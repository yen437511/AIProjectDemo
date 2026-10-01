import { describe, it, expect, vi } from "vitest";
import { createAudio } from "./audio.js";

describe("synthesized audio", () => {
  it("creates audio only after a gesture and persists mute", () => {
    const parameter = () => ({
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    });
    const oscillator = {
      frequency: parameter(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const context = {
      state: "running",
      currentTime: 0,
      createOscillator: vi.fn(() => oscillator),
      createGain: () => ({
        gain: parameter(),
        connect: vi.fn(),
        disconnect: vi.fn(),
      }),
    };
    const factory = vi.fn(() => context);
    const storage = { getItem: () => null, setItem: vi.fn() };
    const audio = createAudio({ contextFactory: factory, storage });
    audio.play("shoot");
    expect(factory).not.toHaveBeenCalled();
    audio.unlock();
    audio.play("shoot");
    expect(oscillator.start).toHaveBeenCalledOnce();
    audio.toggle();
    audio.play("hit");
    expect(oscillator.start).toHaveBeenCalledOnce();
    expect(storage.setItem).toHaveBeenCalledWith("archer-line-muted", "true");
  });
  it("handles unavailable audio and blocked storage", () => {
    const audio = createAudio({
      contextFactory: () => {
        throw Error();
      },
      storage: {
        getItem: () => {
          throw Error();
        },
        setItem: () => {
          throw Error();
        },
      },
    });
    expect(() => {
      audio.unlock();
      audio.toggle();
      audio.play("clear");
      audio.dispose();
    }).not.toThrow();
  });
});
