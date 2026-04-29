import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft,
  Eye,
  Save,
  CheckCircle2,
  Trash2,
  GripVertical,
  Plus,
  Monitor,
  Tablet,
  Smartphone,
  Settings as SettingsIcon,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { blockGroups, blockRegistry, getBlockDefinition } from './blocks/registry';
import type { BlockDefinition, BlockInstance, BlockProps } from './blocks/types';

interface PageRow {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  seo_title: string;
  seo_description: string;
  og_image_url: string;
  is_homepage: boolean;
}

interface BlockRow {
  id: string;
  page_id: string;
  parent_id: string | null;
  block_type: string;
  props: BlockProps;
  display_order: number;
}

type Device = 'desktop' | 'tablet' | 'mobile';

const deviceWidths: Record<Device, string> = {
  desktop: 'max-w-none',
  tablet: 'max-w-3xl',
  mobile: 'max-w-sm',
};

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function flattenTree(blocks: BlockInstance[]): BlockInstance[] {
  const out: BlockInstance[] = [];
  const visit = (list: BlockInstance[], parentId: string | null) => {
    list.forEach((b, idx) => {
      const flat: BlockInstance = {
        ...b,
        parent_id: parentId,
        display_order: idx,
        children: undefined,
      };
      out.push(flat);
      if (b.children && b.children.length) visit(b.children, b.id);
    });
  };
  visit(blocks, null);
  return out;
}

function buildTree(rows: BlockRow[]): BlockInstance[] {
  const byId = new Map<string, BlockInstance>();
  rows.forEach(r => {
    byId.set(r.id, { ...r, children: [] });
  });
  const roots: BlockInstance[] = [];
  byId.forEach(node => {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });
  const sortRecursively = (list: BlockInstance[]) => {
    list.sort((a, b) => a.display_order - b.display_order);
    list.forEach(n => n.children && sortRecursively(n.children));
  };
  sortRecursively(roots);
  return roots;
}

function findBlock(tree: BlockInstance[], id: string): BlockInstance | null {
  for (const b of tree) {
    if (b.id === id) return b;
    if (b.children) {
      const found = findBlock(b.children, id);
      if (found) return found;
    }
  }
  return null;
}

function updateBlock(
  tree: BlockInstance[],
  id: string,
  updater: (b: BlockInstance) => BlockInstance,
): BlockInstance[] {
  return tree.map(b => {
    if (b.id === id) return updater(b);
    if (b.children) return { ...b, children: updateBlock(b.children, id, updater) };
    return b;
  });
}

function removeBlock(tree: BlockInstance[], id: string): BlockInstance[] {
  return tree
    .filter(b => b.id !== id)
    .map(b => (b.children ? { ...b, children: removeBlock(b.children, id) } : b));
}

function insertChild(
  tree: BlockInstance[],
  parentId: string | null,
  block: BlockInstance,
  index?: number,
): BlockInstance[] {
  if (parentId === null) {
    const idx = index ?? tree.length;
    return [...tree.slice(0, idx), block, ...tree.slice(idx)];
  }
  return tree.map(b => {
    if (b.id === parentId) {
      const children = b.children ?? [];
      const idx = index ?? children.length;
      return { ...b, children: [...children.slice(0, idx), block, ...children.slice(idx)] };
    }
    if (b.children) return { ...b, children: insertChild(b.children, parentId, block, index) };
    return b;
  });
}

function makeBlock(pageId: string, def: BlockDefinition, parentId: string | null): BlockInstance {
  return {
    id: genId(),
    page_id: pageId,
    parent_id: parentId,
    block_type: def.type,
    props: { ...def.defaultProps },
    display_order: 0,
    children: def.allowsChildren ? [] : undefined,
  };
}

// ---------------- Sortable wrapper ----------------

function SortableBlock({
  block,
  selected,
  onSelect,
  onDelete,
  onAddChild,
  children,
}: {
  block: BlockInstance;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onAddChild?: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const def = getBlockDefinition(block.block_type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={e => {
        e.stopPropagation();
        onSelect();
      }}
      className={`relative group/block border-2 rounded-xl my-1 transition-colors ${
        selected ? 'border-teal-400' : 'border-transparent hover:border-gray-200'
      }`}
    >
      <div
        className={`absolute -top-3 left-3 z-10 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-white border ${
          selected ? 'border-teal-400 text-teal-600' : 'border-gray-200 text-gray-500'
        } opacity-0 group-hover/block:opacity-100 ${selected ? 'opacity-100' : ''}`}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={e => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-3 h-3" />
        </button>
        <span>{def?.label ?? block.block_type}</span>
        {onAddChild && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onAddChild();
            }}
            className="ml-1 hover:text-teal-600"
            aria-label="Add child block"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-1 hover:text-red-500"
          aria-label="Delete block"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="pointer-events-auto">{children}</div>
    </div>
  );
}

// ---------------- Canvas tree ----------------

function CanvasBlocks({
  blocks,
  parentId,
  selectedId,
  onSelect,
  onDelete,
  onAddChild,
  onReorder,
}: {
  blocks: BlockInstance[];
  parentId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onReorder: (parentId: string | null, fromId: string, toId: string) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    onReorder(parentId, String(active.id), String(over.id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
        {blocks.map(block => {
          const def = getBlockDefinition(block.block_type);
          if (!def) return null;
          const Render = def.Render;
          const renderChildren = def.allowsChildren
            ? () => (
                <CanvasBlocks
                  blocks={block.children ?? []}
                  parentId={block.id}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                  onReorder={onReorder}
                />
              )
            : undefined;
          return (
            <SortableBlock
              key={block.id}
              block={block}
              selected={selectedId === block.id}
              onSelect={() => onSelect(block.id)}
              onDelete={() => onDelete(block.id)}
              onAddChild={def.allowsChildren ? () => onAddChild(block.id) : undefined}
            >
              <Render
                block={block}
                props={block.props as never}
                mode="edit"
                renderChildren={renderChildren}
              />
            </SortableBlock>
          );
        })}
      </SortableContext>
    </DndContext>
  );
}

// ---------------- Block picker modal ----------------

function BlockPicker({
  onPick,
  onClose,
}: {
  onPick: (def: BlockDefinition) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-display font-bold text-gray-900">Add a block</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {blockGroups.map(group => {
            const defs = Object.values(blockRegistry).filter(d => d.group === group.id);
            if (defs.length === 0) return null;
            return (
              <div key={group.id}>
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  {group.label}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {defs.map(def => {
                    const Icon = def.icon;
                    return (
                      <button
                        key={def.type}
                        onClick={() => onPick(def)}
                        className="flex items-center gap-2 px-3 py-3 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 text-left transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-gray-700" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{def.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------- Main editor ----------------

export default function PageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState<PageRow | null>(null);
  const [tree, setTree] = useState<BlockInstance[]>([]);
  const [originalIds, setOriginalIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [picker, setPicker] = useState<{ parentId: string | null } | null>(null);
  const [device, setDevice] = useState<Device>('desktop');
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState('');
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: pageRow } = await supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!pageRow) {
        navigate('/admin/pages');
        return;
      }
      setPage(pageRow as PageRow);
      const { data: rows } = await supabase
        .from('page_blocks')
        .select('*')
        .eq('page_id', id)
        .order('display_order');
      const built = buildTree((rows as BlockRow[]) ?? []);
      setTree(built);
      setOriginalIds(new Set((rows as BlockRow[] | null)?.map(r => r.id) ?? []));
    })();
  }, [id, navigate]);

  const selected = useMemo(
    () => (selectedId ? findBlock(tree, selectedId) : null),
    [tree, selectedId],
  );
  const selectedDef = selected ? getBlockDefinition(selected.block_type) : null;

  const markDirty = () => {
    dirtyRef.current = true;
  };

  const handleAdd = (def: BlockDefinition, parentId: string | null) => {
    if (!page) return;
    const newBlock = makeBlock(page.id, def, parentId);
    setTree(prev => insertChild(prev, parentId, newBlock));
    setSelectedId(newBlock.id);
    setPicker(null);
    markDirty();
  };

  const handleDelete = (blockId: string) => {
    if (!confirm('Delete this block?')) return;
    setTree(prev => removeBlock(prev, blockId));
    if (selectedId === blockId) setSelectedId(null);
    markDirty();
  };

  const handleReorder = (parentId: string | null, fromId: string, toId: string) => {
    setTree(prev => {
      const reorderList = (list: BlockInstance[]): BlockInstance[] => {
        const ids = list.map(b => b.id);
        const fromIdx = ids.indexOf(fromId);
        const toIdx = ids.indexOf(toId);
        if (fromIdx === -1 || toIdx === -1) return list;
        return arrayMove(list, fromIdx, toIdx);
      };
      if (parentId === null) return reorderList(prev);
      return prev.map(b => {
        if (b.id === parentId && b.children) return { ...b, children: reorderList(b.children) };
        if (b.children) {
          const reorderInside = (list: BlockInstance[]): BlockInstance[] =>
            list.map(child => {
              if (child.id === parentId && child.children)
                return { ...child, children: reorderList(child.children) };
              if (child.children) return { ...child, children: reorderInside(child.children) };
              return child;
            });
          return { ...b, children: reorderInside(b.children) };
        }
        return b;
      });
    });
    markDirty();
  };

  const handlePropChange = (next: Partial<BlockProps>) => {
    if (!selectedId) return;
    setTree(prev =>
      updateBlock(prev, selectedId, b => ({ ...b, props: { ...b.props, ...next } })),
    );
    markDirty();
  };

  const handleSave = async (publish?: boolean) => {
    if (!page) return;
    setSaving(true);
    setError('');
    try {
      const flat = flattenTree(tree);
      const newIds = new Set(flat.map(b => b.id));
      const toDelete = [...originalIds].filter(prevId => !newIds.has(prevId));

      if (toDelete.length > 0) {
        const { error: delErr } = await supabase
          .from('page_blocks')
          .delete()
          .in('id', toDelete);
        if (delErr) throw delErr;
      }

      if (flat.length > 0) {
        const rows = flat.map(b => ({
          id: b.id,
          page_id: page.id,
          parent_id: b.parent_id,
          block_type: b.block_type,
          props: b.props,
          display_order: b.display_order,
          updated_at: new Date().toISOString(),
        }));
        const { error: upErr } = await supabase
          .from('page_blocks')
          .upsert(rows, { onConflict: 'id' });
        if (upErr) throw upErr;
      }

      const pageUpdate: Partial<PageRow> & { updated_at: string } = {
        title: page.title,
        slug: page.slug,
        seo_title: page.seo_title,
        seo_description: page.seo_description,
        og_image_url: page.og_image_url,
        updated_at: new Date().toISOString(),
      };
      if (publish !== undefined) {
        pageUpdate.status = publish ? 'published' : 'draft';
      }
      const { error: pageErr } = await supabase
        .from('pages')
        .update(pageUpdate)
        .eq('id', page.id);
      if (pageErr) throw pageErr;

      setOriginalIds(newIds);
      if (publish !== undefined) setPage(p => (p ? { ...p, status: publish ? 'published' : 'draft' } : p));
      setSavedAt(Date.now());
      dirtyRef.current = false;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        Loading page...
      </div>
    );
  }

  const liveUrl = page.is_homepage ? '/' : `/p/${page.slug}`;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-3 sm:px-5 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/admin/pages"
            className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <input
            value={page.title}
            onChange={e => {
              setPage({ ...page, title: e.target.value });
              markDirty();
            }}
            placeholder="Untitled"
            className="font-display font-bold text-gray-900 text-base sm:text-lg bg-transparent focus:outline-none focus:ring-0 min-w-0 flex-1"
          />
          <span
            className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-semibold ${
              page.status === 'published'
                ? 'bg-teal-50 text-teal-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {page.status}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="hidden sm:flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 mr-2">
            {(['desktop', 'tablet', 'mobile'] as Device[]).map(d => {
              const Icon = d === 'desktop' ? Monitor : d === 'tablet' ? Tablet : Smartphone;
              return (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`p-1.5 rounded ${device === d ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                  aria-label={d}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            aria-label="Page settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
          >
            <Eye className="w-3.5 h-3.5" /> View
          </a>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {savedAt && Date.now() - savedAt < 2500 ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Draft'}
              </>
            )}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-gradient-brand text-white text-xs font-semibold hover:opacity-90 disabled:opacity-70"
          >
            Publish
          </button>
        </div>
      </header>

      {error && (
        <div className="px-5 py-2 bg-red-50 text-red-600 text-xs">{error}</div>
      )}

      {/* Body: 3 columns */}
      <div className="flex-1 flex min-h-0">
        {/* Left palette */}
        <aside className="w-56 hidden md:flex flex-col bg-white border-r border-gray-200 overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Add Blocks
            </h3>
          </div>
          <div className="p-3 space-y-4">
            {blockGroups.map(group => {
              const defs = Object.values(blockRegistry).filter(d => d.group === group.id);
              if (defs.length === 0) return null;
              return (
                <div key={group.id}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5 px-1">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {defs.map(def => {
                      const Icon = def.icon;
                      return (
                        <button
                          key={def.type}
                          onClick={() => handleAdd(def, null)}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                        >
                          <Icon className="w-4 h-4 shrink-0 text-gray-400" />
                          {def.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6" onClick={() => setSelectedId(null)}>
          <div
            className={`mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all ${deviceWidths[device]}`}
            onClick={e => e.stopPropagation()}
          >
            {tree.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-gray-400 text-sm mb-3">This page is empty.</p>
                <button
                  onClick={() => setPicker({ parentId: null })}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-brand text-white text-sm font-semibold hover:opacity-90"
                >
                  <Plus className="w-4 h-4" /> Add your first block
                </button>
              </div>
            ) : (
              <CanvasBlocks
                blocks={tree}
                parentId={null}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onDelete={handleDelete}
                onAddChild={parentId => setPicker({ parentId })}
                onReorder={handleReorder}
              />
            )}

            {tree.length > 0 && (
              <div className="px-6 py-4 border-t border-dashed border-gray-200 text-center">
                <button
                  onClick={() => setPicker({ parentId: null })}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-teal-600"
                >
                  <Plus className="w-3.5 h-3.5" /> Add block
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Right inspector */}
        <aside className="w-72 hidden lg:flex flex-col bg-white border-l border-gray-200 overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Inspector
            </h3>
            {selected && (
              <button
                onClick={() => setSelectedId(null)}
                className="text-[10px] text-gray-400 hover:text-gray-600"
              >
                Deselect
              </button>
            )}
          </div>
          <div className="p-4">
            {!selected || !selectedDef ? (
              <p className="text-xs text-gray-400">
                Click a block on the canvas to edit its properties.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <selectedDef.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedDef.label}
                  </span>
                </div>
                <selectedDef.Inspector
                  props={selected.props as never}
                  onChange={handlePropChange}
                />
              </>
            )}
          </div>
        </aside>
      </div>

      {picker && (
        <BlockPicker
          onPick={def => handleAdd(def, picker.parentId)}
          onClose={() => setPicker(null)}
        />
      )}

      {showSettings && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-bold text-gray-900">Page Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={page.slug}
                  onChange={e => {
                    setPage({ ...page, slug: e.target.value });
                    markDirty();
                  }}
                  disabled={page.is_homepage}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                {page.is_homepage && (
                  <p className="text-[11px] text-gray-400 mt-1">The homepage slug is locked.</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={page.seo_title}
                  onChange={e => {
                    setPage({ ...page, seo_title: e.target.value });
                    markDirty();
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  SEO Description
                </label>
                <textarea
                  rows={3}
                  value={page.seo_description}
                  onChange={e => {
                    setPage({ ...page, seo_description: e.target.value });
                    markDirty();
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Open Graph image URL
                </label>
                <input
                  type="text"
                  value={page.og_image_url}
                  onChange={e => {
                    setPage({ ...page, og_image_url: e.target.value });
                    markDirty();
                  }}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
