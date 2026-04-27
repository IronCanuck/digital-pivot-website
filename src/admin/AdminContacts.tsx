import { useEffect, useState } from 'react';
import { Mail, Phone, Clock } from 'lucide-react';
import { supabase, ContactSubmission } from '../lib/supabase';

export default function AdminContacts() {
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems((data as ContactSubmission[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Contact Inbox</h1>
        <p className="text-gray-500 text-sm mt-1">Form submissions from your website's contact section.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-20 text-gray-400">
          No contact submissions yet.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <p className="font-display font-bold text-gray-900">{item.name}</p>
                  <div className="flex flex-wrap gap-4 mt-1">
                    <a href={`mailto:${item.email}`} className="flex items-center gap-1.5 text-teal-600 text-sm hover:underline">
                      <Mail className="w-3.5 h-3.5" /> {item.email}
                    </a>
                    {item.phone && (
                      <a href={`tel:${item.phone}`} className="flex items-center gap-1.5 text-gray-500 text-sm hover:underline">
                        <Phone className="w-3.5 h-3.5" /> {item.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 text-xs whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(item.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-xl px-4 py-3">{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
