# Nutrition calculation method — Issue #82

Version/date: `0.1.0-DRAFT` / 2026-08-03
Method ID: `METHOD-NUT-001`
Scope: exactly `VKM-001…VKM-025`, `VKM-029…VKM-031`; `VKM-026…VKM-028` are excluded.

## Outcome

The nutrition data set is structurally complete for 28 dishes, but numeric protein, fat, carbohydrate and energy values are intentionally `null` and each dish is `BLOCKED_PENDING_VALIDATION`. The accepted Evidence Gate marks ingredient composition as unavailable (`EVD-0027`, `GAP-023`); substituting generic values or zeros would violate the anti-hallucination protocol.

This package is a calculation-ready contract, not a laboratory certificate and not a regulatory approval.

## Source hierarchy

1. Approved label/specification for the exact purchased ingredient SKU.
2. Exact record in an official composition database, with record ID, edible/prepared state, access date and version recorded.
3. A verified professional source when neither of the above exists, with an explicit confidence limitation.
4. A project assumption only when the owner explicitly permits it; assumptions remain visible and cannot support an approved nutrition declaration.

`NUTRITION_SOURCE_REGISTER.csv` records the accepted upstream handoffs, the official EEC page for TR TS 022/2011, USDA FoodData Central as a candidate official database, and the missing supplier/SKU documents. The regulatory source controls presentation basis but does not provide ingredient composition.

## Calculation contract after unblocking

For each recipe line with a mass in grams and an accepted ingredient-composition record:

`line nutrient = accepted net quantity, g × nutrient per 100 g / 100`.

The declared-output total is the sum of included raw/flattened ingredient lines. `SEMI_FINISHED_MAPPING.csv` is used to resolve the recipe graph, but mapped VSF lines must not be added on top of flattened `RECIPES.csv` lines. This preserves the HOF-0004 anti-double-counting rule.

Per 100 g:

`dish nutrient per 100 g = declared-output nutrient × 100 / validated output mass, g`.

Per sale portion:

`sale-portion nutrient = declared-output nutrient × validated sale-portion mass / validated output mass`.

Energy must come from the accepted source basis or a separately documented applicable conversion method. It must be reconciled with protein/fat/carbohydrate values and the applicable edition of TR TS 022/2011 before release. Unknown nutrients are never converted to zero and a partial total is never presented as a complete dish value.

## Portion mass

For `VKM-001…VKM-025`, the draft target output is provisionally used as one sales-unit mass. For batch desserts, draft sale mass is arithmetic only:

- `VKM-029`: 1800 g / 12 = 150 g;
- `VKM-030`: 1200 g / 10 = 120 g;
- `VKM-031`: 600 g × 2 / 20 = 60 g.

These masses are `DRAFT` or `CALCULATED_FROM_DRAFT`, not observed weights. Control cooks must validate them.

## Required validation sequence

1. Procurement approves exact ingredient SKUs and supplies current specifications/labels.
2. NutritionDataAgent maps all ingredient IDs to exact source records and records version/date and edible-state basis.
3. Chef approves recipe quantities and processing state; Operations records weighed input/output in control cooks.
4. The generator calculates complete totals only when every included nutrient input is non-null and accepted.
5. A reviewer reconciles per-output, per-100 g and per-portion values and checks the no-double-counting rule.
6. Laboratory testing is commissioned when the owner requires laboratory-confirmed values. Until then all results remain calculated estimates.

## QA implemented

`scripts/generate_issue_82_nutrition.py` asserts:

- exactly 28 unique in-scope dishes;
- no `VKM-026…VKM-028` records;
- 113 unique ingredient identities from the frozen recipe package;
- all currently unknown nutrition fields contain the explicit token `null`;
- no unknown is represented by numeric zero;
- draft dessert portion masses are arithmetically reproducible.

Open limitations and ownership are listed in `NUTRITION_LIMITATIONS.csv`.
