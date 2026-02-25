export class DiceAudio {
  constructor({ enabled = false } = {}) {
    this.enabled = enabled;
    this.audioContext = null;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
  }

  playRoll() {
    this.#tone(260, 0.14, "sawtooth");
  }

  playSettle() {
    this.#tone(430, 0.08, "triangle");
  }

  #tone(freq, duration, type) {
    if (!this.enabled) return;
    if (typeof window === "undefined") return;

    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;

    if (!this.audioContext) {
      this.audioContext = new Ctx();
    }

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0.0001;
    gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }
}
