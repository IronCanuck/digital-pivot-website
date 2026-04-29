import { useEffect, useState } from 'react';
import { Mail, Phone, Clock, Globe, Building2, Briefcase, Paperclip, ChevronDown } from 'lucide-react';
import { supabase, WaitlistApplication } from '../lib/supabase';

const STATUSES = ['new', 'reviewing', 'accepted', 'declined', 'archived'];

export default function AdminWaitlist() {
  const [items, setItems] = useState<WaitlistApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('waitlist_applications')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems((data as WaitlistApplication[]) || []);
        setLoading(false);
      });
  }, []);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from('waitlist_applications')
      .update({ status })
      .eq('id', id);
    if (!error) {
      setItems(prev => prev.map(it => (it.id === id ? { ...it, status } : it)));
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Waitlist Applications</h1>
        <p className="text-gray-500 text-sm mt-1">Structured applications from the public-facing waitlist form.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-20 text-gray-400">
          No applications yet.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => {
            const open = openId === item.id;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="w-full text-left p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <p className="font-display font-bold text-gray-900 truncate">{item.name}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-gray-500 text-sm flex items-center gap-1.5 mb-2">
                      <Building2 className="w-3.5 h-3.5" /> {item.business_name}
                      <span className="text-gray-300">·</span>
                      <Briefcase className="w-3.5 h-3.5" /> {item.business_type}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <a href={`mailto:${item.email}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-teal-600 hover:underline">
                        <Mail className="w-3.5 h-3.5" /> {item.email}
                      </a>
                      {item.phone && (
                        <a href={`tel:${item.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-gray-500 hover:underline">
                          <Phone className="w-3.5 h-3.5" /> {item.phone}
                        </a>
                      )}
                      {item.existing_url && (
                        <a href={item.existing_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-gray-500 hover:underline">
                          <Globe className="w-3.5 h-3.5" /> {prettyUrl(item.existing_url)}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(item.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {open && (
                  <div className="border-t border-gray-100 px-6 py-5 bg-gray-50 space-y-4">
                    <Detail label="Project Goals">
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{item.project_goals}</p>
                    </Detail>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Detail label="Plan of Interest">
                        <p className="text-gray-700 text-sm">{item.selected_plan || '—'}</p>
                      </Detail>
                      <Detail label="Budget">
                        <p className="text-gray-700 text-sm">{item.budget_range || '—'}</p>
                      </Detail>
                      <Detail label="Timeline">
                        <p className="text-gray-700 text-sm">{item.timeline || '—'}</p>
                      </Detail>
                    </div>

                    {item.attachment_url && (
                      <Detail label="Attachment">
                        <a
                          href={item.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-teal-600 hover:bg-teal-50 transition-colors"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          {item.attachment_name || 'View attachment'}
                        </a>
                      </Detail>
                    )}

                    <Detail label="Status">
                      <select
                        value={item.status}
                        onChange={e => updateStatus(item.id, e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </Detail>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</p>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: 'bg-teal-50 text-teal-700 border-teal-100',
    reviewing: 'bg-amber-50 text-amber-700 border-amber-100',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    declined: 'bg-red-50 text-red-700 border-red-100',
    archived: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const cls = styles[status] || styles.new;
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${cls}`}>
      {status}
    </span>
  );
}

function prettyUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
