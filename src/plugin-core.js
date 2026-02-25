import { parseConfig } from "./config.js";
import { DiceStateMachine, STATES } from "./state-machine.js";
import { rollDie } from "./rng.js";
import { nowEpochMs, buildRollMeta } from "./time.js";
import { animateDiceRoll } from "./animation.js";
import { DiceAudio } from "./audio.js";
import { createUI } from "./ui.js";

function createMemoryHost() {
  let value = null;
  let meta = {};
  return {
    getValue: () => value,
    setValue: (next) => {
      value = next;
    },
    getMeta: () => meta,
    setMeta: (next) => {
      meta = { ...meta, ...next };
    }
  };
}

export class SurveyCTODicePlugin {
  constructor({ mount, host, config } = {}) {
    if (!mount) throw new Error("mount is required");
    this.mount = mount;
    this.host = host || createMemoryHost();
    this.config = parseConfig(config);
    this.state = new DiceStateMachine({ allowReroll: this.config.allowReroll });
    this.audio = new DiceAudio({ enabled: this.config.soundEnabled });
    this.ui = null;
    this.isCommitting = false;
  }

  init() {
    this.ui = createUI({
      mount: this.mount,
      config: this.config,
      onRollClick: () => this.#onRoll(),
      onSoundToggle: (enabled) => this.audio.setEnabled(enabled)
    });

    const existing = this.#readStored();
    if (existing.value != null) {
      this.state.setLockedFromExistingAnswer();
      this.ui.setFace(existing.value);
      this.ui.setResult(existing.value);
      this.ui.setTimestamp(existing.meta?.dice_roll_ts_utc || "");
      this.#syncControls();
      return;
    }

    this.#syncControls();
  }

  destroy() {
    this.mount.innerHTML = "";
  }

  #readStored() {
    const rawValue = this.host.getValue?.();
    const value = Number.isInteger(rawValue)
      ? rawValue
      : typeof rawValue === "string" && rawValue !== ""
      ? Number(rawValue)
      : null;
    const safeValue = Number.isInteger(value) && value >= 1 && value <= 6 ? value : null;
    const meta = this.host.getMeta?.() || {};
    return { value: safeValue, meta };
  }

  async #onRoll() {
    if (this.isCommitting) return;
    if (!this.state.startRolling()) return;

    this.#syncControls();
    this.audio.playRoll();

    await animateDiceRoll({
      dieEl: this.ui.die,
      durationMs: this.config.animationDurationMs,
      onPreviewFace: (face) => this.ui.setFace(face)
    });

    const finalValue = rollDie();
    this.ui.setFace(finalValue);
    this.ui.setResult(finalValue);

    const epochMs = nowEpochMs();
    const meta = buildRollMeta(epochMs);

    this.isCommitting = true;
    try {
      this.host.setValue?.(finalValue);
      this.host.setMeta?.(meta);
      this.ui.setTimestamp(meta.dice_roll_ts_utc);
      this.audio.playSettle();
      this.state.finishRolling();
    } finally {
      this.isCommitting = false;
      this.#syncControls();
    }
  }

  #syncControls() {
    if (!this.ui) return;
    const disabled = this.state.state === STATES.ROLLING || !this.state.canRoll();
    this.ui.setRollDisabled(disabled);
    if (this.state.state === STATES.LOCKED && this.config.allowReroll) {
      this.ui.setRollLabel("Re-roll Dice");
    } else {
      this.ui.setRollLabel("Roll Dice");
    }
  }
}
