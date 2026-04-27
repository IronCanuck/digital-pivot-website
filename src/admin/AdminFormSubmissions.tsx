import { useState, useEffect } from 'react';
import { Clock, Inbox } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { FormSubmission } from '../lib/supabase';

export default function AdminFormSubmissions() {
  const [items, setItems] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FormSubmission | null>(null);

  useEffect(() => {
    supabase
      .from('form_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data);
        setLoading(false);
      });
  }, []);

  function formatDate(ts: string) {
    return new Date(ts).toLocaleString('en-CA', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function getPreview(data: Record<string, string>) {
    const vals = Object.values(data).filter(Boolean);
    return vals.slice(0, 2).join(' · ');
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Form Submissions</h1>
        <p className="text-gray-500 text-sm mt-1">{items.length} submission{items.length !== 1 ? 's' : ''} received</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No submissions yet</p>
          <p className="text-sm mt-1">Responses will appear here after clients fill out the form.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* List */}
          <div className="lg:col-span-1 space-y-2">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected?.id === item.id
                    ? 'border-teal-400 bg-teal-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-800 text-sm truncate">
                  {(item.data as Record<string, string>)['Full Name'] ||
                   (item.data as Record<string, string>)['Name'] ||
                   'Anonymous'}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {getPreview(item.data as Record<string, string>)}
                </p>
                <p className="text-xs text-gray-300 mt-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatDate(item.created_at)}
                </p>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-5">
                  <h2 className="font-display font-bold text-lg text-gray-900">
                    {(selected.data as Record<string, string>)['Full Name'] ||
                     (selected.data as Record<string, string>)['Name'] ||
                     'Anonymous'}
                  </h2>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDate(selected.created_at)}
                  </span>
                </div>
                <div className="space-y-4">
                  {Object.entries(selected.data as Record<string, string>).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{key}</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-lg px-3 py-2">{value || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-300 py-20">
                <div className="text-center">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Select a submission to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
