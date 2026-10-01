const KEY = "archer-line-progress";
export function normalizeProgress(value, count = 5) {
  const best = {};
  for (let id = 1; id <= count; id++) {
    const entry = value?.best?.[id];
    best[id] = {
      stars: Number.isInteger(entry?.stars)
        ? Math.max(0, Math.min(3, entry.stars))
        : 0,
      score: Number.isFinite(entry?.score) ? Math.max(0, entry.score) : 0,
    };
  }
  let unlocked = 1;
  while (unlocked < count && best[unlocked].stars >= 1) unlocked++;
  return { unlocked, best };
}
export function recordResult(progress, id, result, count = 5) {
  const next = normalizeProgress(progress, count);
  if (id < 1 || id > next.unlocked) return next;
  next.best[id] = {
    stars: Math.max(next.best[id].stars, result.stars),
    score: Math.max(next.best[id].score, result.score),
  };
  return normalizeProgress(next, count);
}
// Inject a provider so unavailable storage and even a throwing property getter are safe.
export function createStorage(provider = () => undefined, count = 5) {
  let progress;
  try {
    progress = normalizeProgress(
      JSON.parse(provider()?.getItem(KEY) ?? "null"),
      count,
    );
  } catch {
    progress = normalizeProgress(null, count);
  }
  return {
    getProgress: () => normalizeProgress(progress, count),
    record(id, result) {
      progress = recordResult(progress, id, result, count);
      try {
        provider()?.setItem(KEY, JSON.stringify(progress));
      } catch {
        /* Keep session progress. */
      }
      return this.getProgress();
    },
  };
}
