import { ArrowRight, CheckCircle } from 'lucide-react';

const highlights = [
  'No technical knowledge required',
  'Launched in as little as 30 days',
  'Unlimited update requests',
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* Subtle background blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 0% 0%, rgba(59,171,173,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(138,19,233,0.07) 0%, transparent 55%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-teal-700 text-xs font-medium tracking-wide uppercase">
              Now Accepting Canadian Clients
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] mb-6">
            Professional Websites for{' '}
            <span className="text-gradient-teal">Canadian Businesses</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-8 max-w-2xl mx-auto">
            We design, build, and fully manage your website — so you can focus on running your business while we handle everything online.
          </p>

          {/* Highlights */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10">
            {highlights.map(h => (
              <div key={h} className="flex items-center gap-1.5 text-gray-500 text-sm">
                <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                {h}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-brand text-white font-semibold text-base shadow-lg hover:opacity-90 transition-all hover:shadow-teal-500/30 hover:shadow-xl"
            >
              Get Started Today
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-gray-200 text-gray-700 font-semibold text-base hover:bg-gray-50 transition-colors"
            >
              View Pricing
            </a>
          </div>
        </div>

        {/* Hero visual — browser mockup */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4 bg-white rounded-full h-5 flex items-center px-3 border border-gray-200">
                <span className="text-gray-400 text-xs">www.digitalpivot.ca</span>
              </div>
            </div>
            <img
              src="https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Modern website design preview"
              className="w-full object-cover h-64 sm:h-96"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
