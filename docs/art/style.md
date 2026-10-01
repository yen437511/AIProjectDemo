# Archer Line 美術風格

Soft painterly hand-painted illustration, animated film background aesthetic, soft lighting, rich but gentle colors, subtle brush and paper texture, cohesive sage green, warm ochre and muted teal palette. No photorealism, no pixel art, no text, no watermark, no UI, no animals or extra characters.

所有生成 prompt 以上述共用描述開頭。背景使用 16:9；地面起點位於畫面高度的 77.78%（邏輯 y=560），飛行區低對比。人物腳底對齊 y=560，弓手對齊 (170,455)。靶架與稻草材質使用透明圖；計分環以原有純邏輯資料繪製。

## 輸出與對齊

背景與標題輸出 1920×1080、WebP quality 80。將原圖上下分段縮放至 840 與 240 像素，使地面起點對齊 y=560。分段位置（原始高度比例）：meadow 0.827、forest 0.802、lake 0.813、valley 0.810、snow 0.800、title 0.798。

角色輸出 168×286、quality 85、保留 alpha；原圖在高度 0.169（伸手位置）分段，分別縮放至 76 與 210 像素。顯示於 (86,417)，大小 84×143：手掌接 (170,455)，腳底 y=560。

靶輸出 640×640、quality 85、保留 alpha。下方 31% 為靶架腿，縮放到靶面底端至地面 y=560；上方 69% 中央 72% 為稻草靶面，隨邏輯靶移動。程式繪製的五個計分環完全沿用 target.rings 的顏色與半徑；不改碰撞、計分、插箭、風或移動邏輯。

八張 WebP 共 955,520 bytes，每張背景皆低於 250 KB。不提交原始 PNG。素材網址透過 Vite import，預載每張各自失敗時退回原有幾何渲染，15 秒逾時亦視為失敗。

驗證預覽位於忽略的 .runtime/art-review：標題、五關、844×390 等比縮放與完全回退。使用實際場景 Canvas renderer 產生並檢視；Chromium 因缺少 libnspr4.so 無法啟動，未取得瀏覽器截圖。預覽環境無中文字型，文字顯示為方框，因此無法驗證中文字型外觀。
