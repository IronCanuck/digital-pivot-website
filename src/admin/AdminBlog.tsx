import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase, BlogPost } from '../lib/supabase';
import AdminBlogEditor from './AdminBlogEditor';

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editPost, setEditPost] = useState<BlogPost | null | 'new'>(null);

  const load = async () => {
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setPosts((data as BlogPost[]) || []);
  };

  useEffect(() => { load(); }, []);

  const togglePublished = async (post: BlogPost) => {
    await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    load();
  };

  if (editPost !== null) {
    return (
      <AdminBlogEditor
        post={editPost === 'new' ? null : editPost}
        onSave={() => { setEditPost(null); load(); }}
        onCancel={() => setEditPost(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage your blog content.</p>
        </div>
        <button onClick={() => setEditPost('new')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold hover:opacity-90">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No blog posts yet. Write your first one.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 text-sm">{post.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">/blog/{post.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm hidden md:table-cell">
                    {new Date(post.created_at).toLocaleDateString('en-CA')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => togglePublished(post)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                        post.published
                          ? 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {post.published ? <><Eye className="w-3 h-3" /> Published</> : <><EyeOff className="w-3 h-3" /> Draft</>}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditPost(post)} className="p-1.5 text-gray-400 hover:text-teal-600"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => remove(post.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
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
