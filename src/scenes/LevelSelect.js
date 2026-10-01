import { Menu, button } from "./Menu.js";
import { levels } from "../levels/levels.js";
export class LevelSelect extends Menu {
  constructor(app) {
    const progress = app.storage.getProgress();
    super(
      "選擇關卡",
      levels.map((level, i) =>
        button(
          `${level.id} ${level.name}　${level.id > progress.unlocked ? "鎖定" : "★".repeat(progress.best[level.id].stars) || "☆☆☆"}`,
          125 + Math.floor(i / 3) * 200,
          () => app.play(level),
          {
            x: 20 + (i % 3) * 420,
            w: 400,
            font: 24,
            disabled: level.id > progress.unlocked,
          },
        ),
      ),
    );
    this.buttons.push(button("返回標題", 525, () => app.title()));
  }
}
