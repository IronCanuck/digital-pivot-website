import { Sparkles, Target, Search, Headphones as HeadphonesIcon } from 'lucide-react';

const benefits = [
  {
    icon: Sparkles,
    title: 'Beautiful Design, Every Time',
    body: "Cookie-cutter templates won't cut it. Every site we build is custom-designed to reflect your brand and impress the people who matter most — your customers.",
    image: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: Target,
    title: 'Websites That Generate Leads',
    body: "A beautiful website that doesn't convert is just an expensive brochure. We design every page with one goal in mind: turning visitors into paying clients.",
    image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: Search,
    title: 'Ready for Google from Day One',
    body: 'Every site we build follows SEO best practices — fast load times, proper structure, mobile optimization, and the technical foundation search engines reward.',
    image: 'https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: HeadphonesIcon,
    title: 'Fully Managed, Worry-Free',
    body: "Your website won't go stale or fall behind. We handle updates, security, performance, and any content changes — you just focus on your business.",
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything Your Website Needs to Succeed
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            We don't cut corners. Every Digital Pivot website is built with four non-negotiables.
          </p>
        </div>

        <div className="space-y-16">
          {benefits.map(({ icon: Icon, title, body, image }, index) => (
            <div
              key={title}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Image */}
              <div className="w-full lg:w-1/2">
                <div className="rounded-2xl overflow-hidden shadow-lg aspect-video">
                  <img src={image} alt={title} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Text */}
              <div className="w-full lg:w-1/2">
                <div className="w-12 h-12 rounded-xl bg-gradient-brand-soft flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-500 leading-relaxed text-base">{body}</p>
                <a
                  href="#contact"
                  className="mt-6 inline-flex items-center text-teal-600 font-semibold text-sm hover:text-teal-500 transition-colors"
                >
                  Learn More →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
