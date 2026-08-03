# Nutrition calculation method — Issue #82

Version/date: `0.2.0-REMEDIATION-DRAFT` / 2026-08-03

Method ID: `METHOD-NUT-002`
Scope: exactly `VKM-001…VKM-025`, `VKM-029…VKM-031`; `VKM-026…VKM-028` excluded.

## 1. Outcome and status model

The package now contains numeric protein, fat, carbohydrate and energy calculations for 28/28 dishes:

- per declared draft output;
- per 100 g of declared draft output;
- per draft sale portion;
- with lower/upper sensitivity envelopes where the recipe label admits materially different official composition records.

Calculation and release are separate states:

- `CALCULATED_DRAFT` / `CALCULATED_DRAFT_WITH_ASSUMPTIONS` means arithmetic is complete and reproducible from the frozen draft recipe and cited records;
- `BLOCKED_PENDING_VALIDATION` means the value must not be represented as an approved nutrition declaration until the recipe/output and material SKU/state choices are confirmed;
- `laboratory_confirmed=false` means no value is a laboratory result.

Thus the former 28/28 numeric nutrition defect is remediated for planning and Chef/Owner review, but not for external label release.

## 2. Exact calculation input

- Recipe version: `0.1.0-DRAFT` for all 253 lines.
- Exact `RECIPES.csv` git blob: `c6b22ad5f2812cc989a0d3593f40e21207da8f53`.
- ChefTechnology remediation handoff commit: `6f987d2daf45887fd2a81afc58131bf1e5e96d33`.
- The Chef remediation changed the mandatory `TECH_CARDS.csv` schema/content but did not change the 253 recipe lines or their version.
- All recipe net quantities are grams.
- Exactly 113 ingredient identities are mapped.

The generator fails if the recipe blob, line count, version, scope or gram unit changes. A recipe change therefore requires an explicit new NutritionDataAgent run rather than silently reusing stale values.

## 3. Source hierarchy and provenance

1. Approved label/specification for the exact purchased SKU — preferred release source, still absent.
2. Exact generic/state record in an official food-composition database.
3. Named official proxy or named official alternative when the draft ingredient is underspecified.
4. Transparent composite only for a recipe label that itself combines ingredients (for example, “oregano and salt”).
5. Project-derived profile only when an ingredient explicitly points to another exact frozen recipe (`ING-087` → `VKM-008`).

Official composition sources:

- Public Health England, McCance and Widdowson CoFID 2021;
- the separately published CoFID “old foods” archive where a current record is unavailable;
- USDA FoodData Central SR Legacy 2018.

`NUTRITION_SOURCE_REGISTER.csv` records direct download URLs, release dates and SHA-256 hashes. `INGREDIENT_NUTRITION_REGISTER.csv` records the exact CoFID code or USDA FDC ID, source name, values, status, confidence and alternative-record envelope for every ingredient.

TR TS 022/2011 controls presentation and release review. It is not used as a composition database.

## 4. Formulae

For nutrient `n` and recipe line `i`:

`line_n = net_qty_g_i × nutrient_n_per_100g_i / 100`.

For the declared output:

`dish_n = Σ line_n`.

Per 100 g:

`dish_n_per_100g = dish_n × 100 / declared_output_g`.

Per draft sale portion:

`dish_n_per_portion = dish_n × draft_sale_portion_g / declared_output_g`.

The same equations are applied independently to the lower and upper official-candidate values. The resulting interval is a component-wise uncertainty envelope. It is not a statistical confidence interval and is not claimed to represent every possible commercial SKU.

Energy uses the kcal field stated in the official composition record. The 4/9/4 result is recomputed as QA and the percentage difference is stored in `source_energy_vs_atwater_difference_pct`. It does not replace source energy automatically because official databases may treat fibre, organic acids and other energy-yielding components differently.

## 5. Semi-finished products and double counting

`RECIPES.csv` is the controlling flattened calculation basis. VSF mappings are not added on top of those lines.

One exception is not an added VSF line: `ING-087` is explicitly named “Бриошь VKM-008”. Its per-100 g profile is derived once from the eight frozen `VKM-008` recipe lines and its 85 g draft output, then used once in `VKM-021`. A generic brioche record is deliberately not substituted.

## 6. Portion basis

For `VKM-001…VKM-025`, the draft target output is provisionally one sale unit. Batch desserts use the arithmetic portion basis already declared in the project:

- `VKM-029`: 1800 g / 12 = 150 g;
- `VKM-030`: 1200 g / 10 = 120 g;
- `VKM-031`: 600 g × 2 / 20 = 60 g.

All portion masses remain draft until weighed control cooks.

## 7. Interpretation of mappings

The ingredient register distinguishes four cases:

- `OFFICIAL_GENERIC_MATCH`: the generic ingredient and stated state have a direct official record;
- `OFFICIAL_PROXY_ASSUMPTION`: an official record is selected, but SKU, subtype, fat percentage, cut or preparation state remains underspecified;
- `COMPOSITE_ASSUMPTION`: a transparent midpoint is used only because the recipe line itself combines alternatives; both endpoints remain in the sensitivity basis;
- `PROJECT_DERIVED_FROM_DRAFT_RECIPE`: the profile is derived from another frozen recipe.

Numeric zero is permitted only where the exact official composition record reports zero (for example, tap water, table salt or macronutrients in oil). Unknowns are never converted to zero.

## 8. Required validation before release

1. Chef approves the recipe version, ingredient alternatives and weighed output from control cooks.
2. Procurement freezes exact supplier SKU, fat percentage, drained/prepared state and supplies current labels/specifications.
3. NutritionDataAgent replaces materially different generic/proxy records and rebuilds against the new exact recipe blob.
4. A reviewer checks source IDs, output normalization, sensitivity and the no-double-counting rule.
5. The owner decides whether calculated values are sufficient or laboratory testing is required.
6. Legal/compliance review reconfirms the applicable regulatory presentation and rounding rules at the release date.

Until all applicable steps are complete, all 28 rows retain `release_status=BLOCKED_PENDING_VALIDATION` and `laboratory_confirmed=false`.

## 9. Automated QA

`scripts/generate_issue_82_nutrition.py` asserts:

- exact recipe git blob, 253 lines and one recipe version;
- exact 28-dish scope and explicit breakfast exclusion;
- 113/113 ingredient mappings;
- 28/28 non-null, non-negative numeric dish results;
- 100% mapped-source coverage;
- lower ≤ base ≤ upper for calculated values;
- all values remain non-laboratory and release-blocked;
- `ING-087` derives from the exact `VKM-008` recipe rather than a generic substitute.

Open release limitations, owners and exact next actions are recorded in `NUTRITION_LIMITATIONS.csv` and `NUTRITION_REMEDIATION_REPORT.md`.
