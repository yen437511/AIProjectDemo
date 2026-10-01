import {
  aimFromDrag,
  launch,
  advanceArrow,
  previewTrajectory,
} from "../game/physics.js";

const ORIGIN = { x: 170, y: 455 };

export class Game {
  constructor() {
    this.arrow = null;
    this.grounded = [];
    this.drag = null;
  }

  onPointerDown(point) {
    if (this.drag || this.arrow || point.buttons !== 1) return;
    this.drag = { start: point, end: point, pointerId: point.pointerId };
  }

  onPointerMove(point) {
    if (this.drag?.pointerId === point.pointerId) this.drag.end = point;
  }

  onPointerUp(point) {
    if (this.drag?.pointerId !== point.pointerId) return;
    const aim = aimFromDrag(this.drag.start, point);
    this.drag = null;
    if (!aim.cancelled) this.arrow = launch(ORIGIN, aim.speed, aim.angle);
  }

  onPointerCancel(point) {
    if (this.drag?.pointerId === point.pointerId) this.drag = null;
  }

  exit() {
    this.drag = null;
  }

  update(dt) {
    if (!this.arrow) return;
    this.arrow = advanceArrow(this.arrow, dt);
    if (this.arrow?.stopped) {
      this.grounded.push(this.arrow);
      if (this.grounded.length > 40) this.grounded.shift();
      this.arrow = null;
    }
  }

  render(ctx) {
    ctx.fillStyle = "#b9d7dc";
    ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = "#203d38";
    ctx.fillRect(0, 560, 1280, 160);
    ctx.fillStyle = "#16342f";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText("Archer Line", 48, 65);
    ctx.font = "22px sans-serif";
    ctx.fillText(
      this.arrow ? "箭矢飛行中…" : "任意處按住往後拉，放開射箭",
      48,
      105,
    );
    // Geometric archer silhouette, standing on the ground.
    ctx.beginPath();
    ctx.arc(116, 417, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#16342f";
    ctx.lineWidth = 13;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(116, 440);
    ctx.lineTo(116, 500);
    ctx.moveTo(116, 500);
    ctx.lineTo(90, 553);
    ctx.moveTo(116, 500);
    ctx.lineTo(140, 553);
    ctx.moveTo(116, 453);
    ctx.lineTo(170, 455);
    ctx.stroke();
    const aim = this.drag ? aimFromDrag(this.drag.start, this.drag.end) : null;
    const angle = aim?.angle ?? Math.PI / 6;
    const pull = (aim?.power ?? 0) * 45;
    ctx.save();
    ctx.translate(ORIGIN.x, ORIGIN.y);
    ctx.rotate(-angle);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#765139";
    ctx.beginPath();
    ctx.moveTo(0, -48);
    ctx.quadraticCurveTo(35, 0, 0, 48);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#f6f1db";
    ctx.beginPath();
    ctx.moveTo(0, -48);
    ctx.lineTo(-pull, 0);
    ctx.lineTo(0, 48);
    ctx.stroke();
    ctx.restore();
    if (aim) {
      ctx.fillStyle = "#16342f";
      for (const point of previewTrajectory(launch(ORIGIN, aim.speed, angle))) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#e9efdf";
      ctx.fillRect(48, 610, 250, 18);
      ctx.fillStyle = "#d69945";
      ctx.fillRect(48, 610, 250 * aim.power, 18);
      ctx.fillStyle = "#e9efdf";
      ctx.font = "22px sans-serif";
      ctx.fillText(
        `力道 ${Math.round(aim.power * 100)}%　角度 ${Math.round((angle * 180) / Math.PI)}°`,
        48,
        670,
      );
      this.drawArrow(ctx, {
        ...ORIGIN,
        x: ORIGIN.x - Math.cos(angle) * pull,
        y: ORIGIN.y + Math.sin(angle) * pull,
        angle: -angle,
      });
    }
    for (const arrow of this.grounded) this.drawArrow(ctx, arrow);
    if (this.arrow) this.drawArrow(ctx, this.arrow);
  }

  drawArrow(ctx, arrow) {
    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(arrow.angle ?? Math.atan2(arrow.vy, arrow.vx));
    ctx.strokeStyle = "#513622";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-34, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.fillStyle = "#16342f";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, -5);
    ctx.lineTo(-10, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#f6f1db";
    ctx.beginPath();
    ctx.moveTo(-32, -5);
    ctx.lineTo(-25, 0);
    ctx.lineTo(-32, 5);
    ctx.stroke();
    ctx.restore();
  }
}
