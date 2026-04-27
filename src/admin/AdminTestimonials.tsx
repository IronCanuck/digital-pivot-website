import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Star } from 'lucide-react';
import { supabase, Testimonial } from '../lib/supabase';

const empty: Omit<Testimonial, 'id' | 'created_at'> = {
  author_name: '',
  business_name: '',
  rating: 5,
  body: '',
  display_order: 0,
};

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [modal, setModal] = useState<Omit<Testimonial, 'id' | 'created_at'> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('testimonials').select('*').order('display_order');
    setItems((data as Testimonial[]) || []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditId(null); setModal({ ...empty, display_order: items.length + 1 }); };
  const openEdit = (item: Testimonial) => {
    setEditId(item.id);
    setModal({ author_name: item.author_name, business_name: item.business_name, rating: item.rating, body: item.body, display_order: item.display_order });
  };

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    if (editId) {
      await supabase.from('testimonials').update(modal).eq('id', editId);
    } else {
      await supabase.from('testimonials').insert([modal]);
    }
    setSaving(false);
    setModal(null);
    setEditId(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-500 text-sm mt-1">Manage client reviews shown on the homepage.</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 text-center py-16 text-gray-400">
            No testimonials yet.
          </div>
        ) : items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: item.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-2">"{item.body}"</p>
              <p className="font-semibold text-gray-900 text-sm">{item.author_name}</p>
              <p className="text-gray-400 text-xs">{item.business_name}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-teal-600"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => remove(item.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-display font-bold text-gray-900">{editId ? 'Edit' : 'Add'} Testimonial</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Author Name</label>
                  <input type="text" value={modal.author_name} onChange={e => setModal({ ...modal, author_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Business Name</label>
                  <input type="text" value={modal.business_name} onChange={e => setModal({ ...modal, business_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Rating (1–5)</label>
                <input type="number" min={1} max={5} value={modal.rating} onChange={e => setModal({ ...modal, rating: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Review Text</label>
                <textarea rows={4} value={modal.body} onChange={e => setModal({ ...modal, body: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
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
