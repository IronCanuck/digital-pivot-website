/*
  # Site Media Storage Bucket

  Creates a public-read storage bucket `site-media` for image and asset uploads
  used by the page builder's MediaPicker.

  ## Policies
  - Public can SELECT (download) any object — required so visitors can load images.
  - Authenticated admins can INSERT/UPDATE/DELETE objects.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-media', 'site-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public can read site-media'
  ) THEN
    CREATE POLICY "Public can read site-media"
      ON storage.objects FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'site-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can upload to site-media'
  ) THEN
    CREATE POLICY "Admins can upload to site-media"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'site-media' AND public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can update site-media'
  ) THEN
    CREATE POLICY "Admins can update site-media"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'site-media' AND public.is_admin())
      WITH CHECK (bucket_id = 'site-media' AND public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can delete site-media'
  ) THEN
    CREATE POLICY "Admins can delete site-media"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'site-media' AND public.is_admin());
  END IF;
END $$;
