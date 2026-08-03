# Equipment Capacity Report — Issue #82

## Паспорт

- Role: EquipmentCapacityAgent `/root/equipment_capacity`.
- Version/date: `0.2.0-REMEDIATION` / `2026-08-03`.
- Scope: 28 dishes — `VKM-001…VKM-025`, `VKM-029…VKM-031`; `VKM-026…VKM-028` excluded.
- Upstream: HOF-0011 exact recipe `c6b22ad5f2812cc989a0d3593f40e21207da8f53` / tech cards `c36595f110a8bb5fd5b28282488ef144ec6ee535`; HOF-0012 safety veto; VSF `ab0f20fb7bbc68981bf307d8c817d6d2d983bdfb`.
- Evidence: `EVD-0010`, `EVD-0021…EVD-0026`; current CAPEX structure and missing-document register.

## Result

- 28 resource cards; one non-empty row per dish.
- 155 technology operations; every operation has a functional equipment/workstation mapping.
- 28 capacity/bottleneck records; draft active/total time retained in minutes.
- 28 inventory sets and 28 draft service-tableware sets.
- 14 explicit CAPEX/technical gaps and 12 exact Owner/Engineering/Procurement decisions.
- Stable existing functional codes and `INV_CODE` links are used where the current CAPEX register contains them.
- `REQ-BAK-PREP` remains only for four bread-forming operations. The remediation tested BAK-12, HOT-12 and BAK-07 as existing-code candidates and rejected silent allocation: their approved scopes are pizza table, hot-line table and pastry inventory, not a proven compliant bakery forming surface.

## Passport and project-requirement distinction

The GitHub SSOT contains no selected manufacturer, model/article or manufacturer passport/official URL for any mapped equipment function. `DOC-INV-011` remains `NOT_REQUESTED`; current CAPEX rows contain project minimum technical requirements only. This remediation therefore exposes those requirements separately as `PLANNED`, keeps all passport fields blank and retains actual suitability as `BLOCKED`.

Where units are directly comparable, a one-recipe planning scenario is calculated and explicitly labelled non-operational: pizza-oven, rice-cooker and WOK mappings have one recipe unit and one planning equipment batch. These calculations do not establish demand capacity, actual cycle time or useful throughput.

## Capacity interpretation

The current resource card is a planning architecture, not proof that equipment is acquired, installed, connected, suitable or productive. `preliminary_recipe_batches = 1` means only that each ChefTechnologyAgent card describes one current draft recipe unit. It is not a demand-based production batch count.

Existing group inputs (pizza 25; bakery 20; cold 16; hot 21; sides 12; pastry 20 units/hour) are retained only as `ESTIMATE` from `KITCHEN_PRODUCTION_CAPACITY_BY_MENU_VARSHAVKA_v3.0.0.xlsx / ПАРАМЕТРЫ`. Their implied planning cycle is calculated as `60 / group rate` for sensitivity only. They are not manufacturer passport or observed values. Demand-based equipment batches remain blank/`BLOCKED` until approved peak demand, staffing, selected-model passports and timed tests are available.

The external spreadsheet engine used for inspection returned unsupported-name formula errors in computed demand/capacity cells of the current capacity workbook. Therefore this package does not import its computed bottleneck conclusions. Gate D must demonstrate a clean external recalculation before those outputs are relied on.

## Preliminary bottleneck hypotheses

1. `BAK-02` is shared by bread, desserts and potentially potato operations; the second-oven gate cannot be resolved without a daily load diagram and safety/cleaning validation.
2. Manual cold preparation may trigger `CLD-08`/`CLD-09`, but these remain conditional until timing trials.
3. Hot-line interactions (`HOT-01`, `HOT-02`, `HOT-03`, `HOT-05A/B`, `HOT-06`) cannot be ranked without the approved hourly dish mix and changeover times.
4. Inventory wash/dry flow and allergen segregation require HOF-0003 re-review on the final equipment/workflow.
5. Tableware candidates are traceable to the historical register, but no per-dish service set, turnover or stock quantity is approved.

## Issue impacts

- Issue #37: control cooks and peak-load trials must capture operation time, equipment load, changeover, yield and simultaneous station demand.
- Issue #38: selected equipment and inventory must be re-reviewed for critical limits, cooling/holding, sanitation, cross-contact and traceability; no safety regime is inferred here.
- Issue #39: supplier SKU/package dimensions affect storage load and delivery packaging; equipment and tableware supplier documents remain outstanding.
- Issue #47: future economics may consume machine-hours, energy and packaging/tableware inputs only after the resource data are validated; no CAPEX or direct cost is asserted here.

## Automated QA

- exact scope 28 and excluded breakfast codes: PASS;
- operation coverage: 155/155 mapped: PASS;
- one capacity/inventory/tableware record per dish: 28/28/28: PASS;
- active/total time units: all `мин`: PASS;
- unsupported existing functional codes: 0: PASS;
- invented passport capacity values: 0: PASS;
- selected manufacturer/model/passport claims: 0: PASS;
- one-recipe planning estimates with explicit non-operational status: 10/155 operation mappings;
- claimed installed/connected equipment: 0: PASS;
- unknown batch counts or tableware quantities replaced with zero: 0: PASS.

## Readiness

`REMEDIATED_WITH_EXTERNAL_BLOCKERS`. Operation mapping and decision precision are improved, but all 28 dishes remain blocked from demonstrated capacity and confirmed equipment suitability pending `EQG-001…EQG-014`, selected-model/site evidence and the binding HOF-0012 safety veto. `IV-003` is not closed because no compliant bakery work surface has been approved. `IV-006` is not closed because no dish has passport-backed useful capacity, observed cycle/load/batches and connection evidence.
