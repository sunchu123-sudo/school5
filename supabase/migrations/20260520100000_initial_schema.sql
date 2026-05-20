-- 本檔由 `supabase/schema.sql` 複製，供 `npm run db push` 使用；手動維護時請與根目錄 schema 保持同步。
-- ============================================================
-- v2.0-C 三棧國小行動校園 App — Supabase 資料表 schema
-- ============================================================
-- 使用方式：於 Supabase Dashboard → SQL Editor 貼上並執行
-- 注意：本檔案僅建立資料表、索引、RLS 與初始資料
--       正式後台寫入需搭配 Supabase Auth 與管理者權限（見檔案底部註解）
-- ============================================================

-- ------------------------------------------------------------
-- 共用：updated_at 自動更新
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- 1. announcements（公告）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  category      text NOT NULL,
  content       text NOT NULL,
  date          date NOT NULL,
  is_important  boolean NOT NULL DEFAULT false,
  is_pinned     boolean NOT NULL DEFAULT false,
  external_link text,
  attachments   jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_visible    boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_date
  ON public.announcements (date DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_category
  ON public.announcements (category);

CREATE INDEX IF NOT EXISTS idx_announcements_is_visible
  ON public.announcements (is_visible);

CREATE INDEX IF NOT EXISTS idx_announcements_is_pinned
  ON public.announcements (is_pinned DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_is_important
  ON public.announcements (is_important DESC);

DROP TRIGGER IF EXISTS trg_announcements_updated_at ON public.announcements;
CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- 2. calendar_events（行事曆活動）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  date          date NOT NULL,
  time          text,
  category      text NOT NULL,
  location      text,
  description   text,
  is_important  boolean NOT NULL DEFAULT false,
  is_visible    boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_date
  ON public.calendar_events (date ASC);

CREATE INDEX IF NOT EXISTS idx_calendar_events_category
  ON public.calendar_events (category);

CREATE INDEX IF NOT EXISTS idx_calendar_events_is_visible
  ON public.calendar_events (is_visible);

DROP TRIGGER IF EXISTS trg_calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER trg_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- 3. lunch_menus（午餐菜單）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lunch_menus (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date           date NOT NULL UNIQUE,
  main           text,
  main_dish      text,
  side_dishes    jsonb NOT NULL DEFAULT '[]'::jsonb,
  soup           text,
  fruit          text,
  nutrition_note text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lunch_menus_date
  ON public.lunch_menus (date DESC);

DROP TRIGGER IF EXISTS trg_lunch_menus_updated_at ON public.lunch_menus;
CREATE TRIGGER trg_lunch_menus_updated_at
  BEFORE UPDATE ON public.lunch_menus
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- 4. albums（相簿）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.albums (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  date         date NOT NULL,
  category     text NOT NULL,
  description  text,
  photo_count  integer NOT NULL DEFAULT 0,
  cover_image  text,
  is_visible   boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_albums_date
  ON public.albums (date DESC);

CREATE INDEX IF NOT EXISTS idx_albums_category
  ON public.albums (category);

CREATE INDEX IF NOT EXISTS idx_albums_is_visible
  ON public.albums (is_visible);

DROP TRIGGER IF EXISTS trg_albums_updated_at ON public.albums;
CREATE TRIGGER trg_albums_updated_at
  BEFORE UPDATE ON public.albums
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- 5. school_info（學校資料）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.school_info (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  phone           text,
  address         text,
  office_hours    text,
  email           text,
  intro           text,
  vision          text,
  transportation  text,
  map_url         text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_school_info_updated_at ON public.school_info;
CREATE TRIGGER trg_school_info_updated_at
  BEFORE UPDATE ON public.school_info
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- 6. forms（表單下載）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forms (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  category     text NOT NULL,
  description  text,
  file_url     text,
  is_visible   boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forms_category
  ON public.forms (category);

CREATE INDEX IF NOT EXISTS idx_forms_is_visible
  ON public.forms (is_visible);

DROP TRIGGER IF EXISTS trg_forms_updated_at ON public.forms;
CREATE TRIGGER trg_forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Row Level Security（RLS）
-- ============================================================
-- 第一階段政策：
--   1. 前台（anon / public）可讀取 is_visible = true 的列表資料
--   2. school_info 可公開讀取全部
--   3. lunch_menus 第一階段可公開讀取全部
--   4. 暫不開放匿名寫入（INSERT / UPDATE / DELETE）
--
-- ⚠️ 正式後台寫入需搭配 Supabase Auth 與管理者權限，例如：
--   - 建立 admin 角色或 profiles.is_admin 欄位
--   - 僅 authenticated 且具管理者身份者可寫入
--   - 切勿在正式環境長期使用 service_role key 於前端
-- ============================================================

ALTER TABLE public.announcements   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lunch_menus     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_info     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms           ENABLE ROW LEVEL SECURITY;

-- announcements：公開讀取 is_visible = true
DROP POLICY IF EXISTS "public_read_visible_announcements" ON public.announcements;
CREATE POLICY "public_read_visible_announcements"
  ON public.announcements
  FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

-- calendar_events：公開讀取 is_visible = true
DROP POLICY IF EXISTS "public_read_visible_calendar_events" ON public.calendar_events;
CREATE POLICY "public_read_visible_calendar_events"
  ON public.calendar_events
  FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

-- albums：公開讀取 is_visible = true
DROP POLICY IF EXISTS "public_read_visible_albums" ON public.albums;
CREATE POLICY "public_read_visible_albums"
  ON public.albums
  FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

-- forms：公開讀取 is_visible = true
DROP POLICY IF EXISTS "public_read_visible_forms" ON public.forms;
CREATE POLICY "public_read_visible_forms"
  ON public.forms
  FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

-- school_info：公開讀取全部
DROP POLICY IF EXISTS "public_read_school_info" ON public.school_info;
CREATE POLICY "public_read_school_info"
  ON public.school_info
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- lunch_menus：第一階段公開讀取全部
DROP POLICY IF EXISTS "public_read_lunch_menus" ON public.lunch_menus;
CREATE POLICY "public_read_lunch_menus"
  ON public.lunch_menus
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- 初始資料（seed）
-- ============================================================

-- announcements（至少 3 筆）
INSERT INTO public.announcements (title, category, content, date, is_important, is_pinned, is_visible)
VALUES
  (
    '開學日提醒',
    '學校公告',
    '親愛的家長您好：\n\n新學期即將開始，請協助孩子準備書本、文具與運動服。開學當日請於 7:50 前到校，並留意班級群組的最新通知。\n\n如有疑問，請洽教務處。',
    CURRENT_DATE + INTERVAL '7 days',
    true,
    true,
    true
  ),
  (
    '親師座談會通知',
    '家長通知',
    '本校將於下週三下午 2:00 舉辦親師座談會，地點為活動中心。請各班家長踴躍參加，與導師交流學習與生活狀況。\n\n報名方式：請向各班導師登記。',
    CURRENT_DATE + INTERVAL '10 days',
    false,
    false,
    true
  ),
  (
    '校園活動公告',
    '活動通知',
    '本週五將舉辦校園環境教育日，全校師生將參與淨山與部落文化體驗活動。請學生穿著運動服、攜帶水壺與帽子，並依班級集合時間準時出席。',
    CURRENT_DATE + INTERVAL '3 days',
    false,
    false,
    true
  );

-- calendar_events（至少 3 筆）
INSERT INTO public.calendar_events (title, date, time, category, location, description, is_important, is_visible)
VALUES
  (
    '開學日',
    CURRENT_DATE + INTERVAL '7 days',
    '07:50-08:20',
    '全校',
    '操場',
    '新學期開學典禮，請全校師生穿著整齊校服參加。',
    true,
    true
  ),
  (
    '親師座談會',
    CURRENT_DATE + INTERVAL '10 days',
    '14:00-16:00',
    '活動',
    '活動中心',
    '各班親師座談，請家長依班級通知時間出席。',
    false,
    true
  ),
  (
    '校外教學',
    CURRENT_DATE + INTERVAL '14 days',
    '08:00-15:00',
    '活動',
    '太魯閣國家公園',
    '三、四年級校外教學，請攜帶水壺、雨具與便當。',
    false,
    true
  );

-- lunch_menus（至少 1 筆：今日午餐）
INSERT INTO public.lunch_menus (date, main, main_dish, side_dishes, soup, fruit, nutrition_note)
VALUES
  (
    CURRENT_DATE,
    '白飯',
    '香滷雞腿',
    '["炒青菜", "玉米炒蛋"]'::jsonb,
    '海帶芽湯',
    '香蕉',
    '均衡飲食，請不挑食。'
  )
ON CONFLICT (date) DO NOTHING;

-- albums（至少 3 筆）
INSERT INTO public.albums (title, date, category, description, photo_count, cover_image, is_visible)
VALUES
  (
    '校園生活',
    CURRENT_DATE - INTERVAL '30 days',
    '校園日常',
    '記錄孩子們在三棧校園中的日常學習與活動點滴。',
    24,
    '/placeholder.svg',
    true
  ),
  (
    '戶外教學',
    CURRENT_DATE - INTERVAL '20 days',
    '校外教學',
    '走出教室，在山海之間探索與學習。',
    32,
    '/placeholder.svg',
    true
  ),
  (
    '文化課程',
    CURRENT_DATE - INTERVAL '10 days',
    '民族教育',
    '原住民族文化週，傳唱、編織與部落文化體驗。',
    18,
    '/placeholder.svg',
    true
  );

-- school_info（至少 1 筆）
INSERT INTO public.school_info (name, phone, address, office_hours, email, intro, vision, transportation, map_url)
VALUES
  (
    '三棧國民小學',
    '03-8611025',
    '花蓮縣秀林鄉三棧村',
    '週一至週五 08:00-16:00',
    'school@example.edu.tw',
    '三棧國小位於花蓮秀林鄉，在山海與部落文化中培育孩子成長，重視原住民族教育與環境關懷。',
    '讓每位學生在山林與文化中自信學習、快樂成長，成為關懷土地與社群的公民。',
    '由花蓮市區沿台九線北上，經秀林鄉往三棧方向即可抵達。建議自行開車或搭乘學校交通車。',
    'https://www.google.com/maps/search/?api=1&query=花蓮縣秀林鄉三棧村'
  );

-- forms（至少 3 筆）
INSERT INTO public.forms (title, category, description, file_url, is_visible)
VALUES
  (
    '學生請假單',
    '請假',
    '學生因病或有事請假時使用，請家長填寫後交回導師。',
    '#',
    true
  ),
  (
    '校外教學同意書',
    '校外教學',
    '參加校外教學前，請家長詳閱並簽署同意書。',
    '#',
    true
  ),
  (
    '家長志工報名表',
    '家長志工',
    '歡迎家長加入志工行列，協助各項校園活動。',
    '#',
    true
  );

-- ============================================================
-- 後續階段提醒（v2.0-D 起）
-- ============================================================
-- 1. 建立 Supabase Auth 管理員帳號
-- 2. 新增 INSERT / UPDATE / DELETE 政策（僅 admin 可寫入）
-- 3. 前台改由 src/services/* 讀取 Supabase（取代 localStorage 優先）
-- 4. 後台 CRUD 改寫入 Supabase
-- ============================================================
