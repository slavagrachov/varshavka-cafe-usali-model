# Financial-model calculation bridge contract — 31 positions

Status: `POPULATED_MODEL_BRIDGE_READY / EVIDENCE_BRIDGE_BLOCKED`

## Sources

- 28 positions: RC2 provisional proxy costing and 101 channel rows at verified source head `71516bf871fa560e890ce5bc7f858854a5335ae2`.
- 3 breakfasts: S04 v3.0.0 on main `1573dc616ead7244146c8601cf61cd3c82d3c46e`.

## Outputs

- `FINMODEL_CALCULATION_BRIDGE_31.csv`: exactly 31 unique menu positions.
- `FINMODEL_CHANNEL_ECONOMICS_BRIDGE_104.csv`: 101 Issue #82 scenario rows plus 3 breakfast rows.

All current values are imported into `model_*`; all `evidence_*` remain blank. Downstream logic must explicitly select MODEL_SCENARIO or EVIDENCE and must stop if EVIDENCE is requested but unavailable. No COALESCE from model to evidence, no zero for unknown, no proxy promotion, no assignment of the weighted breakfast average to individual variants, and no arbitrary channel collapse. Import does not close IV-004 or approve prices.
