# Archer Line

瀏覽器 2D 橫向射箭遊戲：拖曳瞄準、放開射箭，挑戰環靶與關卡。
介面採繁體中文，桌機與手機共用 Pointer Events，畫面以 Canvas 幾何繪製。
目前是專案骨架版本，顯示背景與標題 placeholder。

## Build & Test

- `npm install`：安裝專案依賴（Node.js 20.19+ 或 22.12+）。
- `npm run dev`：啟動 Vite 開發伺服器。
- `npm test`：執行 Vitest 純邏輯測試。
- `npm run build`：產生 `dist/`，部署基底路徑為 `/AIProjectDemo/`。
- `npm run preview`：預覽 build 成果。
- `npm run lint`：執行 ESLint。
- `npm run format`：檢查 Prettier 格式；修正使用 `npx prettier --write .`。

## GitHub Pages 部署

遊玩網址：[Archer Line](https://yen437511.github.io/AIProjectDemo/)。首次部署成功後即可開啟。

先在 GitHub repository 的 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。
`.github/workflows/deploy.yml` 會在推送到 `main` 時自動部署，也可從 Actions 頁面手動執行。
Workflow 使用 Node.js 22，依序執行 `npm ci`、`npm test`、`npm run build`；測試與建置成功後，
透過 `actions/upload-pages-artifact` 上傳 `dist/`，再由 `actions/deploy-pages` 發布。
可在 Actions 的執行紀錄查看部署結果與 `github-pages` 環境網址。

Vite 建置時的 base 為 `/AIProjectDemo/`，使 JavaScript、CSS 等資源使用正確的 GitHub Pages 子路徑。

架構：原生 JavaScript ES Modules + HTML5 Canvas，不使用 TypeScript 或遊戲框架。
`src/main.js` 組裝應用；`src/core/scaling.js` 管理 1280×720 邏輯座標、等比縮放與 DPR；
`loop.js` 提供 60Hz 固定步長更新與 rAF 繪製，隱藏分頁暫停並清除累積時間；
`sceneManager.js` 提供 push/pop/replace，只有頂層場景接收更新與輸入，所有場景依序繪製；
`input.js` 將 Pointer Events 轉成邏輯座標。場景可實作 enter/exit/update/render 及
onPointerDown/Move/Up/Cancel。`src/scenes/Placeholder.js` 示範此管線。
未來的遊戲純邏輯放在 `src/game/`，關卡資料放在 `src/levels/`，UI 場景放在 `src/scenes/`。
目前僅建立骨架，不實作射擊、計分或關卡。
