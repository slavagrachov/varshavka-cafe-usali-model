# HANDOFF HOF-0004 — SemiFinishedProductsAgent

- Sender: `/root/semi_finished` / SemiFinishedProductsAgent.
- Receivers: Orchestrator; ChefTechnologyAgent; FoodSafetyAgent; CostingPricingAgent; SystemArchitect; ExcelBuilder after Gate B acceptance.
- Version/date: `0.1.0-DRAFT` / `2026-08-03`.
- Dish scope: 28 — `VKM-001…VKM-025`, `VKM-029…VKM-031`; `VKM-026…VKM-028` excluded.
- VSF scope: 34 — `VSF-001…VSF-034`.
- Upstream: HOF-0002 and HOF-0003, both `ACCEPTED_WITH_CONDITIONS`.

## Package

1. `SEMI_FINISHED_PRODUCTS.csv` — 34 authoritative architectural cards.
2. `SEMI_FINISHED_RECIPE_LINES.csv` — structured draft batch recipe variants.
3. `SEMI_FINISHED_DAG.csv` — dish/VSF parent-child graph.
4. `SEMI_FINISHED_MAPPING.csv` — exact consumer, variant, quantity and anti-double-counting rule.
5. `SEMI_FINISHED_QA_REPORT.md` — automated and semantic QA.
6. `scripts/generate_issue_82_semi_finished.py` — deterministic rebuild and validation.

## Sources and statuses

- Evidence: `EVD-0007`, `EVD-0008`, `EVD-0009`; safety constraints from HOF-0003.
- Chef quantities remain `ASSUMPTION`; arithmetic and topology checks are `CALCULATED`.
- No factual yield, safety-critical limit, supplier SKU, price or shelf life was created.
- Every VSF safety status remains `BLOCKED_PENDING_VALIDATION`.

## Performed checks

- 34 unique stable IDs, exact range `VSF-001…VSF-034`: PASS.
- all references and selected variants resolve: PASS.
- DAG acyclic and all 34 VSFs reachable from a dish root: PASS.
- parent-child quantities and units present: PASS.
- structural double-accounting rule: PASS.
- unknown-to-zero substitutions: 0.

## Open questions and blockers

- `GAP-SF-001`: resolve four formula variants for VSF-001 and VSF-002.
- `GAP-SF-002`: decompose VSF-017 and VSF-030 or approve exact purchased SKUs.
- `GAP-006`: Chef freeze and weighed control cooks are outstanding for all VSFs.
- `GAP-010/GAP-011`: FoodSafety veto is preserved; safety re-review is required after recipe/process freeze.

## Acceptance criteria

1. Orchestrator accepts the explicit variant model and the VSF-013 → VSF-014 nesting decision.
2. ChefTechnologyAgent confirms or returns the four pizza variants and special mappings by Change Request—no silent rewrite.
3. CostingPricingAgent selects costs strictly through `SEMI_FINISHED_MAPPING.csv` and never costs mapped flattened lines twice.
4. FoodSafetyAgent re-reviews frozen batch processes before any `READY_FOR_CHEF_REVIEW` transition.
5. ExcelBuilder imports this package only after Orchestrator records `ACCEPTED` or `ACCEPTED_WITH_CONDITIONS`.

## Sender decision

`READY_FOR_HANDOFF_WITH_BLOCKERS`. Receiver decision: `ACCEPTED_WITH_CONDITIONS` — 2026-08-03. Variant model and mappings are frozen for downstream; GAP-SF-001/002 and safety veto remain open.
