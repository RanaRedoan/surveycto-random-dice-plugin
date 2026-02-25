import test from "node:test";
import assert from "node:assert/strict";
import { DiceStateMachine, STATES } from "../src/state-machine.js";

test("state machine blocks re-roll by default", () => {
  const machine = new DiceStateMachine({ allowReroll: false });
  assert.equal(machine.startRolling(), true);
  machine.finishRolling();
  assert.equal(machine.state, STATES.LOCKED);
  assert.equal(machine.startRolling(), false);
});

test("state machine allows re-roll when configured", () => {
  const machine = new DiceStateMachine({ allowReroll: true });
  assert.equal(machine.startRolling(), true);
  machine.finishRolling();
  assert.equal(machine.startRolling(), true);
});

test("state machine can lock from existing answer", () => {
  const machine = new DiceStateMachine({ allowReroll: false });
  machine.setLockedFromExistingAnswer();
  assert.equal(machine.canRoll(), false);
});
