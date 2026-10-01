import { describe, it, expect } from "vitest";
import {
  createTarget,
  sweepTarget,
  attachArrow,
  attachedPosition,
} from "./target.js";
import { scoreHit } from "./scoring.js";
import { Game } from "../scenes/Game.js";

describe("target collision and scoring", () => {
  const target = createTarget({ x: 100, y: 200, height: 200 });
  it("sweeps fast arrows and interpolates the actual impact", () => {
    expect(sweepTarget({ x: 0, y: 100 }, { x: 1000, y: 1100 }, target)).toEqual(
      { x: 100, y: 200, fraction: 0.1 },
    );
    expect(
      sweepTarget({ x: 200, y: 200 }, { x: 0, y: 200 }, target)?.fraction,
    ).toBe(0.5);
    expect(sweepTarget({ x: 0, y: 200 }, { x: 99, y: 200 }, target)).toBeNull();
    expect(
      sweepTarget({ x: 100, y: 0 }, { x: 100, y: 400 }, target),
    ).toBeNull();
    expect(
      sweepTarget({ x: 0, y: 301 }, { x: 200, y: 301 }, target),
    ).toBeNull();
    expect(sweepTarget({ x: 0, y: 300 }, { x: 100, y: 300 }, target)?.y).toBe(
      300,
    );
  });
  it("includes ring boundaries and scores symmetrically", () => {
    expect(scoreHit(target, 200)).toBe(10);
    for (const [distance, points, outside] of [
      [20, 10, 8],
      [40, 8, 6],
      [60, 6, 4],
      [80, 4, 2],
      [100, 2, 0],
    ]) {
      for (const sign of [-1, 1]) {
        expect(scoreHit(target, 200 + sign * distance)).toBe(points);
        expect(scoreHit(target, 200 + sign * (distance + 0.001))).toBe(outside);
      }
    }
    expect(
      scoreHit(createTarget({ rings: [{ radius: 1, score: 7 }] }), 400),
    ).toBe(7);
  });
  it("keeps embedded arrows relative to the target", () => {
    const attachment = attachArrow(
      { vx: 10, vy: 10 },
      { x: 100, y: 220 },
      target,
    );
    expect(attachedPosition(attachment, { ...target, x: 300, y: 400 })).toEqual(
      { x: 300, y: 420, angle: Math.PI / 4 },
    );
  });
  it("scores a fast hit once even when the endpoint exits the screen", () => {
    const game = new Game({ target });
    game.arrow = { x: 0, y: 200, vx: 100000, vy: 0 };
    game.update(1 / 60);
    expect(game.score).toBe(10);
    expect(game.arrow).toBeNull();
    expect(game.attached).toHaveLength(1);
    expect(game.scoreTexts).toHaveLength(1);
    game.update(2);
    expect(game.score).toBe(10);
    expect(game.scoreTexts).toHaveLength(0);
  });
  it("only spends arrows on valid releases and blocks shots when empty", () => {
    const game = new Game({ arrows: 1 });
    const down = { x: 400, y: 300, pointerId: 1, buttons: 1 };
    game.onPointerDown(down);
    game.onPointerUp(down);
    expect(game.remainingArrows).toBe(1);
    game.onPointerDown(down);
    game.onPointerUp({ ...down, x: 310, y: 390 });
    expect(game.remainingArrows).toBe(0);
    game.arrow = null;
    game.onPointerDown(down);
    expect(game.drag).toBeNull();
  });
});
