-- ============================================================
-- 開發／示範用：允許 anon 讀寫 announcements、lunch_menus
-- ============================================================
-- ⚠️ 僅限本機或私人測試專案執行。正式上線請勿使用，應改為
--    Supabase Auth + 僅 authenticated 管理員可寫入。
--
-- 用途：
--   1. 後台 fetchAdminAnnouncements 需讀取 is_visible = false 列
--   2. v2.0-E 後台以 VITE_SUPABASE_ANON_KEY 做 CRUD／upsert
--
-- 執行：Supabase → SQL Editor → 貼上並 Run（在已成功執行 schema.sql 之後）
-- ============================================================

-- 後台列表：與既有「僅可見」政策並存時，Permissive 政策為 OR，
-- 下列 SELECT USING (true) 可使 anon 讀到全部公告列。
DROP POLICY IF EXISTS "dev_anon_select_all_announcements" ON public.announcements;
CREATE POLICY "dev_anon_select_all_announcements"
  ON public.announcements
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 公告寫入（硬刪除需 DELETE）
DROP POLICY IF EXISTS "dev_anon_insert_announcements" ON public.announcements;
CREATE POLICY "dev_anon_insert_announcements"
  ON public.announcements
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "dev_anon_update_announcements" ON public.announcements;
CREATE POLICY "dev_anon_update_announcements"
  ON public.announcements
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "dev_anon_delete_announcements" ON public.announcements;
CREATE POLICY "dev_anon_delete_announcements"
  ON public.announcements
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 午餐菜單（upsert = INSERT + UPDATE，date 唯一）
DROP POLICY IF EXISTS "dev_anon_insert_lunch_menus" ON public.lunch_menus;
CREATE POLICY "dev_anon_insert_lunch_menus"
  ON public.lunch_menus
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "dev_anon_update_lunch_menus" ON public.lunch_menus;
CREATE POLICY "dev_anon_update_lunch_menus"
  ON public.lunch_menus
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "dev_anon_delete_lunch_menus" ON public.lunch_menus;
CREATE POLICY "dev_anon_delete_lunch_menus"
  ON public.lunch_menus
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- API 角色權限（若專案尚未授權寫入，可一併執行）
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lunch_menus TO anon, authenticated;
