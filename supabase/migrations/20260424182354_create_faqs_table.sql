/*
  # Create faqs table

  Stores FAQ questions and answers shown on the homepage FAQ accordion.

  1. New Tables
    - `faqs`
      - `id` (uuid, primary key)
      - `question` (text)
      - `answer` (text)
      - `display_order` (int)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Public read
    - Authenticated write
*/

CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL DEFAULT '',
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read faqs"
  ON faqs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert faqs"
  ON faqs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update faqs"
  ON faqs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete faqs"
  ON faqs FOR DELETE
  TO authenticated
  USING (true);
