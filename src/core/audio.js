// Audio is created only by unlock(), called from a trusted user gesture.
export function createAudio({ contextFactory, storage } = {}) {
  let context;
  let muted = false;
  try {
    muted = storage?.getItem("archer-line-muted") === "true";
  } catch {
    /* Private browsing. */
  }
  const notes = {
    draw: [180, 280, 0.12],
    shoot: [650, 120, 0.15],
    hit: [220, 80, 0.12],
    bullseye: [660, 1100, 0.3],
    ground: [100, 40, 0.12],
    button: [440, 660, 0.08],
    clear: [520, 1040, 0.45],
  };
  return {
    get muted() {
      return muted;
    },
    unlock() {
      try {
        context ??= contextFactory?.();
        if (context?.state === "suspended") context.resume()?.catch?.(() => {});
      } catch {
        /* Audio is optional on unsupported devices. */
      }
    },
    toggle() {
      muted = !muted;
      try {
        storage?.setItem("archer-line-muted", String(muted));
      } catch {
        /* Optional persistence. */
      }
      return muted;
    },
    play(name) {
      if (muted || !context || context.state !== "running") return;
      const [from, to, duration] = notes[name] ?? notes.button;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      oscillator.type =
        name === "hit" || name === "ground" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(from, now);
      oscillator.frequency.exponentialRampToValueAtTime(to, now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
      oscillator.start(now);
      oscillator.stop(now + duration);
    },
    dispose() {
      context?.close()?.catch?.(() => {});
    },
  };
}
