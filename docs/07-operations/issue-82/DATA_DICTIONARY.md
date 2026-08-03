# DATA DICTIONARY — Issue #82 workbook v2.0.0 remediation RC

## Conventions

- Stable IDs: `VKM` dish, `VKC` cost card, `VKT` technology card, `VSF` semi-finished product, `ING` ingredient, `EVD` evidence, `GAP/BLK/INT-C` blocker/conflict.
- `null` or blank means unknown and never means zero.
- `DRAFT`, `ASSUMPTION`, `BLOCKED` and `BLOCKED_PENDING_VALIDATION` are not completed/approved statuses.
- Yellow = confirmation/input field; green = formula/calculated field; red/pink = blocked status.
- Evidence economics and proxy scenario economics are separate layers. Proxy values cannot populate approved/evidence blanks.

## Sheets

| Sheet | Grain / key | Purpose | Remediation source |
|---|---|---|---|
| `00_ПАСПОРТ` | one row per `VKM` | scope and honest cross-domain readiness | HOF-0011…0015 |
| `01_МЕНЮ` | one row per `VKM` | menu/readiness and guarded evidence economics | formulas |
| `02_РЕЦЕПТУРЫ` | one row per recipe line | 253 draft ingredient lines | HOF-0011 upstream lock |
| `03_ПОЛУФАБРИКАТЫ` | VSF card / DAG edge | 34 cards / 42 edges | accepted upstream |
| `04_КАЛЬКУЛЯЦИИ` | `VKC` plus proxy `VKM` | evidence cost cards and isolated 28-row proxy scenario | HOF-0014 v1.1 |
| `05_ТЕХКАРТЫ` | one row per `VKT` | six mandatory fields/statuses, process, output, safety links | HOF-0011/0012 |
| `06_СЫРЬЁ_И_ЦЕНЫ` | ingredient / accepted observation | evidence input prices and provenance | HOF-0014 v1.1 |
| `07_ЦЕНООБРАЗОВАНИЕ` | dish × channel | 101 evidence rows plus isolated 101 proxy rows | HOF-0014 v1.1 |
| `08_ОБОРУДОВАНИЕ` | dish / operation / capacity row | 28 resources, 155 mappings, 28 planning sensitivities | HOF-0015 |
| `09_ИНВЕНТАРЬ_И_ПОСУДА` | one row per `VKM` | candidate sets and blocked quantities | HOF-0015 |
| `10_АЛЛЕРГЕНЫ_БЕЗОПАСНОСТЬ` | one row per `VKM` | version lock, applicability, null limits, allergen screen, veto | HOF-0012 |
| `11_ПИЩЕВАЯ_ЦЕННОСТЬ` | one row per `VKM` | calculated base/low/high nutrition and release status | HOF-0013 |
| `12_ВОПРОСЫ_ШЕФУ` | one row per question | controlled Chef questions | Chef gate |
| `13_СОГЛАСОВАНИЕ` | one row per `VKM` | blank Chef/Owner decisions | owner gate |
| `14_КОНТРОЛЬНЫЕ_ПРОРАБОТКИ` | one row per `VKM` | plan and blank actual fields | validation gate |
| `15_ПРОВЕРКИ` | one row per assertion | 17 formula controls and readiness taxonomy | ExcelBuilder |
| `16_ИСТОЧНИКИ` | one row per source/evidence | provenance and limitations | source registers |

## Added technology-card fields

`application_scope`, `raw_material_requirements`, `raw_material_preparation`, `allowable_deviations`, `organoleptic_indicators`, `storage_and_realization`; every field has an adjacent independent status.

## Core formula fields

- `04!G`: linked partial known cost; `04!I:J:K:N`: guarded complete evidence chain.
- `07!E:I:L`: linked/guarded evidence kitchen COGS, project price, ratios and contribution.
- `01!J:M`: menu-level evidence economics.
- `15!D:F`: Actual, Delta and PASS/FAIL.

The proxy tables are values from an explicitly labelled assumption scenario and are not formula inputs to the evidence chain.
