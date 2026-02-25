const DEFAULTS = Object.freeze({
  allowReroll: false,
  soundEnabled: false,
  animationDurationMs: 2200,
  showTimestamp: true,
  theme: "field-light"
});

function asBoolean(value, defaultValue) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return defaultValue;
}

function asNumber(value, defaultValue) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return defaultValue;
}

export function parseConfig(input = {}) {
  const animationDurationMs = Math.min(
    4000,
    Math.max(800, Math.round(asNumber(input.animationDurationMs, DEFAULTS.animationDurationMs)))
  );

  return {
    allowReroll: asBoolean(input.allowReroll, DEFAULTS.allowReroll),
    soundEnabled: asBoolean(input.soundEnabled, DEFAULTS.soundEnabled),
    showTimestamp: asBoolean(input.showTimestamp, DEFAULTS.showTimestamp),
    animationDurationMs,
    theme: typeof input.theme === "string" && input.theme ? input.theme : DEFAULTS.theme
  };
}

export { DEFAULTS };
