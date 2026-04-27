import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { FormField, FormSettings } from '../lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  plan?: string;
}

export default function GetStartedModal({ open, onClose, plan }: Props) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [settings, setSettings] = useState<FormSettings | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      supabase.from('form_fields').select('*').order('display_order'),
      supabase.from('form_settings').select('*').maybeSingle(),
    ]).then(([fieldsRes, settingsRes]) => {
      if (fieldsRes.data) setFields(fieldsRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
    });
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setValues({});
        setErrors({});
        setSubmitted(false);
      }, 300);
    }
  }, [open]);

  function validate() {
    const errs: Record<string, string> = {};
    fields.forEach(f => {
      if (f.required && !values[f.label]?.trim()) {
        errs[f.label] = `${f.label} is required`;
      }
      if (f.field_type === 'email' && values[f.label] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[f.label])) {
        errs[f.label] = 'Please enter a valid email address';
      }
    });
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const data: Record<string, string> = { ...values };
      if (plan) data['Selected Plan'] = plan;

      await supabase.from('form_submissions').insert({ data });

      // Notify via edge function if notification email is set
      if (settings?.notification_email) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        await fetch(`${supabaseUrl}/functions/v1/notify-form-submission`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            to: settings.notification_email,
            formData: data,
          }),
        });
      }

      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="font-display font-bold text-xl text-gray-900">
              {settings?.form_title || 'Get Started'}
            </h2>
            {settings?.form_description && (
              <p className="text-sm text-gray-500 mt-0.5">{settings.form_description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-teal-500" />
              </div>
              <h3 className="font-display font-bold text-lg text-gray-900 mb-2">You're all set!</h3>
              <p className="text-gray-500 text-sm">{settings?.success_message || 'Thanks for reaching out! We\'ll be in touch soon.'}</p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {plan && (
                <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 text-sm text-teal-700 font-medium">
                  Selected: {plan}
                </div>
              )}

              {fields.map(field => (
                <div key={field.id}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field.field_type === 'textarea' ? (
                    <textarea
                      value={values[field.label] ?? ''}
                      onChange={e => {
                        setValues(v => ({ ...v, [field.label]: e.target.value }));
                        if (errors[field.label]) setErrors(er => ({ ...er, [field.label]: '' }));
                      }}
                      placeholder={field.placeholder}
                      rows={4}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all resize-none ${
                        errors[field.label] ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                  ) : field.field_type === 'select' ? (
                    <select
                      value={values[field.label] ?? ''}
                      onChange={e => {
                        setValues(v => ({ ...v, [field.label]: e.target.value }));
                        if (errors[field.label]) setErrors(er => ({ ...er, [field.label]: '' }));
                      }}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all ${
                        errors[field.label] ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <option value="">{field.placeholder || `Select ${field.label}...`}</option>
                      {(field.options ?? []).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.field_type}
                      value={values[field.label] ?? ''}
                      onChange={e => {
                        setValues(v => ({ ...v, [field.label]: e.target.value }));
                        if (errors[field.label]) setErrors(er => ({ ...er, [field.label]: '' }));
                      }}
                      placeholder={field.placeholder}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all ${
                        errors[field.label] ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                  )}

                  {errors[field.label] && (
                    <p className="text-red-500 text-xs mt-1">{errors[field.label]}</p>
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  settings?.submit_button_label || 'Send Message'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
