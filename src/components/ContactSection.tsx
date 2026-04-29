import { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle, Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const BUSINESS_TYPES = [
  'Service Provider',
  'Contractor / Trades',
  'Retail / E-commerce',
  'Restaurant / Hospitality',
  'Healthcare / Wellness',
  'Professional Services',
  'Real Estate',
  'Non-profit',
  'Other',
];

const BUDGET_RANGES = [
  'Under $5,000',
  '$5,000 – $7,500',
  '$7,500 – $12,000',
  'Monthly plan ($250/mo)',
  'Not sure yet',
];

const TIMELINES = [
  'ASAP — within 30 days',
  '1–2 months',
  '3+ months',
  'Flexible / just exploring',
];

const PLANS = [
  '',
  'Monthly Plan — $250/month',
  'One-Time Payment — $4,800',
  'Not sure yet',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface FormState {
  name: string;
  email: string;
  phone: string;
  business_name: string;
  business_type: string;
  existing_url: string;
  project_goals: string;
  selected_plan: string;
  budget_range: string;
  timeline: string;
}

const initialState: FormState = {
  name: '',
  email: '',
  phone: '',
  business_name: '',
  business_type: '',
  existing_url: '',
  project_goals: '',
  selected_plan: '',
  budget_range: '',
  timeline: '',
};

export default function ContactSection() {
  const [form, setForm] = useState<FormState>(initialState);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Pricing CTAs dispatch this event with the chosen plan.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ plan?: string }>).detail;
      if (detail?.plan) {
        setForm(f => ({ ...f, selected_plan: detail.plan as string }));
      }
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    window.addEventListener('waitlist:select-plan', handler);
    return () => window.removeEventListener('waitlist:select-plan', handler);
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_FILE_SIZE) {
      setError('File is too large — please keep attachments under 10 MB.');
      return;
    }
    setError('');
    setFile(selected);
  }

  function clearFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function uploadAttachment(): Promise<{ url: string | null; name: string | null }> {
    if (!file) return { url: null, name: null };
    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const { error: uploadErr } = await supabase
      .storage
      .from('waitlist-uploads')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || `application/${ext}`,
      });
    if (uploadErr) throw uploadErr;
    const { data } = supabase.storage.from('waitlist-uploads').getPublicUrl(path);
    return { url: data.publicUrl, name: file.name };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { url, name: attachmentName } = await uploadAttachment();

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        business_name: form.business_name.trim(),
        business_type: form.business_type,
        existing_url: form.existing_url.trim() || null,
        project_goals: form.project_goals.trim(),
        selected_plan: form.selected_plan || null,
        budget_range: form.budget_range || null,
        timeline: form.timeline || null,
        attachment_url: url,
        attachment_name: attachmentName,
      };

      const { error: insertErr } = await supabase
        .from('waitlist_applications')
        .insert([payload]);

      if (insertErr) throw insertErr;

      setSuccess(true);
      setForm(initialState);
      clearFile();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(`We couldn't submit your application — ${message}. Please try again or email hello@digitalpivot.ca.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" ref={sectionRef} className="py-24 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Left */}
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5 mb-5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-teal-700 text-xs font-medium tracking-wide uppercase">
                Only 4 Projects per Month
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Apply to the Waitlist
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-8">
              Tell us a little about your business and what you're looking for. We review every
              application personally and reply within one business day to confirm your spot.
            </p>

            <div className="space-y-5">
              {[
                { label: 'Personally Reviewed', desc: 'Every application is read and replied to by our team — no auto-responders.' },
                { label: 'No Obligation', desc: 'Submitting an application is completely free with no commitment.' },
                { label: '30-Day Guarantee', desc: "We back our work with a full refund if you're not satisfied." },
              ].map(item => (
                <div key={item.label} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-teal-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100">
            {success ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-teal-500" />
                </div>
                <h3 className="font-display font-bold text-gray-900 text-xl mb-2">You're on the Waitlist!</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  Thanks for applying. We'll review your application and reply within one business day to confirm your spot.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-6 text-teal-600 text-sm font-semibold hover:text-teal-700 transition-colors"
                >
                  Submit another application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Selected plan banner */}
                {form.selected_plan && (
                  <div className="flex items-center justify-between gap-3 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 text-sm text-teal-700">
                    <span><span className="font-semibold">Applying for:</span> {form.selected_plan}</span>
                    <button
                      type="button"
                      onClick={() => update('selected_plan', '')}
                      className="text-teal-700/70 hover:text-teal-700"
                      aria-label="Clear selected plan"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Full Name" required>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      className={inputClass}
                      placeholder="Jane Smith"
                    />
                  </Field>
                  <Field label="Email" required>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => update('email', e.target.value)}
                      className={inputClass}
                      placeholder="jane@yourbusiness.ca"
                    />
                  </Field>
                </div>

                {/* Phone + Business Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Phone Number">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      className={inputClass}
                      placeholder="+1 (555) 000-0000"
                    />
                  </Field>
                  <Field label="Business Name" required>
                    <input
                      required
                      type="text"
                      value={form.business_name}
                      onChange={e => update('business_name', e.target.value)}
                      className={inputClass}
                      placeholder="Smith Plumbing Co."
                    />
                  </Field>
                </div>

                {/* Business type + existing URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Type of Business" required>
                    <select
                      required
                      value={form.business_type}
                      onChange={e => update('business_type', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select an option…</option>
                      {BUSINESS_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Existing Website (if any)">
                    <input
                      type="url"
                      value={form.existing_url}
                      onChange={e => update('existing_url', e.target.value)}
                      className={inputClass}
                      placeholder="https://yourbusiness.ca"
                    />
                  </Field>
                </div>

                {/* Plan + Budget + Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <Field label="Plan of Interest">
                    <select
                      value={form.selected_plan}
                      onChange={e => update('selected_plan', e.target.value)}
                      className={inputClass}
                    >
                      {PLANS.map(p => (
                        <option key={p} value={p}>{p || 'No preference'}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Budget">
                    <select
                      value={form.budget_range}
                      onChange={e => update('budget_range', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">No preference</option>
                      {BUDGET_RANGES.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Timeline">
                    <select
                      value={form.timeline}
                      onChange={e => update('timeline', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">No preference</option>
                      {TIMELINES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Project goals */}
                <Field label="What are you looking for in a website?" required>
                  <textarea
                    required
                    rows={5}
                    value={form.project_goals}
                    onChange={e => update('project_goals', e.target.value)}
                    className={`${inputClass} resize-none`}
                    placeholder="Tell us about your business goals, target customers, must-have features, sites you admire, etc."
                  />
                </Field>

                {/* File upload */}
                <Field label="Logo, screenshots or brand assets (optional)">
                  {file ? (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                          <Upload className="w-4 h-4 text-teal-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="text-gray-400 hover:text-gray-600 shrink-0"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/40 transition-colors cursor-pointer">
                      <Upload className="w-5 h-5 text-teal-500" />
                      <span className="text-sm text-gray-700 font-medium">Click to upload a file</span>
                      <span className="text-xs text-gray-400">PNG, JPG, PDF or ZIP — up to 10 MB</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.zip"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                  )}
                </Field>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-brand text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-70"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                  ) : (
                    <>Apply to the Waitlist <Send className="w-4 h-4" /></>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  We only take 4 projects per month. By submitting, you agree to our Terms & Conditions.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
