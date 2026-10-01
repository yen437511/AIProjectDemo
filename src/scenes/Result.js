import { Menu, button } from "./Menu.js";
import { levels } from "../levels/levels.js";
export class Result extends Menu {
  constructor(app, level, result) {
    super("關卡結算");
    this.result = result;
    this.age = 0;
    this.buttons = [
      button("重玩", 520, () => app.play(level), { x: 20, w: 400 }),
      button("選單", 520, () => app.select(), { x: 860, w: 400 }),
    ];
    const next = levels[levels.findIndex((l) => l.id === level.id) + 1];
    if (next)
      this.buttons.push(
        button(
          result.stars ? "下一關" : "下一關（未解鎖）",
          520,
          () => app.play(next),
          {
            x: 440,
            w: 400,
            disabled: app.storage.getProgress().unlocked < next.id,
          },
        ),
      );
  }
  update(dt) {
    this.age += dt;
  }
  drawContent(ctx) {
    ctx.font = "bold 72px sans-serif";
    ctx.fillStyle = "#d69945";
    ctx.fillText(
      Array.from({ length: 3 }, (_, i) =>
        i < this.result.stars && this.age >= (i + 1) * 0.35 ? "★" : "☆",
      ).join(" "),
      640,
      255,
    );
    ctx.fillStyle = "#f6f1db";
    ctx.font = "36px sans-serif";
    ctx.fillText(
      `分數 ${this.result.score} / ${this.result.maxScore}`,
      640,
      350,
    );
    ctx.fillText(`命中率 ${Math.round(this.result.accuracy * 100)}%`, 640, 420);
  }
}
