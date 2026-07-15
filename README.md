# CUBE 刷卡查

輸入店家或平台，即時比較 2026 年國泰世華 CUBE 卡權益方案、回饋率與付款條件。

網站包含 Level 1–3 試算、慶生月與童樂匯資格設定、重複適用方案比較，以及授權日、分期、第三方支付等刷卡提醒。資料整理日為 2026-07-15，實際權益仍以 CUBE App 與國泰世華官方公告為準。

## 本機開發

```text
pnpm install
pnpm dev
```

## 驗證

```text
pnpm build
node --test tests/rendered-html.test.mjs
```

## GitHub Pages

這個儲存庫已包含 GitHub Pages 自動部署流程。推送至 `main` 後，GitHub Actions 會從 `app/page.tsx` 的最新回饋資料產生純靜態網站並部署。

第一次使用時，請到 GitHub 儲存庫的 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。完成後，網站網址為：

```text
https://tsubin6899.github.io/cube/
```

本機若想預覽 GitHub Pages 版本，可執行：

```text
node scripts/build-github-pages.mjs
```

產生的檔案會放在 `site/`，並不需要提交。
