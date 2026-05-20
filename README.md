# 三棧國小行動校園

花蓮縣秀林鄉三棧國民小學行動校園 App（Vite + React），供家長查看公告、行事曆、相簿與常用服務。

## 本機開發

```bash
npm install
npm run dev
```

瀏覽器開啟 http://localhost:8080

## 部署至 Vercel

請參考 [DEPLOY.md](./DEPLOY.md)。

## Supabase（雲端資料庫）

第一次連線請依序完成：[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)。  
一鍵推送資料庫：`npm run db:link`（一次）→ `npm run db:push`。  
驗收勾選：[SUPABASE_VERIFY.md](./SUPABASE_VERIFY.md)。
