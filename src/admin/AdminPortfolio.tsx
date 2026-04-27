import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { supabase, Portfolio } from '../lib/supabase';

const empty: Omit<Portfolio, 'id' | 'created_at'> = {
  name: '',
  description: '',
  image_url: '',
  site_url: '',
  display_order: 0,
};

export default function AdminPortfolio() {
  const [items, setItems] = useState<Portfolio[]>([]);
  const [modal, setModal] = useState<Omit<Portfolio, 'id' | 'created_at'> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('portfolio').select('*').order('display_order');
    setItems((data as Portfolio[]) || []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditId(null); setModal({ ...empty, display_order: items.length + 1 }); };
  const openEdit = (item: Portfolio) => {
    setEditId(item.id);
    setModal({ name: item.name, description: item.description, image_url: item.image_url, site_url: item.site_url || '', display_order: item.display_order });
  };

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    const payload = { ...modal, site_url: modal.site_url || null };
    if (editId) {
      await supabase.from('portfolio').update(payload).eq('id', editId);
    } else {
      await supabase.from('portfolio').insert([payload]);
    }
    setSaving(false);
    setModal(null);
    setEditId(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this portfolio item?')) return;
    await supabase.from('portfolio').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-500 text-sm mt-1">Manage the websites shown in your portfolio section.</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>No portfolio items yet. Add your first one.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Description</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="w-10 h-7 rounded object-cover" />
                      )}
                      <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm hidden sm:table-cell max-w-xs truncate">{item.description}</td>
                  <td className="px-6 py-4 text-center text-gray-500 text-sm">{item.display_order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-teal-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => remove(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-display font-bold text-gray-900">{editId ? 'Edit' : 'Add'} Portfolio Item</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {([
                { label: 'Project Name', key: 'name' as const },
                { label: 'Description', key: 'description' as const },
                { label: 'Image URL', key: 'image_url' as const },
                { label: 'Site URL (optional)', key: 'site_url' as const },
              ] as const).map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{label}</label>
                  <input
                    type="text"
                    value={(modal as Record<string, string>)[key] || ''}
                    onChange={e => setModal({ ...modal, [key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Display Order</label>
                <input
                  type="number"
                  value={modal.display_order}
                  onChange={e => setModal({ ...modal, display_order: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-brand text-white text-sm font-semibold hover:opacity-90 disabled:opacity-70">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
