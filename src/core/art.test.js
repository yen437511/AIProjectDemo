import { describe, it, expect } from "vitest";
import { manifest as assetManifest } from "../assets/manifest.js";
import { ART_IDS, createArt, levelArt } from "./art.js";

describe("art preloading and fallback", () => {
  it("maps five levels and includes all eight unique assets", () => {
    expect(new Set(ART_IDS).size).toBe(8);
    expect(Object.keys(assetManifest).sort()).toEqual([...ART_IDS].sort());
    for (const url of Object.values(assetManifest))
      expect(url).toMatch(/\.webp$/);
    expect([1, 2, 3, 4, 5].map(levelArt)).toEqual([
      "meadow",
      "forest",
      "lake",
      "valley",
      "snow",
    ]);
    expect(levelArt(0)).toBeNull();
  });
  it("settles failed images, keeps successful images and loads only once", async () => {
    const manifest = Object.fromEntries(ART_IDS.map((id) => [id, id]));
    let calls = 0;
    const image = {};
    const art = createArt(manifest, async (url) => {
      calls++;
      if (url === "archer") throw new Error("network");
      return image;
    });
    expect(art.progress).toBe(0);
    expect(art.get("meadow")).toBeNull();
    await Promise.all([art.preload(), art.preload()]);
    expect(calls).toBe(8);
    expect(art.ready).toBe(true);
    expect(art.progress).toBe(1);
    expect(art.get("archer")).toBeNull();
    expect(art.get("meadow")).toBe(image);
  });
  it("falls back for every image when loading fails synchronously", async () => {
    const art = createArt({}, () => {
      throw new Error("decode");
    });
    await art.preload();
    expect(art.ready).toBe(true);
    for (const id of ART_IDS) expect(art.get(id)).toBeNull();
  });
});
