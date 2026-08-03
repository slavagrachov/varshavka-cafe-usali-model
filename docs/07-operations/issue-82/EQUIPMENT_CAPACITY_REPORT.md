# Equipment Capacity Report — Issue #82

## Паспорт

- Role: EquipmentCapacityAgent `/root/equipment_capacity`.
- Version/date: `0.1.0-DRAFT` / `2026-08-03`.
- Scope: 28 dishes — `VKM-001…VKM-025`, `VKM-029…VKM-031`; `VKM-026…VKM-028` excluded.
- Upstream accepted with conditions: HOF-0002, HOF-0003, HOF-0004.
- Evidence: `EVD-0010`, `EVD-0021…EVD-0026`; HOF-0003 safety evidence.

## Result

- 28 resource cards; one non-empty row per dish.
- 155 technology operations; every operation has a functional equipment/workstation mapping.
- 28 capacity/bottleneck records; draft active/total time retained in minutes.
- 28 inventory sets and 28 draft service-tableware sets.
- 14 explicit CAPEX/technical gaps.
- Stable existing functional codes and `INV_CODE` links are used where the current CAPEX register contains them.
- `REQ-BAK-PREP` is intentionally a gap code, not a claimed asset: the current CAPEX model has no unambiguous dedicated bakery preparation workstation for manual shaping.

## Capacity interpretation

The current resource card is a planning architecture, not proof that equipment is acquired, installed, connected, suitable or productive. `preliminary_recipe_batches = 1` means only that each ChefTechnologyAgent card describes one current draft recipe unit. It is not a demand-based production batch count.

Existing group inputs (pizza 25; bakery 20; cold 16; hot 21; sides 12; pastry 20 units/hour) are retained only as `ESTIMATE` from `KITCHEN_PRODUCTION_CAPACITY_BY_MENU_VARSHAVKA_v3.0.0.xlsx / ПАРАМЕТРЫ`. They are not manufacturer passport or observed values. Required equipment batches remain blank/`BLOCKED` until approved peak demand, staffing, selected-model passports and timed tests are available.

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
- claimed installed/connected equipment: 0: PASS;
- unknown batch counts or tableware quantities replaced with zero: 0: PASS.

## Readiness

`READY_FOR_HANDOFF_WITH_BLOCKERS`. Resource architecture is complete for Gate C reconciliation, but all 28 dishes remain blocked from demonstrated capacity and confirmed equipment suitability pending `EQG-001…EQG-014` and the binding HOF-0003 safety veto.
