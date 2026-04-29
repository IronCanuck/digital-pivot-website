/*
  # Page Builder Tables

  Creates the schema for a WordPress + Elementor-style block-based page builder.

  ## New Tables

  ### 1. `pages`
  A logical page on the public site. Identified by a URL slug (e.g. "home", "about").
  - `id` (uuid, primary key)
  - `slug` (text, unique) — URL slug; the special slug `home` overrides the homepage.
  - `title` (text) — Internal/admin title (also used as <title> if seo_title is blank).
  - `status` (text) — `draft` or `published`. Only `published` is visible publicly.
  - `seo_title` (text) — Optional <title> tag override.
  - `seo_description` (text) — Optional meta description.
  - `og_image_url` (text) — Optional OG/twitter image.
  - `is_homepage` (boolean) — Convenience flag (slug=home is the canonical homepage).
  - `created_by` (uuid) — FK to auth.users.
  - `created_at`, `updated_at` (timestamptz)

  ### 2. `page_blocks`
  The block tree for a page. Blocks may nest inside container blocks via `parent_id`.
  - `id` (uuid, primary key)
  - `page_id` (uuid, FK pages, on delete cascade)
  - `parent_id` (uuid, nullable, self-FK, on delete cascade)
  - `block_type` (text) — registry key: heading, rich_text, image, button, container, video, spacer, divider, html, form, preset, gallery
  - `props` (jsonb) — block-specific configuration
  - `display_order` (integer)
  - `created_at`, `updated_at` (timestamptz)

  ### 3. `media_assets`
  Tracks files uploaded to the `site-media` Storage bucket so the editor can list/pick them.
  - `id` (uuid, primary key)
  - `storage_path` (text) — Path inside the bucket (e.g. uploads/abc.png)
  - `public_url` (text) — Cached public URL
  - `mime_type` (text)
  - `size_bytes` (bigint)
  - `alt_text` (text)
  - `uploaded_by` (uuid)
  - `created_at` (timestamptz)

  ### 4. `admin_profiles`
  Marks which auth users are allowed to access the admin panel.
  - `id` (uuid, primary key) — equals `auth.users.id`
  - `role` (text) — `owner` or `admin`
  - `created_at` (timestamptz)

  ### 5. `admin_invites`
  One-time invite codes for adding new admin users.
  - `id` (uuid, primary key)
  - `code` (text, unique) — random invite code
  - `created_by` (uuid) — admin who generated it
  - `used_by` (uuid, nullable) — auth user who consumed it
  - `used_at` (timestamptz, nullable)
  - `expires_at` (timestamptz, nullable)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables.
  - `pages` + `page_blocks`: public can SELECT only when the page is `published`.
  - All writes (insert/update/delete) restricted to authenticated users present in `admin_profiles`.
  - `media_assets`: public can SELECT (so PageRenderer can show alt text); only admins can write.
  - `admin_profiles`: an authenticated user can SELECT their own row; only owner can mutate.
  - `admin_invites`: only authenticated admins can manage; the signup edge function uses the service role to validate/consume.

  ## Helpers
  - `is_admin()` SQL helper used by RLS policies.
*/

-- ------------------------------------------------------------------
-- admin_profiles
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('owner','admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own profile"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can read all profiles"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_profiles ap WHERE ap.id = auth.uid()));

-- Helper used by other RLS policies.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ------------------------------------------------------------------
-- admin_invites
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read invites"
  ON admin_invites FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can create invites"
  ON admin_invites FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete invites"
  ON admin_invites FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------
-- pages
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  og_image_url text NOT NULL DEFAULT '',
  is_homepage boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pages_status_idx ON pages(status);
CREATE INDEX IF NOT EXISTS pages_slug_idx ON pages(slug);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published pages"
  ON pages FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins can insert pages"
  ON pages FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update pages"
  ON pages FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete pages"
  ON pages FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------
-- page_blocks
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS page_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES page_blocks(id) ON DELETE CASCADE,
  block_type text NOT NULL,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_blocks_page_idx ON page_blocks(page_id, parent_id, display_order);

ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read blocks of published pages"
  ON page_blocks FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pages p
      WHERE p.id = page_blocks.page_id
        AND (p.status = 'published' OR public.is_admin())
    )
  );

CREATE POLICY "Admins can insert page blocks"
  ON page_blocks FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update page blocks"
  ON page_blocks FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete page blocks"
  ON page_blocks FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------
-- media_assets
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  public_url text NOT NULL,
  mime_type text NOT NULL DEFAULT '',
  size_bytes bigint NOT NULL DEFAULT 0,
  alt_text text NOT NULL DEFAULT '',
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_assets_created_idx ON media_assets(created_at DESC);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read media assets"
  ON media_assets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert media assets"
  ON media_assets FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update media assets"
  ON media_assets FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete media assets"
  ON media_assets FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------
-- Bootstrap: promote existing auth users to admin_profiles so the
-- pre-existing admin login keeps working after this migration runs.
-- ------------------------------------------------------------------
INSERT INTO admin_profiles (id, role)
SELECT u.id,
  CASE WHEN row_number() OVER (ORDER BY u.created_at) = 1 THEN 'owner' ELSE 'admin' END
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------
-- Seed: default homepage page with "preset" blocks mirroring current
-- React sections so the editor has something meaningful to show.
-- ------------------------------------------------------------------
DO $$
DECLARE
  v_home_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pages WHERE slug = 'home') THEN
    INSERT INTO pages (slug, title, status, is_homepage)
    VALUES ('home', 'Home', 'draft', true)
    RETURNING id INTO v_home_id;

    INSERT INTO page_blocks (page_id, block_type, props, display_order) VALUES
      (v_home_id, 'preset', jsonb_build_object('component', 'hero'), 1),
      (v_home_id, 'preset', jsonb_build_object('component', 'value_pillars'), 2),
      (v_home_id, 'preset', jsonb_build_object('component', 'comparison'), 3),
      (v_home_id, 'preset', jsonb_build_object('component', 'portfolio'), 4),
      (v_home_id, 'preset', jsonb_build_object('component', 'process'), 5),
      (v_home_id, 'preset', jsonb_build_object('component', 'benefits'), 6),
      (v_home_id, 'preset', jsonb_build_object('component', 'pricing'), 7),
      (v_home_id, 'preset', jsonb_build_object('component', 'testimonials'), 8),
      (v_home_id, 'preset', jsonb_build_object('component', 'faq'), 9),
      (v_home_id, 'preset', jsonb_build_object('component', 'contact'), 10);
  END IF;
END $$;
