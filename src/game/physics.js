// Canvas coordinates: positive y points down; launch angles point upwards.
export function launch(origin, speed, angle) {
  return {
    ...origin,
    vx: speed * Math.cos(angle),
    vy: -speed * Math.sin(angle),
  };
}

export function stepPhysics(state, dt, gravity = 480, wind = 0) {
  return {
    x: state.x + state.vx * dt + (wind * dt * dt) / 2,
    y: state.y + state.vy * dt + (gravity * dt * dt) / 2,
    vx: state.vx + wind * dt,
    vy: state.vy + gravity * dt,
  };
}

export function heading({ vx, vy }) {
  return Math.atan2(vy, vx);
}

export function aimFromDrag(start, end, maxPull = 180, minPull = 12) {
  const dx = start.x - end.x;
  const dy = start.y - end.y;
  const distance = Math.hypot(dx, dy);
  const power = Math.min(1, Math.max(0, distance / maxPull));
  return {
    power,
    angle: Math.atan2(-dy, dx),
    speed: power * 900,
    cancelled: distance < minPull,
  };
}

// Resolve contact at its exact time, avoiding a timestep-dependent ground overshoot.
export function advanceArrow(
  arrow,
  dt,
  { ground = 560, width = 1280, height = 720, gravity = 480, wind = 0 } = {},
) {
  if (arrow.stopped) return arrow;
  let next = stepPhysics(arrow, dt, gravity, wind);
  if (next.y >= ground) {
    const time =
      gravity === 0
        ? (ground - arrow.y) / arrow.vy
        : (-arrow.vy +
            Math.sqrt(arrow.vy ** 2 + 2 * gravity * (ground - arrow.y))) /
          gravity;
    next = stepPhysics(arrow, Math.max(0, Math.min(dt, time)), gravity, wind);
    if (next.x >= 0 && next.x <= width)
      return { ...next, y: ground, angle: heading(next), stopped: true };
  }
  if (next.x < 0 || next.x > width || next.y > height) return null;
  return { ...next, angle: heading(next), stopped: false };
}

export function previewTrajectory(state, options = {}) {
  const gravity = options.gravity ?? 480;
  const ground = options.ground ?? 560;
  const flightTime =
    (-state.vy + Math.sqrt(state.vy ** 2 + 2 * gravity * (ground - state.y))) /
    gravity;
  return Array.from({ length: 12 }, (_, i) =>
    stepPhysics(
      state,
      ((i + 1) / 12) * flightTime * 0.3,
      gravity,
      options.wind ?? 0,
    ),
  );
}
