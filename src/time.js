export function nowEpochMs() {
  return Date.now();
}

export function toUtcIso(epochMs) {
  return new Date(epochMs).toISOString();
}

export function buildRollMeta(epochMs) {
  return {
    dice_roll_ts_epoch_ms: epochMs,
    dice_roll_ts_utc: toUtcIso(epochMs),
    dice_rng_version: "dice_v1"
  };
}
