import { describe, it, expect } from "vitest";
import {
  launch,
  stepPhysics,
  heading,
  aimFromDrag,
  advanceArrow,
  previewTrajectory,
} from "./physics.js";

describe("shooting physics", () => {
  it("matches analytical range at 60Hz and retains impact heading", () => {
    const speed = 600,
      angle = Math.PI / 4,
      gravity = 480;
    let arrow = launch({ x: 0, y: 560 }, speed, angle);
    for (let i = 0; i < 300 && !arrow.stopped; i++)
      arrow = advanceArrow(arrow, 1 / 60);
    expect(arrow.stopped).toBe(true);
    expect(arrow.x).toBeCloseTo(
      (speed ** 2 * Math.sin(2 * angle)) / gravity,
      6,
    );
    expect(arrow.y).toBe(560);
    expect(arrow.angle).toBeCloseTo(angle);
    expect(advanceArrow(arrow, 1)).toBe(arrow);
  });
  it("accelerates in the wind direction", () => {
    const state = launch({ x: 100, y: 400 }, 500, Math.PI / 4);
    const calm = stepPhysics(state, 1);
    expect(stepPhysics(state, 1, 480, 50).x).toBeGreaterThan(calm.x);
    expect(stepPhysics(state, 1, 480, -50).x).toBeLessThan(calm.x);
  });
  it("uses velocity direction for heading", () => {
    expect(heading({ vx: 0, vy: -1 })).toBe(-Math.PI / 2);
    expect(heading({ vx: -1, vy: 0 })).toBe(Math.PI);
    expect(heading({ vx: 1, vy: 1 })).toBe(Math.PI / 4);
  });
  it("clamps pull power and cancels small gestures", () => {
    const start = { x: 300, y: 300 };
    expect(aimFromDrag(start, start).cancelled).toBe(true);
    expect(aimFromDrag(start, { x: 210, y: 300 }).power).toBe(0.5);
    expect(aimFromDrag(start, { x: -300, y: 300 }).power).toBe(1);
    expect(aimFromDrag(start, { x: 210, y: 390 }).angle).toBeCloseTo(
      Math.PI / 4,
    );
  });
  it("removes arrows leaving the sides or bottom", () => {
    expect(
      advanceArrow({ x: 1279, y: 100, vx: 500, vy: 0 }, 1 / 60),
    ).toBeNull();
    expect(advanceArrow({ x: 1, y: 100, vx: -500, vy: 0 }, 1 / 60)).toBeNull();
    expect(
      advanceArrow({ x: 100, y: 719, vx: 0, vy: 500 }, 1 / 60, {
        ground: 1000,
      }),
    ).toBeNull();
  });
  it("keeps high shots above the screen until they fall back to ground", () => {
    let arrow = launch({ x: 170, y: 455 }, 900, Math.PI / 2);
    let above = false;
    for (let i = 0; i < 300 && !arrow.stopped; i++) {
      arrow = advanceArrow(arrow, 1 / 60);
      expect(arrow).not.toBeNull();
      above ||= arrow.y < 0;
    }
    expect(above).toBe(true);
    expect(arrow.stopped).toBe(true);
    expect(arrow.y).toBe(560);
  });
  it("limits preview to the first 30 percent of flight", () => {
    const state = launch({ x: 170, y: 455 }, 600, Math.PI / 4);
    const points = previewTrajectory(state);
    expect(points).toHaveLength(12);
    const time = (-state.vy + Math.sqrt(state.vy ** 2 + 2 * 480 * 105)) / 480;
    expect(points.at(-1)).toEqual(stepPhysics(state, time * 0.3));
  });
});
