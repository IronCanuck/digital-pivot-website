import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { supabase, FAQ } from '../lib/supabase';

const empty: Omit<FAQ, 'id' | 'created_at'> = { question: '', answer: '', display_order: 0 };

export default function AdminFAQ() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [modal, setModal] = useState<Omit<FAQ, 'id' | 'created_at'> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('faqs').select('*').order('display_order');
    setItems((data as FAQ[]) || []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditId(null); setModal({ ...empty, display_order: items.length + 1 }); };
  const openEdit = (item: FAQ) => {
    setEditId(item.id);
    setModal({ question: item.question, answer: item.answer, display_order: item.display_order });
  };

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    if (editId) {
      await supabase.from('faqs').update(modal).eq('id', editId);
    } else {
      await supabase.from('faqs').insert([modal]);
    }
    setSaving(false);
    setModal(null);
    setEditId(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    await supabase.from('faqs').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">FAQ</h1>
          <p className="text-gray-500 text-sm mt-1">Manage questions and answers shown on the homepage.</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold hover:opacity-90">
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No FAQs yet.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Question</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{item.question}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">{item.display_order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-teal-600"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => remove(item.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-display font-bold text-gray-900">{editId ? 'Edit' : 'Add'} FAQ</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Question</label>
                <input type="text" value={modal.question} onChange={e => setModal({ ...modal, question: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Answer</label>
                <textarea rows={5} value={modal.answer} onChange={e => setModal({ ...modal, answer: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
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
