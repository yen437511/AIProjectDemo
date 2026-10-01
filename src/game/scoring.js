export function scoreHit(target, y) {
  const distance = Math.abs(y - target.y) / (target.height / 2);
  return target.rings.find((ring) => distance <= ring.radius)?.score ?? 0;
}
