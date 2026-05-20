# Supabase 資料庫設定說明

**階段：** v2.0-C — 資料表 SQL 與初始資料  
**狀態：** 僅 SQL 與文件，尚未修改 App 程式碼

---

## 1. 如何在 Supabase 後台執行 schema.sql

### 步驟一：建立 Supabase 專案

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 點選 **New Project**，建立新專案
3. 記下專案的 **Project URL** 與 **anon public key**（v2.0-D 才會用到）

### 步驟二：執行 SQL

1. 進入專案 → 左側選單 **SQL Editor**
2. 點選 **New query**
3. 開啟本 repo 的 [`schema.sql`](./schema.sql)，複製全部內容貼上
4. 點選 **Run** 執行

若成功，應會建立 6 張資料表、索引、trigger、RLS 政策與初始資料。

### 步驟三：若需重新執行

若資料表已存在，再次執行 `CREATE TABLE IF NOT EXISTS` 不會覆蓋既有資料。  
若要完全重建，請先在 SQL Editor 手動 `DROP TABLE`（**注意：會刪除所有資料**），再重新執行 `schema.sql`。

---

## 2. 建立資料表後如何確認資料

### 方式 A：Table Editor

1. 左側 **Table Editor**
2. 分別點選各資料表，確認有初始資料：

| 資料表 | 預期筆數（至少） |
|--------|-------------------|
| `announcements` | 3 筆 |
| `calendar_events` | 3 筆 |
| `lunch_menus` | 1 筆（今日） |
| `albums` | 3 筆 |
| `school_info` | 1 筆 |
| `forms` | 3 筆 |

### 方式 B：SQL 查詢

```sql
SELECT 'announcements' AS tbl, count(*) FROM announcements
UNION ALL SELECT 'calendar_events', count(*) FROM calendar_events
UNION ALL SELECT 'lunch_menus', count(*) FROM lunch_menus
UNION ALL SELECT 'albums', count(*) FROM albums
UNION ALL SELECT 'school_info', count(*) FROM school_info
UNION ALL SELECT 'forms', count(*) FROM forms;
```

### 方式 C：測試 RLS 公開讀取

在 SQL Editor 使用 anon key 測試，或於 **API Docs** 頁面以 REST 方式查詢：

```
GET /rest/v1/announcements?is_visible=eq.true
```

---

## 3. RLS 政策目前只開放前台讀取

本階段已啟用 **Row Level Security**，並僅建立 **SELECT** 政策：

| 資料表 | 政策名稱 | 規則 |
|--------|----------|------|
| `announcements` | `public_read_visible_announcements` | `is_visible = true` 可讀 |
| `calendar_events` | `public_read_visible_calendar_events` | `is_visible = true` 可讀 |
| `albums` | `public_read_visible_albums` | `is_visible = true` 可讀 |
| `forms` | `public_read_visible_forms` | `is_visible = true` 可讀 |
| `school_info` | `public_read_school_info` | 全部可讀 |
| `lunch_menus` | `public_read_lunch_menus` | 全部可讀（第一階段） |

**尚未建立：**

- INSERT / UPDATE / DELETE 政策
- 匿名（anon）寫入權限

因此目前後台無法透過前端 anon key 直接寫入 Supabase，這是預期行為。

---

## 4. 後台寫入正式版需要 Supabase Auth

正式上線前，請完成：

1. **Supabase Auth** — 建立管理員帳號（Email / OAuth）
2. **管理者角色** — 例如 `profiles.is_admin = true` 或自訂 `user_roles` 表
3. **寫入 RLS 政策** — 僅 `authenticated` 且具 admin 身份者可 INSERT / UPDATE / DELETE
4. **移除示範登入** — 取代目前前端的 `admin` / `1234` 硬編碼登入

⚠️ **請勿**在正式環境將 `service_role key` 放入 Vite 前端。

---

## 5. 下一階段 v2.0-D 才會讓前台改讀 Supabase

| 階段 | 內容 | App 程式碼 |
|------|------|------------|
| **v2.0-C（本階段）** | SQL 建表 + 初始資料 + RLS 讀取 | **不修改** |
| **v2.0-D（下一階段）** | `supabaseClient.ts`、service 層、前台改讀 Supabase | 才開始修改 |

目前 App 仍使用 **localStorage** 與 **mock.ts**，與 Supabase 尚未連線。  
執行本 SQL 不會影響 `npm run dev` 或 `npm run build`。

---

## 6. 檔案說明

| 檔案 | 說明 |
|------|------|
| [`schema.sql`](./schema.sql) | 建表、索引、trigger、RLS、初始資料 |
| [`README.md`](./README.md) | 本說明文件 |

---

## 7. 相關文件

- [`../SUPABASE_PLAN_v2.0.md`](../SUPABASE_PLAN_v2.0.md) — v2.0 整體規畫
- [`../DEPLOYMENT.md`](../DEPLOYMENT.md) — Vercel 部署說明
