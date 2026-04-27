import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { supabase, FAQ } from '../lib/supabase';

const fallback: FAQ[] = [
  { id: '1', question: 'Who is Digital Pivot designed for?', answer: "We work with small to medium-sized Canadian businesses who need a professional website that actually generates leads. Whether you're a contractor, service provider, or local retailer, we can help.", display_order: 1, created_at: '' },
  { id: '2', question: 'What is included in the monthly fee?', answer: "Your $300/month covers everything: custom website design, secure hosting, ongoing updates and edits, performance monitoring, and direct support. There are no hidden costs.", display_order: 2, created_at: '' },
  { id: '3', question: 'Do I own the website?', answer: "You own all the content and branding on your website. The platform subscription covers design, hosting, and management services for the duration of your contract.", display_order: 3, created_at: '' },
  { id: '4', question: 'Is there a money-back guarantee?', answer: "Yes. If you are not satisfied within the first 30 days of your site going live, we will provide a full refund — no questions asked.", display_order: 4, created_at: '' },
  { id: '5', question: 'How long does it take to launch?', answer: "Most websites are live within 30 days of your onboarding call. The timeline depends on how quickly we receive your information and any revision feedback.", display_order: 5, created_at: '' },
  { id: '6', question: 'Is the website optimized for Google?', answer: "Absolutely. Every website we build includes on-page SEO best practices: proper heading structure, meta tags, fast loading speeds, and mobile-friendly design.", display_order: 6, created_at: '' },
  { id: '7', question: 'Can I make changes to the website myself?', answer: "You can request changes at any time by contacting our support team. Unlimited content updates are included in your monthly plan.", display_order: 7, created_at: '' },
  { id: '8', question: 'What happens at the end of my 24-month contract?', answer: "After your initial term, your contract moves to a flexible month-to-month arrangement. We'll reach out before your term ends to discuss your options.", display_order: 8, created_at: '' },
];

export default function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>(fallback);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('faqs')
      .select('*')
      .order('display_order')
      .then(({ data }) => {
        if (data && data.length > 0) setFaqs(data as FAQ[]);
      });
  }, []);

  return (
    <section id="faq" className="py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 text-base">
            Have a question not listed here? Reach out and we'll get back to you within one business day.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map(faq => (
            <div
              key={faq.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-semibold text-gray-900 text-sm pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-teal-500 shrink-0 transition-transform duration-200 ${
                    open === faq.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  open === faq.id ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
