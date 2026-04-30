import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl?.trim() || !supabaseAnonKey?.trim()) {
  throw new Error(
    'Supabase env missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
      'Local: add them to .env and restart `npm run dev`. ' +
      'Production: set both in your host (e.g. Vercel) and redeploy — Vite bakes them in at build time.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface SiteContent {
  id: string;
  section: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  image_url: string;
  site_url: string | null;
  display_order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  business_name: string;
  rating: number;
  body: string;
  display_order: number;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface MediaLogo {
  id: string;
  name: string;
  image_url: string;
  display_order: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
}

export interface FormField {
  id: string;
  label: string;
  field_type: string;
  placeholder: string;
  required: boolean;
  options: string[];
  display_order: number;
  created_at: string;
}

export interface FormSettings {
  id: string;
  notification_email: string;
  form_title: string;
  form_description: string;
  submit_button_label: string;
  success_message: string;
  updated_at: string;
}

export interface FormSubmission {
  id: string;
  data: Record<string, string>;
  created_at: string;
}

export interface Notification {
  id: string;
  type: 'form_submission' | 'contact' | 'waitlist' | string;
  title: string;
  message: string;
  link_url: string;
  source_table: string;
  source_id: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface WaitlistApplication {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  business_name: string;
  business_type: string;
  existing_url: string | null;
  project_goals: string;
  selected_plan: string | null;
  budget_range: string | null;
  timeline: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  status: string;
  created_at: string;
}
