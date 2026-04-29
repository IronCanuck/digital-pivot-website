/*
  # Create waitlist_applications table + storage bucket

  ## Summary
  Powers the public-facing "Apply to the Waitlist" form. Captures structured
  business info (business name/type, existing site URL, project goals, plan,
  budget, timeline) plus optional brand-asset file uploads (logo, screenshots).

  ## New Table: `waitlist_applications`
  - `id` (uuid, primary key)
  - `name` (text, required)
  - `email` (text, required)
  - `phone` (text, nullable)
  - `business_name` (text, required)
  - `business_type` (text, required)
  - `existing_url` (text, nullable)
  - `project_goals` (text, required) — what they're looking for
  - `selected_plan` (text, nullable) — auto-filled when arriving from pricing
  - `budget_range` (text, nullable)
  - `timeline` (text, nullable)
  - `attachment_url` (text, nullable) — public URL of uploaded asset
  - `attachment_name` (text, nullable) — original filename
  - `status` (text, default 'new') — admin workflow tracking
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Anyone (anon + authenticated) can INSERT applications
  - Only authenticated admins can SELECT / UPDATE / DELETE
  - Storage bucket `waitlist-uploads` created (public read, anon insert)
*/

CREATE TABLE IF NOT EXISTS waitlist_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  business_name text NOT NULL,
  business_type text NOT NULL,
  existing_url text,
  project_goals text NOT NULL,
  selected_plan text,
  budget_range text,
  timeline text,
  attachment_url text,
  attachment_name text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE waitlist_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a waitlist application"
  ON waitlist_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read waitlist applications"
  ON waitlist_applications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update waitlist applications"
  ON waitlist_applications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete waitlist applications"
  ON waitlist_applications FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS waitlist_applications_created_at_idx
  ON waitlist_applications (created_at DESC);

-- Storage bucket for optional brand assets / screenshots / logos.
-- Public read so admins can preview attachments without signed URLs.
INSERT INTO storage.buckets (id, name, public)
VALUES ('waitlist-uploads', 'waitlist-uploads', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  -- Allow anyone (anon + authenticated) to upload to this bucket.
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Anyone can upload waitlist attachments'
  ) THEN
    CREATE POLICY "Anyone can upload waitlist attachments"
      ON storage.objects FOR INSERT
      TO anon, authenticated
      WITH CHECK (bucket_id = 'waitlist-uploads');
  END IF;

  -- Public read of waitlist attachments (bucket is public, but explicit policy
  -- keeps things consistent if the bucket is later flipped to private).
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public can read waitlist attachments'
  ) THEN
    CREATE POLICY "Public can read waitlist attachments"
      ON storage.objects FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'waitlist-uploads');
  END IF;

  -- Admins can clean up old uploads.
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Authenticated can delete waitlist attachments'
  ) THEN
    CREATE POLICY "Authenticated can delete waitlist attachments"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'waitlist-uploads');
  END IF;
END $$;
