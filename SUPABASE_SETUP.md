# Supabase 設定指南（三棧國小行動校園）

依序完成後，前台會優先讀雲端，後台公告／午餐／行事曆／相簿／學校資料／表單可寫入 Supabase（需一併執行開發用 RLS，見步驟 3）。

---

## 步驟 1：建立專案

1. 開啟 [Supabase Dashboard](https://supabase.com/dashboard) 並登入  
2. **New project** → 選區域、設定資料庫密碼、建立專案  
3. 等待專案就緒（約 1～2 分鐘）

---

## 步驟 2：建立資料表與種子資料

1. 左側 **SQL Editor** → **New query**  
2. 開啟本 repo 檔案 [`supabase/schema.sql`](./supabase/schema.sql)，**全選複製**貼到編輯器  
3. 點 **Run** 執行  

成功後會有 6 張表：`announcements`、`calendar_events`、`lunch_menus`、`albums`、`school_info`、`forms`，並含初始資料。

### 方式 B：一鍵 `db push`（Supabase CLI）

適合**全新專案**或尚未在 SQL Editor 手動跑過建表腳本時使用。

1. 安裝依賴後，於專案根目錄執行（僅需一次）：  
   `npm run db:link`  
   依提示登入 Supabase、輸入資料庫密碼、選擇專案。
2. 推送 migration 到遠端：  
   `npm run db:push`  
   會依序套用 `supabase/migrations/` 內檔案（建表＋種子、開發用 anon 政策：公告／午餐、以及行事曆／相簿／學校／表單）。
3. 查看遠端已套用版本：  
   `npm run db:status`

**注意：**

- `migrations/` 內容為根目錄 [`supabase/schema.sql`](./supabase/schema.sql) 與開發用政策檔（[`policies_dev_anon_announcements_lunch.sql`](./supabase/policies_dev_anon_announcements_lunch.sql)、[`policies_dev_anon_calendar_albums_school_forms.sql`](./supabase/policies_dev_anon_calendar_albums_school_forms.sql)）的**副本**；若你改其中一邊，請同步更新另一邊，或改為只維護 `migrations/` 再手動匯出。
- 若你**已在 Dashboard 手動執行過** `schema.sql`，再跑 `db push` 可能因物件已存在而失敗；請改用全新專案測 CLI，或繼續用 SQL Editor 維護。

首次使用 CLI 前若未登入過，請先執行：  
`npx supabase@latest login`（瀏覽器開啟授權）。

---

## 步驟 3（建議本機／示範用）：開放 anon 讀寫（後台 CRUD）

預設 `schema.sql` **只開放匿名 SELECT**（且多數列表僅 `is_visible = true`），因此後台若要讀寫隱藏列或寫入資料表，會被 RLS 擋下。

若你要用 **anon key** 在瀏覽器直接連後台（與本專案 v2.0-E／v2.0-F 相同方式），請在 SQL Editor **依序**執行：

1. [`supabase/policies_dev_anon_announcements_lunch.sql`](./supabase/policies_dev_anon_announcements_lunch.sql) — 公告、午餐  
2. [`supabase/policies_dev_anon_calendar_albums_school_forms.sql`](./supabase/policies_dev_anon_calendar_albums_school_forms.sql) — 行事曆、相簿、學校資料、表單  

檔案開頭有安全提醒：**正式對外網站請勿使用**，應改為 Supabase Auth + 僅管理員可寫入的 RLS。

---

## 步驟 4：取得 API 網址與 anon key

1. 左側 **Project Settings**（齒輪）→ **API**  
2. 複製：  
   - **Project URL**  
   - **Project API keys** 區塊的 **anon** `public`（長字串，以 `eyJ` 開頭）

**切勿**把 **service_role** key 貼進 Vite 前端或提交到 Git。

---

## 步驟 5：本機環境變數

1. 在專案根目錄複製範本：  
   `copy .env.example .env.local`（Windows PowerShell 可用 `Copy-Item .env.example .env.local`）  
2. 編輯 **`.env.local`**，填入：

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

3. **重新啟動** `npm run dev`（Vite 只會在啟動時讀入 env）

---

## 步驟 6：確認是否連線成功

- 瀏覽器開前台首頁或公告頁，應能載入雲端資料（與種子內容一致或接近）  
- 後台 **公告／午餐／行事曆／相簿／學校資料／表單** 頂部應顯示：**目前資料來源：Supabase 雲端資料庫**  
- 儲存後可至 Supabase **Table Editor** 查看對應資料表是否更新  

若仍顯示「此瀏覽器暫存資料」或出現雲端錯誤 toast，請檢查：

- `.env.local` 變數名稱是否**完全一致**（`VITE_` 前綴）  
- 是否已執行 **步驟 3** 的兩份開發用政策（公告／午餐＋行事曆等四表）  
- SQL Editor 的 **Logs** 或瀏覽器 **Network** 是否為 401／RLS 錯誤  

---

## 步驟 7：Vercel 部署（選用）

1. Vercel 專案 → **Settings** → **Environment Variables**  
2. 新增與本機相同之 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`（Production / Preview 視需要勾選）  
3. **Redeploy** 一次讓變數生效  

---

## 相關文件

| 檔案 | 說明 |
|------|------|
| [`supabase/README.md`](./supabase/README.md) | 建表、RLS 說明、資料筆數檢查 |
| [`supabase/schema.sql`](./supabase/schema.sql) | 手動 SQL Editor 建表＋種子（與 migrations 同步維護） |
| [`supabase/migrations/`](./supabase/migrations/) | CLI `db push` 用 |
| [`supabase/policies_dev_anon_announcements_lunch.sql`](./supabase/policies_dev_anon_announcements_lunch.sql) | 開發用公告／午餐寫入 |
| [`supabase/policies_dev_anon_calendar_albums_school_forms.sql`](./supabase/policies_dev_anon_calendar_albums_school_forms.sql) | 開發用行事曆／相簿／學校／表單寫入 |
| [`SUPABASE_PLAN_v2.0.md`](./SUPABASE_PLAN_v2.0.md) | 整體規畫 |
| [**SUPABASE_VERIFY.md**](./SUPABASE_VERIFY.md) | **串線成功簡易判斷標準（勾選用）** |
