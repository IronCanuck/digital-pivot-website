import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { supabase, Portfolio } from '../lib/supabase';

const fallbackPortfolio: Portfolio[] = [
  {
    id: '1',
    name: 'Maple Ridge Plumbing',
    description: 'Full-service plumbing company serving the Greater Toronto Area',
    image_url: 'https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=800',
    site_url: null,
    display_order: 1,
    created_at: '',
  },
  {
    id: '2',
    name: 'Northern Lights HVAC',
    description: 'Heating and cooling specialists for residential and commercial properties',
    image_url: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
    site_url: null,
    display_order: 2,
    created_at: '',
  },
  {
    id: '3',
    name: 'Prairie Clean Co.',
    description: 'Professional cleaning services for homes and offices',
    image_url: 'https://images.pexels.com/photos/4352247/pexels-photo-4352247.jpeg?auto=compress&cs=tinysrgb&w=800',
    site_url: null,
    display_order: 3,
    created_at: '',
  },
  {
    id: '4',
    name: 'Summit Landscaping',
    description: 'Landscape design, maintenance, and seasonal cleanup',
    image_url: 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=800',
    site_url: null,
    display_order: 4,
    created_at: '',
  },
  {
    id: '5',
    name: 'Coast Electrical',
    description: 'Licensed electricians for residential and light commercial work',
    image_url: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800',
    site_url: null,
    display_order: 5,
    created_at: '',
  },
  {
    id: '6',
    name: 'Ridgeline Roofing',
    description: 'Roof installation, repair, and inspection throughout Ontario',
    image_url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
    site_url: null,
    display_order: 6,
    created_at: '',
  },
];

export default function PortfolioSection() {
  const [items, setItems] = useState<Portfolio[]>(fallbackPortfolio);

  useEffect(() => {
    supabase
      .from('portfolio')
      .select('*')
      .order('display_order')
      .then(({ data }) => {
        if (data && data.length > 0) setItems(data as Portfolio[]);
      });
  }, []);

  return (
    <section id="portfolio" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Our Work Speaks for Itself
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            A sample of the websites we've built for Canadian service businesses like yours.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="text-white font-display font-bold text-lg">{item.name}</h3>
                <p className="text-white/70 text-sm mt-1">{item.description}</p>
                {item.site_url && (
                  <a
                    href={item.site_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-teal-400 text-sm font-medium hover:text-teal-300 transition-colors"
                  >
                    View Site <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="p-4 group-hover:hidden">
                <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
