# PWA 安裝說明 — 三棧國小行動校園 App

本專案已加入基本 PWA（Progressive Web App）支援，可將網站加入手機主畫面，像 App 一樣開啟。

> **注意：** 目前是基本 PWA 版本，尚未完整支援離線資料同步。離線時可能只能看到基本首頁殼層，公告、行事曆等動態內容仍需網路連線。

---

## iPhone（Safari）加入主畫面

1. 使用 **Safari** 開啟網站（需為已部署的 HTTPS 網址，或本機測試用 `npm run preview`）。
2. 點選底部 **分享** 按鈕（方框加向上箭頭）。
3. 向下滑動，選擇 **加入主畫面**。
4. 確認名稱（預設為「三棧校園」）後，點 **加入**。
5. 回到主畫面，點選新圖示即可全螢幕開啟。

---

## Android（Chrome）加入主畫面

1. 使用 **Chrome** 開啟網站（需為 HTTPS 或 localhost）。
2. 若瀏覽器偵測到 PWA，可能會自動顯示 **安裝 App** 或 **加入主畫面** 提示。
3. 若未出現提示，點選右上角 **⋮** 選單。
4. 選擇 **安裝應用程式** 或 **加入主畫面**（依 Chrome 版本文字可能略有不同）。
5. 確認後，圖示會出現在主畫面或應用程式抽屜。

---

## Icon 檔案位置

| 檔案 | 用途 |
|------|------|
| `public/icons/icon-192.png` | PWA 圖示（192×192）、Apple Touch Icon |
| `public/icons/icon-512.png` | PWA 圖示（512×512） |
| `public/icons/icon.svg` | 向量原始檔（可重新匯出 PNG） |
| `public/manifest.webmanifest` | PWA manifest 設定 |

若要更換圖示，請替換上述 PNG 檔案，並重新部署。建議保留 192 與 512 兩種尺寸。

---

## 圖示不更新時如何清除快取

PWA 與 Service Worker 會快取部分資源，更新圖示後若未生效，可嘗試：

### iPhone Safari
1. 設定 → Safari → **清除瀏覽記錄與網站資料**（會清除所有網站資料）。
2. 或刪除主畫面捷徑後，重新加入主畫面。

### Android Chrome
1. Chrome → 設定 → 隱私權和安全性 → **清除瀏覽資料**。
2. 勾選「快取的圖片和檔案」，清除後重新開啟網站。
3. 若已安裝 PWA：長按 App 圖示 → 應用程式資訊 → 儲存空間 → **清除快取**。
4. 開發者可在 Chrome DevTools → Application → Service Workers → **Unregister**，再重新整理。

### 開發環境
- `npm run dev` **不會**註冊 Service Worker，避免快取干擾開發。
- 測試 PWA 請使用 `npm run build` 後執行 `npm run preview`，或部署至 Vercel 等 HTTPS 環境。

---

## 相關設定檔

| 檔案 | 說明 |
|------|------|
| `public/manifest.webmanifest` | 應用名稱、顏色、圖示、顯示模式 |
| `public/sw.js` | Service Worker（基本離線殼層） |
| `src/registerSW.ts` | 僅 production 註冊 SW |
| `index.html` | manifest 連結與 Apple PWA meta 標籤 |

---

## 目前限制

- 資料仍儲存於瀏覽器 localStorage，換裝置不會同步。
- 離線時無法完整瀏覽所有頁面與最新公告。
- iOS 對 PWA 支援與 Android 略有差異，部分功能需透過 Safari 加入主畫面才有效。
