import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import { supabase, BlogPost } from '../lib/supabase';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()
      .then(({ data }) => {
        setPost(data as BlogPost | null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <main className="pt-28 pb-24 min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 space-y-4 animate-pulse">
          <div className="h-10 bg-gray-100 rounded-xl w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="space-y-3 mt-8">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 bg-gray-100 rounded" />)}
          </div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="pt-28 pb-24 min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-teal-600 hover:underline text-sm">
            ← Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-24 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-teal-600 text-sm font-medium hover:text-teal-500 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

        <div className="flex items-center gap-2 text-sm text-gray-400 mb-10 pb-8 border-b border-gray-100">
          <Calendar className="w-4 h-4" />
          {new Date(post.created_at).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.body}
        </div>
      </div>
    </main>
  );
}
