import { SurveyCTODicePlugin } from "./plugin-core.js";

export function createSurveyCTODicePlugin(options) {
  return new SurveyCTODicePlugin(options);
}

if (typeof window !== "undefined") {
  window.createSurveyCTODicePlugin = createSurveyCTODicePlugin;
}
