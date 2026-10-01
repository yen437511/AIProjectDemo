import {
  aimFromDrag,
  launch,
  advanceArrow,
  previewTrajectory,
} from "../game/physics.js";

import { Menu, button } from "./Menu.js";
import { attachArrow, attachedPosition } from "../game/target.js";
import { calculateStars, scoreHit } from "../game/scoring.js";

import { levels } from "../levels/levels.js";
import { targetAtTime, sweepMovingTarget } from "../game/level.js";

import { drawBackground } from "./background.js";

const ORIGIN = { x: 170, y: 455 };

export class Game {
  constructor({ level = levels[0], target, arrows = level.arrows, app } = {}) {
    this.app = app;
    this.particles = [];
    this.trail = [];
    this.shake = 0;
    this.pauseUI = new Menu(
      "",
      [button("暫停", 115, () => app?.pause(this), { x: 1070, w: 192 })],
      { overlay: true },
    );
    this.pauseUI.audio = app?.audio;
    this.level = level;
    this.definitions = target
      ? [{ x: target.x, y: target.y, size: target.height, motion: null }]
      : level.targets;
    this.targets = target
      ? [target]
      : this.definitions.map((definition) => targetAtTime(definition, 0));
    this.target = this.targets[0];
    this.elapsed = 0;
    this.result = null;
    this.remainingArrows = arrows;
    this.score = 0;
    this.attached = [];
    this.scoreTexts = [];
    this.arrow = null;
    this.grounded = [];
    this.drag = null;
  }

  onPointerDown(point) {
    if (this.result) return;
    if (this.pauseUI.hit(point)) {
      this.pauseUI.onPointerDown(point);
      return;
    }
    if (
      this.drag ||
      this.arrow ||
      this.remainingArrows <= 0 ||
      point.buttons !== 1
    )
      return;
    this.app?.audio?.play("draw");
    this.drag = { start: point, end: point, pointerId: point.pointerId };
  }

  onPointerMove(point) {
    this.pauseUI.onPointerMove(point);
    if (this.drag?.pointerId === point.pointerId) this.drag.end = point;
  }

  onPointerUp(point) {
    if (this.pauseUI.pressed) {
      this.pauseUI.onPointerUp(point);
      return;
    }
    if (this.drag?.pointerId !== point.pointerId) return;
    const aim = aimFromDrag(this.drag.start, point);
    this.drag = null;
    if (!aim.cancelled) {
      this.arrow = launch(ORIGIN, aim.speed, aim.angle);
      this.remainingArrows--;
      this.trail.length = 0;
      this.app?.audio?.play("shoot");
    }
  }

  onPointerCancel(point) {
    this.pauseUI.onPointerCancel();
    if (this.drag?.pointerId === point.pointerId) this.drag = null;
  }

  onKeyDown(key) {
    if (key === "escape" || key === "p") this.app?.pause(this);
  }
  onHidden() {
    this.app?.pause(this);
  }

  exit() {
    this.drag = null;
  }

  update(dt) {
    if (this.result) return;
    this.shake = Math.max(0, this.shake - dt);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 400 * dt;
    }
    const before = this.targets;
    this.elapsed += dt;
    this.targets = this.definitions.map((definition, index) => ({
      ...before[index],
      y: targetAtTime(definition, this.elapsed).y,
    }));
    this.target = this.targets[0];
    for (let i = this.scoreTexts.length - 1; i >= 0; i--) {
      this.scoreTexts[i].age += dt;
      if (this.scoreTexts[i].age >= 1.2) this.scoreTexts.splice(i, 1);
    }
    if (!this.arrow) {
      this.finishIfReady();
      return;
    }
    const previous = this.arrow;
    // Sweep before boundary removal so fast arrows cannot skip the target.
    const next = advanceArrow(previous, dt, {
      width: Infinity,
      wind: this.level.wind,
    });
    const hits = next
      ? this.targets
          .map((target, index) => {
            const hit = sweepMovingTarget(
              previous,
              next,
              before[index],
              target,
            );
            return hit && { ...hit, index };
          })
          .filter(Boolean)
          .sort((a, b) => a.fraction - b.fraction)
      : [];
    const hit = hits[0];
    if (hit) {
      const points = scoreHit(hit.target, hit.y);
      this.score += points;
      const bullseye = points === hit.target.rings[0].score;
      this.app?.audio?.play(bullseye ? "bullseye" : "hit");
      if (bullseye) this.shake = 0.22;
      for (let i = 0; i < (bullseye ? 32 : 14); i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 180;
        this.particles.push({
          x: hit.x,
          y: hit.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 80,
          life: 0.5 + Math.random() * 0.4,
          color: bullseye
            ? ["#f3c273", "#ef6461", "#f6f1db"][i % 3]
            : "#c69a66",
        });
      }
      this.attached.push({
        ...attachArrow(next, hit, hit.target),
        targetIndex: hit.index,
      });
      // Store offset against the contact-time target, then render at its current position.
      this.scoreTexts.push({ x: hit.x, y: hit.y, points, age: 0 });
      this.arrow = null;
      this.finishIfReady();
      return;
    }
    this.arrow = next && next.x >= 0 && next.x <= 1280 ? next : null;
    if (this.arrow) {
      this.trail.push({ x: this.arrow.x, y: this.arrow.y });
      if (this.trail.length > 14) this.trail.shift();
    }
    if (this.arrow?.stopped) {
      this.app?.audio?.play("ground");
      this.grounded.push(this.arrow);
      if (this.grounded.length > 40) this.grounded.shift();
      this.arrow = null;
    }
    this.finishIfReady();
  }

  finishIfReady() {
    if (this.remainingArrows === 0 && !this.arrow) {
      this.result = {
        score: this.score,
        stars: calculateStars(this.score, this.level.starThresholds),
        maxScore: this.level.arrows * 10,
        accuracy: this.attached.length / this.level.arrows,
      };
      this.app?.finish(this.level, this.result);
    }
  }

  render(ctx) {
    ctx.save();
    if (this.shake > 0)
      ctx.translate(
        Math.sin(this.elapsed * 100) * this.shake * 18,
        Math.cos(this.elapsed * 90) * this.shake * 10,
      );
    drawBackground(ctx, this.elapsed);
    for (const p of this.particles) {
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 5, 5);
    }
    ctx.globalAlpha = 1;
    if (this.arrow) {
      ctx.lineWidth = 3;
      for (let i = 1; i < this.trail.length; i++) {
        ctx.strokeStyle = `rgba(255, 248, 216, ${(i / this.trail.length) * 0.45})`;
        ctx.beginPath();
        ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
        ctx.stroke();
      }
    }
    ctx.fillStyle = "#16342f";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(`${this.level.id}. ${this.level.name}`, 48, 65);
    ctx.font = "22px sans-serif";
    ctx.fillText(
      this.arrow
        ? "箭矢飛行中…"
        : this.remainingArrows > 0
          ? "任意處按住往後拉，放開射箭"
          : "箭矢已用完",
      48,
      105,
    );
    ctx.fillText(`分數：${this.score}`, 480, 65);
    ctx.fillText("剩餘箭矢", 680, 65);
    for (let i = 0; i < this.remainingArrows; i++)
      this.drawArrow(ctx, { x: 835 + i * 38, y: 58, angle: -Math.PI / 4 });
    ctx.fillText(
      `風 ${this.level.wind === 0 ? "無風" : this.level.wind > 0 ? "→" : "←"} ${Math.abs(this.level.wind)}`,
      480,
      105,
    );
    for (const target of this.targets) this.drawTarget(ctx, target);
    for (const arrow of this.attached)
      this.drawArrow(
        ctx,
        attachedPosition(arrow, this.targets[arrow.targetIndex]),
      );
    for (const text of this.scoreTexts) {
      ctx.save();
      ctx.globalAlpha = 1 - text.age / 1.2;
      ctx.fillStyle = "#a72e2e";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(
        `+${text.points}${text.points === this.target.rings[0].score ? " 正中紅心！" : ""}`,
        text.x - 90,
        text.y - 25 - text.age * 55,
      );
      ctx.restore();
    }
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
      for (const point of previewTrajectory(launch(ORIGIN, aim.speed, angle), {
        wind: this.level.wind,
      })) {
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
    ctx.save();
    for (const b of this.pauseUI.buttons) {
      ctx.fillStyle =
        this.pauseUI.pressed?.button === b
          ? "#bb8437"
          : this.pauseUI.hover === b
            ? "#f3c273"
            : "#d69945";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "#16342f";
      ctx.font = "32px sans-serif";
      ctx.fillText(b.label, b.x + 55, b.y + 95);
    }
    ctx.restore();
    if (this.arrow) {
      if (this.arrow.y < 0) {
        ctx.fillStyle = "#16342f";
        ctx.beginPath();
        ctx.moveTo(this.arrow.x, 8);
        ctx.lineTo(this.arrow.x - 8, 22);
        ctx.lineTo(this.arrow.x + 8, 22);
        ctx.closePath();
        ctx.fill();
      } else this.drawArrow(ctx, this.arrow);
    }
    ctx.restore();
  }

  drawTarget(ctx, target) {
    const { x, y, width, height, rings } = target;
    ctx.strokeStyle = "#765139";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, 550);
    ctx.moveTo(x, 520);
    ctx.lineTo(x - 40, 560);
    ctx.moveTo(x, 520);
    ctx.lineTo(x + 40, 560);
    ctx.stroke();
    for (const ring of [...rings].reverse()) {
      ctx.fillStyle = ring.color;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        (width * ring.radius) / 2,
        (height * ring.radius) / 2,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
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
