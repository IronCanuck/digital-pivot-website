import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Star, HelpCircle, SquarePen as PenSquare, Inbox, ExternalLink, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Counts {
  portfolio: number;
  testimonials: number;
  faqs: number;
  blog_posts: number;
  contacts: number;
}

const cards = [
  { key: 'portfolio', label: 'Portfolio Items', icon: Briefcase, to: '/admin/portfolio', color: 'teal' },
  { key: 'testimonials', label: 'Testimonials', icon: Star, to: '/admin/testimonials', color: 'purple' },
  { key: 'faqs', label: 'FAQ Entries', icon: HelpCircle, to: '/admin/faq', color: 'teal' },
  { key: 'blog_posts', label: 'Blog Posts', icon: PenSquare, to: '/admin/blog', color: 'purple' },
  { key: 'contacts', label: 'Contact Submissions', icon: Inbox, to: '/admin/contacts', color: 'teal' },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts>({ portfolio: 0, testimonials: 0, faqs: 0, blog_posts: 0, contacts: 0 });

  useEffect(() => {
    const tables = ['portfolio', 'testimonials', 'faqs', 'blog_posts', 'contact_submissions'];
    Promise.all(
      tables.map(t => supabase.from(t).select('*', { count: 'exact', head: true }))
    ).then(results => {
      setCounts({
        portfolio: results[0].count || 0,
        testimonials: results[1].count || 0,
        faqs: results[2].count || 0,
        blog_posts: results[3].count || 0,
        contacts: results[4].count || 0,
      });
    });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back. Here's an overview of your site.</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          View Live Site <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-10">
        {cards.map(({ key, label, icon: Icon, to, color }) => (
          <Link
            key={key}
            to={to}
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              color === 'teal' ? 'bg-teal-50 text-teal-600' : 'bg-purple-50 text-purple-500'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{counts[key as keyof Counts]}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-display font-bold text-gray-900 mb-5">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Edit page content & text', to: '/admin/content' },
            { label: 'Add a portfolio item', to: '/admin/portfolio' },
            { label: 'Add a testimonial', to: '/admin/testimonials' },
            { label: 'Write a blog post', to: '/admin/blog' },
            { label: 'Manage FAQ entries', to: '/admin/faq' },
            { label: 'View contact submissions', to: '/admin/contacts' },
          ].map(item => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-teal-200 transition-all text-sm text-gray-700 font-medium"
            >
              {item.label}
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
