import { it, expect } from "vitest";
import { createStorage, recordResult, normalizeProgress } from "./storage.js";
it("unlocks sequentially only for at least one star and keeps independent bests", () => {
  let p = normalizeProgress(null);
  p = recordResult(p, 1, { stars: 0, score: 5 });
  expect(p.unlocked).toBe(1);
  p = recordResult(p, 2, { stars: 3, score: 50 });
  expect(p.best[2].stars).toBe(0);
  p = recordResult(p, 1, { stars: 2, score: 30 });
  p = recordResult(p, 1, { stars: 1, score: 40 });
  expect(p.unlocked).toBe(2);
  expect(p.best[1]).toEqual({ stars: 2, score: 40 });
  for (let id = 2; id <= 5; id++)
    p = recordResult(p, id, { stars: 1, score: 20 });
  expect(p.unlocked).toBe(5);
});
it("persists across instances", () => {
  let data = null;
  const provider = () => ({
    getItem: () => data,
    setItem: (_, value) => {
      data = value;
    },
  });
  createStorage(provider).record(1, { stars: 3, score: 50 });
  expect(createStorage(provider).getProgress().unlocked).toBe(2);
});
it("degrades safely for getters, reads, writes and corrupt data", () => {
  for (const provider of [
    () => {
      throw Error();
    },
    () => ({
      getItem: () => {
        throw Error();
      },
    }),
    () => ({ getItem: () => "broken" }),
    () => ({
      getItem: () => null,
      setItem: () => {
        throw Error();
      },
    }),
  ]) {
    const store = createStorage(provider);
    expect(store.getProgress().unlocked).toBe(1);
    expect(store.record(1, { stars: 1, score: 20 }).unlocked).toBe(2);
  }
  expect(
    normalizeProgress({ best: { 1: { stars: 99, score: -1 } } }).best[1],
  ).toEqual({ stars: 3, score: 0 });
});
