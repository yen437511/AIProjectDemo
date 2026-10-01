export class Menu {
  constructor(title, buttons = [], { overlay = false } = {}) {
    this.title = title;
    this.buttons = buttons;
    this.overlay = overlay;
    this.hover = null;
    this.pressed = null;
  }
  enter(manager) {
    this.manager = manager;
  }
  hit(p) {
    return this.buttons.find(
      (b) =>
        !b.disabled &&
        p.x >= b.x &&
        p.x <= b.x + b.w &&
        p.y >= b.y &&
        p.y <= b.y + b.h,
    );
  }
  onPointerMove(p) {
    this.hover = this.hit(p);
  }
  onPointerDown(p) {
    if (p.buttons === 1)
      this.pressed = { button: this.hit(p), id: p.pointerId };
  }
  onPointerUp(p) {
    if (this.pressed?.id !== p.pointerId) return;
    const button = this.pressed.button;
    this.pressed = null;
    if (button && button === this.hit(p)) {
      this.audio?.play("button");
      button.action();
    }
  }
  onPointerCancel() {
    this.pressed = null;
  }
  render(ctx) {
    ctx.save();
    ctx.fillStyle = this.overlay ? "#16342fe8" : "#16342f";
    ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = "#f6f1db";
    ctx.textAlign = "center";
    ctx.font = "bold 48px sans-serif";
    ctx.fillText(this.title, 640, 115);
    this.drawContent?.(ctx);
    for (const b of this.buttons) {
      ctx.fillStyle = b.disabled
        ? "#52665d"
        : this.pressed?.button === b
          ? "#bb8437"
          : this.hover === b
            ? "#f3c273"
            : "#d69945";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = b.disabled ? "#bac6bb" : "#16342f";
      ctx.font = `bold ${b.font ?? 32}px sans-serif`;
      ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 11);
    }
    ctx.restore();
  }
}
export const button = (label, y, action, extra = {}) => ({
  label,
  x: 320,
  y,
  w: 640,
  h: 192,
  action,
  ...extra,
});
