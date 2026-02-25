import { createSurveyCTODicePlugin } from "../../src/index.js";

const hostKey = "surveycto-dice-example";

const host = {
  getValue() {
    const raw = localStorage.getItem(`${hostKey}:value`);
    return raw == null ? null : Number(raw);
  },
  setValue(value) {
    localStorage.setItem(`${hostKey}:value`, String(value));
  },
  getMeta() {
    const raw = localStorage.getItem(`${hostKey}:meta`);
    return raw ? JSON.parse(raw) : {};
  },
  setMeta(meta) {
    const current = this.getMeta();
    localStorage.setItem(`${hostKey}:meta`, JSON.stringify({ ...current, ...meta }));
  }
};

const plugin = createSurveyCTODicePlugin({
  mount: document.getElementById("app"),
  host,
  config: {
    allowReroll: false,
    soundEnabled: false,
    animationDurationMs: 2200,
    showTimestamp: true
  }
});

plugin.init();
