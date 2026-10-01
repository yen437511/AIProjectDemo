import { createTarget } from "./target.js";

export function targetAtTime(definition, time) {
  const motion = definition.motion;
  return createTarget({
    x: definition.x,
    y:
      definition.y +
      (motion
        ? motion.amplitude * Math.sin((time * Math.PI * 2) / motion.period)
        : 0),
    height: definition.size,
  });
}

// Sweep in the moving target's frame and return its position at contact.
export function sweepMovingTarget(previous, next, before, after) {
  const dx = next.x - previous.x;
  if (dx === 0) return null;
  const fraction = (before.x - previous.x) / dx;
  if (fraction < 0 || fraction > 1) return null;
  const target = { ...after, y: before.y + (after.y - before.y) * fraction };
  const y = previous.y + (next.y - previous.y) * fraction;
  return Math.abs(y - target.y) <= target.height / 2
    ? { x: target.x, y, fraction, target }
    : null;
}
