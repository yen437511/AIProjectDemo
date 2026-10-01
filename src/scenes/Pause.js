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
  }
  onKeyDown(key) {
    if (key === "escape" || key === "p") this.manager.pop();
  }
}
