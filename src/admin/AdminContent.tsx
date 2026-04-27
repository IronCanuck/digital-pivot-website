import { useEffect, useState, useCallback } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ContentField {
  section: string;
  key: string;
  value: string;
}

const sections: { id: string; label: string; fields: { key: string; label: string; multiline?: boolean }[] }[] = [
  {
    id: 'hero',
    label: 'Hero Section',
    fields: [
      { key: 'headline', label: 'Main Headline' },
      { key: 'subheadline', label: 'Sub-headline', multiline: true },
      { key: 'cta_primary', label: 'Primary Button Text' },
      { key: 'cta_secondary', label: 'Secondary Button Text' },
    ],
  },
  {
    id: 'pillar_1',
    label: 'Value Pillar 1 (Design)',
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'body', label: 'Description', multiline: true },
    ],
  },
  {
    id: 'pillar_2',
    label: 'Value Pillar 2 (Convert)',
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'body', label: 'Description', multiline: true },
    ],
  },
  {
    id: 'pillar_3',
    label: 'Value Pillar 3 (Pricing)',
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'body', label: 'Description', multiline: true },
    ],
  },
  {
    id: 'process',
    label: 'Process Section',
    fields: [
      { key: 'headline', label: 'Headline' },
      { key: 'subheadline', label: 'Sub-headline', multiline: true },
    ],
  },
  {
    id: 'pricing',
    label: 'Pricing Section',
    fields: [
      { key: 'headline', label: 'Section Headline' },
      { key: 'subheadline', label: 'Sub-headline' },
      { key: 'plan_name', label: 'Plan Name' },
      { key: 'price', label: 'Price (numbers only)' },
      { key: 'billing_note', label: 'Billing Note' },
      { key: 'guarantee', label: 'Guarantee Text' },
    ],
  },
  {
    id: 'contact',
    label: 'Contact Section',
    fields: [
      { key: 'headline', label: 'Headline' },
      { key: 'subheadline', label: 'Sub-headline', multiline: true },
    ],
  },
  {
    id: 'footer',
    label: 'Footer',
    fields: [
      { key: 'tagline', label: 'Tagline' },
    ],
  },
];

export default function AdminContent() {
  const [content, setContent] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('site_content').select('*').then(({ data }) => {
      if (!data) return;
      const map: Record<string, Record<string, string>> = {};
      for (const row of data) {
        if (!map[row.section]) map[row.section] = {};
        map[row.section][row.key] = row.value;
      }
      setContent(map);
    });
  }, []);

  const getValue = useCallback((section: string, key: string) => {
    return content[section]?.[key] ?? '';
  }, [content]);

  const setValue = (section: string, key: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [key]: value },
    }));
  };

  const saveSection = async (sectionId: string, fields: ContentField[]) => {
    setSaving(sectionId);
    for (const field of fields) {
      await supabase.from('site_content').upsert(
        { section: field.section, key: field.key, value: field.value, updated_at: new Date().toISOString() },
        { onConflict: 'section,key' }
      );
    }
    setSaving(null);
    setSaved(sectionId);
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Page Content</h1>
        <p className="text-gray-500 text-sm mt-1">Edit the text displayed on each section of your website.</p>
      </div>

      <div className="space-y-6">
        {sections.map(section => (
          <div key={section.id} className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-display font-bold text-gray-900 mb-5">{section.label}</h2>
            <div className="space-y-4">
              {section.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    {field.label}
                  </label>
                  {field.multiline ? (
                    <textarea
                      rows={3}
                      value={getValue(section.id, field.key)}
                      onChange={e => setValue(section.id, field.key, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={getValue(section.id, field.key)}
                      onChange={e => setValue(section.id, field.key, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() =>
                  saveSection(
                    section.id,
                    section.fields.map(f => ({ section: section.id, key: f.key, value: getValue(section.id, f.key) }))
                  )
                }
                disabled={saving === section.id}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {saved === section.id ? (
                  <><CheckCircle className="w-4 h-4" /> Saved</>
                ) : saving === section.id ? (
                  'Saving...'
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
