# SESSION_MANIFEST — Issue #82

- Issue: https://github.com/slavagrachov/varshavka-cafe-usali-model/issues/82
- Parent: #69
- Predecessor: #80
- Date: 2026-08-03
- Base branch: `main`
- Base SHA: `1a057cd30b36c1bacfd02c24cf9ebde610517830`
- Working branch: `agent/issue-82-menu-docs`
- PR #79: merged into `main`
- PR #81: open draft; not merged; reference-only
- Scope: 28 positions — `VKM-001…VKM-025`, `VKM-029…VKM-031`
- Excluded: `VKM-026…VKM-028` except as reference architecture
- Merge/closure rule: do not merge PR, close #82, or close #81 without written owner approval.

## Session status

`WAVE_4_CONDITIONAL / OWNER_CHEF_GATE_PENDING`

## Source boundaries

1. Primary: approved chef recipe or owner decision.
2. Applicable official regulation or professional recipe collection.
3. Official manufacturer/supplier document.
4. Verifiable professional source.
5. Explicit project assumption.

PR #81 content is secondary and may be transferred only with provenance and review.

## Data contract

Every record must contain: stable ID; dish code; entity type; version; field value; unit; parameter status; EvidenceID or calculation method; source date/version; owner; blocker if any; and upstream/downstream IDs. Missing numeric facts are `null`, never zero. Allowed parameter statuses: `FACT`, `CALCULATED`, `ASSUMPTION`, `DRAFT`, `ESTIMATE`, `BLOCKED`, `BLOCKED_PENDING_VALIDATION`, `MONITOR`, `SUPERSEDED`. Dish statuses: `DRAFT_WITH_ASSUMPTIONS`, `READY_FOR_CHEF_REVIEW`, `READY_FOR_CONTROL_COOK`, `APPROVED`.

Stable identifiers: `VKM-xxx` menu position; `VKC-xxx` costing; `VKT-xxx` technology card; `VSF-xxx` semi-finished product; `ING-xxx` ingredient; `EVD-xxxx` evidence; `BLK-xxxx` blocker; `CR-xxxx` change request; `HOF-xxxx` handoff.

## Mandatory handoff contract

Sender; receiver; version/date; dish list; files/data; EvidenceIDs; parameter statuses; checks; open questions; blockers; acceptance criteria; receiver decision `ACCEPTED / REJECTED / ACCEPTED_WITH_CONDITIONS`. Data changes outside a handoff and Change Request are prohibited.

## RACI

| Result | R | A | C | I |
|---|---|---|---|---|
| Source Register, Evidence Matrix, Gap Register | SourceAuditor | Orchestrator | all specialists | Owner |
| Recipes, technology, chef questions, control-cook plan | ChefTechnologyAgent | Orchestrator | FoodSafety, SemiFinishedProducts | Owner |
| Semi-finished product DAG/cards | SemiFinishedProductsAgent | ChefTechnologyAgent | Costing, SystemArchitect | Orchestrator |
| Safety cards, allergens, CCP/blockers | FoodSafetyAgent | Orchestrator | ChefTechnology | Owner |
| Costing and pricing | CostingPricingAgent | Orchestrator | ChefTechnology, FoodSafety | Owner |
| Equipment/capacity/inventory/tableware | EquipmentCapacityAgent | Orchestrator | ChefTechnology | Owner |
| Nutrition | NutritionDataAgent | Orchestrator | ChefTechnology | Owner |
| Integration review | SystemArchitect | Orchestrator | all specialists | Owner |
| Workbook/builder/data dictionary | ExcelBuilder | Orchestrator | SystemArchitect | Owner |
| Independent verification | IndependentVerifier | Owner | Orchestrator only for logistics | all agents |

## Agent Execution Log

| Role | Agent ID | Task | Inputs | Expected results | Actual results | Start/end | Status | Handoff to | Decisions/blockers |
|---|---|---|---|---|---|---|---|---|---|
| SourceAuditor | /root/source_auditor_replacement | Wave 1A evidence audit | main, issues, PR #81 | Source Register; Evidence Matrix; Gap Register; allowed assumptions | 7 files; 18 sources; 32 EvidenceID; 26 gaps | 2026-08-03 / 2026-08-03 | COMPLETED | Orchestrator | HOF-0001 ACCEPTED_WITH_CONDITIONS; original agent interrupted after non-delivery |
| ChefTechnologyAgent | /root/chef_technology | Wave 1B recipes and process | accepted Gate A package | 28 passports/recipes/tech cards; mass balance; chef questions; cook plan | 28 passports; 253 recipe lines; 28 tech cards; 28 mass balances; 144 questions; 28 plans/forms; 34 VSF candidates | 2026-08-03 / 2026-08-03 | COMPLETED | SemiFinished; Costing; Equipment; Nutrition; ExcelBuilder | HOF-0002 ACCEPTED_WITH_CONDITIONS; no readiness due safety veto |
| SemiFinishedProductsAgent | /root/semi_finished | Nested recipe DAG | accepted HOF-0002 and HOF-0003 | unique VSF cards and DAG | 34 cards; 166 lines; 42 DAG edges; 42 mappings; acyclic; no orphan | 2026-08-03 / 2026-08-03 | COMPLETED | Costing; SystemArchitect; ExcelBuilder | HOF-0004 ACCEPTED_WITH_CONDITIONS; GAP-SF-001/002 open |
| FoodSafetyAgent | /root/food_safety | Wave 1B safety | Gate A and recipe handoff | 28 safety cards; allergen/CCP/blocker registers | 28 cards; 28×15 allergens; 140 controls; 140 blockers; official sources | 2026-08-03 / 2026-08-03 | COMPLETED | ChefTechnology; SystemArchitect; ExcelBuilder | HOF-0003 ACCEPTED_WITH_CONDITIONS; veto BLOCK all 28 |
| CostingPricingAgent | /root/costing_pricing | Wave 2 economics | frozen recipes and price evidence | 28 cost cards; prices/channels/sensitivity | v0.2.1: 46/68 accepted prices; 22 rejected; 28 cards; 101 channel rows | 2026-08-03 / 2026-08-03 | COMPLETED | SystemArchitect | HOF-0005 v0.2.1 ACCEPTED_WITH_CONDITIONS after CR-0001; complete COGS blocked 28/28 |
| EquipmentCapacityAgent | /root/equipment_capacity | Wave 2 resources | frozen process and equipment register | 28 resource cards; bottlenecks; CAPEX gaps | 28 cards; 155 operation mappings; 14 gaps | 2026-08-03 / 2026-08-03 | COMPLETED | SystemArchitect | HOF-0006 ACCEPTED_WITH_CONDITIONS; passport/availability/demand blocked |
| NutritionDataAgent | /root/nutrition_data | Wave 2 nutrition | frozen recipes | 28 calculated nutrition records | 28 records; 113 ingredients; 7 sources; 6 limitations | 2026-08-03 / 2026-08-03 | COMPLETED | SystemArchitect | HOF-0007 ACCEPTED_WITH_CONDITIONS; numeric values blocked |
| SystemArchitect | /root/system_architect | Gate C reconciliation | all accepted Wave 2 handoffs | integration review; conflicts | 28-row matrix; 8 conflict classes; independent cost/source recheck | 2026-08-03 / 2026-08-03 | COMPLETED | ExcelBuilder | HOF-0008 PASS_WITH_CONDITIONS; INT-C-002…008 open |
| ExcelBuilder | /root/excel_builder | Wave 3 workbook | accepted handoffs only | 17-sheet xlsx; builder; build/formula/visual QA; dictionary | no deliverable | 2026-08-03 / 2026-08-03 | INTERRUPTED | Orchestrator | rejected after repeated non-delivery controls |
| ExcelBuilder | /root/excel_builder_replacement | Wave 3 workbook replacement | accepted handoffs only | 17-sheet xlsx; builder; build/formula/visual QA; dictionary | 17 sheets; 28 dishes; 15/15 checks; LO recalc; visual QA 17/17; CR-0002 visual fix | 2026-08-03 / 2026-08-03 | COMPLETED | IndependentVerifier | HOF-0009 ACCEPTED_WITH_CONDITIONS; final SHA256 `914a70c4...cc0b6` |
| IndependentVerifier | /root/independent_verifier | Wave 4 red-team verification | frozen release candidate | report; defects; PASS/CONDITIONAL/FAIL | CONDITIONAL; 2 S1 + 5 S2 open; S3 corrected/rechecked | 2026-08-03 / 2026-08-03 | COMPLETED | Orchestrator and defect owners | HOF-0010; no new workbook/model S1/S2 |

## Gates

- Gate A: Source Register + Evidence Matrix + Gap Register + status rules + allowed assumptions.
- Gate B: all 28 recipes/processes/semi-finished links/mass-balance/safety/questions/readiness.
- Gate C: cross-domain reconciliation passed or conflicts explicitly blocked.
- Gate D: 28 dishes, 17 sheets, formula/recalc/logical/visual checks completed.
- Owner/Chef Gate: owner review only; no automatic approval.

## Control registers

- Decision/Conflict Log: `DEC-0001` — PR #81 remains reference-only; accepted.
- Blocker Register: initialized; population begins at Gate A.
- Change Request Register: initialized.
- Handoff Register: initialized.

## Completeness matrix

Canonical matrix: `COMPLETENESS_MATRIX_28x13.csv`. It contains 28 rows and 13 mandatory result columns = 364 controlled deliverables.
