import { it, expect } from "vitest";
import { createTarget } from "./target.js";
import { Game } from "../scenes/Game.js";

const down = { x: 400, y: 300, pointerId: 1, buttons: 1 };
const release = { x: 310, y: 390, pointerId: 1, buttons: 0 };
it("owns one pointer, cancels gestures, and blocks shots during flight", () => {
  const game = new Game({ target: createTarget({ y: 100 }) });
  game.onPointerDown(down);
  game.onPointerUp({ ...release, pointerId: 2 });
  expect(game.arrow).toBeNull();
  game.onPointerCancel(down);
  expect(game.drag).toBeNull();
  game.onPointerDown(down);
  game.onPointerUp(down);
  expect(game.arrow).toBeNull();
  game.onPointerDown(down);
  game.onPointerUp(release);
  expect(game.arrow.vx).toBeGreaterThan(0);
  game.onPointerDown(down);
  expect(game.drag).toBeNull();
  for (let i = 0; i < 300; i++) game.update(1 / 60);
  expect(game.arrow).toBeNull();
  expect(game.grounded).toHaveLength(1);
  game.onPointerDown(down);
  expect(game.drag).not.toBeNull();
});
