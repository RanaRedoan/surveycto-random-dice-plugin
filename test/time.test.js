import test from "node:test";
import assert from "node:assert/strict";
import { buildRollMeta, toUtcIso } from "../src/time.js";

test("toUtcIso returns ISO timestamp", () => {
  const iso = toUtcIso(0);
  assert.equal(iso, "1970-01-01T00:00:00.000Z");
});

test("buildRollMeta returns required fields", () => {
  const epoch = 1772028192481;
  const meta = buildRollMeta(epoch);
  assert.equal(meta.dice_roll_ts_epoch_ms, epoch);
  assert.equal(meta.dice_roll_ts_utc, "2026-02-25T14:03:12.481Z");
  assert.equal(meta.dice_rng_version, "dice_v1");
});
