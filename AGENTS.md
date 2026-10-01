# Project Guidance

只實作目前任務範圍。純邏輯不得依賴 DOM，並以 Vitest 驗證。
完成前 `npm test` 與 `npm run build` 必須通過。

## Build & Test

- `npm install`：安裝專案依賴（Node.js 20.19+ 或 22.12+）。
- `npm run dev`：啟動 Vite 開發伺服器。
- `npm test`：執行 Vitest 純邏輯測試。
- `npm run build`：產生 `dist/`，部署基底路徑為 `/AIProjectDemo/`。
- `npm run preview`：預覽 build 成果。
- `npm run lint`：執行 ESLint。
- `npm run format`：檢查 Prettier 格式；修正使用 `npx prettier --write .`。

架構：原生 JavaScript ES Modules + HTML5 Canvas，不使用 TypeScript 或遊戲框架。
`src/main.js` 組裝應用；`src/core/scaling.js` 管理 1280×720 邏輯座標、等比縮放與 DPR；
`loop.js` 提供 60Hz 固定步長更新與 rAF 繪製，隱藏分頁暫停並清除累積時間；
`sceneManager.js` 提供 push/pop/replace，只有頂層場景接收更新與輸入，所有場景依序繪製；
`input.js` 將 Pointer Events 轉成邏輯座標。場景可實作 enter/exit/update/render 及
onPointerDown/Move/Up/Cancel。`src/scenes/Placeholder.js` 示範此管線。
未來的遊戲純邏輯放在 `src/game/`，關卡資料放在 `src/levels/`，UI 場景放在 `src/scenes/`。
目前僅建立骨架，不實作射擊、計分或關卡。
