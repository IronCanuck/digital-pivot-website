import { Palette, TrendingUp, DollarSign } from 'lucide-react';

const pillars = [
  {
    icon: Palette,
    title: 'Stunning Design',
    body: 'Every website is crafted to look premium and professional — the kind of site that makes visitors trust you instantly and stay longer.',
    color: 'teal',
  },
  {
    icon: TrendingUp,
    title: 'Built to Convert',
    body: "We don't just make things look good. Every element is positioned to turn visitors into paying customers with clear calls-to-action and optimized layouts.",
    color: 'purple',
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    body: 'No hidden fees, no surprise invoices. One simple monthly rate covers everything — design, hosting, unlimited updates, and dedicated support.',
    color: 'teal',
  },
];

const colorMap: Record<string, string> = {
  teal: 'bg-teal-50 text-teal-600 border-teal-100',
  purple: 'bg-purple-50 text-purple-500 border-purple-100',
};

const iconBgMap: Record<string, string> = {
  teal: 'bg-teal-100 text-teal-600',
  purple: 'bg-purple-100 text-purple-500',
};

export default function ValuePillars() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Businesses Choose{' '}
            <span className="text-gradient-teal">Digital Pivot</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
            We combine great design with smart strategy to give your business the online presence it deserves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map(({ icon: Icon, title, body, color }) => (
            <div
              key={title}
              className={`rounded-2xl border p-8 transition-all hover:-translate-y-1 hover:shadow-lg ${colorMap[color]}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${iconBgMap[color]}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
