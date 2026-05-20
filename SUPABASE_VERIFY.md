# Supabase 串線成功 — 簡易判斷標準

依序檢查；**全部通過**即表示本機／雲端串線與讀寫大致正常。

| # | 檢查項目 | 成功標準 |
|---|----------|----------|
| 1 | 後台公告來源 | 登入後開啟 **`/admin/announcements`**，頁面上方顯示 **「目前資料來源：Supabase 雲端資料庫」**（若顯示「此瀏覽器暫存資料」代表未連上雲端或未設定 `.env.local`／RLS 未開放讀取） |
| 2 | 後台寫入雲端 | 在後台 **新增一則公告** 並儲存後，到 Supabase **Table Editor** → **`announcements`** 可看到**新的一列** |
| 3 | 前台讀雲端 | 開啟 **`/announcements`**，按 **重新整理（F5）**，剛才的公告**出現在列表** |
| 4 | 午餐寫入雲端 | 在 **`/admin/lunch`** 修改內容並儲存後，Table Editor → **`lunch_menus`** 可看到對應 **`date`** 的列已更新 |
| 5 | 前台午餐同步 | 開啟 **首頁 `/`** 與 **`/lunch`**，各自 **重新整理**後，今日午餐內容與後台一致（雲端優先時應同步） |
| 6 | 建置 | 專案根目錄執行 **`npm run build`** 成功、無 TypeScript 錯誤 |

---

## 常見未通過原因

- **第 1 項不通**：`.env.local` 缺 `VITE_SUPABASE_URL`／`VITE_SUPABASE_ANON_KEY` 或打錯；未重啟 `npm run dev`；或從未在雲端建好表／讀取被 RLS 擋。
- **第 2、4 項不通**：未執行開發用政策檔 **`policies_dev_anon_announcements_lunch.sql`**（或 migration 內含該段），anon 無法 INSERT／UPDATE。
- **第 3、5 項不通**：前台仍讀到舊的 **localStorage**（可試無痕視窗或清掉該站 localStorage 再重整）；或雲端寫入失敗但後台已改存本機。

詳細設定步驟見 [**SUPABASE_SETUP.md**](./SUPABASE_SETUP.md)。
