import { WIDTH, HEIGHT } from "../core/scaling.js";

export class Placeholder {
  render(ctx) {
    ctx.fillStyle = "#b9d7dc";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#527978";
    ctx.beginPath();
    ctx.moveTo(0, 560);
    ctx.lineTo(280, 290);
    ctx.lineTo(600, 560);
    ctx.lineTo(930, 340);
    ctx.lineTo(WIDTH, 560);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#203d38";
    ctx.fillRect(0, 560, WIDTH, 160);
    ctx.textAlign = "center";
    ctx.fillStyle = "#16342f";
    ctx.font = "bold 76px sans-serif";
    ctx.fillText("Archer Line", WIDTH / 2, 230);
    ctx.font = "28px sans-serif";
    ctx.fillText("弓弦之間，瞄準每一個可能", WIDTH / 2, 290);
    ctx.fillStyle = "#e9efdf";
    ctx.font = "22px sans-serif";
    ctx.fillText("專案骨架已就緒", WIDTH / 2, 640);
  }
}
