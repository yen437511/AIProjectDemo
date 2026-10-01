import { it, expect, vi } from "vitest";
import { Game } from "./Game.js";
it("emits bullseye feedback and retires particles and shake", () => {
  const play = vi.fn();
  const game = new Game({
    target: {
      x: 200,
      y: 455,
      width: 20,
      height: 100,
      rings: [{ radius: 1, score: 10, color: "red" }],
    },
    app: { audio: { play } },
  });
  game.onPointerDown({ x: 400, y: 400, buttons: 1, pointerId: 1 });
  game.onPointerUp({ x: 220, y: 400, pointerId: 1 });
  for (let i = 0; i < 10 && game.arrow; i++) game.update(1 / 60);
  expect(play.mock.calls.map(([name]) => name)).toEqual([
    "draw",
    "shoot",
    "bullseye",
  ]);
  expect(game.particles).toHaveLength(32);
  expect(game.shake).toBeGreaterThan(0);
  for (let i = 0; i < 90; i++) game.update(1 / 60);
  expect(game.particles).toHaveLength(0);
  expect(game.shake).toBe(0);
});
