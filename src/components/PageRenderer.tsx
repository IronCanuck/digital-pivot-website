import { useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getBlockDefinition } from '../admin/blocks/registry';
import type { BlockInstance } from '../admin/blocks/types';

interface PageRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  seo_title: string;
  seo_description: string;
  og_image_url: string;
}

interface BlockRow {
  id: string;
  page_id: string;
  parent_id: string | null;
  block_type: string;
  props: Record<string, unknown>;
  display_order: number;
}

interface Props {
  slug?: string;
  fallback?: ReactNode;
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

function applySeo(page: PageRow | null) {
  if (!page) return;
  const title = page.seo_title || page.title;
  if (title) document.title = title;
  if (page.seo_description) {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = page.seo_description;
  }
}

function RenderBlocks({ blocks }: { blocks: BlockInstance[] }) {
  return (
    <>
      {blocks.map(block => {
        const def = getBlockDefinition(block.block_type);
        if (!def) return null;
        const Comp = def.Render;
        const renderChildren =
          block.children && block.children.length > 0
            ? () => <RenderBlocks blocks={block.children!} />
            : undefined;
        return (
          <Comp
            key={block.id}
            block={block}
            props={block.props as never}
            mode="view"
            renderChildren={renderChildren}
          />
        );
      })}
    </>
  );
}

export default function PageRenderer({ slug: slugProp, fallback }: Props) {
  const params = useParams();
  const slug = slugProp ?? params.slug ?? '';
  const [page, setPage] = useState<PageRow | null>(null);
  const [blocks, setBlocks] = useState<BlockInstance[]>([]);
  const [status, setStatus] = useState<'loading' | 'found' | 'missing'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    (async () => {
      const { data: pageRow } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (cancelled) return;
      if (!pageRow) {
        setStatus('missing');
        return;
      }
      const { data: rows } = await supabase
        .from('page_blocks')
        .select('*')
        .eq('page_id', pageRow.id)
        .order('display_order');
      if (cancelled) return;
      setPage(pageRow as PageRow);
      setBlocks(buildTree((rows as BlockRow[]) ?? []));
      setStatus('found');
      applySeo(pageRow as PageRow);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  if (status === 'missing') {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400 text-sm">
        Page not found.
      </div>
    );
  }

  return (
    <main>
      <RenderBlocks blocks={blocks} />
      {page && blocks.length === 0 && (
        <div className="py-24 text-center text-gray-400 text-sm">
          This page has no content yet.
        </div>
      )}
    </main>
  );
}
