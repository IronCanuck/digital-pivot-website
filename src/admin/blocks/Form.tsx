import { useEffect, useState } from 'react';
import { FormInput } from 'lucide-react';
import type { BlockDefinition } from './types';
import { supabase } from '../../lib/supabase';
import type { FormField, FormSettings } from '../../lib/supabase';
import { Field, TextInput } from './Inspector';

interface FormProps extends Record<string, unknown> {
  title: string;
  description: string;
}

const defaultProps: FormProps = {
  title: '',
  description: '',
};

// eslint-disable-next-line react-refresh/only-export-components
function FormBlockRender({ props, mode }: { props: FormProps; mode: 'view' | 'edit' }) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [settings, setSettings] = useState<FormSettings | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('form_fields').select('*').order('display_order'),
      supabase.from('form_settings').select('*').maybeSingle(),
    ]).then(([fieldsRes, settingsRes]) => {
      if (fieldsRes.data) setFields(fieldsRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'edit') return;
    setSubmitting(true);
    await supabase.from('form_submissions').insert({ data: values });
    setSubmitting(false);
    setSubmitted(true);
  };

  const heading = props.title || settings?.form_title || 'Contact us';
  const subheading = props.description || settings?.form_description || '';

  return (
    <div className="my-6 mx-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <h3 className="font-display text-2xl font-bold text-gray-900">{heading}</h3>
        {subheading && <p className="text-gray-500 text-sm mt-1">{subheading}</p>}
        {submitted ? (
          <p className="mt-6 text-teal-600 text-sm">
            {settings?.success_message ?? 'Thanks! We\'ll be in touch soon.'}
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {fields.map(f => (
              <div key={f.id}>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  {f.label}
                  {f.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                {f.field_type === 'textarea' ? (
                  <textarea
                    rows={4}
                    required={f.required}
                    placeholder={f.placeholder}
                    value={values[f.label] ?? ''}
                    onChange={e => setValues(v => ({ ...v, [f.label]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
                  />
                ) : f.field_type === 'select' ? (
                  <select
                    required={f.required}
                    value={values[f.label] ?? ''}
                    onChange={e => setValues(v => ({ ...v, [f.label]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    {f.options.map(o => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.field_type}
                    required={f.required}
                    placeholder={f.placeholder}
                    value={values[f.label] ?? ''}
                    onChange={e => setValues(v => ({ ...v, [f.label]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  />
                )}
              </div>
            ))}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-brand text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-70"
            >
              {submitting ? 'Sending...' : settings?.submit_button_label ?? 'Send'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export const FormBlock: BlockDefinition<FormProps> = {
  type: 'form',
  label: 'Contact Form',
  icon: FormInput,
  group: 'advanced',
  defaultProps,
  Render: ({ props, mode }) => <FormBlockRender props={props} mode={mode} />,
  Inspector: ({ props, onChange }) => (
    <div className="space-y-4">
      <Field label="Title (optional)" hint="Falls back to the global form title.">
        <TextInput value={props.title} onChange={v => onChange({ title: v })} />
      </Field>
      <Field label="Description (optional)">
        <TextInput value={props.description} onChange={v => onChange({ description: v })} />
      </Field>
      <p className="text-xs text-gray-500">
        Edit fields, success message, and notification email in the Form Builder admin page.
      </p>
    </div>
  ),
};
