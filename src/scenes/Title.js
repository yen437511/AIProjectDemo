import { Menu, button } from "./Menu.js";
export class Title extends Menu {
  constructor(app) {
    super("Archer Line · 弓箭之路", [
      button("開始遊戲", 225, () => app.select()),
      button("操作說明", 435, () => app.howTo()),
    ]);
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
}
