# v2.0 Supabase 雲端資料庫規畫

**版本名稱：** v2.0 Supabase 雲端資料庫規畫  
**文件用途：** 供後續逐步將 localStorage 暫存改接 Supabase 時參考  
**目前狀態：** 規畫文件（尚未實作程式碼）

---

## 1. 專案目標

本專案（三棧國小行動校園 App）目前使用 **localStorage** 暫存後台資料，資料僅存在使用者瀏覽器中，**無法跨裝置、跨瀏覽器同步**。

**v2.0 目標：**

- 改為 **Supabase** 雲端 PostgreSQL 資料庫
- 前台與後台讀寫同一份雲端資料
- 家長、老師、行政人員在不同手機／電腦上可看到一致內容
- 保留現有 UI 與 CRUD 操作流程，僅替換資料層
- 正式上線前導入 **Supabase Auth** 或等效權限控管，取代示範登入

---

## 2. 目前 localStorage key 對應

| localStorage key | Supabase 資料表 | 說明 |
|------------------|-----------------|------|
| `admin_announcements` | `announcements` | 公告 |
| `admin_calendar_events` | `calendar_events` | 行事曆活動 |
| `admin_today_lunch` | `lunch_menus` | 今日／每日午餐 |
| `admin_albums` | `albums` | 相簿 |
| `admin_school_info` | `school_info` | 學校基本資料（單筆） |
| `admin_forms` | `forms` | 表單下載 |

> **不遷移至 Supabase（v2.0 規畫外）：**
>
> - `admin_logged_in` — 改由 Supabase Auth session 取代
> - JSON 備份檔 — 可保留為匯出／匯入工具，或改為從 Supabase 匯出

---

## 3. Supabase 資料表總覽

| 資料表 | 類型 | 說明 |
|--------|------|------|
| `announcements` | 多筆列表 | 學校公告 |
| `calendar_events` | 多筆列表 | 行事曆活動 |
| `lunch_menus` | 多筆（依日期） | 午餐菜單，目前 App 以「今日」為主 |
| `albums` | 多筆列表 | 相簿與照片 URL |
| `school_info` | 單筆設定 | 全校共用聯絡與介紹資料 |
| `forms` | 多筆列表 | 可下載表單 |

---

## 4. 各資料表欄位規畫

### 4.1 announcements（公告）

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 用途說明 |
|----------|----------|:----:|--------|----------|
| `id` | `uuid` | ✓ | `gen_random_uuid()` | 主鍵 |
| `title` | `text` | ✓ | — | 公告標題 |
| `category` | `text` | ✓ | `'學校公告'` | 後台分類：學校公告、活動通知、家長通知、午餐資訊、其他 |
| `date` | `date` | ✓ | `CURRENT_DATE` | 公告日期 |
| `summary` | `text` | — | `''` | 摘要（前台列表用，可從 content 截取） |
| `content` | `text` | ✓ | — | 公告內文 |
| `important` | `boolean` | ✓ | `false` | 是否標示為重要 |
| `pinned` | `boolean` | ✓ | `false` | 是否置頂（後台功能） |
| `attachment_url` | `text` | — | `null` | 附件連結 |
| `external_url` | `text` | — | `null` | 外部連結 |
| `created_at` | `timestamptz` | ✓ | `now()` | 建立時間 |
| `updated_at` | `timestamptz` | ✓ | `now()` | 更新時間 |

**索引建議：** `(pinned DESC, date DESC)`、`category`

---

### 4.2 calendar_events（行事曆活動）

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 用途說明 |
|----------|----------|:----:|--------|----------|
| `id` | `uuid` | ✓ | `gen_random_uuid()` | 主鍵 |
| `title` | `text` | ✓ | — | 活動名稱 |
| `date` | `date` | ✓ | — | 活動日期（YYYY-MM-DD） |
| `weekday` | `text` | — | `''` | 星期顯示（週一～週日，可程式計算） |
| `time` | `text` | — | `''` | 時間，如 `08:00-10:00` |
| `location` | `text` | — | `''` | 地點 |
| `audience` | `text` | — | `'全校'` | 對象，如全校、六年級 |
| `category` | `text` | ✓ | `'活動'` | 全校、班級、活動、放假、評量、社團 |
| `note` | `text` | — | `null` | 備註／說明（後台 description 對應） |
| `important` | `boolean` | ✓ | `false` | 是否標示為重要 |
| `created_at` | `timestamptz` | ✓ | `now()` | 建立時間 |
| `updated_at` | `timestamptz` | ✓ | `now()` | 更新時間 |

**索引建議：** `(date ASC)`、`category`

---

### 4.3 lunch_menus（午餐菜單）

目前 localStorage 只存「今日午餐」一筆物件；雲端改為**依日期**儲存，方便未來擴充週菜單。

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 用途說明 |
|----------|----------|:----:|--------|----------|
| `id` | `uuid` | ✓ | `gen_random_uuid()` | 主鍵 |
| `menu_date` | `date` | ✓ | — | 菜單日期（唯一） |
| `main` | `text` | ✓ | `''` | 主食 |
| `main_dish` | `text` | ✓ | `''` | 主菜 |
| `side_dish_1` | `text` | — | `''` | 副菜一 |
| `side_dish_2` | `text` | — | `''` | 副菜二 |
| `soup` | `text` | — | `''` | 湯品 |
| `fruit` | `text` | — | `''` | 水果 |
| `created_at` | `timestamptz` | ✓ | `now()` | 建立時間 |
| `updated_at` | `timestamptz` | ✓ | `now()` | 更新時間 |

**localStorage 對應：**

```
main       → main
mainDish   → main_dish
sideDish1  → side_dish_1
sideDish2  → side_dish_2
soup       → soup
fruit      → fruit
（新增）   → menu_date = 今日日期
```

**索引建議：** `UNIQUE (menu_date)`

---

### 4.4 albums（相簿）

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 用途說明 |
|----------|----------|:----:|--------|----------|
| `id` | `uuid` | ✓ | `gen_random_uuid()` | 主鍵 |
| `title` | `text` | ✓ | — | 相簿標題 |
| `date` | `date` | ✓ | `CURRENT_DATE` | 活動日期 |
| `category` | `text` | ✓ | `'其他'` | 分類，如運動會、校外教學 |
| `photo_count` | `integer` | ✓ | `0` | 照片數量（可與 photos 陣列同步） |
| `cover_image` | `text` | — | `''` | 封面圖 URL |
| `description` | `text` | — | `''` | 相簿描述 |
| `photos` | `jsonb` | ✓ | `'[]'` | 照片 URL 陣列 |
| `is_visible` | `boolean` | ✓ | `true` | 是否於前台顯示 |
| `created_at` | `timestamptz` | ✓ | `now()` | 建立時間 |
| `updated_at` | `timestamptz` | ✓ | `now()` | 更新時間 |

**索引建議：** `(date DESC)`、`is_visible`

> **v2.1 延伸（可選）：** 照片改存 Supabase Storage，資料表只存 path／public URL。

---

### 4.5 school_info（學校資料）

全校共用**單筆**設定，建議固定 `id = 1` 或 `slug = 'default'`。

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 用途說明 |
|----------|----------|:----:|--------|----------|
| `id` | `smallint` | ✓ | `1` | 主鍵（固定單筆） |
| `slug` | `text` | ✓ | `'default'` | 識別鍵，唯一 |
| `name` | `text` | ✓ | `'三棧國小'` | 學校名稱 |
| `phone` | `text` | ✓ | `''` | 電話（顯示用） |
| `phone_tel` | `text` | — | `''` | 電話數字（撥號用，去除非數字） |
| `address` | `text` | ✓ | `''` | 地址 |
| `office_hours` | `text` | — | `''` | 服務時間 |
| `email` | `text` | — | `''` | 電子郵件 |
| `map_text` | `text` | — | `''` | 地圖文字說明 |
| `map_url` | `text` | — | `''` | 地圖連結 |
| `intro` | `text` | — | `''` | 學校簡介 |
| `vision` | `text` | — | `''` | 學校願景 |
| `transportation` | `text` | — | `''` | 交通方式（可多行文字） |
| `updated_at` | `timestamptz` | ✓ | `now()` | 更新時間 |

---

### 4.6 forms（表單下載）

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 用途說明 |
|----------|----------|:----:|--------|----------|
| `id` | `uuid` | ✓ | `gen_random_uuid()` | 主鍵 |
| `title` | `text` | ✓ | — | 表單名稱 |
| `category` | `text` | ✓ | `'其他'` | 請假、校外教學、獎助學金、學生資料、家長志工、其他 |
| `description` | `text` | — | `''` | 表單說明 |
| `file_url` | `text` | — | `''` | 檔案下載連結 |
| `is_visible` | `boolean` | ✓ | `true` | 是否於前台顯示 |
| `sort_order` | `integer` | — | `0` | 排序（可選） |
| `created_at` | `timestamptz` | ✓ | `now()` | 建立時間 |
| `updated_at` | `timestamptz` | ✓ | `now()` | 更新時間 |

**索引建議：** `(is_visible, sort_order)`

---

## 5. SQL 建表語法

以下 SQL 可在 Supabase Dashboard → **SQL Editor** 執行。

```sql
-- ============================================================
-- v2.0 三棧國小行動校園 App — Supabase 建表語法
-- ============================================================

-- 共用：更新 updated_at 的 trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- announcements
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  category      text NOT NULL DEFAULT '學校公告',
  date          date NOT NULL DEFAULT CURRENT_DATE,
  summary       text NOT NULL DEFAULT '',
  content       text NOT NULL,
  important     boolean NOT NULL DEFAULT false,
  pinned        boolean NOT NULL DEFAULT false,
  attachment_url text,
  external_url  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_pinned_date
  ON public.announcements (pinned DESC, date DESC);

CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- calendar_events
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  date        date NOT NULL,
  weekday     text NOT NULL DEFAULT '',
  time        text NOT NULL DEFAULT '',
  location    text NOT NULL DEFAULT '',
  audience    text NOT NULL DEFAULT '全校',
  category    text NOT NULL DEFAULT '活動',
  note        text,
  important   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_date
  ON public.calendar_events (date ASC);

CREATE TRIGGER trg_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- lunch_menus
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lunch_menus (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_date    date NOT NULL UNIQUE,
  main         text NOT NULL DEFAULT '',
  main_dish    text NOT NULL DEFAULT '',
  side_dish_1  text NOT NULL DEFAULT '',
  side_dish_2  text NOT NULL DEFAULT '',
  soup         text NOT NULL DEFAULT '',
  fruit        text NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_lunch_menus_updated_at
  BEFORE UPDATE ON public.lunch_menus
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- albums
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.albums (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  date         date NOT NULL DEFAULT CURRENT_DATE,
  category     text NOT NULL DEFAULT '其他',
  photo_count  integer NOT NULL DEFAULT 0,
  cover_image  text NOT NULL DEFAULT '',
  description  text NOT NULL DEFAULT '',
  photos       jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_visible   boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_albums_date_visible
  ON public.albums (date DESC, is_visible);

CREATE TRIGGER trg_albums_updated_at
  BEFORE UPDATE ON public.albums
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- school_info（單筆）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.school_info (
  id              smallint PRIMARY KEY DEFAULT 1,
  slug            text NOT NULL UNIQUE DEFAULT 'default',
  name            text NOT NULL DEFAULT '三棧國小',
  phone           text NOT NULL DEFAULT '',
  phone_tel       text NOT NULL DEFAULT '',
  address         text NOT NULL DEFAULT '',
  office_hours    text NOT NULL DEFAULT '',
  email           text NOT NULL DEFAULT '',
  map_text        text NOT NULL DEFAULT '',
  map_url         text NOT NULL DEFAULT '',
  intro           text NOT NULL DEFAULT '',
  vision          text NOT NULL DEFAULT '',
  transportation  text NOT NULL DEFAULT '',
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT school_info_singleton CHECK (id = 1)
);

CREATE TRIGGER trg_school_info_updated_at
  BEFORE UPDATE ON public.school_info
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.school_info (id, slug)
VALUES (1, 'default')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- forms
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forms (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  category     text NOT NULL DEFAULT '其他',
  description  text NOT NULL DEFAULT '',
  file_url     text NOT NULL DEFAULT '',
  is_visible   boolean NOT NULL DEFAULT true,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forms_visible_sort
  ON public.forms (is_visible, sort_order);

CREATE TRIGGER trg_forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security（RLS）— 初期草案
-- 正式上線前務必依 Auth 角色調整
-- ------------------------------------------------------------
ALTER TABLE public.announcements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lunch_menus      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_info      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms            ENABLE ROW LEVEL SECURITY;

-- 公開讀取（僅 is_visible / 公開資料）
CREATE POLICY "public_read_announcements"
  ON public.announcements FOR SELECT
  USING (true);

CREATE POLICY "public_read_calendar_events"
  ON public.calendar_events FOR SELECT
  USING (true);

CREATE POLICY "public_read_lunch_menus"
  ON public.lunch_menus FOR SELECT
  USING (true);

CREATE POLICY "public_read_albums"
  ON public.albums FOR SELECT
  USING (is_visible = true);

CREATE POLICY "public_read_school_info"
  ON public.school_info FOR SELECT
  USING (true);

CREATE POLICY "public_read_forms"
  ON public.forms FOR SELECT
  USING (is_visible = true);

-- ⚠️ 寫入政策請在接入 Supabase Auth 後再開啟，勿在正式環境長期使用寬鬆寫入權限
```

> **注意：** 上方 RLS 僅示範「前台公開讀取」。後台 **INSERT / UPDATE / DELETE** 政策應在接入 **Supabase Auth** 後，限制為已登入且具 admin 角色的使用者。

---

## 6. 未來程式修改規畫

### 6.1 目錄結構（建議新增）

```
src/
├── lib/
│   └── supabaseClient.ts       # Supabase 連線設定
├── services/
│   ├── announcementsService.ts # 公告 CRUD + 查詢
│   ├── calendarService.ts      # 行事曆 CRUD + 查詢
│   ├── lunchService.ts         # 午餐 CRUD + 依日期查詢
│   ├── albumsService.ts        # 相簿 CRUD + 查詢
│   ├── schoolService.ts        # 學校資料讀寫（單筆）
│   └── formsService.ts         # 表單 CRUD + 查詢
```

### 6.2 各檔案職責

| 檔案 | 職責 |
|------|------|
| `src/lib/supabaseClient.ts` | 建立 Supabase client；讀取 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY` |
| `src/services/announcementsService.ts` | `listAnnouncements`、`getAnnouncementById`、`create`、`update`、`delete` |
| `src/services/calendarService.ts` | `listEvents`、`getUpcomingEvents`、`create`、`update`、`delete` |
| `src/services/lunchService.ts` | `getTodayLunch`、`getLunchByDate`、`upsertTodayLunch` |
| `src/services/albumsService.ts` | `listPublicAlbums`、`listAllAlbums`、`getById`、`create`、`update`、`delete` |
| `src/services/schoolService.ts` | `getSchoolInfo`、`updateSchoolInfo` |
| `src/services/formsService.ts` | `listPublicForms`、`listAllForms`、`create`、`update`、`delete` |

### 6.3 修改順序建議（分階段）

| 階段 | 工作項目 | 說明 |
|:----:|----------|------|
| **2.0-a** | 建立 Supabase 專案、執行 SQL、設定 env | 基礎建設 |
| **2.0-b** | 新增 `supabaseClient.ts` + 安裝 `@supabase/supabase-js` | 連線層 |
| **2.0-c** | 實作 `schoolService` + `lunchService` | 資料結構較簡單，適合先做 |
| **2.0-d** | 實作 `announcementsService`、`calendarService` | 核心內容 |
| **2.0-e** | 實作 `albumsService`、`formsService` | 含 is_visible 篩選 |
| **2.0-f** | 修改 `src/lib/storage.ts` | 改為優先讀 Supabase，localStorage 作 fallback（過渡期） |
| **2.0-g** | 修改各 Admin 頁面 | 將 `saveToStorage` 改為呼叫 service |
| **2.0-h** | 修改前台頁面資料來源 | 透過 storage 或 service 讀取，UI 不大改 |
| **2.0-i** | 接入 Supabase Auth | 取代 `admin_logged_in` 示範登入 |
| **2.0-j** | 資料遷移腳本 | 將 localStorage／JSON 備份匯入 Supabase |
| **2.0-k** | 移除 localStorage 主資料來源 | 正式切換完成 |

### 6.4 storage.ts 過渡策略

```
讀取順序（過渡期）：
1. Supabase 雲端資料（若 env 已設定且連線成功）
2. localStorage 暫存（向後相容）
3. mock.ts 預設資料

寫入（過渡期）：
- 後台儲存 → 同時寫 Supabase + localStorage（可選）
- 正式切換後 → 僅寫 Supabase
```

### 6.5 型別對應（snake_case ↔ camelCase）

Service 層負責 DB `snake_case` 與前端 `camelCase` 轉換，例如：

| DB 欄位 | 前端欄位 |
|---------|----------|
| `main_dish` | `mainDish` |
| `side_dish_1` | `sideDish1` |
| `is_visible` | `isVisible` |
| `file_url` | `fileUrl` |
| `menu_date` | `menuDate` |

---

## 7. 環境變數規畫

### 7.1 本機開發（`.env.local`）

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

| 變數 | 說明 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase 專案 API URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase 公開 anon key（前端使用） |

> Vite 只有 `VITE_` 前綴的變數會暴露給前端程式。

### 7.2 Vercel 部署

在 Vercel 專案 → **Settings → Environment Variables** 新增：

- `VITE_SUPABASE_URL`（Production / Preview / Development）
- `VITE_SUPABASE_ANON_KEY`（Production / Preview / Development）

### 7.3 不要放在前端的機密

| 變數 | 用途 | 存放位置 |
|------|------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` | 繞過 RLS 的管理操作 | **僅後端／腳本**，絕不可放入 Vite 前端 |

---

## 8. 安全提醒

### 8.1 目前 v1.x 風險

- 後台登入為前端硬編碼（`admin` / `1234`）
- 所有資料存在使用者瀏覽器 localStorage
- 無伺服器端權限驗證

### 8.2 v2.0 初期（開發／測試）

- 可先使用 **anon key** 讓前台讀取公開資料（配合 RLS `SELECT` 政策）
- 後台寫入在開發階段可暫時放寬，但**不可在正式公開環境長期使用**

### 8.3 正式上線前必做

| 項目 | 說明 |
|------|------|
| **Supabase Auth** | 後台管理員以 Email／OAuth 登入，取代示範帳密 |
| **RLS 寫入政策** | 僅 `authenticated` 且具 admin 角色者可 INSERT / UPDATE / DELETE |
| **角色管理** | 使用 Supabase `auth.users` + 自訂 `profiles` 或 `user_roles` 表 |
| **Storage 權限** | 若使用 Supabase Storage 存照片／表單檔，需設定 bucket 政策 |
| **審計** | 重要操作可記錄 `updated_by`、`updated_at` |

### 8.4 建議 RLS 方向（正式版）

```
前台使用者（anon / 未登入）：
  - SELECT 公開資料（albums.is_visible、forms.is_visible 等）

後台管理員（authenticated + admin role）：
  - 全部 CRUD

一般訪客：
  - 不可寫入任何資料表
```

---

## 9. 資料遷移參考

可沿用 v1.0 備份 JSON 格式，撰寫一次性匯入腳本：

```
admin_announcements   → INSERT INTO announcements ...
admin_calendar_events → INSERT INTO calendar_events ...
admin_today_lunch     → UPSERT INTO lunch_menus (menu_date = today) ...
admin_albums          → INSERT INTO albums ...
admin_school_info     → UPDATE school_info SET ... WHERE id = 1
admin_forms           → INSERT INTO forms ...
```

匯入時需將 localStorage 的 camelCase 欄位轉為 DB snake_case，並為舊資料產生新 uuid。

---

## 10. 相關文件

| 文件 | 說明 |
|------|------|
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Vercel 部署設定 |
| [`RELEASE_CHECKLIST_v1.3.md`](./RELEASE_CHECKLIST_v1.3.md) | v1.3 上線測試清單 |
| [`PWA_SETUP.md`](./PWA_SETUP.md) | PWA 安裝說明 |

---

## 11. 版本里程碑

| 版本 | 目標 |
|------|------|
| v1.x | localStorage 暫存 + PWA + Vercel 部署 |
| **v2.0** | Supabase 資料表建立 + service 層 + 前後台改讀雲端 |
| v2.1 | Supabase Auth + RLS 正式權限 |
| v2.2 | Supabase Storage（相簿、表單檔案） |
| v3.0 | 進階功能（推播、多校區、Google Sheet 同步等） |

---

**文件維護：** 實作 v2.0 時，請依實際 Supabase 專案設定更新本文件中的 SQL、RLS 與 service 介面。
