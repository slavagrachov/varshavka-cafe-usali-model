# HOF-0015 — EquipmentCapacity remediation handoff

## Identification

- Handoff ID: `HOF-0015` (`HOF-0014` reserved for CostingPricingAgent).
- Session: `VAR-ISSUE-82-S02-REMEDIATION`.
- Issue / PR: #82 / draft PR #83.
- Branch: `agent/issue-82-menu-docs`.
- Separate agent: `/root/equipment_capacity_remediation`.
- Exact technology input: recipe `0.1.0-DRAFT`, blob `c6b22ad5f2812cc989a0d3593f40e21207da8f53`; tech-card blob `c36595f110a8bb5fd5b28282488ef144ec6ee535`.
- Exact VSF input blob: `ab0f20fb7bbc68981bf307d8c817d6d2d983bdfb`.
- Safety input: HOF-0012; all 28 vetoes remain `BLOCK`.
- Sender decision: `REMEDIATED_WITH_EXTERNAL_BLOCKERS`.
- Requested receiver decision: `ACCEPTED_WITH_CONDITIONS`.

## Package

1. `RESOURCE_CARDS.csv` — 28 resource cards with an explicit non-demand one-recipe scenario.
2. `EQUIPMENT_FUNCTION_MATRIX.csv` — 155 mappings with project requirement, recipe-load, planning-batch, selected-model/passport and suitability fields.
3. `CAPACITY_BOTTLENECK_REPORT.csv` — 28 planning-cycle sensitivities and blank demand/passport batch results.
4. `INVENTORY_REGISTER.csv` — 28 candidate production-inventory sets; quantities remain blocked.
5. `TABLEWARE_REGISTER.csv` — 28 candidate service sets and a reproducible start-quantity formula; inputs remain blocked.
6. `CAPEX_TECHNICAL_GAPS.csv` — 14 evidence-backed gaps, including the narrowed `REQ-BAK-PREP` decision.
7. `EQUIPMENT_OWNER_DECISION_PACK.csv` — 12 exact decisions with options, recommendation, evidence, four impact dimensions, owner and unblock condition.
8. `EQUIPMENT_CAPACITY_REPORT.md` — remediation method, factual limits, QA and defect disposition.
9. `scripts/generate_issue_82_equipment_capacity.py` — version-locked reproducible generator.

## Sources and statuses

- Technology process/time: HOF-0011 / `EVD-0010`; exact recipe/tech-card blobs above; times remain `ESTIMATE` until observation.
- VSF linkage: exact `SEMI_FINISHED_PRODUCTS.csv` blob above / `EVD-0009`; 34-node DAG is not modified.
- Safety: HOF-0012; all 28 vetoes and unsupported numeric limits remain blocked.
- Function mapping: `EVD-0021` / source capacity workbook / current CAPEX register; `ESTIMATE`.
- Project minimum requirements: current `CAPEX_QUANTITY_SPECIFICATION.csv`; separately exposed as `PLANNED`, not passports.
- Selected manufacturer/model/passport: absent from GitHub SSOT; `EVD-0022`; blank + `BLOCKED_NO_SELECTED_MODEL_PASSPORT`.
- Asset availability/connections: `EVD-0023`; `BLOCKED`.
- Bottlenecks: `EVD-0024`; planning cycles are sensitivity calculations, actual conclusions remain `BLOCKED_PENDING_VALIDATION`.
- Inventory: `EVD-0025`; candidate set `ESTIMATE`, quantity blank + `BLOCKED`.
- Tableware: `EVD-0026`; candidate set `DRAFT/ESTIMATE`, quantity/turnover blank + `BLOCKED`.

## Checks performed

- exactly 28 unique resource/capacity/inventory/tableware records: PASS;
- exact menu scope and no `VKM-026…VKM-028`: PASS;
- 155 source operations and 155 mapped operations: PASS;
- every mapping has a functional code or an explicit technical-gap requirement code: PASS;
- manual mapping false positives corrected for bread scald/butter/greasing and hot-line preparation/WOK processing: PASS;
- active and total time units consistent (`мин`): PASS;
- no manufacturer/passport capacity invented: PASS;
- no asset marked purchased, installed, serviceable or connected: PASS;
- no unknown batch/tableware quantity replaced with zero: PASS;
- selected manufacturer/model/passport claims: zero: PASS;
- existing current codes resolve to CAPEX rows: PASS;
- `REQ-BAK-PREP` reduced to four bread-forming operations and remains explicitly non-CAPEX: PASS;
- one-recipe planning batch estimates are labelled non-operational: PASS.

## Open questions and blockers

See `CAPEX_TECHNICAL_GAPS.csv`, `EQG-001…EQG-014`, and `EQUIPMENT_OWNER_DECISION_PACK.csv`, `EQD-001…EQD-012`. GitHub has no selected models or exact manufacturer passports. Actual useful capacity, cycle time, recipe load, demand batches, availability and connections therefore remain blocked for 28/28.

## Acceptance criteria

1. Owner/SystemArchitect resolves `EQD-006`: prove an existing compliant bakery surface or add a stable code through change control.
2. No downstream agent treats planning group rates, active-time-implied labor rates or candidate assets as passport/observed facts.
3. Demand-based batch counts remain blank until approved demand, staffing, passports and timing evidence are available.
4. Equipment availability/connections remain `BLOCKED`; no claim of purchase, installation or suitability is made.
5. FoodSafetyAgent re-reviews final equipment, inventory and workflow before any dish readiness upgrade; HOF-0012 veto remains binding.
6. ExcelBuilder preserves blank unknowns, statuses, EvidenceIDs and blocker links and demonstrates clean external recalculation at Gate D.
7. CostingPricingAgent does not assign equipment/CAPEX/energy or packaging cost from this package without accepted price/allocation evidence.

## Recipient decision

## Defect disposition

- `IV-003 / S2`: **OPEN**. The mapping is narrowed and decision-ready, but no compliant existing bakery work surface or stable new code is approved.
- `IV-006 / S2`: **OPEN**. Structural coverage is 28/28 dishes and 155/155 operations; demonstrated suitability/capacity remains 0/28 because exact models/passports, asset/connection evidence, approved demand and timed tests are absent.

## Explicit non-results

- No equipment is claimed purchased, installed, serviceable, connected or suitable.
- No project minimum requirement is represented as a manufacturer passport value.
- No demand-based batch count or actual bottleneck is asserted.
- No recipe, safety limit, price, CAPEX amount, inventory quantity or tableware quantity is invented.
- No safety veto is removed.

## Recipient decision

`PENDING` — Orchestrator records acceptance and integrates only the exact generated artifacts. ExcelBuilder may surface them but must preserve blank unknowns and statuses. IndependentVerifier must recheck all 28 dishes and 155 operations against the exact frozen release candidate.
