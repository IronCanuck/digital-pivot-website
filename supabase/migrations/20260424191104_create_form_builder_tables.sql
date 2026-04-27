/*
  # Create Form Builder Tables

  ## Summary
  Sets up the backend for the site's customizable contact form system.

  ## New Tables

  ### 1. `form_fields`
  Stores the editable fields that make up the contact form. Each field is a "block" that the admin can add, reorder, or remove via the block editor.
  - `id` (uuid, primary key)
  - `label` (text) - The visible label shown to the user
  - `field_type` (text) - One of: text, email, tel, textarea, select
  - `placeholder` (text) - Placeholder hint text
  - `required` (boolean) - Whether the field is mandatory
  - `options` (text[]) - For select fields, the list of choices
  - `display_order` (integer) - Ordering of fields in the form
  - `created_at` (timestamptz)

  ### 2. `form_settings`
  Stores global form configuration, including the notification email address.
  - `id` (uuid, primary key)
  - `notification_email` (text) - Email to forward submissions to
  - `form_title` (text) - Title displayed at top of form
  - `form_description` (text) - Subtitle/description text
  - `submit_button_label` (text)
  - `success_message` (text)
  - `updated_at` (timestamptz)

  ### 3. `form_submissions`
  Stores each submitted form response as a JSONB object (flexible to match any field configuration).
  - `id` (uuid, primary key)
  - `data` (jsonb) - Key/value pairs of field label → response value
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public can INSERT into form_submissions (anonymous form submitters)
  - Only authenticated users (admins) can SELECT/UPDATE/INSERT/DELETE form_fields, form_settings, and SELECT form_submissions

  ## Seed Data
  - Default form_settings row inserted
  - Default form fields: Name, Email, Phone, Message
*/

-- form_fields table
CREATE TABLE IF NOT EXISTS form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL DEFAULT '',
  field_type text NOT NULL DEFAULT 'text',
  placeholder text NOT NULL DEFAULT '',
  required boolean NOT NULL DEFAULT false,
  options text[] NOT NULL DEFAULT '{}',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read form fields"
  ON form_fields FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert form fields"
  ON form_fields FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update form fields"
  ON form_fields FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete form fields"
  ON form_fields FOR DELETE
  TO authenticated
  USING (true);

-- Allow public to read form fields (needed to render the form)
CREATE POLICY "Public can read form fields"
  ON form_fields FOR SELECT
  TO anon
  USING (true);

-- form_settings table
CREATE TABLE IF NOT EXISTS form_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_email text NOT NULL DEFAULT '',
  form_title text NOT NULL DEFAULT 'Get Started',
  form_description text NOT NULL DEFAULT 'Tell us about your project and we''ll get back to you shortly.',
  submit_button_label text NOT NULL DEFAULT 'Send Message',
  success_message text NOT NULL DEFAULT 'Thanks! We''ll be in touch soon.',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE form_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read form settings"
  ON form_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert form settings"
  ON form_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update form settings"
  ON form_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow public to read form settings (needed to render the form)
CREATE POLICY "Public can read form settings"
  ON form_settings FOR SELECT
  TO anon
  USING (true);

-- form_submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a form"
  ON form_submissions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read submissions"
  ON form_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can also submit forms"
  ON form_submissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Seed default form settings
INSERT INTO form_settings (notification_email, form_title, form_description, submit_button_label, success_message)
VALUES ('', 'Get Started', 'Tell us about your project and we''ll get back to you shortly.', 'Send Message', 'Thanks for reaching out! We''ll be in touch soon.')
ON CONFLICT DO NOTHING;

-- Seed default form fields
INSERT INTO form_fields (label, field_type, placeholder, required, display_order) VALUES
  ('Full Name', 'text', 'John Smith', true, 1),
  ('Email Address', 'email', 'john@example.com', true, 2),
  ('Phone Number', 'tel', '+1 (555) 000-0000', false, 3),
  ('Message', 'textarea', 'Tell us about your project...', true, 4)
ON CONFLICT DO NOTHING;
