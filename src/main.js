import "./style.css";
import { WIDTH, HEIGHT, resizeCanvas } from "./core/scaling.js";
import { SceneManager } from "./core/sceneManager.js";
import { attachInput } from "./core/input.js";
import { startLoop } from "./core/loop.js";
import { createApp } from "./scenes/app.js";
import { createStorage } from "./core/storage.js";

import { createAudio } from "./core/audio.js";

import { createArt } from "./core/art.js";
import { manifest } from "./assets/manifest.js";
const art = createArt(
  manifest,
  (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      const timer = setTimeout(() => reject(new Error("Image timeout")), 15000);
      image.onload = () => {
        clearTimeout(timer);
        resolve(image);
      };
      image.onerror = () => {
        clearTimeout(timer);
        reject(new Error("Image failed"));
      };
      image.src = url;
    }),
);
art.preload();
const audio = createAudio({
  contextFactory: () =>
    new (window.AudioContext || window.webkitAudioContext)(),
  storage: {
    getItem: (key) => window.localStorage.getItem(key),
    setItem: (key, value) => window.localStorage.setItem(key, value),
  },
});
const unlockAudio = () => audio.unlock();
window.addEventListener("pointerdown", unlockAudio, { capture: true });
window.addEventListener("keydown", unlockAudio, { capture: true });
const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const manager = new SceneManager();
const app = createApp(
  manager,
  createStorage(() => window.localStorage),
  audio,
  art,
);
app.title();
const keydown = (event) => {
  const key = event.key.toLowerCase();
  if (!event.repeat && ["escape", "p"].includes(key)) {
    event.preventDefault();
    manager.current?.onKeyDown?.(key);
  }
};
const visibility = () => {
  if (document.hidden) manager.current?.onHidden?.();
};
window.addEventListener("keydown", keydown);
document.addEventListener("visibilitychange", visibility);
const resize = () =>
  resizeCanvas(
    canvas,
    window.innerWidth,
    window.innerHeight,
    window.devicePixelRatio || 1,
  );
resize();
window.addEventListener("resize", resize);
const detachInput = attachInput(canvas, manager);
const stop = startLoop({
  update: (dt) => manager.update(dt),
  render: () => {
    // Recheck DPR for moving between displays or browser zoom.
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (
      canvas.width !== Math.round(rect.width * dpr) ||
      canvas.height !== Math.round(rect.height * dpr)
    )
      resize();
    ctx.setTransform(canvas.width / WIDTH, 0, 0, canvas.height / HEIGHT, 0, 0);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    manager.render(ctx);
  },
});
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    window.removeEventListener("keydown", keydown);
    document.removeEventListener("visibilitychange", visibility);
    audio.dispose();
    window.removeEventListener("pointerdown", unlockAudio, { capture: true });
    window.removeEventListener("keydown", unlockAudio, { capture: true });
    stop();
    detachInput();
    window.removeEventListener("resize", resize);
    while (manager.current) manager.pop();
  });
