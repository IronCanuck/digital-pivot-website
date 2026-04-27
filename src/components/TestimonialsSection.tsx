import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { supabase, Testimonial } from '../lib/supabase';

const fallback: Testimonial[] = [
  {
    id: '1',
    author_name: 'Mark Thompson',
    business_name: "Thompson's Landscaping",
    rating: 5,
    body: 'Digital Pivot completely transformed our online presence. Within the first month we started getting calls directly from our website. The design looks incredibly professional and the team was a pleasure to work with.',
    display_order: 1,
    created_at: '',
  },
  {
    id: '2',
    author_name: 'Sarah Leblanc',
    business_name: 'Leblanc Plumbing & Heating',
    rating: 5,
    body: "I was skeptical at first but I am so glad I made the switch. Our old website was embarrassing. Now I'm proud to hand out my card knowing people will actually be impressed when they look us up.",
    display_order: 2,
    created_at: '',
  },
  {
    id: '3',
    author_name: 'James Kowalski',
    business_name: 'Prairie Clean Co.',
    rating: 5,
    body: "The whole process was painless. They handled everything and kept me in the loop the entire time. The site has been live for four months and I've already recouped the investment many times over.",
    display_order: 3,
    created_at: '',
  },
];

export default function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[]>(fallback);

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('*')
      .order('display_order')
      .then(({ data }) => {
        if (data && data.length > 0) setItems(data as Testimonial[]);
      });
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            Real feedback from real Canadian business owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map(t => (
            <div
              key={t.id}
              className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-teal-300 mb-4" />
              <p className="text-gray-700 text-sm leading-relaxed mb-6">{t.body}</p>
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{t.author_name}</p>
                <p className="text-gray-500 text-xs">{t.business_name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
