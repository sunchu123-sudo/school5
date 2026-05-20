# 三棧國小行動校園 — Vercel 部署說明

本專案為 Vite + React 靜態前端，適合部署至 [Vercel](https://vercel.com) 作為**線上測試版**。

## 建置設定（Vercel 自動偵測或手動確認）

| 項目 | 值 |
|------|-----|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

根目錄的 `vercel.json` 已設定 SPA 重新導向，避免直接開啟 `/lunch`、`/announcements` 等路徑時出現 404。

## 第一次部署流程

### 1. 本機確認可建置

```bash
npm install
npm run build
npm run preview
```

瀏覽器開啟 `http://localhost:4173` 檢查是否正常。

### 2. 推送到 GitHub（若尚未建立遠端）

```bash
git init
git add .
git commit -m "Initial commit: 三棧國小行動校園 App"

git branch -M main
git remote add origin https://github.com/你的帳號/school5.git
git push -u origin main
```

> 請先在 GitHub 建立空倉庫（不要勾選自動產生 README，以免衝突）。

### 3. 在 Vercel 匯入專案

1. 登入 [vercel.com](https://vercel.com)（建議用 GitHub 帳號）
2. **Add New → Project** → 選擇 `school5` 倉庫
3. 確認建置設定後按 **Deploy**
4. 完成後會得到預覽網址，例如：`https://school5-xxx.vercel.app`

之後每次 `git push` 到 `main`，Vercel 會自動重新部署。

### 4. 改用 CLI 部署（選用，可不經 GitHub）

```bash
npm i -g vercel
vercel login
vercel
```

正式環境：`vercel --prod`

## 測試版與正式版建議

- **Preview（測試）**：非 `main` 分支或 PR 會產生獨立預覽網址
- **Production（正式）**：通常綁定 `main` 分支；可之後在 Vercel 設定自訂網域

可在 Vercel 專案 **Settings → Deployment Protection** 為測試站加上密碼，避免公開被搜尋到。

## 上線後建議檢查

- [ ] 手機開啟首頁與底部分頁
- [ ] 直接開啟子路徑（如 `/lunch`、`/contact`）是否正常
- [ ] 「撥打學校電話」「開啟地圖」在真機是否有效
- [ ] 內容是否被底部分頁遮住

## 注意事項

- 目前資料來自 `src/data/mock.ts`，線上版為**示意內容**，非即時校務系統。
- 本機開發：`npm run dev`（預設 `http://localhost:8080`）
