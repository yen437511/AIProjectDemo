import { Menu, button } from "./Menu.js";
export class Title extends Menu {
  constructor(app) {
    super("Archer Line · 弓箭之路", [
      button("開始遊戲", 225, () => app.select()),
      button("操作說明", 435, () => app.howTo()),
    ]);
    this.audio = app.audio;
    this.art = app.art;
    const sound = button(
      "",
      20,
      () => {
        app.audio?.toggle();
        sound.label = app.audio?.muted ? "音效：關" : "音效：開";
      },
      { x: 1040, w: 220, h: 64, font: 24 },
    );
    sound.label = app.audio?.muted ? "音效：關" : "音效：開";
    this.buttons.push(sound);
  }
  drawBackdrop(ctx) {
    const image = this.art?.get("title");
    if (image) {
      ctx.drawImage(image, 0, 0, 1280, 720);
      ctx.fillStyle = "#16342f70";
      ctx.fillRect(0, 0, 1280, 720);
    }
  }
  drawContent(ctx) {
    if (this.art && !this.art.ready) {
      ctx.fillStyle = "#f6f1db";
      ctx.font = "24px sans-serif";
      ctx.fillText(
        `素材載入中 ${Math.round(this.art.progress * 100)}%`,
        640,
        680,
      );
    }
  }
}
