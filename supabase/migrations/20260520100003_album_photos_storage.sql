-- v2.2：相簿照片 JSONB + Supabase Storage bucket（album-photos）
-- 執行於 schema 與 dev anon 政策之後

-- ------------------------------------------------------------
-- albums.photos：儲存照片公開 URL 陣列
-- ------------------------------------------------------------
ALTER TABLE public.albums
  ADD COLUMN IF NOT EXISTS photos jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.albums.photos IS '照片公開 URL 陣列（Supabase Storage 或手動網址）';

-- ------------------------------------------------------------
-- Storage bucket：album-photos（公開讀取，供前台顯示）
-- ------------------------------------------------------------
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

-- 開發／示範：anon 可讀寫 album-photos（正式環境請改 Auth + 管理者政策）
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
