-- 本檔由 `supabase/policies_dev_anon_calendar_albums_school_forms.sql` 複製，供 `npm run db push` 使用；請與根目錄檔案保持同步。
-- ============================================================
-- 開發／示範用：允許 anon 讀寫 calendar_events、albums、school_info、forms
-- ============================================================
-- ⚠️ 僅限本機或私人測試專案。正式上線請改 Supabase Auth + 管理者 RLS。
--
-- 用途：v2.0-F 後台行事曆／相簿／學校資料／表單，以 VITE_SUPABASE_ANON_KEY CRUD
-- 執行：於已成功執行 schema.sql 與 policies_dev_anon_announcements_lunch.sql 之後
-- ============================================================

-- calendar_events：後台需讀取 is_visible = false
DROP POLICY IF EXISTS "dev_anon_select_all_calendar_events" ON public.calendar_events;
CREATE POLICY "dev_anon_select_all_calendar_events"
  ON public.calendar_events
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "dev_anon_insert_calendar_events" ON public.calendar_events;
CREATE POLICY "dev_anon_insert_calendar_events"
  ON public.calendar_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "dev_anon_update_calendar_events" ON public.calendar_events;
CREATE POLICY "dev_anon_update_calendar_events"
  ON public.calendar_events
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "dev_anon_delete_calendar_events" ON public.calendar_events;
CREATE POLICY "dev_anon_delete_calendar_events"
  ON public.calendar_events
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- albums：後台需讀取隱藏列
DROP POLICY IF EXISTS "dev_anon_select_all_albums" ON public.albums;
CREATE POLICY "dev_anon_select_all_albums"
  ON public.albums
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "dev_anon_insert_albums" ON public.albums;
CREATE POLICY "dev_anon_insert_albums"
  ON public.albums
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "dev_anon_update_albums" ON public.albums;
CREATE POLICY "dev_anon_update_albums"
  ON public.albums
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "dev_anon_delete_albums" ON public.albums;
CREATE POLICY "dev_anon_delete_albums"
  ON public.albums
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- school_info：匿名寫入（單筆 upsert 情境）
DROP POLICY IF EXISTS "dev_anon_insert_school_info" ON public.school_info;
CREATE POLICY "dev_anon_insert_school_info"
  ON public.school_info
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "dev_anon_update_school_info" ON public.school_info;
CREATE POLICY "dev_anon_update_school_info"
  ON public.school_info
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "dev_anon_delete_school_info" ON public.school_info;
CREATE POLICY "dev_anon_delete_school_info"
  ON public.school_info
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- forms：後台需讀取隱藏列
DROP POLICY IF EXISTS "dev_anon_select_all_forms" ON public.forms;
CREATE POLICY "dev_anon_select_all_forms"
  ON public.forms
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "dev_anon_insert_forms" ON public.forms;
CREATE POLICY "dev_anon_insert_forms"
  ON public.forms
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "dev_anon_update_forms" ON public.forms;
CREATE POLICY "dev_anon_update_forms"
  ON public.forms
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "dev_anon_delete_forms" ON public.forms;
CREATE POLICY "dev_anon_delete_forms"
  ON public.forms
  FOR DELETE
  TO anon, authenticated
  USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.albums TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_info TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forms TO anon, authenticated;
