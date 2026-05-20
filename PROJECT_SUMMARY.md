# 三棧國小行動校園 App — 專案完整摘要

**版本範圍：** v0.1 ～ v2.0-D  
**最後更新：** 2026-05-20  
**正式網址：** https://school5-six.vercel.app  
**GitHub：** https://github.com/sunchu123-sudo/school5  

本文件整合各階段開發回報，方便交接、測試與後續開發。

---

## 目錄

1. [專案概覽](#1-專案概覽)
2. [版本歷程](#2-版本歷程)
3. [localStorage 資料 key](#3-localstorage-資料-key)
4. [後台管理](#4-後台管理)
5. [PWA 手機安裝](#5-pwa-手機安裝)
6. [部署與 GitHub](#6-部署與-github)
7. [Supabase 雲端資料庫](#7-supabase-雲端資料庫)
8. [前台資料讀取順序（v2.0-D）](#8-前台資料讀取順序v20-d)
9. [上線測試清單摘要](#9-上線測試清單摘要)
10. [已知限制](#10-已知限制)
11. [下一步建議](#11-下一步建議)
12. [相關文件索引](#12-相關文件索引)

---

## 1. 專案概覽

| 項目 | 說明 |
|------|------|
| 技術棧 | React、Vite、TypeScript、Tailwind、shadcn-ui |
| 定位 | 手機版學校行動校園 App |
| 資料策略 | localStorage 暫存（後台）+ 可選 Supabase（前台讀取） |
| 部署平台 | Vercel |
| 示範後台帳密 | `admin` / `1234`（僅示範，不適合正式公開） |

---

## 2. 版本歷程

### v0.1 — 後台骨架
- 新增 AdminLayout、AdminNav、AdminHeader
- 新增各後台管理頁面骨架
- `/admin` 路由群組

### v0.2 — 公告 & 午餐操作
- 公告 CRUD、搜尋、分類、置頂、預覽
- 午餐表單編輯與即時預覽

### v0.3 — localStorage 暫存
- `admin-storage.ts` 讀寫驗證
- 公告、午餐存入瀏覽器
- 恢復預設按鈕

### v0.4 — 前台同步 localStorage
- `storage.ts` 共用讀取
- 前台公告、午餐讀取 localStorage

### v0.5 — 簡易登入保護
- `AdminLogin.tsx`、`AdminProtectedRoute.tsx`
- Key：`admin_logged_in`

### v0.6 — 行事曆 localStorage
- Key：`admin_calendar_events`
- 前台行事曆同步

### v0.7 — 相簿 localStorage
- Key：`admin_albums`
- `isVisible` 控制前台顯示

### v0.8 — 學校資料 & 表單
- Keys：`admin_school_info`、`admin_forms`
- 前台聯絡、簡介、表單下載同步

### v0.9 — 後台首頁統計
- Dashboard 讀取各 localStorage 統計
- 今日午餐、最近公告、近期活動摘要

### v1.0 — 資料備份與還原
- `adminBackup.ts`
- 匯出 / 匯入 JSON、清除暫存

### v1.1 — PWA
- `manifest.webmanifest`、`sw.js`、icons
- 可加入手機主畫面

### v1.2 — Vercel 部署設定
- `vercel.json` SPA rewrite
- `DEPLOYMENT.md`

### v1.3 — 上線測試清單
- `RELEASE_CHECKLIST_v1.3.md`

### v2.0 規畫 — Supabase 文件
- `SUPABASE_PLAN_v2.0.md`

### v2.0-C — Supabase SQL
- `supabase/schema.sql`（6 張表 + RLS + 初始資料）
- `supabase/README.md`

### v2.0-D — 前台讀 Supabase
- `supabaseClient.ts`、6 個 service
- 前台 Supabase 優先，localStorage / mock 備援
- **後台仍寫 localStorage**（尚未改 Supabase 寫入）

---

## 3. localStorage 資料 key

| Key | 用途 | Supabase 對應表 |
|-----|------|-----------------|
| `admin_announcements` | 公告 | `announcements` |
| `admin_calendar_events` | 行事曆 | `calendar_events` |
| `admin_today_lunch` | 今日午餐 | `lunch_menus` |
| `admin_albums` | 相簿 | `albums` |
| `admin_school_info` | 學校資料 | `school_info` |
| `admin_forms` | 表單 | `forms` |
| `admin_logged_in` | 登入狀態 | （未遷移，將由 Auth 取代） |

---

## 4. 後台管理

### 路由

| 路徑 | 功能 |
|------|------|
| `/admin/login` | 登入 |
| `/admin` | 首頁統計 |
| `/admin/announcements` | 公告管理 |
| `/admin/calendar` | 行事曆 |
| `/admin/lunch` | 午餐 |
| `/admin/albums` | 相簿 |
| `/admin/school` | 學校資料 |
| `/admin/forms` | 表單 |
| `/admin/settings` | 設定、備份還原 |

### 登入測試
- 帳號：`admin`
- 密碼：`1234`

### 備份檔格式
- 檔名：`school-campus-backup-YYYY-MM-DD.json`
- 含 6 個 admin key 的 `data` 物件

---

## 5. PWA 手機安裝

### 相關檔案
- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icons/icon-192.png`、`icon-512.png`

### iPhone（Safari）
分享 → **加入主畫面** → 名稱「三棧校園」

### Android（Chrome）
選單 → **安裝應用程式** / **加入主畫面**

### 注意
- `npm run dev` 不註冊 Service Worker
- 測試 PWA 請用 `npm run build` + `npm run preview` 或正式 HTTPS 網址

詳見 [`PWA_SETUP.md`](./PWA_SETUP.md)

---

## 6. 部署與 GitHub

### 本機指令

```bash
npm install
npm run dev      # 開發 http://localhost:8080
npm run build    # 建置
npm run preview  # 預覽建置結果
```

### Vercel 設定

| 項目 | 值 |
|------|-----|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| SPA Rewrite | `vercel.json` |

### 正式網址
- **Production：** https://school5-six.vercel.app

### GitHub
- **Repository：** https://github.com/sunchu123-sudo/school5
- **最新 commit：** `555a30b` — Add admin CMS, PWA, Supabase read layer, and deployment docs.

### 部署指令（CLI）

```bash
npx vercel deploy --prod --yes
```

詳見 [`DEPLOYMENT.md`](./DEPLOYMENT.md)

---

## 7. Supabase 雲端資料庫

### 設定步驟（摘要）

1. [Supabase Dashboard](https://supabase.com/dashboard) 建立專案
2. SQL Editor 執行 [`supabase/schema.sql`](./supabase/schema.sql)
3. Project Settings → API 複製 URL 與 anon key
4. 專案根目錄建立 `.env.local`：

```env
VITE_SUPABASE_URL=https://你的專案ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

5. 重啟 `npm run dev`
6. Vercel 亦需設定相同環境變數後重新部署

### 資料表（6 張）
`announcements`、`calendar_events`、`lunch_menus`、`albums`、`school_info`、`forms`

### RLS（第一階段）
- 僅 **SELECT** 公開讀取
- `is_visible = true` 的列表資料可讀
- `school_info`、`lunch_menus` 全部可讀
- **尚未開放匿名寫入**

詳見 [`supabase/README.md`](./supabase/README.md)、[`SUPABASE_PLAN_v2.0.md`](./SUPABASE_PLAN_v2.0.md)

---

## 8. 前台資料讀取順序（v2.0-D）

```
1. Supabase（有設定且查詢成功、有資料）
2. localStorage（後台暫存）
3. mock.ts（預設資料）
```

### 已改 Supabase 優先讀取的前台頁面

| 頁面 | Service |
|------|---------|
| 公告列表 / 詳情 | `announcementsService` |
| 行事曆 | `calendarService` |
| 首頁（公告、午餐） | `announcementsService`、`lunchService` |
| 午餐資訊 | `lunchService` |
| 相簿列表 / 詳情 | `albumsService` |
| 聯絡、請假、交通、簡介 | `schoolService` |
| 表單下載 | `formsService` |

### 重要：前後台資料可能不同步
- **前台** → 優先 Supabase
- **後台** → 仍寫 localStorage

在後台改資料，前台**不一定**立即看到（除非也寫入 Supabase）。

---

## 9. 上線測試清單摘要

### 前台路由
`/ · /announcements · /calendar · /albums · /more · /lunch · /leave · /contact · /school-intro · /location · /forms`

### 後台路由
`/admin/login · /admin · /admin/announcements · /admin/calendar · /admin/lunch · /admin/albums · /admin/school · /admin/forms · /admin/settings`

### 必測項目
- [ ] 子路由重新整理不 404
- [ ] 後台登入 / 登出
- [ ] localStorage CRUD 與前台同步（同瀏覽器）
- [ ] JSON 備份匯出 / 匯入 / 清除
- [ ] PWA 加入主畫面（手機）
- [ ] （可選）Supabase 設定後前台顯示雲端資料

完整勾選表見 [`RELEASE_CHECKLIST_v1.3.md`](./RELEASE_CHECKLIST_v1.3.md)

---

## 10. 已知限制

| 限制 | 說明 |
|------|------|
| localStorage | 資料存在瀏覽器，不同裝置不同步 |
| 示範登入 | admin/1234 不適合正式環境 |
| 前後台分離 | 前台讀 Supabase、後台寫 localStorage |
| RLS 寫入 | 尚未開放，後台無法直接寫 Supabase |
| PWA 離線 | 基本殼層，無完整離線資料同步 |
| 相簿照片 | 目前為 placeholder，未接 Storage |

---

## 11. 下一步建議

| 階段 | 內容 |
|------|------|
| v2.0-E | 後台 CRUD 改寫入 Supabase |
| v2.1 | Supabase Auth 取代示範登入 + RLS 寫入政策 |
| v2.2 | Supabase Storage（相簿、表單檔案） |
| 維運 | Vercel 設定 Supabase 環境變數 |

---

## 12. 相關文件索引

| 文件 | 用途 |
|------|------|
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | 本機建置、Vercel 部署 |
| [`PWA_SETUP.md`](./PWA_SETUP.md) | PWA 安裝與快取 |
| [`RELEASE_CHECKLIST_v1.3.md`](./RELEASE_CHECKLIST_v1.3.md) | 上線測試勾選表 |
| [`SUPABASE_PLAN_v2.0.md`](./SUPABASE_PLAN_v2.0.md) | Supabase 整體規畫 |
| [`supabase/README.md`](./supabase/README.md) | SQL 執行與 RLS 說明 |
| [`supabase/schema.sql`](./supabase/schema.sql) | 建表 SQL |

---

## 附錄：主要新增程式檔案

```
src/lib/supabaseClient.ts
src/lib/dataFallback.ts
src/lib/publicData.tsx
src/lib/adminBackup.ts
src/services/announcementsService.ts
src/services/calendarService.ts
src/services/lunchService.ts
src/services/albumsService.ts
src/services/schoolService.ts
src/services/formsService.ts
src/pages/admin/AdminLogin.tsx
src/components/admin/AdminProtectedRoute.tsx
src/registerSW.ts
public/manifest.webmanifest
public/sw.js
public/icons/
supabase/schema.sql
vercel.json
```

---

*本文件由開發階段各版本回報整理而成，供校方、開發者與後續維護參考。*
