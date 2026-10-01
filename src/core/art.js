// Loading is injected so this module remains independent of browser APIs.
export const ART_IDS = Object.freeze([
  "meadow",
  "forest",
  "lake",
  "valley",
  "snow",
  "title",
  "archer",
  "target",
]);
export function createArt(manifest, load) {
  const images = new Map();
  let completed = 0;
  let started;
  return {
    get progress() {
      return completed / ART_IDS.length;
    },
    get ready() {
      return completed === ART_IDS.length;
    },
    get(id) {
      return images.get(id) ?? null;
    },
    preload() {
      started ??= Promise.all(
        ART_IDS.map(async (id) => {
          try {
            const image = await load(manifest[id]);
            if (image) images.set(id, image);
          } catch {
            /* Missing art uses the geometric renderer. */
          }
          completed++;
        }),
      );
      return started;
    },
  };
}
export const levelArt = (id) => ART_IDS[id - 1] ?? null;
