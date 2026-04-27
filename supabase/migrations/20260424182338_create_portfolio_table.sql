/*
  # Create portfolio table

  Stores client website showcase entries displayed in the portfolio section.

  1. New Tables
    - `portfolio`
      - `id` (uuid, primary key)
      - `name` (text) - client/project name
      - `description` (text) - short description
      - `image_url` (text) - screenshot or mockup image URL
      - `site_url` (text, nullable) - link to live site
      - `display_order` (int) - sort order
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Public read
    - Authenticated write
*/

CREATE TABLE IF NOT EXISTS portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  site_url text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read portfolio"
  ON portfolio FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert portfolio"
  ON portfolio FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update portfolio"
  ON portfolio FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete portfolio"
  ON portfolio FOR DELETE
  TO authenticated
  USING (true);
