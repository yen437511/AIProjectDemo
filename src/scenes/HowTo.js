import { Menu, button } from "./Menu.js";
export class HowTo extends Menu {
  constructor(app) {
    super("操作說明", [button("返回標題", 525, () => app.title())]);
  }
  drawContent(ctx) {
    ctx.font = "30px sans-serif";
    ctx.fillText("① 按住畫面　② 往左後方拖曳　③ 放開射箭", 640, 200);
    ctx.fillText("拖曳方向決定角度，距離決定力道；紅心得分最高。", 640, 450);
    ctx.fillText("獲得至少一星解鎖下一關。Esc / P 可暫停。", 640, 495);
    ctx.strokeStyle = "#d69945";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(820, 310, 25, 0, Math.PI * 2);
    ctx.moveTo(780, 310);
    ctx.lineTo(450, 380);
    ctx.lineTo(490, 340);
    ctx.moveTo(450, 380);
    ctx.lineTo(505, 395);
    ctx.stroke();
    ctx.font = "28px sans-serif";
    ctx.fillText("按住", 820, 370);
    ctx.fillText("往後拉 ↙", 550, 290);
  }
}
