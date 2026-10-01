import { Menu, button } from "./Menu.js";
export class Pause extends Menu {
  constructor(app, game) {
    super(
      "已暫停",
      [
        button("繼續", 125, () => app.manager.pop()),
        button("重新開始", 325, () => app.play(game.level)),
        button("回選單", 525, () => app.select()),
      ],
      { overlay: true },
    );
    this.audio = app.audio;
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
  onKeyDown(key) {
    if (key === "escape" || key === "p") this.manager.pop();
  }
}
