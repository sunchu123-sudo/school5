# 部署說明 — 三棧國小行動校園 App

本專案為 **React + Vite + TypeScript + Tailwind** 手機版學校 App，含前台、後台、localStorage 暫存、資料備份匯入匯出與 PWA 功能。

---

## 1. 本機開發

```bash
npm install
npm run dev
```

預設開發伺服器：`http://localhost:8080`

> 開發模式（`npm run dev`）**不會**註冊 Service Worker，避免快取干擾開發。

---

## 2. 建置檢查

部署前請先在本機確認建置成功：

```bash
npm run build
```

建置產物輸出至 `dist/` 目錄。

---

## 3. 本機預覽建置結果

```bash
npm run preview
```

可用此方式在本機測試 production 建置、PWA 與路由行為（預設約 `http://localhost:4173`）。

---

## 4. Vercel 部署注意事項

### 專案設定

| 項目 | 建議值 |
|------|--------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install`（預設即可） |

### SPA 路由

本專案使用 **React Router**，已在根目錄 `vercel.json` 設定 rewrite：

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

此設定可避免部署後直接重新整理子路由（如 `/announcements`、`/admin`）時出現 **404**。

### 部署方式

1. 將專案 push 至 GitHub。
2. 在 [Vercel](https://vercel.com) 匯入該 repository。
3. 確認 Framework 為 **Vite**、Output 為 **dist**。
4. 部署完成後依下方清單測試各路由。

---

## 5. 上線後測試網址

部署完成後，請逐一開啟並確認頁面正常（將 `https://your-domain.vercel.app` 替換為實際網址）：

| 路徑 | 說明 |
|------|------|
| `/` | 首頁 |
| `/announcements` | 公告列表 |
| `/calendar` | 行事曆 |
| `/albums` | 相簿 |
| `/more` | 更多功能 |
| `/admin/login` | 後台登入 |
| `/admin` | 後台首頁（需登入） |

**額外建議測試：**

- 在任一子路由按 **重新整理**，確認不會 404。
- 手機瀏覽器測試 **加入主畫面**（PWA），詳見 [`PWA_SETUP.md`](./PWA_SETUP.md)。
- 後台登入後測試公告、午餐等 CRUD 與 localStorage 暫存。
- 後台設定頁測試 **備份匯出／匯入**。

---

## 6. localStorage 注意事項

- 目前資料儲存在**使用者瀏覽器**中，不同裝置、不同瀏覽器**不會同步**。
- 清除瀏覽器資料後，暫存內容會消失（可透過 JSON 備份還原）。
- 正式多人共用、跨裝置使用前，建議改接 **Supabase** 或其他雲端資料庫。
- 後台登入為前端示範，不適合正式環境直接使用。

---

## 7. PWA 相關檔案

部署時以下檔案會一併進入 `dist/`：

| 檔案 | 說明 |
|------|------|
| `public/manifest.webmanifest` | PWA manifest |
| `public/sw.js` | Service Worker |
| `public/icons/icon-192.png` | 圖示 192×192 |
| `public/icons/icon-512.png` | 圖示 512×512 |

Service Worker 僅在 **production** 環境註冊（`src/registerSW.ts`）。

---

## 8. 常見問題

### 子路由重新整理 404

確認 `vercel.json` 已提交至 repository，且 Vercel 專案未覆寫 rewrite 設定。

### PWA 圖示未更新

清除瀏覽器快取或重新安裝 PWA，詳見 [`PWA_SETUP.md`](./PWA_SETUP.md)。

### 建置失敗

在本機執行 `npm run build` 查看錯誤訊息，修正 TypeScript 或 ESLint 問題後再推送。
