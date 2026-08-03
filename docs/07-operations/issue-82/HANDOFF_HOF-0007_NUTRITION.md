# HANDOFF HOF-0007 — NutritionDataAgent

- Sender: `/root/nutrition_data` / NutritionDataAgent.
- Receiver: Orchestrator; then SystemArchitect and ExcelBuilder after acceptance.
- Version/date: `0.1.0-DRAFT` / 2026-08-03.
- Dish scope: 28 — `VKM-001…VKM-025`, `VKM-029…VKM-031`; `VKM-026…VKM-028` excluded.
- Upstream packages: HOF-0002 and HOF-0004, both `ACCEPTED_WITH_CONDITIONS`; Gate A `EVD-0027/EVD-0028` and `GAP-023` preserved.

## Package

1. `NUTRITION_SOURCE_REGISTER.csv` — 7 source/method records, including official-source candidates and missing primary documents.
2. `INGREDIENT_NUTRITION_REGISTER.csv` — 113 unique frozen-recipe ingredients; explicit unresolved composition fields.
3. `DISH_NUTRITION.csv` — 28 dish records with output/portion basis, B/F/C/energy fields and methods.
4. `NUTRITION_CALCULATION_METHOD.md` — source hierarchy, calculation contract, double-counting rule and validation sequence.
5. `NUTRITION_LIMITATIONS.csv` — 6 actionable limitations with owners and next actions.
6. `scripts/generate_issue_82_nutrition.py` — deterministic rebuild and QA.

## Sources and parameter statuses

- Dish identity and draft output: HOF-0002 / `EVD-0003…EVD-0008`, status `DRAFT` or `CALCULATED_FROM_DRAFT`.
- VSF graph and anti-double-counting: HOF-0004 / `EVD-0009`, status `DRAFT` with structural QA accepted.
- Ingredient nutrient values: `EVD-0027`, status `BLOCKED_PENDING_VALIDATION`; exact source record is `null` for all 113 ingredients.
- Dish B/F/C and energy: `EVD-0028` / `METHOD-NUT-001`, status `BLOCKED_PENDING_VALIDATION`; all eight numeric nutrient fields per dish are `null`.
- Laboratory confirmation: `false` for all 28 dishes; no calculated value may be described as laboratory-confirmed.
- Official method references: EEC TR TS 022/2011 page and USDA FoodData Central, accessed 2026-08-03. Neither is treated as an automatic ingredient mapping.

## Performed checks

- Exactly 28 unique dish records and exact requested scope: PASS.
- Breakfast exclusions `VKM-026…VKM-028`: PASS.
- Frozen recipe version retained: PASS (`0.1.0-DRAFT` for all 28).
- Unique ingredient register: PASS (113 identities; 253 recipe lines covered).
- Unknown nutrition values represented as numeric zero: PASS (0 occurrences).
- Unknown nutrition values explicitly represented as `null`: PASS (all unresolved fields).
- HOF-0004 anti-double-counting rule stated in method: PASS.
- Draft dessert sale masses reproduce from batch output/count: PASS (150 g, 120 g, 60 g).

## Open questions and blockers

- `GAP-013`: exact supplier SKUs/specifications and edible-state definitions are missing.
- `GAP-023`: no accepted ingredient nutrition records are mapped.
- `GAP-005/GAP-025`: recipe output and process losses are not validated by weighed control cooks.
- `NUT-LIM-001…006`: detailed effects, owners and next actions are in `NUTRITION_LIMITATIONS.csv`.

Impact: nutrition values cannot be displayed as numeric results, used for a nutrition declaration, or passed as release-ready values. Other domains may safely proceed because every nutrition field carries an explicit status and blocker.

## Acceptance criteria

1. Orchestrator accepts explicit `null` values as the only evidence-compliant result until `GAP-023` is resolved.
2. SystemArchitect verifies exact dish scope, stable VKM/VKC/VKT links and the flattened-vs-VSF anti-double-counting rule.
3. ExcelBuilder imports `null` as an unknown/blocker, never as blank-to-zero or numeric zero.
4. Any later numeric update requires exact source record/version/date, recipe-version match and a new handoff/review.
5. Calculated results remain labelled `CALCULATED`, not laboratory-confirmed.

## Decision

- Sender decision: `READY_FOR_HANDOFF_WITH_BLOCKERS`.
- Receiver decision: `ACCEPTED_WITH_CONDITIONS` / 2026-08-03. Числовые Б/Ж/У/энергия остаются `null` и `BLOCKED_PENDING_VALIDATION`; ExcelBuilder не преобразует их в нули, а Gate C проверяет scope, версию рецептуры и анти-двойной учёт VSF.
