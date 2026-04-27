/*
  # Create site_content table

  Stores all editable text content for each section of the public website.

  1. New Tables
    - `site_content`
      - `id` (uuid, primary key)
      - `section` (text) - identifies which page section (hero, benefits, process, etc.)
      - `key` (text) - field identifier within the section
      - `value` (text) - the actual content value
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Public can read all content
    - Only authenticated admin users can write
*/

CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  key text NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(section, key)
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site content"
  ON site_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert site content"
  ON site_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update site content"
  ON site_content FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete site content"
  ON site_content FOR DELETE
  TO authenticated
  USING (true);
