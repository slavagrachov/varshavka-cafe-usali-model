# NutritionDataAgent remediation report — Issue #82

Agent: `/root/nutrition_remediation` / separate NutritionDataAgent

Session: `VAR-ISSUE-82-S02-REMEDIATION`

Version/date: `0.2.0-REMEDIATION-DRAFT` / 2026-08-03
Scope: Issue #82 / draft PR #83 nutrition domain only.

## 1. Result

The numerical nutrition gap is remediated for all 28 in-scope positions.

| Control | Result |
|---|---:|
| In-scope dishes | 28/28 |
| Ingredient identities | 113/113 mapped |
| Recipe lines covered | 253/253 |
| Numeric protein/fat/carbohydrate/energy at declared output | 28/28 |
| Numeric protein/fat/carbohydrate/energy per 100 g | 28/28 |
| Draft sale-portion calculations | 28/28 |
| Official source mapping coverage | 100% |
| Direct official generic matches | 63/113 |
| Official proxy assumptions | 45/113 |
| Transparent composites | 4/113 |
| Project-derived recipe profile | 1/113 (`ING-087` from `VKM-008`) |
| Laboratory-confirmed results | 0/28 |
| Release-ready nutrition declarations | 0/28 |

Every dish is now `CALCULATED_DRAFT` or `CALCULATED_DRAFT_WITH_ASSUMPTIONS`. Every dish separately remains `BLOCKED_PENDING_VALIDATION` for release. This separation prevents the previous error where an absence of release evidence also prevented useful planning calculations.

## 2. Frozen input and traceability

- ChefTechnology handoff commit: `6f987d2daf45887fd2a81afc58131bf1e5e96d33`.
- `RECIPES.csv` blob: `c6b22ad5f2812cc989a0d3593f40e21207da8f53`.
- Recipe version: `0.1.0-DRAFT`, 253/253 lines.
- Chef remediation changed technology-card fields, not recipes.
- Source databases: official CoFID 2021, official CoFID old-food archive and USDA FoodData Central SR Legacy.
- Exact download URLs, release dates and SHA-256 hashes are in `NUTRITION_SOURCE_REGISTER.csv`.
- Every ingredient row records an exact CoFID code, USDA FDC ID, composite basis or project-derived recipe ID.

## 3. Produced artifacts

1. `DISH_NUTRITION.csv` — 28 calculated records, base/lower/upper values at declared output and per 100 g, portion values and release status.
2. `INGREDIENT_NUTRITION_REGISTER.csv` — 113 mapped ingredients with exact official record IDs, base values, uncertainty envelope and mapping confidence.
3. `NUTRITION_SOURCE_REGISTER.csv` — official sources, download hashes and allowed/prohibited uses.
4. `NUTRITION_LIMITATIONS.csv` — six controlled limitations with owner and exit condition.
5. `NUTRITION_CALCULATION_METHOD.md` — full calculation, energy reconciliation, semi-finished and validation method.
6. `scripts/generate_issue_82_nutrition.py` — deterministic builder and QA.

## 4. Calculation QA

- Exact scope `VKM-001…VKM-025`, `VKM-029…VKM-031`: PASS.
- Exclusion `VKM-026…VKM-028`: PASS.
- Exact recipe blob and version lock: PASS.
- Ingredient coverage 113/113: PASS.
- Numeric completeness for all dish macro/energy fields: PASS.
- Negative values: 0.
- Unknown-to-zero substitutions: 0. Zeros occur only in official records that state zero.
- Sensitivity ordering lower ≤ base ≤ upper: PASS.
- Flattened-recipe/VSF double-counting control: PASS.
- `ING-087` derived from `VKM-008` instead of generic brioche: PASS.
- `laboratory_confirmed=false`: 28/28.
- `release_status=BLOCKED_PENDING_VALIDATION`: 28/28.

## 5. Owner/Chef decision requirements

### NUT-DEC-001 — Freeze ingredient alternatives and SKU/state

- Required decision: approve the exact product or recipe interpretation for proxy/composite ingredients.
- Options: retain the recommended official proxy; select a named alternative already present in the sensitivity envelope; provide a different exact SKU label/specification.
- Recommended option: Chef first resolves combined/alternative recipe labels, then Procurement supplies exact SKU labels for high-impact dairy, meat, sauce, coconut milk, cream and decoration ingredients.
- Evidence: ingredient-level record and sensitivity basis in `INGREDIENT_NUTRITION_REGISTER.csv`.
- Impact: values remain useful for planning; the main uncertainty is visible in each dish range and may change declared energy/macros.
- Owner: Chef + Procurement, accepted by Owner where menu positioning changes.
- Exit condition: exact selected ingredient/state and label or exact official record are recorded.

### NUT-DEC-002 — Approve weighed output and portion

- Required decision: accept or revise output after control cook.
- Options: approve draft output if measured results support it; replace with measured mean and tolerance; revise recipe.
- Recommended option: use at least the controlled weighed series required by the ChefTechnology pack and regenerate nutrition from the resulting frozen version.
- Impact: total nutrients at input remain broadly stable, but per-100 g and per-portion values change directly with validated yield.
- Owner: Chef / Operations.
- Exit condition: approved recipe version, measured output and portion mass.

### NUT-DEC-003 — Decide whether laboratory confirmation is required

- Required decision: calculated declaration only or laboratory confirmation.
- Options: publish calculated values after source/SKU/recipe validation; commission accredited testing after freeze.
- Recommended option: decide only after recipe and SKU freeze; testing before freeze would validate a moving target.
- Impact: no cost/pricing formula changes automatically, but external claims and compliance evidence differ materially.
- Owner: Owner with Legal/Compliance and Chef.
- Exit condition: documented decision and, if required, laboratory protocol/results.

## 6. Remaining blockers

1. Recipe/output remain draft (`GAP-005`).
2. Exact supplier SKUs and labels are not frozen (`GAP-013`).
3. Laboratory confirmation is absent and may or may not be required by Owner.
4. Regulatory edition, rounding and presentation must be reconfirmed at actual publication.

These blockers prohibit representing the values as approved or laboratory-confirmed. They do not negate the completed draft calculations.

## 7. Handoff decision

Sender decision: `READY_FOR_INTEGRATION_WITH_RELEASE_BLOCKERS`.

Acceptance conditions for Orchestrator/ExcelBuilder:

1. import numeric base and sensitivity values without converting `release_status` into readiness;
2. preserve recipe blob/version and source record IDs;
3. display “calculated draft” separately from “laboratory confirmed” and “release-ready”;
4. rerun the generator if the Chef recipe blob changes;
5. IndependentVerifier recomputes all 28 rows from the 253 recipe lines and 113 ingredient profiles.
