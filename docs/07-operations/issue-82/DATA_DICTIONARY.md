# DATA DICTIONARY — Issue #82 workbook v2.0.0

## Workbook conventions

- Stable IDs: `VKM` dish, `VKC` cost card, `VKT` technology card, `VSF` semi-finished product, `ING` ingredient, `EVD` evidence, `GAP/BLK/INT-C` blocker/conflict.
- `null` or blank means unknown. It never means zero.
- Yellow = editable/confirmation input; green = formula output; red/pink = blocked status.
- Complete COGS, channel price, food cost and margin remain blank until all required inputs are accepted.
- All safety vetoes remain `BLOCK`; nutrition numeric values remain null.

## Sheets

| Sheet | Grain / key | Purpose | Primary source | Logical print/used range |
|---|---|---|---|---|
| `00_ПАСПОРТ` | one row per `VKM` | version, scope, integrated status | passports + Gate C | `A1:J40` |
| `01_МЕНЮ` | one row per `VKM` | menu/readiness and linked economics | passports + formulas | `A1:N33` |
| `02_РЕЦЕПТУРЫ` | one row per `recipe_line_id` | 253 draft ingredient lines | `RECIPES.csv` | `A1:P258` |
| `03_ПОЛУФАБРИКАТЫ` | `VSF` card and DAG edge | 34 cards / 42 edges | HOF-0004 | `A1:O85` |
| `04_КАЛЬКУЛЯЦИИ` | one row per `VKC` | partial benchmark and guarded COGS formulas | HOF-0005 v0.2.1 | `A1:Q33` |
| `05_ТЕХКАРТЫ` | one row per `VKT` | operations, time, plating, safety status | HOF-0002/0003 | `A1:Q33` |
| `06_СЫРЬЁ_И_ЦЕНЫ` | ingredient and accepted price observation | active input prices and provenance | HOF-0005 v0.2.1 | `A1:M168` |
| `07_ЦЕНООБРАЗОВАНИЕ` | one row per dish/channel | guarded channel economics | HOF-0005 v0.2.1 | `A1:P106` |
| `08_ОБОРУДОВАНИЕ` | dish resource card and operation mapping | equipment/capacity structure | HOF-0006 | `A1:N192` |
| `09_ИНВЕНТАРЬ_И_ПОСУДА` | one row per `VKM` | candidate sets and blocked quantities | HOF-0006 | `A1:P33` |
| `10_АЛЛЕРГЕНЫ_БЕЗОПАСНОСТЬ` | one row per `VKM` | safety nulls, allergen screen, veto | HOF-0003 | `A1:O33` |
| `11_ПИЩЕВАЯ_ЦЕННОСТЬ` | one row per `VKM` | nutrition null-safe register | HOF-0007 | `A1:Q33` |
| `12_ВОПРОСЫ_ШЕФУ` | one row per question | 144 controlled open questions | HOF-0002 | `A1:N149` |
| `13_СОГЛАСОВАНИЕ` | one row per `VKM` | blank Chef/Owner decisions | Gate contract | `A1:L33` |
| `14_КОНТРОЛЬНЫЕ_ПРОРАБОТКИ` | one row per `VKM` | plan and blank actual fields | HOF-0002 | `A1:P33` |
| `15_ПРОВЕРКИ` | one row per assertion | Gate D formula controls | integrated | `A1:G47` |
| `16_ИСТОЧНИКИ` | one row per source/evidence item | provenance and limitations | HOF-0001/0003/0005/0007 | `A1:M118` |

## Core formula fields

- `04!G`: formula-linked partial known cost.
- `04!I:J:K:N`: guarded complete food cost, spoilage, kitchen COGS and portion COGS.
- `07!E:I:L`: linked/guarded kitchen COGS, project price, ratios and contribution.
- `01!J:M`: menu-level linked economics.
- `15!D:F`: actual, delta and PASS/FAIL formulas.
