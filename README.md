# SurveyCTO Dice Roller Field Plugin

SurveyCTO field plug-in that shows a large interactive dice, rolls with animation, and saves one integer result (`1..6`) to the form.

## What to download

- Plug-in ZIP: `releases/dice-roller.fieldplugin.zip`
- Ready test form package: `releases/SurveyCTO_Dice_Test_Form_Package.zip`
- XLSForm only: `SurveyCTO_Dice_Plugin_Sample_FIXED.xlsx`

## How to use in SurveyCTO

1. In your XLSForm, use an `integer` field.
2. Set `appearance` to:
   - `custom-dice-roller`
3. Optional parameters:
   - `custom-dice-roller allow-reroll=false sound-enabled=false animation-duration-ms=2200 show-timestamp=true`
4. Upload your form and attach `dice-roller.fieldplugin.zip`.

If the plug-in is not attached, SurveyCTO will show a normal integer keypad input.

## Supported field type

- `integer`

## Plug-in parameters

| Key | Default | Description |
| --- | --- | --- |
| `allow-reroll` | `false` | If `false`, value locks after first roll |
| `sound-enabled` | `false` | Enables short roll/settle sounds |
| `animation-duration-ms` | `2200` | Rolling animation duration (`800` to `4000`) |
| `show-timestamp` | `true` | Shows roll time text in UI |

## Notes about timestamp/audit fields

SurveyCTO field plug-ins write the answer for their own question.  
To capture a roll timestamp for audit, use a calculate field in XLSForm (already included in sample):

- `if(${dice_result} != '', once(now()), '')`

## Repository structure (SurveyCTO plug-in files)

- `fieldplugin/source/manifest.json`
- `fieldplugin/source/template.html`
- `fieldplugin/source/script.js`
- `fieldplugin/source/style.css`

Zip the contents of `fieldplugin/source` (not the folder itself) as `dice-roller.fieldplugin.zip`.

## License

MIT. See [LICENSE](./LICENSE).
