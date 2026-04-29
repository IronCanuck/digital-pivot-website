import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Pencil, Eye, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PageRow {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  is_homepage: boolean;
  updated_at: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminPages() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<PageRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await supabase
      .from('pages')
      .select('id, slug, title, status, is_homepage, updated_at')
      .order('updated_at', { ascending: false });
    setPages((data as PageRow[]) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const finalSlug = slugify(slug || title);
    if (!finalSlug) {
      setError('A slug is required.');
      return;
    }
    const { data, error: err } = await supabase
      .from('pages')
      .insert({ title, slug: finalSlug, status: 'draft' })
      .select('id')
      .single();
    if (err) {
      setError(err.message);
      return;
    }
    setCreating(false);
    setTitle('');
    setSlug('');
    if (data) navigate(`/admin/pages/${data.id}/edit`);
  };

  const remove = async (page: PageRow) => {
    if (page.is_homepage) {
      alert('You cannot delete the homepage.');
      return;
    }
    if (!confirm(`Delete "${page.title || page.slug}"?`)) return;
    await supabase.from('pages').delete().eq('id', page.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-500 text-sm mt-1">
            Build and edit pages with the visual block editor.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> New Page
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {pages.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No pages yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Title</th>
                <th className="text-left px-5 py-3 font-semibold">URL</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-left px-5 py-3 font-semibold">Updated</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {pages.map(p => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {p.title || <span className="text-gray-400">(untitled)</span>}
                    {p.is_homepage && (
                      <span className="ml-2 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-teal-50 text-teal-700">
                        Home
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">
                    {p.is_homepage ? '/' : `/p/${p.slug}`}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        p.status === 'published'
                          ? 'bg-teal-50 text-teal-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(p.updated_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    {p.status === 'published' && (
                      <a
                        href={p.is_homepage ? '/' : `/p/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-teal-600 mr-3"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </a>
                    )}
                    <Link
                      to={`/admin/pages/${p.id}/edit`}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-teal-600 mr-3"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <button
                      onClick={() => remove(p)}
                      className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:text-gray-300"
                      disabled={p.is_homepage}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-bold text-gray-900">New Page</h2>
              <button
                onClick={() => setCreating(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={create} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Title
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={e => {
                    setTitle(e.target.value);
                    if (!slug) setSlug(slugify(e.target.value));
                  }}
                  placeholder="About Us"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  URL Slug
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 font-mono">/p/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(slugify(e.target.value))}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  />
                </div>
              </div>
              {error && (
                <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold hover:opacity-90"
                >
                  Create &amp; Edit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
