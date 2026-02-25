import test from "node:test";
import assert from "node:assert/strict";
import { parseConfig } from "../src/config.js";

test("parseConfig applies defaults", () => {
  const config = parseConfig({});
  assert.equal(config.allowReroll, false);
  assert.equal(config.soundEnabled, false);
  assert.equal(config.animationDurationMs, 2200);
  assert.equal(config.showTimestamp, true);
});

test("parseConfig clamps animation duration", () => {
  assert.equal(parseConfig({ animationDurationMs: 100 }).animationDurationMs, 800);
  assert.equal(parseConfig({ animationDurationMs: 7000 }).animationDurationMs, 4000);
});

test("parseConfig parses booleans from strings", () => {
  const config = parseConfig({ allowReroll: "true", soundEnabled: "false" });
  assert.equal(config.allowReroll, true);
  assert.equal(config.soundEnabled, false);
});
