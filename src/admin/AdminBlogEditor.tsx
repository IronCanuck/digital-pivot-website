import { useState } from 'react';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { supabase, BlogPost } from '../lib/supabase';

interface Props {
  post: BlogPost | null;
  onSave: () => void;
  onCancel: () => void;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminBlogEditor({ post, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [body, setBody] = useState(post?.body || '');
  const [published, setPublished] = useState(post?.published || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!post) setSlug(slugify(val));
  };

  const save = async () => {
    if (!title || !slug) { setError('Title and slug are required.'); return; }
    setSaving(true);
    setError('');

    const payload = {
      title,
      slug,
      excerpt,
      body,
      published,
      updated_at: new Date().toISOString(),
    };

    let err;
    if (post) {
      ({ error: err } = await supabase.from('blog_posts').update(payload).eq('id', post.id));
    } else {
      ({ error: err } = await supabase.from('blog_posts').insert([payload]));
    }

    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      onSave();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">{post ? 'Edit Post' : 'New Blog Post'}</h1>
          <p className="text-gray-500 text-sm mt-1">{post ? `Editing: ${post.title}` : 'Create a new article'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Your blog post title"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Slug (URL)</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">/blog/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(slugify(e.target.value))}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Excerpt (shown in blog listing)</label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="A short summary of the post..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Body Content</label>
              <textarea
                rows={18}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write your full article here..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-display font-bold text-gray-900 mb-4">Publish Settings</h3>
            <button
              onClick={() => setPublished(!published)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                published
                  ? 'border-teal-200 bg-teal-50 text-teal-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
            >
              <span>{published ? 'Published' : 'Draft'}</span>
              {published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              {published ? 'This post is visible on the public blog.' : 'This post is hidden from the public.'}
            </p>
          </div>

          {error && <p className="text-red-500 text-xs bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

          <div className="flex flex-col gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-brand text-white font-semibold text-sm hover:opacity-90 disabled:opacity-70"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Post'}
            </button>
            <button onClick={onCancel} className="w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
