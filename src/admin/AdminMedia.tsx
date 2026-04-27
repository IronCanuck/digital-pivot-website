import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Save } from 'lucide-react';
import { supabase, MediaLogo } from '../lib/supabase';

const empty: Omit<MediaLogo, 'id'> = { name: '', image_url: '', display_order: 0 };

export default function AdminMedia() {
  const [items, setItems] = useState<MediaLogo[]>([]);
  const [modal, setModal] = useState<Omit<MediaLogo, 'id'> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('media_logos').select('*').order('display_order');
    setItems((data as MediaLogo[]) || []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    await supabase.from('media_logos').insert([modal]);
    setSaving(false);
    setModal(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this logo?')) return;
    await supabase.from('media_logos').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Media Logos</h1>
          <p className="text-gray-500 text-sm mt-1">Manage logos shown in the "As Featured In" section.</p>
        </div>
        <button onClick={() => setModal({ ...empty, display_order: items.length + 1 })} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Logo
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No media logos yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map(item => (
              <div key={item.id} className="group relative flex flex-col items-center p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <img src={item.image_url} alt={item.name} className="h-10 object-contain grayscale" />
                <p className="text-xs text-gray-400 mt-2 text-center truncate w-full">{item.name}</p>
                <button
                  onClick={() => remove(item.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-display font-bold text-gray-900">Add Media Logo</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Name</label>
                <input type="text" value={modal.name} onChange={e => setModal({ ...modal, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Image URL</label>
                <input type="text" value={modal.image_url} onChange={e => setModal({ ...modal, image_url: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Display Order</label>
                <input type="number" value={modal.display_order} onChange={e => setModal({ ...modal, display_order: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
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
