import { useEffect, useState } from 'react';
import { Plus, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Invite {
  id: string;
  code: string;
  used_by: string | null;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

function generateCode() {
  const random = Math.random().toString(36).slice(2, 10);
  return `dpv-${random}`;
}

export default function AdminInvites() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from('admin_invites')
      .select('*')
      .order('created_at', { ascending: false });
    setInvites((data as Invite[]) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setLoading(true);
    const code = generateCode();
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from('admin_invites').insert({
      code,
      created_by: userData.user?.id ?? null,
    });
    setLoading(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Revoke this invite code?')) return;
    await supabase.from('admin_invites').delete().eq('id', id);
    load();
  };

  const copyLink = async (code: string) => {
    const url = `${window.location.origin}/admin/signup`;
    await navigator.clipboard.writeText(`${url}\n\nInvite code: ${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Admin Invites</h1>
          <p className="text-gray-500 text-sm mt-1">
            Generate one-time codes that let new admins sign up at /admin/signup.
          </p>
        </div>
        <button
          onClick={create}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold hover:opacity-90 disabled:opacity-70"
        >
          <Plus className="w-4 h-4" /> New Invite
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {invites.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No invites yet. Click "New Invite" to generate one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Code</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-left px-5 py-3 font-semibold">Created</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {invites.map(inv => (
                <tr key={inv.id} className="border-t border-gray-100">
                  <td className="px-5 py-3 font-mono text-gray-900">{inv.code}</td>
                  <td className="px-5 py-3">
                    {inv.used_by ? (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        Used {inv.used_at ? new Date(inv.used_at).toLocaleDateString() : ''}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(inv.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => copyLink(inv.code)}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-teal-600 mr-3"
                    >
                      {copied === inv.code ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => remove(inv.id)}
                      className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
