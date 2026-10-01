export const DEFAULT_RINGS = [
  { radius: 0.2, score: 10, color: "#da4545" },
  { radius: 0.4, score: 8, color: "#edbd4c" },
  { radius: 0.6, score: 6, color: "#4e95bd" },
  { radius: 0.8, score: 4, color: "#343f47" },
  { radius: 1, score: 2, color: "#f4f0dc" },
];

export function createTarget({
  x = 1000,
  y = 400,
  width = 42,
  height = 220,
  rings = DEFAULT_RINGS,
} = {}) {
  return { x, y, width, height, rings: rings.map((ring) => ({ ...ring })) };
}

// The side-view target face lies on x; height determines scoring distance.
export function sweepTarget(previous, next, target) {
  const dx = next.x - previous.x;
  if (dx === 0) return null;
  const fraction = (target.x - previous.x) / dx;
  if (fraction < 0 || fraction > 1) return null;
  const y = previous.y + (next.y - previous.y) * fraction;
  if (Math.abs(y - target.y) > target.height / 2) return null;
  return { x: target.x, y, fraction };
}

export function attachArrow(arrow, hit, target) {
  return {
    angle: arrow.angle ?? Math.atan2(arrow.vy, arrow.vx),
    offsetX: hit.x - target.x,
    offsetY: hit.y - target.y,
  };
}

export function attachedPosition(attachment, target) {
  return {
    x: target.x + attachment.offsetX,
    y: target.y + attachment.offsetY,
    angle: attachment.angle,
  };
}
