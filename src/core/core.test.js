import { describe, it, expect, vi } from "vitest";
import { fitViewport, toLogical, resizeCanvas } from "./scaling.js";
import { startLoop, advance, STEP } from "./loop.js";
import { SceneManager } from "./sceneManager.js";

describe("canvas scaling", () => {
  it("fits wide and portrait viewports with letterboxing", () => {
    expect(fitViewport(1920, 720)).toEqual({
      width: 1280,
      height: 720,
      scale: 1,
    });
    expect(fitViewport(360, 800)).toEqual({
      width: 360,
      height: 202.5,
      scale: 360 / 1280,
    });
  });
  it("maps pointer positions using the canvas offset and CSS size", () => {
    expect(
      toLogical(420, 250, { left: 100, top: 70, width: 640, height: 360 }),
    ).toEqual({ x: 640, y: 360 });
  });
  it("keeps CSS size independent of the high-DPI backing store", () => {
    const canvas = { style: {} };
    resizeCanvas(canvas, 640, 360, 2);
    expect(canvas).toEqual({
      width: 1280,
      height: 720,
      style: { width: "640px", height: "360px" },
    });
  });
});
it("clamps long frames and updates at a fixed step", () => {
  const update = vi.fn();
  const remainder = advance(0, 10, update);
  expect(update.mock.calls.length).toBeLessThanOrEqual(6);
  expect(update.mock.calls.length).toBeGreaterThanOrEqual(5);
  expect(update.mock.calls.every(([dt]) => dt === STEP)).toBe(true);
  expect(remainder).toBeLessThan(STEP);
});
it("dispatches input and updates to the top scene and exits replaced scenes", () => {
  const manager = new SceneManager();
  const bottom = { update: vi.fn(), render: vi.fn() };
  const top = {
    enter: vi.fn(),
    exit: vi.fn(),
    onPointerDown: vi.fn(),
    render: vi.fn(),
  };
  manager.push(bottom);
  manager.push(top);
  manager.update(STEP);
  manager.render({});
  manager.onPointerDown({ x: 1 });
  expect(bottom.update).not.toHaveBeenCalled();
  expect(bottom.render).toHaveBeenCalled();
  expect(top.enter).toHaveBeenCalledWith(manager);
  expect(top.onPointerDown).toHaveBeenCalledWith({ x: 1 });
  manager.replace({});
  expect(top.exit).toHaveBeenCalledOnce();
  manager.pop();
  expect(manager.current).toBe(bottom);
});

it("pauses hidden tabs and resumes without accumulating background time", () => {
  let callback;
  let visibility;
  const host = {
    requestAnimationFrame: vi.fn((fn) => {
      callback = fn;
      return 1;
    }),
    cancelAnimationFrame: vi.fn(),
  };
  const doc = {
    hidden: false,
    addEventListener: vi.fn((type, fn) => {
      visibility = fn;
    }),
    removeEventListener: vi.fn(),
  };
  const update = vi.fn();
  const render = vi.fn();
  const stop = startLoop({ update, render }, host, doc);
  callback(0);
  callback(20);
  expect(update).toHaveBeenCalledOnce();
  doc.hidden = true;
  visibility();
  callback(10000);
  expect(render).toHaveBeenCalledTimes(2);
  doc.hidden = false;
  visibility();
  callback(20000);
  expect(update).toHaveBeenCalledOnce();
  stop();
  expect(host.cancelAnimationFrame).toHaveBeenCalledWith(1);
  expect(doc.removeEventListener).toHaveBeenCalledWith(
    "visibilitychange",
    visibility,
  );
});
