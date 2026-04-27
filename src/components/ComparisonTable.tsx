import { Check, X } from 'lucide-react';

const criteria = [
  'Professional custom design',
  'Mobile responsive',
  'SEO optimized',
  'Ongoing updates & support',
  'Transparent flat-rate pricing',
  'Dedicated account manager',
  'Fast launch (30 days)',
];

const columns = [
  { label: 'Digital Pivot', highlight: true, values: [true, true, true, true, true, true, true] },
  { label: 'Freelancer', highlight: false, values: [true, true, false, false, false, false, false] },
  { label: 'Traditional Agency', highlight: false, values: [true, true, true, false, false, true, false] },
  { label: 'DIY Builder', highlight: false, values: [false, true, false, false, true, false, true] },
];

export default function ComparisonTable() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How We Stack Up
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            See how Digital Pivot compares to the other options available to your business.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-200 bg-white">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="text-left px-6 py-5 text-sm font-semibold text-gray-500 w-1/3">What you get</th>
                {columns.map(col => (
                  <th key={col.label} className={`px-6 py-5 text-center text-sm font-bold ${col.highlight ? 'text-teal-600' : 'text-gray-700'}`}>
                    {col.highlight && (
                      <span className="block text-xs font-semibold mb-1 bg-gradient-brand text-white rounded-full px-3 py-0.5 mx-auto w-fit">
                        Best Choice
                      </span>
                    )}
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion, i) => (
                <tr key={criterion} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{criterion}</td>
                  {columns.map(col => (
                    <td key={col.label} className="px-6 py-4 text-center">
                      {col.values[i] ? (
                        <Check className={`w-5 h-5 mx-auto ${col.highlight ? 'text-teal-500' : 'text-green-500'}`} />
                      ) : (
                        <X className="w-5 h-5 mx-auto text-red-400" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
