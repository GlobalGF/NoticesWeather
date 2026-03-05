# Hardware Compatibility Model (Solar + EV + Battery)

This model stores compatibility between:

- Solar inverters
- EV chargers
- Home batteries

## Core entities

- `hardware_manufacturers`
- `solar_inverters`
- `ev_chargers`
- `home_batteries`

## Compatibility layers

1. `compatibility_pairs`
- Pairwise compatibility:
  - inverter + charger
  - inverter + battery

2. `compatibility_kits`
- Full compatibility for:
  - inverter + charger + battery

## Why both tables?

- Pairwise data is easier to source from vendor docs.
- Full kit data reflects real-world behavior and edge constraints.
- This lets you publish broad compatibility quickly and refine high-traffic kits with lab/field validation.

## Enumerations

- `compatibility_level`: compatible, compatible_with_limits, not_compatible, unknown
- `test_status`: lab_tested, field_validated, vendor_declared, pending_review

## Example query scenarios

- Best kits by inverter and efficiency.
- Incompatible kits for technical review.
- Coverage dashboard per inverter or manufacturer.

See full DDL + examples in `data/queries/hardware_compatibility.sql`.
