export const STEP = 1 / 60;
export const MAX_FRAME = 0.1;

// Pure accumulator used by the browser loop and unit tests.
export function advance(accumulator, elapsed, update) {
  accumulator += Math.max(0, Math.min(elapsed, MAX_FRAME));
  while (accumulator >= STEP) {
    update(STEP);
    accumulator -= STEP;
  }
  return accumulator;
}

export function startLoop({ update, render }, host = window, doc = document) {
  let previous = null;
  let accumulator = 0;
  let frame;
  let stopped = false;
  const reset = () => {
    previous = null;
    accumulator = 0;
  };
  function tick(now) {
    if (stopped) return;
    if (!doc.hidden) {
      const elapsed = previous === null ? 0 : (now - previous) / 1000;
      previous = now;
      accumulator = advance(accumulator, elapsed, update);
      render(accumulator / STEP);
    } else reset();
    frame = host.requestAnimationFrame(tick);
  }
  doc.addEventListener("visibilitychange", reset);
  frame = host.requestAnimationFrame(tick);
  return () => {
    stopped = true;
    host.cancelAnimationFrame(frame);
    doc.removeEventListener("visibilitychange", reset);
  };
}
