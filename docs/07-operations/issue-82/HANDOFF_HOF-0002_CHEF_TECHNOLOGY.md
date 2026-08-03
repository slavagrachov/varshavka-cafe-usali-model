# HANDOFF HOF-0002 — ChefTechnologyAgent

- Sender: `/root/chef_technology` / ChefTechnologyAgent.
- Receivers: Orchestrator; FoodSafetyAgent; SemiFinishedProductsAgent; затем CostingPricingAgent, EquipmentCapacityAgent, NutritionDataAgent и ExcelBuilder после Gate B.
- Version/date: 0.1.0-DRAFT / 2026-08-03.
- Dish scope: 28 — `VKM-001…VKM-025`, `VKM-029…VKM-031`; завтраки `VKM-026…028` не включены.
- Files: `DISH_PASSPORTS.csv`; `RECIPES.csv`; `TECH_CARDS.csv`; `MASS_BALANCE_REPORT.csv`; `CHEF_QUESTIONS_REGISTER.csv`; `CONTROL_COOK_PLAN.csv`; `CONTROL_COOK_FORMS.md`; `SEMI_FINISHED_CANDIDATES.csv`; `CHEF_TECHNOLOGY_REPORT.md`.
- Evidence: EVD-0003…EVD-0011, EVD-0013, EVD-0014, EVD-0030; HOF-0003 / EVD-FS-001…EVD-FS-010 для сохранения safety-veto.
- Parameter statuses: identity `FACT`; menu output/unit `DRAFT`; recipes and times `ASSUMPTION`; arithmetic reconciliation `CALCULATED`; actual losses/outputs and safety `BLOCKED_PENDING_VALIDATION`.
- Checks: 28 passports; 28 recipe-covered dishes; 253 non-empty recipe lines; 28 tech cards; 28 arithmetic mass balances; 144 open chef questions; 28 control plans/forms; stable VKM/VKC/VKT; no VKM-026…028; output contribution equals draft target for every dish.
- Open questions: all records in `CHEF_QUESTIONS_REGISTER.csv`.
- Blockers: GAP-001, GAP-002, GAP-004…GAP-008, GAP-010, GAP-011, GAP-025; HOF-0003 сохраняет `BLOCK` по всем 28; no control-cook or tasting evidence.
- Acceptance criteria: schema/data-contract fields present; exactly 28 dishes; no unlabelled domain facts; mass-balance arithmetic passes; safety-critical fields remain blocked; VSF candidates handed to separate agent; downstream agents do not silently alter recipe values.
- Receiver decision: `ACCEPTED_WITH_CONDITIONS` — 2026-08-03. Conditions: all project norms remain DRAFT/ASSUMPTION; HOF-0003 veto remains binding; VSF candidates require separate-agent DAG acceptance; no downstream silent recipe edits.

## Handoff notes by receiver

- FoodSafetyAgent: HOF-0003 принят `ACCEPTED_WITH_CONDITIONS`; сохранить `null` safety-critical полей и veto `BLOCK`, вернуть изменения только через re-review/Change Request.
- SemiFinishedProductsAgent: create authoritative aperiodic DAG and batch cards; reject/renumber candidates explicitly through handoff/Change Request.
- CostingPricingAgent: use only after recipe freeze; no price-driven silent recipe changes.
- EquipmentCapacityAgent: treat operation times as draft estimates pending observation.
- NutritionDataAgent: calculate only with accepted ingredient-source data; unknown is not zero.
- ExcelBuilder: import only if Orchestrator records acceptance.
