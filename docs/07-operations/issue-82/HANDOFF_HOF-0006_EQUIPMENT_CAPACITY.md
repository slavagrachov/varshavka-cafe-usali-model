# HANDOFF HOF-0006 — EquipmentCapacityAgent

- Sender: `/root/equipment_capacity` / EquipmentCapacityAgent.
- Receivers: Orchestrator; SystemArchitect; CostingPricingAgent; FoodSafetyAgent; ExcelBuilder after Gate C acceptance.
- Version/date: `0.1.0-DRAFT` / `2026-08-03`.
- Dish scope: 28 — `VKM-001…VKM-025`, `VKM-029…VKM-031`; `VKM-026…VKM-028` excluded.
- Upstream: HOF-0002, HOF-0003 and HOF-0004, all accepted with conditions.
- Sender decision: `READY_FOR_HANDOFF_WITH_BLOCKERS`.
- Requested receiver decision: `ACCEPTED_WITH_CONDITIONS`.

## Package

1. `RESOURCE_CARDS.csv` — 28 integrated dish resource cards.
2. `EQUIPMENT_FUNCTION_MATRIX.csv` — 155 operation-to-function mappings.
3. `CAPACITY_BOTTLENECK_REPORT.csv` — 28 capacity records and blocker-aware hypotheses.
4. `INVENTORY_REGISTER.csv` — 28 production inventory sets.
5. `TABLEWARE_REGISTER.csv` — 28 service-tableware candidate sets.
6. `CAPEX_TECHNICAL_GAPS.csv` — 14 evidence-backed CAPEX/technical blockers.
7. `EQUIPMENT_CAPACITY_REPORT.md` — method, interpretation, QA and cross-Issue impacts.

## Sources and statuses

- Technology process/time: HOF-0002 / `EVD-0010`; times remain `ESTIMATE` until observation.
- VSF linkage: HOF-0004 / `EVD-0009`; 34-node DAG is not modified.
- Safety: HOF-0003; all 28 vetoes and null critical limits are preserved.
- Function mapping: `EVD-0021` / source capacity workbook / current CAPEX register; `ESTIMATE`.
- Passport capacity: `EVD-0022`; blank + `BLOCKED`.
- Asset availability/connections: `EVD-0023`; `BLOCKED`.
- Bottlenecks: `EVD-0024`; `BLOCKED_PENDING_VALIDATION`.
- Inventory: `EVD-0025`; candidate set `ESTIMATE`, quantity blank + `BLOCKED`.
- Tableware: `EVD-0026`; candidate set `DRAFT/ESTIMATE`, quantity/turnover blank + `BLOCKED`.

## Checks performed

- exactly 28 unique resource/capacity/inventory/tableware records: PASS;
- exact menu scope and no `VKM-026…VKM-028`: PASS;
- 155 source operations and 155 mapped operations: PASS;
- every mapping has a functional code or an explicit technical-gap requirement code: PASS;
- active and total time units consistent (`мин`): PASS;
- no manufacturer/passport capacity invented: PASS;
- no asset marked purchased, installed, serviceable or connected: PASS;
- no unknown batch/tableware quantity replaced with zero: PASS;
- existing current codes resolve to CAPEX rows; `REQ-BAK-PREP` is explicitly non-CAPEX and blocked: PASS.

## Open questions and blockers

See `CAPEX_TECHNICAL_GAPS.csv`, `EQG-001…EQG-014`. Highest-impact items: selected-model passports; ownership/condition; engineering connections; peak demand; timed batch tests; clean capacity-workbook recalculation; bakery manual-workstation code; shared-oven schedule; inventory sanitation allocation; serving matrix and packaging.

## Acceptance criteria

1. SystemArchitect reconciles all operation codes with the stable CAPEX code model and decides `REQ-BAK-PREP` through an explicit decision/change path.
2. No downstream agent treats planning group rates, active-time-implied labor rates or candidate assets as passport/observed facts.
3. Demand-based batch counts remain blank until approved demand, staffing, passports and timing evidence are available.
4. Equipment availability/connections remain `BLOCKED`; no claim of purchase, installation or suitability is made.
5. FoodSafetyAgent re-reviews final equipment, inventory and workflow before any dish readiness upgrade.
6. ExcelBuilder preserves blank unknowns, statuses, EvidenceIDs and blocker links and demonstrates clean external recalculation at Gate D.
7. CostingPricingAgent does not assign equipment/CAPEX/energy or packaging cost from this package without accepted price/allocation evidence.

## Recipient decision

`ACCEPTED_WITH_CONDITIONS` / 2026-08-03. Паспортная мощность, факт наличия/подключения, demand-based партии, количества инвентаря/посуды и фактические bottleneck-выводы остаются пустыми/заблокированными; `REQ-BAK-PREP` — только разрыв, не актив. Gate C должен повторно сверить коды и связи.
