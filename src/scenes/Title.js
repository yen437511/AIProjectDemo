import { Menu, button } from "./Menu.js";
export class Title extends Menu {
  constructor(app) {
    super("Archer Line · 弓箭之路", [
      button("開始遊戲", 225, () => app.select()),
      button("操作說明", 435, () => app.howTo()),
    ]);
  }
}
