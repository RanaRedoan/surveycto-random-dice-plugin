export const STATES = Object.freeze({
  IDLE: "idle",
  ROLLING: "rolling",
  LOCKED: "locked"
});

export class DiceStateMachine {
  constructor({ allowReroll }) {
    this.allowReroll = Boolean(allowReroll);
    this.state = STATES.IDLE;
  }

  setLockedFromExistingAnswer() {
    this.state = STATES.LOCKED;
  }

  canRoll() {
    if (this.state === STATES.IDLE) return true;
    if (this.state === STATES.LOCKED && this.allowReroll) return true;
    return false;
  }

  startRolling() {
    if (!this.canRoll()) return false;
    this.state = STATES.ROLLING;
    return true;
  }

  finishRolling() {
    this.state = STATES.LOCKED;
  }

  toJSON() {
    return { state: this.state, allowReroll: this.allowReroll };
  }
}
