# IV-016 — QA staleness remediation report

## Identification

- Session: `VAR-ISSUE-82-S02-REMEDIATION`.
- Issue / draft PR: #82 / #83.
- Input head: `a2a0f8153c885e47cf8cda572ce131491013b6fe`.
- Defect: `IV-016 / S2 / QA_STALENESS`.
- Owner: ExcelBuilder / QA owner.
- Remediation verdict: `READY_FOR_IV_RETEST`, not self-resolved.

## Cause

The committed `scripts/qa_issue_82_independent_verification.mjs` represented the pre-remediation package. It hardcoded:

- obsolete workbook SHA-256 `914a70…`;
- obsolete price partition `46 accepted + 22 rejected = 68`;
- obsolete `source_recipe_version=null` safety expectation;
- obsolete workbook ranges and Gate D schema.

It therefore exited before verifying exact RC1 even though the final independent verifier separately proved the workbook and domain package.

## Remediation

The script was replaced with a portable, read-only current-contract verifier:

1. Derives the exact workbook SHA-256 from immutable HOF-0016 and compares it with the current binary.
2. Computes the current Git blob SHA of `RECIPES.csv` and verifies every safety card against the exact recipe version/blob.
3. Verifies `68 accepted + 22 rejected = 90` price observations and excludes every rejected ID from active selections.
4. Verifies the evidence layer separately from the proxy scenario:
   - evidence COGS: 28 rows, complete fields still blank;
   - evidence channel rows: 101, project metrics still blank/blocked;
   - proxy COGS: 28 numeric LOW_CONFIDENCE rows;
   - proxy channel economics: 101 numeric LOW_CONFIDENCE rows.
5. Verifies 28 nutrition calculations with release blocks and zero laboratory-confirmed rows.
6. Verifies 28 safety cards, 112 critical nulls, 28 vetoes, 140 CCP rows and the exact recipe blob.
7. Verifies 28 resource cards, 155 equipment mappings and 28 capacity rows without passport claims.
8. Invokes `qa_issue_82_workbook.py` and asserts the current 28/101/17 workbook contract, 17/17 freeze panes, 809 formulas and zero formula-error literals.
9. Performs no writes to domain data, workbook or reports while executing.

The Issue #82 workflow now executes this independent QA after the workbook QA step.

## Exact local results

| Check | Result |
|---|---|
| Costing/proxy QA | PASS |
| Cross-domain integration QA | `PASS_WITH_CONDITIONS` |
| Workbook QA | PASS |
| Updated independent repository QA | PASS |
| Workbook SHA-256 | `38462a6df3c9c429e17bc759fb522f4fb6aee7c28c378d8e421c0441a14ac382` |
| Workbook sheets / freeze panes / formulas | 17 / 17 / 809 |
| Dish scope / recipe lines / completeness cells | 28 / 253 / 364 |
| Accepted / rejected price observations | 68 / 22 |
| Evidence / proxy cost rows | 28 / 28 |
| Evidence / proxy channel rows | 101 / 101 |
| Safety vetoes / critical nulls | 28 / 112 |
| Nutrition calculated / release-blocked / lab-confirmed | 28 / 28 / 0 |
| Equipment mappings / passport claims | 155 / 0 |
| Domain/workbook files changed by QA execution | 0 |

## Remaining condition

`IV-016` can be closed only after:

1. these exact changes are published on RC2;
2. the Issue #82 workflow succeeds on that exact head including the new independent-QA step;
3. the separate IndependentVerifier reruns the committed script and confirms the result.

No subject-matter blocker is removed by this QA remediation.
