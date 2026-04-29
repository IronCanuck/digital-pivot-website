import { useEffect } from 'react';
import { Check, ShieldCheck, Sparkles, Mail, Clock, BadgeCheck } from 'lucide-react';

const SUPPORT_EMAIL = 'hello@digitalpivot.ca';

function mailto(plan: string) {
  const subject = encodeURIComponent(`Care Plan Inquiry — ${plan}`);
  const body = encodeURIComponent(
    `Hi Digital Pivot team,\n\nI'd like to continue with the ${plan} after my current contract ends.\n\nMy business / site:\n\nThanks!`
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}

const tiers = [
  {
    name: 'Essential Care',
    price: '$79',
    cadence: '/month',
    tagline: 'The "don\'t break my site" plan. Rock-solid foundations.',
    accent: 'teal',
    features: [
      'Hosting, SSL & domain renewal handling',
      'Daily off-site backups',
      'Framework + dependency updates',
      'Security monitoring + vulnerability scans',
      '24/7 uptime monitoring',
      'Up to 30 min/mo of small text or image swaps',
      'Email support, 48-hour response',
    ],
  },
  {
    name: 'Standard Care',
    price: '$149',
    cadence: '/month',
    tagline: 'Where most clients land. Steady momentum without the agency price tag.',
    accent: 'brand',
    badge: 'Most Popular',
    features: [
      'Everything in Essential',
      'Up to 2 hours/mo of content & design updates',
      'Quarterly SEO + Core Web Vitals health check',
      'Monthly performance + traffic report',
      'Priority email support, 24-hour response',
    ],
  },
  {
    name: 'Growth Care',
    price: '$249',
    cadence: '/month',
    tagline: 'For clients treating their site as a real lead engine.',
    accent: 'purple',
    badge: 'High Performance',
    features: [
      'Everything in Standard',
      'Up to 5 hours/mo of dev, design & content work',
      'Monthly SEO + GA4 + Search Console report with recommendations',
      '1 A/B test per month (built on Vercel Edge) with written recap',
      'Quarterly conversion review (funnel walkthrough)',
      '1 × 30-min strategy call per quarter',
      'Same-business-day support',
    ],
  },
];

export default function CarePlansPage() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Continuing Care Plans · Digital Pivot';

    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);

    return () => {
      document.title = prevTitle;
      robots.remove();
    };
  }, []);

  return (
    <main className="bg-gray-50">
      {/* Hero */}
      <section className="pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5 mb-5">
            <BadgeCheck className="w-3.5 h-3.5 text-teal-500" />
            <span className="text-teal-700 text-xs font-medium tracking-wide uppercase">
              For Existing Clients · Post-Contract Care
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
            Keep your site running like the day it launched.
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Your contract is winding down — congratulations on owning your site outright. Choose a continuing care plan to keep hosting, security, and updates handled, with no long-term commitment.
          </p>
        </div>
      </section>

      {/* Tiers */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {tiers.map(tier => {
              const isBrand = tier.accent === 'brand';
              const isPurple = tier.accent === 'purple';

              return (
                <div
                  key={tier.name}
                  className={`relative rounded-3xl overflow-hidden ${
                    isBrand ? 'shadow-2xl' : 'shadow-lg border border-gray-200 bg-white'
                  }`}
                >
                  {isBrand && (
                    <div className="absolute inset-0 bg-gradient-brand p-px rounded-3xl">
                      <div className="h-full w-full bg-white rounded-3xl" />
                    </div>
                  )}
                  {isPurple && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 p-px rounded-3xl">
                      <div className="h-full w-full bg-white rounded-3xl" />
                    </div>
                  )}

                  <div className="relative p-8 sm:p-10">
                    {tier.badge && (
                      <div className="absolute top-6 right-6">
                        <span
                          className={`text-white text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${
                            isPurple
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                              : 'bg-gradient-brand'
                          }`}
                        >
                          {isPurple && <Sparkles className="w-3 h-3" />}
                          {tier.badge}
                        </span>
                      </div>
                    )}

                    <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">
                      {tier.name}
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">{tier.tagline}</p>

                    <div className="flex items-end gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-500 mb-2">CAD</span>
                      <span className="font-display text-5xl font-bold text-gray-900">
                        {tier.price}
                      </span>
                      <span className="text-gray-500 text-sm mb-2">{tier.cadence}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-6">
                      Month-to-month · Cancel with 30 days notice · + GST
                    </p>

                    <a
                      href={mailto(tier.name)}
                      className={`flex items-center justify-center gap-2 w-full text-center py-4 rounded-xl font-bold text-base transition-all mb-8 ${
                        isBrand
                          ? 'bg-gradient-brand text-white hover:opacity-90 shadow-md'
                          : isPurple
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-md'
                          : 'border-2 border-teal-400 text-teal-600 hover:bg-teal-50'
                      }`}
                    >
                      <Mail className="w-4 h-4" /> Email to Get Started
                    </a>

                    <ul className="space-y-3">
                      {tier.features.map((f, i) => (
                        <li
                          key={f}
                          className={`flex items-start gap-3 text-sm ${
                            i === 0 && f.startsWith('Everything in')
                              ? 'text-gray-500 italic'
                              : 'text-gray-700'
                          }`}
                        >
                          <Check
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              isPurple ? 'text-pink-500' : 'text-teal-500'
                            }`}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                      <ShieldCheck
                        className={`w-8 h-8 shrink-0 ${
                          isPurple
                            ? 'text-pink-500'
                            : isBrand
                            ? 'text-teal-500'
                            : 'text-gray-400'
                        }`}
                      />
                      <p className="text-xs text-gray-400">
                        No lock-in. Cancel anytime with 30 days notice.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Perks / fine print */}
      <section className="pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-10">
            <h3 className="font-display text-xl font-bold text-gray-900 mb-6">
              The fine print, in plain English
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-600">
              <div className="flex gap-3">
                <BadgeCheck className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold text-gray-900">Annual prepay discount:</span>{' '}
                  Pay yearly upfront and get <span className="font-semibold">10% off</span> any
                  tier.
                </p>
              </div>
              <div className="flex gap-3">
                <BadgeCheck className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold text-gray-900">Loyalty welcome:</span> First 3
                  months at <span className="font-semibold">50% off</span> when transitioning
                  directly from your contract.
                </p>
              </div>
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold text-gray-900">Need more hours?</span> Anything
                  beyond your plan is billed at{' '}
                  <span className="font-semibold">$95/hr CAD</span>, in 15-minute increments.
                </p>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold text-gray-900">You still own your site.</span>{' '}
                  Care plans don't change that. Cancel anytime and we'll hand off cleanly.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500 mb-3">
                Not sure which tier fits? Just reply to your offboarding email or send us a note.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                  'Care Plan — Question'
                )}`}
                className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm hover:text-teal-700 transition-colors"
              >
                <Mail className="w-4 h-4" /> {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
