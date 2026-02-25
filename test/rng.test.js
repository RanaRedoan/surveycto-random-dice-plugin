import test from "node:test";
import assert from "node:assert/strict";
import { secureRandomInt, rollDie } from "../src/rng.js";

test("secureRandomInt rejects invalid ranges", () => {
  assert.throws(() => secureRandomInt(5, 1), /Invalid range/);
});

test("rollDie returns values between 1 and 6", () => {
  for (let i = 0; i < 300; i += 1) {
    const value = rollDie();
    assert.equal(Number.isInteger(value), true);
    assert.equal(value >= 1 && value <= 6, true);
  }
});

test("secureRandomInt works without crypto object", () => {
  const value = secureRandomInt(1, 6, null);
  assert.equal(value >= 1 && value <= 6, true);
});
