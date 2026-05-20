-- ============================================================
-- 開發／示範用：album-photos Storage bucket + anon 讀寫
-- ============================================================
-- ⚠️ 僅限本機或私人測試專案。正式上線請改 Auth + 管理者 Storage 政策。
-- 需先執行 schema；若已跑 migration 20260520100003 可略過重複的 bucket 建立。
-- ============================================================

ALTER TABLE public.albums
  ADD COLUMN IF NOT EXISTS photos jsonb NOT NULL DEFAULT '[]'::jsonb;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'album-photos',
  'album-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "dev_anon_read_album_photos" ON storage.objects;
CREATE POLICY "dev_anon_read_album_photos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'album-photos');

DROP POLICY IF EXISTS "dev_anon_insert_album_photos" ON storage.objects;
CREATE POLICY "dev_anon_insert_album_photos"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'album-photos');

DROP POLICY IF EXISTS "dev_anon_update_album_photos" ON storage.objects;
CREATE POLICY "dev_anon_update_album_photos"
  ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'album-photos')
  WITH CHECK (bucket_id = 'album-photos');

DROP POLICY IF EXISTS "dev_anon_delete_album_photos" ON storage.objects;
CREATE POLICY "dev_anon_delete_album_photos"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'album-photos');
