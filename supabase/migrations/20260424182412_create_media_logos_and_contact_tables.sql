/*
  # Create media_logos and contact_submissions tables

  1. New Tables
    - `media_logos` - stores "As Seen On" logo entries
      - `id` (uuid, primary key)
      - `name` (text) - media outlet name
      - `image_url` (text) - logo image URL
      - `display_order` (int)

    - `contact_submissions` - stores website contact form entries
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text, nullable)
      - `message` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Public can insert contact submissions
    - Authenticated users can read contact submissions
    - Public can read media logos
    - Authenticated users can manage media logos
*/

CREATE TABLE IF NOT EXISTS media_logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL DEFAULT '',
  display_order int NOT NULL DEFAULT 0
);

ALTER TABLE media_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read media logos"
  ON media_logos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert media logos"
  ON media_logos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update media logos"
  ON media_logos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete media logos"
  ON media_logos FOR DELETE
  TO authenticated
  USING (true);


CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read contact submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (true);
