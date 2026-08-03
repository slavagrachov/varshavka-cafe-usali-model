# FORMULA QA REPORT — Issue #82 workbook v2.0.0 remediation RC

## Verdict

`STRUCTURAL PASS / READY_FOR_INDEPENDENT_RETEST`.

## Exact controls

| Control | Result |
|---|---|
| Exact dish scope | 28 / PASS |
| Exact worksheet names/order | 17/17 / PASS |
| Exact non-null freeze panes | 17/17 / PASS |
| Workbook formulas | 809 |
| Formula error literals | 0 / PASS |
| Gate D assertions | 17/17 PASS |
| Structured/filterable tables | 23 |
| Data validation rules | 4 |
| Complete evidence food-cost inputs blank | 28/28 / PASS |
| Complete evidence portion COGS formulas guarded | 28/28 / PASS |
| Evidence project-price formulas guarded | 101/101 / PASS |
| Separate proxy scenario COGS | 28/28 / PASS |
| Separate proxy scenario channel metrics | 101/101 / PASS |
| Nutrition calculated numeric display | 28 × 16 / PASS |
| Nutrition release block | 28/28 / PASS |
| Safety veto / unsupported numeric blanks | 28 / 112 / PASS |
| Accepted evidence price sources | 68 / PASS |
| Rejected price observations active | 0 / PASS |
| Equipment mapping / capacity scenario | 155 / 28 / PASS |

## Formula architecture and reactivity

- `04_КАЛЬКУЛЯЦИИ`: evidence input → guarded formula chain; a missing required input returns blank. Proxy values are in a different table and never feed the evidence chain.
- `07_ЦЕНООБРАЗОВАНИЕ`: complete kitchen COGS is linked from the evidence calculation table; project price, food cost, margin and contribution remain blank until all required evidence inputs exist. The 101-row proxy scenario is visibly separate.
- `01_МЕНЮ`: evidence COGS/price/food cost/margin are linked formulas, not copied proxy results.
- `15_ПРОВЕРКИ`: 17 assertions calculate Actual, Delta and PASS/FAIL.

Null/zero guard probe passed: blank stays blank, numeric zero remains numeric zero, and a positive input propagates. Formula text contracts were inspected in the final OOXML for the partial-cost guard, complete-food guard, complete-COGS guard, channel COGS link and channel-price guard.

## Recalculation

The build engine returned all 17 Gate D checks as PASS before export. The saved workbook requests automatic full recalculation on open. No LibreOffice executable exists in this environment; therefore an external-engine run is not represented as completed and remains part of the exact frozen-RC independent retest.
