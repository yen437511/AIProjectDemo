import { describe, it, expect } from "vitest";
import { levels } from "../levels/levels.js";
import { calculateStars } from "./scoring.js";
import { targetAtTime, sweepMovingTarget } from "./level.js";
import { launch, advanceArrow } from "./physics.js";
import { attachedPosition } from "./target.js";
import { scoreHit } from "./scoring.js";
import { Game } from "../scenes/Game.js";

describe("level rules", () => {
  it("awards stars at inclusive thresholds", () => {
    expect(
      [0, 15, 16, 29, 30, 41, 42, 100].map((score) =>
        calculateStars(score, [16, 30, 42]),
      ),
    ).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
  });
  it("defines five complete, reachable score budgets", () => {
    expect(levels.map((level) => level.id)).toEqual([1, 2, 3, 4, 5]);
    for (const level of levels) {
      expect(level.name.length).toBeGreaterThan(0);
      expect(level.arrows).toBeGreaterThan(0);
      expect(Number.isFinite(level.wind)).toBe(true);
      expect(level.starThresholds).toHaveLength(3);
      expect(level.starThresholds[0]).toBeGreaterThan(0);
      expect(level.starThresholds[1]).toBeGreaterThan(level.starThresholds[0]);
      expect(level.starThresholds[2]).toBeGreaterThan(level.starThresholds[1]);
      expect(level.arrows * 10).toBeGreaterThanOrEqual(level.starThresholds[2]);
      for (const target of level.targets) {
        expect(target.x).toBeGreaterThan(170);
        expect(target.size).toBeGreaterThan(0);
        expect(Number.isFinite(target.y)).toBe(true);
        expect(target).toHaveProperty("motion");
        if (target.motion) {
          expect(target.motion.period).toBeGreaterThan(0);
          expect(target.motion.amplitude).toBeGreaterThan(0);
        }
      }
    }
  });
  it("moves sinusoidally and sweeps at contact time", () => {
    const definition = levels[2].targets[0];
    const before = targetAtTime(definition, 0);
    const after = targetAtTime(definition, 1);
    expect(after.y).toBeCloseTo(definition.y + definition.motion.amplitude);
    const hit = sweepMovingTarget(
      { x: 1000, y: 392.5 },
      { x: 1120, y: 392.5 },
      before,
      after,
    );
    expect(hit.target.y).toBeCloseTo(392.5);
    expect(
      attachedPosition({ offsetX: 0, offsetY: 5, angle: 0 }, after).y,
    ).toBe(after.y + 5);
  });
  it("waits for the last arrow and settles misses", () => {
    const game = new Game({ arrows: 1 });
    game.onPointerDown({ x: 400, y: 400, buttons: 1, pointerId: 1 });
    game.onPointerUp({ x: 400, y: 300, pointerId: 1 });
    expect(game.remainingArrows).toBe(0);
    expect(game.result).toBeNull();
    for (let frame = 0; frame < 600 && !game.result; frame++)
      game.update(1 / 60);
    expect(game.result).toMatchObject({ score: 0, stars: 0 });
  });
});

// Search valid player angles at full draw, then execute those shots through Game.
// Each subsequent shot starts at the actual elapsed time of the previous impact.
for (const level of levels) {
  it(`can earn three stars in level ${level.id} using 60Hz physics`, () => {
    const game = new Game({ level });
    for (let shot = 0; shot < level.arrows; shot++) {
      let best = { points: -1, angle: 0 };
      for (let degrees = 5; degrees <= 65; degrees += 0.25) {
        const angle = (degrees * Math.PI) / 180;
        let arrow = launch({ x: 170, y: 455 }, 900, angle);
        for (let frame = 0; frame < 300; frame++) {
          const time = game.elapsed + frame / 60;
          const next = advanceArrow(arrow, 1 / 60, {
            wind: level.wind,
            width: Infinity,
          });
          if (!next) break;
          const hit = sweepMovingTarget(
            arrow,
            next,
            targetAtTime(level.targets[0], time),
            targetAtTime(level.targets[0], time + 1 / 60),
          );
          if (hit) {
            const points = scoreHit(hit.target, hit.y);
            if (points > best.points) best = { points, angle };
            break;
          }
          if (next.stopped || next.x > 1280) break;
          arrow = next;
        }
      }
      expect(best.points).toBe(10);
      game.onPointerDown({ x: 400, y: 400, buttons: 1, pointerId: 1 });
      game.onPointerUp({
        x: 400 - 180 * Math.cos(best.angle),
        y: 400 + 180 * Math.sin(best.angle),
        pointerId: 1,
      });
      for (let frame = 0; frame < 300 && game.arrow; frame++)
        game.update(1 / 60);
    }
    expect(game.result.stars).toBe(3);
    expect(game.score).toBe(level.arrows * 10);
    expect(game.attached).toHaveLength(level.arrows);
  });
}
