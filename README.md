# SurveyCTO Dice Plugin

A lightweight SurveyCTO field plugin that visually simulates a die roll, returns a numeric value (`1` to `6`) to the form, and logs roll metadata for transparency.

## Why this plugin

This plugin is designed for professional field operations where random assignment must be:

- transparent to respondents and supervisors
- hard to manipulate by accident or intent
- readable and usable on Android tablets in bright outdoor conditions

## Features

- Single die roll (`1` to `6`) for v1
- Large, centered, high-contrast dice UI
- Smooth roll animation (default `2200ms`)
- Clear confirmation text (`Result: X`)
- Auto-save result to SurveyCTO-bound value
- Lock-after-roll by default (no re-roll unless enabled)
- Persists result when navigating back/re-opening
- Roll timestamp logging (`UTC ISO` + `epoch ms`)
- Optional sound effect with on/off toggle (default off)
- Production-focused, dependency-light JavaScript implementation

## Output contract

Primary output:

- `value` (integer): `1..6`

Metadata output:

- `dice_roll_ts_utc` (text): e.g. `2026-02-25T14:03:12.481Z`
- `dice_roll_ts_epoch_ms` (integer): e.g. `1772028192481`
- `dice_rng_version` (text): `dice_v1`

## Configuration

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `allowReroll` | boolean | `false` | Allow roll again after first completed roll |
| `soundEnabled` | boolean | `false` | Enable dice roll sound |
| `animationDurationMs` | number | `2200` | Roll animation duration (`800-4000`) |
| `showTimestamp` | boolean | `true` | Show timestamp text in UI |
| `theme` | string | `field-light` | UI theme key (v1 supports `field-light`) |

## Installation

1. Clone this repository.
2. Install dependencies:

```bash
npm install
```

3. Build distributable files:

```bash
npm run build
```

4. Use `dist/` assets in your SurveyCTO plugin package/workflow.

## SurveyCTO integration pattern

This repo uses a host adapter pattern so the plugin can bind to SurveyCTO APIs cleanly.  
The host must provide:

- `getValue(): number | null`
- `setValue(value: number): void`
- `getMeta(): object`
- `setMeta(meta: object): void`

Basic startup:

```js
import { createSurveyCTODicePlugin } from "./dist/index.js";

const plugin = createSurveyCTODicePlugin({
  mount: document.getElementById("app"),
  host: surveyCtoHostAdapter,
  config: {
    allowReroll: false,
    soundEnabled: false,
    animationDurationMs: 2200
  }
});

plugin.init();
```

## Example use cases

- Treatment assignment in RCT modules
- Incentive randomization (lottery-like selection)
- Respondent selection within eligible household members

## Development

Run quality checks:

```bash
npm run check
```

## Versioning

- SemVer: `MAJOR.MINOR.PATCH`
- Current: `v1.0.0`

## Security and reliability notes

- Uses `crypto.getRandomValues` where available
- Falls back to `Math.random` only when crypto is unavailable
- Protects against rapid double taps and re-randomization by default

## License

MIT. See [LICENSE](./LICENSE).
