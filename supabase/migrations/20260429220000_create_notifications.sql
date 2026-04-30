/*
  # Notifications system

  Creates a `notifications` table plus triggers that automatically insert a
  notification whenever a new submission lands in `form_submissions`,
  `contact_submissions`, or `waitlist_applications`. Powers the admin
  Notifications page and the unread badge in the sidebar.

  ## New Table: `notifications`
  - `id` (uuid, pk)
  - `type` (text) — one of: form_submission, contact, waitlist
  - `title` (text) — short headline shown in the list
  - `message` (text) — preview body (first values from the submission)
  - `link_url` (text) — admin route to open for full detail (e.g. /admin/form-submissions)
  - `source_table` (text) — submitter table name
  - `source_id` (uuid, nullable) — id of the originating row
  - `metadata` (jsonb) — extra fields (e.g. submitter name/email)
  - `read_at` (timestamptz, nullable) — when an admin marked it read
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled.
  - Only admins (`public.is_admin()`) can SELECT / UPDATE / DELETE.
  - Triggers run with definer rights so anon inserts on submission tables can
    still create notification rows without granting anon write access here.
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  link_url text NOT NULL DEFAULT '',
  source_table text NOT NULL DEFAULT '',
  source_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_created_idx ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON notifications(read_at) WHERE read_at IS NULL;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------
-- Trigger functions
-- ------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.notify_form_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_email text;
  v_preview text;
BEGIN
  v_name := COALESCE(NEW.data->>'Full Name', NEW.data->>'Name', NEW.data->>'name', '');
  v_email := COALESCE(NEW.data->>'Email Address', NEW.data->>'Email', NEW.data->>'email', '');
  v_preview := COALESCE(NEW.data->>'Message', NEW.data->>'message', '');

  INSERT INTO public.notifications (type, title, message, link_url, source_table, source_id, metadata)
  VALUES (
    'form_submission',
    CASE
      WHEN v_name <> '' THEN 'New form submission from ' || v_name
      ELSE 'New form submission'
    END,
    NULLIF(LEFT(v_preview, 200), ''),
    '/admin/form-submissions',
    'form_submissions',
    NEW.id,
    jsonb_build_object('name', v_name, 'email', v_email, 'data', NEW.data)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_contact_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (type, title, message, link_url, source_table, source_id, metadata)
  VALUES (
    'contact',
    'New contact message from ' || NEW.name,
    LEFT(NEW.message, 200),
    '/admin/contacts',
    'contact_submissions',
    NEW.id,
    jsonb_build_object('name', NEW.name, 'email', NEW.email, 'phone', NEW.phone)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_waitlist_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (type, title, message, link_url, source_table, source_id, metadata)
  VALUES (
    'waitlist',
    'New waitlist application — ' || COALESCE(NEW.business_name, NEW.name),
    LEFT(NEW.project_goals, 200),
    '/admin/waitlist',
    'waitlist_applications',
    NEW.id,
    jsonb_build_object(
      'name', NEW.name,
      'email', NEW.email,
      'business_name', NEW.business_name,
      'selected_plan', NEW.selected_plan
    )
  );
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------------
-- Triggers (drop+create to keep idempotent)
-- ------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_notify_form_submission ON form_submissions;
CREATE TRIGGER trg_notify_form_submission
  AFTER INSERT ON form_submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_form_submission();

DROP TRIGGER IF EXISTS trg_notify_contact_submission ON contact_submissions;
CREATE TRIGGER trg_notify_contact_submission
  AFTER INSERT ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_contact_submission();

DROP TRIGGER IF EXISTS trg_notify_waitlist_application ON waitlist_applications;
CREATE TRIGGER trg_notify_waitlist_application
  AFTER INSERT ON waitlist_applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_waitlist_application();

-- Allow Postgres LISTEN/Realtime broadcasts of inserts/updates so the admin
-- sidebar badge can react live. Wrapped in DO so reruns don't error if the
-- table is already a member of the publication.
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
  END;
END $$;
