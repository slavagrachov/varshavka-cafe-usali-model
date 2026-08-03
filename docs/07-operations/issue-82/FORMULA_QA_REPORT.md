# FORMULA QA REPORT — Issue #82 workbook v2.0.0

## Verdict

`PASS_WITH_CONDITIONS`.

## Checks

| Control | Result |
|---|---|
| Exact dish scope | 28 / PASS |
| Exact worksheet count | 17 / PASS |
| Artifact-tool formula error scan | 0 matches / PASS |
| LibreOffice recalculation then re-inspection | 0 matches / PASS |
| Workbook Gate D assertions | 15/15 PASS |
| Complete food cost blank | 28/28 PASS |
| Complete portion COGS blank | 28/28 PASS |
| Channel project price blank | 101/101 PASS |
| Safety veto | 28/28 `BLOCK` / PASS |
| Nutrition numeric blanks | 224/224 / PASS |
| Accepted price sources | 46 / PASS |
| Rejected source selected or active | 0 / PASS |
| Negative selected prices | 0 / PASS |
| Zero selected prices | 0 / PASS |
| VSF orphans / cycles | 0 / 0 / PASS |

## Formula architecture

- `04_КАЛЬКУЛЯЦИИ`: source-backed partial-cost benchmark is a visible input; partial/formula, spoilage, kitchen COGS and complete portion COGS are formulas. Complete outputs are guarded and return blank while any required input is absent.
- `07_ЦЕНООБРАЗОВАНИЕ`: kitchen COGS is linked from calculations; price, food cost, margin and contribution are guarded formulas and stay blank.
- `01_МЕНЮ`: complete COGS, price, food cost and margin are cross-sheet formulas.
- `15_ПРОВЕРКИ`: each assertion has Expected, Actual, Delta and Status formula columns.

Reactivity test: changing `04_КАЛЬКУЛЯЦИИ!F6` from `144.93642` to `145.93642` in a non-saved QA copy changed formula cell `G6` by exactly `1.00`; PASS. The final workbook was not mutated by this test.

No unexplained calculation hardcodes were identified. The 1.5% spoilage assumption is visible in `04_КАЛЬКУЛЯЦИИ!Q3`, and cannot populate complete outputs until complete food cost exists.

## CR-0002 recheck

IV-008 changed formatting only on `15_ПРОВЕРКИ!A31:A47`. Post-change artifact-tool and LibreOffice inspections both returned 15/15 checks PASS and 0 common formula errors. Formula text and calculated values were unchanged.
