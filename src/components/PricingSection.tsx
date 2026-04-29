import { useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import GetStartedModal from './GetStartedModal';

const features = [
  'Custom-designed, professional website',
  'Mobile responsive & fast-loading',
  'On-page SEO optimization',
  'Secure hosting included',
  'Unlimited content update requests',
  'Dedicated support team',
  'Google Analytics setup',
  'SSL certificate included',
  'Contact forms & lead capture',
];

export default function PricingSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  function openModal(plan: string) {
    setSelectedPlan(plan);
    setModalOpen(true);
  }

  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-teal-700 text-xs font-medium tracking-wide uppercase">
              Only 4 Projects Accepted per Month
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Honest Pricing
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            Two options to get your business online. Same great result, different payment structure. Spots are limited — apply to the waitlist below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Card 1 — Monthly */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-brand p-px rounded-3xl">
              <div className="h-full w-full bg-white rounded-3xl" />
            </div>
            <div className="relative p-8 sm:p-10">
              <div className="absolute top-6 right-6">
                <span className="bg-gradient-brand text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  Most Popular
                </span>
              </div>

              <h3 className="font-display text-2xl font-bold text-gray-900 mb-1">Monthly Plan</h3>
              <p className="text-gray-500 text-sm mb-6">Fully managed, spread over 24 months.</p>

              <div className="flex items-end gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-500 mb-2">CAD</span>
                <span className="font-display text-6xl font-bold text-gray-900">$250</span>
                <span className="text-gray-500 text-sm mb-3">/month</span>
              </div>
              <p className="text-sm text-gray-400 mb-1">24-month contract · Billed monthly</p>
              <p className="text-xs text-gray-400 mb-8">+ GST. Total commitment $6,000 CAD + GST.</p>

              <button
                onClick={() => openModal('Monthly Plan — $250/month')}
                className="block w-full text-center py-4 rounded-xl bg-gradient-brand text-white font-bold text-base hover:opacity-90 transition-opacity shadow-md mb-8"
              >
                Apply to the Waitlist
              </button>

              <ul className="space-y-3">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-teal-500 shrink-0" />
              </div>
            </div>
          </div>

          {/* Card 2 — One-time */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-white">
            <div className="p-8 sm:p-10">
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-1">One-Time Payment</h3>
              <p className="text-gray-500 text-sm mb-6">Pay once, own it outright. No contract.</p>

              <div className="flex items-end gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-500 mb-2">CAD</span>
                <span className="font-display text-6xl font-bold text-gray-900">$4,800</span>
              </div>
              <p className="text-sm text-gray-400 mb-1">Single payment · No monthly fees · No contract</p>
              <p className="text-xs text-gray-400 mb-8">+ GST. One-time payment of $4,800 CAD + GST.</p>

              <button
                onClick={() => openModal('One-Time Payment — $5,600')}
                className="block w-full text-center py-4 rounded-xl border-2 border-teal-400 text-teal-600 font-bold text-base hover:bg-teal-50 transition-colors mb-8"
              >
                Apply to the Waitlist
              </button>

              <ul className="space-y-3">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-gray-400 shrink-0" />
              </div>
            </div>
          </div>

        </div>

        {/* Global small print */}
        <p className="text-center text-xs text-gray-400 mt-8">
          All prices in Canadian dollars. GST will be added at checkout where applicable. By proceeding you agree to our Terms & Conditions.
        </p>
      </div>

      <GetStartedModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        plan={selectedPlan}
      />
    </section>
  );
}
