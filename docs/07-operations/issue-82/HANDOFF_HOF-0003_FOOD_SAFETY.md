# Handoff HOF-0003 — Food Safety

- Sender: FoodSafetyAgent `/root/food_safety`
- Receivers: Orchestrator; ChefTechnologyAgent; SystemArchitect; ExcelBuilder
- Version/date: `1.0.0` / `2026-08-03`
- Scope: `VKM-001…VKM-025`, `VKM-029…VKM-031` — 28 dishes
- Excluded: `VKM-026…VKM-028`
- Upstream: `SOURCE_AUDIT.md`, `EVIDENCE_MATRIX.csv`, `GAP_REGISTER.csv`, `SESSION_MANIFEST.md`
- Sender decision: `READY_FOR_HANDOFF_WITH_SAFETY_VETO`
- Requested receiver decision: `ACCEPTED_WITH_CONDITIONS`

## Files and structured data

1. `FOOD_SAFETY_REPORT.md` — scope, regulatory cut-off, method, veto and checks.
2. `SAFETY_CARDS.csv` — 28 per-dish safety cards.
3. `ALLERGEN_MATRIX.csv` — 28 × 15 allergen-class screen plus method and confirmation fields.
4. `CCP_CONTROL_REGISTER.csv` — 140 controls, five stages per dish.
5. `SAFETY_BLOCKER_REGISTER.csv` — 140 blockers, five per dish.
6. `SAFETY_SOURCE_REGISTER.csv` — 10 official/primary regulatory records.
7. `scripts/generate_issue_82_food_safety.mjs` — deterministic source-to-CSV generator for this safety package.

## EvidenceIDs

- Upstream: `EVD-0003`, `EVD-0012`, `EVD-0013`, `EVD-0014`, `EVD-0015`, `EVD-0016`.
- Food Safety: `EVD-FS-001…EVD-FS-010`.
- Official source hosts: `publication.pravo.gov.ru`, `eec.eaeunion.org`.

## Parameter statuses

- Official act identity/effective-date facts: `FACT`.
- Future СанПиН 2.3/2.4.4282-26 transition applicability: `MONITOR` until `2026-09-01`.
- Name-based allergen signals: `DRAFT` / `PRESENT_DRAFT_NAME_BASED`.
- Unknown recipe/SKU composition: `BLOCKED_PENDING_VALIDATION` / `UNKNOWN_RECIPE_SKU`.
- Dish-specific temperatures, cooling/reheating regimes and shelf life: `null` + `BLOCKED_PENDING_VALIDATION`.
- Dish readiness: `BLOCK` for all 28.

## Checks performed

- exactly 28 unique safety cards: PASS;
- scope excludes `VKM-026…VKM-028`: PASS;
- exactly 28 allergen rows with all 15 classes: PASS;
- 140 control rows = 28 × 5: PASS;
- 140 blocker rows = 28 × 5: PASS;
- every safety-critical unknown has EvidenceID, blocker, owner and next action: PASS;
- temperatures/shelf lives invented: 0;
- zeros used for unknowns: 0;
- official source URLs present: PASS;
- current/future СанПиН effective-date distinction: PASS.

## Open questions

1. What is the accepted recipe version for each dish, including all VSF nodes and compound ingredients?
2. Which exact supplier SKU is selected for every ingredient?
3. What approved site HACCP/ППК hazard analysis and control forms will apply?
4. Which production, holding, cooling, reheating and delivery flows are actually used per dish/channel?
5. Which critical limits are supported by an applicable act/manufacturer document and validated on the actual process/equipment?
6. What shelf life/storage condition is justified for the final product, and by which document/test?
7. How is allergen cross-contact controlled on shared equipment, utensils, storage and service areas?
8. How will the kitchen transition from current СанПиН 2.3/2.4.3590-20 to СанПиН 2.3/2.4.4282-26 before 01.09.2026?

## Blockers

For each dish:

- `S1`: raw-material/SKU evidence absent;
- `S1`: final allergen and cross-contact evidence absent;
- `S1`: validated process critical limits absent;
- `S1`: storage/cooling/reheating/realization/shelf-life evidence absent;
- `S2`: approved labeling/traceability workflow absent.

Full owners, impact, action and checkpoints are in `SAFETY_BLOCKER_REGISTER.csv`.

## Handoff acceptance criteria

Receiver must:

1. preserve all `null` safety-critical values and statuses;
2. preserve `BLOCK` veto for all 28 until a documented Food Safety re-review;
3. never convert `PRESENT_DRAFT_NAME_BASED` to final composition without recipe + SKU evidence;
4. never interpret `UNKNOWN_RECIPE_SKU` as allergen absence;
5. return recipe/process changes through formal handoff/Change Request;
6. apply transition review for any operation/release on or after 01.09.2026;
7. prevent Excel formulas from substituting zero/default temperature or shelf life.

## Recipient decision

`ACCEPTED_WITH_CONDITIONS` — 2026-08-03. All nulls, EvidenceIDs, official-source dates and 28 dish vetoes are binding until a documented FoodSafety re-review.
