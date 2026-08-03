# HANDOFF HOF-0013 — NutritionDataAgent remediation

- Sender: `/root/nutrition_remediation` / separate NutritionDataAgent.
- Receiver: Orchestrator; then ExcelBuilder/SystemArchitect and IndependentVerifier.
- Session: `VAR-ISSUE-82-S02-REMEDIATION`.
- Version/date: `0.2.0-REMEDIATION-DRAFT` / 2026-08-03.
- Dish scope: 28 — `VKM-001…VKM-025`, `VKM-029…VKM-031`; `VKM-026…VKM-028` excluded.
- Published branch head after nutrition package: `e0b5c6539e4ff4a6563d7902576466e62d822e6a`.

## 1. Exact upstream input

- ChefTechnology remediation commit: `6f987d2daf45887fd2a81afc58131bf1e5e96d33`.
- Frozen `RECIPES.csv` git blob: `c6b22ad5f2812cc989a0d3593f40e21207da8f53`.
- Recipe version: `0.1.0-DRAFT` for 253/253 lines.
- Chef remediation changed mandatory technology-card schema/content; the recipe blob and 253 lines remained unchanged.
- `DISH_PASSPORTS.csv` supplies the draft declared output and sale-unit basis.
- `RECIPES.csv` remains the flattened controlling basis; VSF lines are not added again.

## 2. Package and exact published blobs

| Artifact | Git blob SHA |
|---|---|
| `DISH_NUTRITION.csv` | `39a75aebcad5a03a6c11d281c11b686894266070` |
| `INGREDIENT_NUTRITION_REGISTER.csv` | `8caeeca48aedcfd72f1eca2a170d53d275415f6a` |
| `NUTRITION_CALCULATION_METHOD.md` | `0de824fec5139155ffee3b6ddeb3a1419cbb05c9` |
| `NUTRITION_LIMITATIONS.csv` | `55f367fb7654c4f7fcec214a99bee86058c7adca` |
| `NUTRITION_SOURCE_REGISTER.csv` | `f13598e6a03994a02e957d1737f0c64ee75043cf` |
| `NUTRITION_REMEDIATION_REPORT.md` | `3eadccfd00aeb519ed8f63e9bf6ba368364075e9` |
| `scripts/generate_issue_82_nutrition.py` | `927278f73d641342592bdcd0b5ef5933fc3082b9` |

The seven local files were byte-compared with branch head `e0b5c653…`: exact match.

## 3. Numerical completion

| Control | Result |
|---|---:|
| In-scope dishes | 28/28 |
| Recipe lines | 253/253 |
| Ingredient identities mapped | 113/113 |
| Numeric B/F/C/energy at declared output | 28/28 |
| Numeric B/F/C/energy per 100 g | 28/28 |
| Numeric draft sale-portion values | 28/28 |
| Official-source mapping coverage | 100% |
| Direct official generic matches | 63/113 |
| Official proxy assumptions | 45/113 |
| Transparent composites | 4/113 |
| Project-derived profile | 1/113 (`ING-087` from exact `VKM-008`) |
| Laboratory-confirmed rows | 0/28 |
| Release-ready declaration rows | 0/28 |

Base values and component-wise low/high envelopes are present. An envelope is built only from named official candidates; no arbitrary percentage band is used.

## 4. Sources and evidence controls

1. Public Health England CoFID 2021 — official government composition database; workbook SHA-256 `436e9445ef2adb2a75f3d7edd51302de3adad25385f9795fc94ba58bd030e97d`.
2. CoFID “old foods” archive — official archived source; workbook SHA-256 `b3f74af4016e14ebbe41590dc12221ba71c03e316dd0e61d7c96a4c869dc0ca1`.
3. USDA FoodData Central SR Legacy — official government composition database; ZIP SHA-256 `b80817294b8850530aaedf2e515c02593b1824f763a0ff356e5c2081643e6fd0`.
4. TR TS 022/2011 — presentation/release source, not composition input.
5. Supplier/manufacturer exact-SKU label — still absent and required where a generic/proxy value materially differs.

Independent source QA compared 135 embedded USDA record profiles and 12 CoFID record profiles to the downloaded official source tables: exact value match.

## 5. Arithmetic and scope QA

- Exact recipe blob lock: PASS.
- Exact 28-dish scope and breakfast exclusion: PASS.
- 113/113 ingredient mapping: PASS.
- Non-null and non-negative numeric results: PASS.
- Independent recomputation from the output ingredient register: PASS for `28 × 4 = 112` per-100 g headline metrics.
- Lower ≤ base ≤ upper: PASS.
- Unknown-to-zero substitution: 0. Numeric zero is used only where the official record reports zero.
- VSF double-counting: 0; `RECIPES.csv` is flattened and controlling.
- `ING-087`: derived from exact `VKM-008`, not a generic brioche record.
- Generator compilation and deterministic rerun: PASS.

## 6. Status interpretation and remaining release blockers

- `CALCULATED_DRAFT` / `CALCULATED_DRAFT_WITH_ASSUMPTIONS`: arithmetic is complete and reviewable.
- `release_status=BLOCKED_PENDING_VALIDATION`: 28/28; values are not approved for final external nutrition declaration.
- `laboratory_confirmed=false`: 28/28.

Remaining dependencies:

1. Chef validates the recipe and weighed output (`GAP-005`).
2. Procurement freezes exact SKU/state and supplies labels (`GAP-013`).
3. Owner decides whether calculation is sufficient or laboratory testing is required.
4. Legal/compliance reconfirms the applicable release-time presentation and rounding basis.

These dependencies do not restore the old numeric-null defect; they control approval/release of the now calculated values.

## 7. IV-005 disposition

Original `IV-005/S2` observation: “All eight numeric nutrition fields are null for 28/28.”

Current evidence:

- all required B/F/C/energy fields are numeric for 28/28;
- all 113 ingredient identities are mapped;
- source and sensitivity provenance is explicit;
- calculation remains honestly separated from release and laboratory confirmation.

Sender recommendation: `READY_FOR_IV_RETEST`.

IndependentVerifier may close `IV-005` as `RESOLVED` after independently recomputing all 28 dishes and confirming the exact published blobs. NutritionDataAgent does not self-close the defect. The remaining recipe/SKU/laboratory dependencies must remain visible in `NUTRITION_LIMITATIONS.csv`; they are validation/release blockers, not a recurrence of the original all-null calculation defect.

## 8. Acceptance criteria

1. Orchestrator accepts numeric draft calculation separately from release readiness.
2. ExcelBuilder imports base and sensitivity values and preserves `release_status` and `laboratory_confirmed` without converting either into readiness.
3. SystemArchitect preserves recipe blob/version and the flattened-recipe anti-double-counting rule.
4. IndependentVerifier checks 28 recipes, 113 mappings, 112 headline arithmetic recomputations, source record IDs and the seven exact blobs.
5. Any later recipe-blob change requires a fresh generator run and new NutritionDataAgent handoff.

## 9. Sender decision

`READY_FOR_INTEGRATION_WITH_RELEASE_BLOCKERS`.

The numeric nutrition remediation is complete for all 28 dishes. Approval, external declaration and laboratory confirmation remain explicitly prohibited until their evidence gates are satisfied.
