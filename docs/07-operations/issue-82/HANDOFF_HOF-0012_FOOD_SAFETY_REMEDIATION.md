# Handoff HOF-0012 — Food Safety Remediation

- Sender: FoodSafetyAgent `/root/food_safety_remediation`
- Receivers: Orchestrator; ExcelBuilder; IndependentVerifier
- Version/date: `1.0.0` / `2026-08-03`
- Scope: `VKM-001…VKM-025`, `VKM-029…VKM-031` — 28 dishes
- Input recipe: `0.1.0-DRAFT`, exact blob `c6b22ad5f2812cc989a0d3593f40e21207da8f53`
- Input VSF register blob: `ab0f20fb7bbc68981bf307d8c817d6d2d983bdfb`
- Sender decision: `REMEDIATED_WITH_SAFETY_VETO`
- Requested receiver decision: `ACCEPTED_WITH_CONDITIONS`

## Result

1. `IV-001`: technical version-lock condition closed. All 28 safety cards and all related control/blocker records identify the exact current DRAFT recipe version/blob. This does not equal Chef acceptance.
2. `IV-002`: remains open S1. All 28 dish vetoes remain `BLOCK`; 112/112 unsupported numeric safety fields remain `null`.
3. Direct allergen signals were recomputed from the exact project recipe. Unknown compound/SKU composition remains explicit; absence is never inferred.
4. Cooling and reheating applicability is explicit for every dish profile, including the unresolved immediate-service/make-ahead choice.
5. Every remaining veto has owner, action, evidence requirement and exact unblock condition in `SAFETY_BLOCKER_REGISTER.csv` and `FOOD_SAFETY_DECISION_PACK.md`.

## Files

- `SAFETY_CARDS.csv` — 28 version-locked profiles;
- `ALLERGEN_MATRIX.csv` — 28 rows × 15 classes;
- `CCP_CONTROL_REGISTER.csv` — 140 controls;
- `SAFETY_BLOCKER_REGISTER.csv` — 140 blockers;
- `SAFETY_SOURCE_REGISTER.csv` — 10 official sources;
- `FOOD_SAFETY_REPORT.md`;
- `FOOD_SAFETY_DECISION_PACK.md`;
- `scripts/generate_issue_82_food_safety.mjs`.

## Non-negotiable receiver rules

- Do not replace `null` with zero or a plausible number.
- Do not treat `UNKNOWN_NOT_ABSENT` as allergen absence.
- Do not treat a project recipe lock as Chef approval.
- Do not convert a CCP/OPRP candidate to confirmed without site hazard analysis and validation.
- Do not remove any `BLOCK` until the exact unblock condition is evidenced and a new FoodSafety re-review is issued.
- Re-run the generator only against the exact locked upstream files; any recipe/VSF change invalidates this handoff and requires a new review.
