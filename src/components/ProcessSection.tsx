import { Package, ClipboardList, Hammer, Rocket, BarChart2 } from 'lucide-react';

const steps = [
  {
    icon: Package,
    number: '01',
    title: 'Choose Your Plan',
    body: 'Select the Digital Pivot Business Website package and complete your sign-up in minutes.',
  },
  {
    icon: ClipboardList,
    number: '02',
    title: 'Quick Onboarding',
    body: 'We gather everything we need in a 30-minute onboarding call — your branding, services, and goals.',
  },
  {
    icon: Hammer,
    number: '03',
    title: 'We Build It',
    body: "Our team gets to work designing and developing your custom website. You review and provide feedback.",
  },
  {
    icon: Rocket,
    number: '04',
    title: 'Launch Day',
    body: 'Once you approve the final design, we handle the technical launch — no effort required on your end.',
  },
  {
    icon: BarChart2,
    number: '05',
    title: 'Grow & Optimize',
    body: 'Your site is live and working for you. We monitor performance, apply updates, and support you ongoing.',
  },
];

export default function ProcessSection() {
  return (
    <section id="process" className="py-24 bg-white relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 0% 50%, rgba(59,171,173,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 100% 50%, rgba(138,19,233,0.05) 0%, transparent 55%)',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Getting Started Is Simple
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            From sign-up to launch, we handle every step. All we need is 30 minutes of your time.
          </p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map(({ icon: Icon, number, title, body }) => (
              <div key={number} className="flex flex-col items-center text-center group">
                <div className="relative mb-5">
                  <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:border-teal-300 transition-colors shadow-sm">
                    <Icon className="w-8 h-8 text-teal-500" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-gradient-brand text-white text-xs font-bold flex items-center justify-center shadow-md">
                    {number.replace('0', '')}
                  </span>
                </div>
                <h3 className="font-display font-bold text-gray-900 text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
