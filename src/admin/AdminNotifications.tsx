import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  Inbox,
  ClipboardList,
  Users,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { supabase, type Notification } from '../lib/supabase';

type FilterMode = 'all' | 'unread';
type TypeFilter = 'all' | 'form_submission' | 'contact' | 'waitlist';

const typeMeta: Record<
  string,
  { label: string; icon: typeof Inbox; tint: string }
> = {
  form_submission: {
    label: 'Form',
    icon: ClipboardList,
    tint: 'bg-teal-50 text-teal-700',
  },
  contact: { label: 'Contact', icon: Inbox, tint: 'bg-blue-50 text-blue-700' },
  waitlist: { label: 'Waitlist', icon: Users, tint: 'bg-purple-50 text-purple-700' },
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AdminNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    setItems((data as Notification[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('notifications-page')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const visible = useMemo(() => {
    return items.filter(n => {
      if (filter === 'unread' && n.read_at) return false;
      if (typeFilter !== 'all' && n.type !== typeFilter) return false;
      return true;
    });
  }, [items, filter, typeFilter]);

  const unreadCount = items.filter(i => !i.read_at).length;

  const markRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);
    load();
  };

  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this notification?')) return;
    await supabase.from('notifications').delete().eq('id', id);
    load();
  };

  const clearAll = async () => {
    if (!confirm('Delete all notifications? This cannot be undone.')) return;
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-red-500 text-white text-xs font-semibold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time alerts when someone submits a form, contact message, or waitlist application.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
          <button
            onClick={clearAll}
            disabled={items.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Clear all
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {(['all', 'unread'] as FilterMode[]).map(m => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === m ? 'bg-gradient-brand text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {m === 'all' ? 'All' : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>
        <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
          <Filter className="w-3.5 h-3.5 text-gray-400 ml-2" />
          {(['all', 'form_submission', 'contact', 'waitlist'] as TypeFilter[]).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                typeFilter === t ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t === 'all' ? 'All types' : typeMeta[t]?.label ?? t}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            <Bell className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            {filter === 'unread' ? "You're all caught up." : 'No notifications yet.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {visible.map(n => {
              const meta = typeMeta[n.type] ?? {
                label: n.type,
                icon: Bell,
                tint: 'bg-gray-100 text-gray-600',
              };
              const Icon = meta.icon;
              const unread = !n.read_at;
              return (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 px-5 py-4 transition-colors ${
                    unread ? 'bg-teal-50/30' : 'bg-white'
                  }`}
                >
                  <div
                    className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${meta.tint}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {unread && (
                          <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" aria-hidden />
                        )}
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {n.title}
                        </p>
                        <span
                          className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded font-semibold ${meta.tint}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    {n.message && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {n.link_url && (
                        <Link
                          to={n.link_url}
                          onClick={() => unread && markRead(n.id)}
                          className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" /> View
                        </Link>
                      )}
                      {unread && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-xs text-gray-500 hover:text-gray-900"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => remove(n.id)}
                        className="text-xs text-red-500 hover:text-red-700 ml-auto inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
