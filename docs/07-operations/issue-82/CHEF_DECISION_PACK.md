# Chef Decision Pack — Issue #82

- Дата среза: 2026-08-03.
- Scope: 28 позиций — `VKM-001…VKM-025`, `VKM-029…VKM-031`.
- Исключено: `VKM-026…VKM-028`.
- Рецептура: `0.1.0-DRAFT`; ни одна позиция не утверждена.
- Excel: `VARSHAVKA_MENU_COSTING_TECH_CARDS_DRAFT_v2.0.0.xlsx`.
- Gate C / Gate D: `PASS_WITH_CONDITIONS`.
- Independent Verification: `CONDITIONAL`; 2 открытых S1 safety + 5 открытых S2 предметных блокеров; новых S1/S2 дефектов книги/модели нет; S3 `IV-008` исправлен и повторно проверен.
- Final workbook SHA-256: `914a70c4c5ba67c8cba1750a17c667157bdf97b79e0b2ea5da7ef64a114cc0b6`.

## Что подготовлено

По каждой позиции сформированы все 13 обязательных результатов: паспорт, рецептура, связи полуфабрикатов, калькуляция, техкарта, ресурсы, инвентарь/посуда, allergens/safety, питание, каналы, вопросы шефу, контрольная форма и согласование. Матрица содержит 364 непустых результата. Значения могут быть draft или blocked; это не означает согласование.

## Сводка 28 позиций

Частичная стоимость — только сумма подтверждённых публичными наблюдениями компонентов. Это не полный COGS и не основание для цены.

| Код | Блюдо | Раздел | Частичная стоимость, руб. | Полный COGS/цена | Safety veto | Вопросов шефу | Статус |
|---|---|---|---:|---|---|---:|---|
| VKM-001 | Маргарита | Пицца | 144.94 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-002 | Четыре сыра | Пицца | 237.81 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-003 | Грибная с ветчиной | Пицца | 89.23 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-004 | Пепперони | Пицца | 107.42 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-005 | Белая чиабатта | Хлеб | 3.26 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-006 | Томатная чиабатта | Хлеб | 3.00 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-007 | Бородинский хлеб | Хлеб | 5.28 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-008 | Бриошь | Хлеб | 25.88 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-009 | Буррата с томатами | Салаты | 192.07 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-010 | Микс-салат с креветками и яблоком | Салаты | 174.30 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-011 | Греческий | Салаты | `null` | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-012 | Винегрет | Салаты | `null` | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-013 | Слабосолёный лосось | Холодные закуски | 440.00 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-014 | Сельдь с запечённым картофелем | Холодные закуски | `null` | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-015 | Оливки и маслины | Холодные закуски | `null` | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-016 | Ассорти фирменных солений | Холодные закуски | 0.49 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-017 | Ростбиф с луком и гренкой | Холодные закуски | `null` | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-018 | Традиционный красный борщ | Супы | 0.95 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-019 | Мурманская треска со сливочно-горчичным соусом | Горячие блюда | 303.76 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-020 | Креветки по-тайски | Горячие блюда | 240.70 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-021 | Бургер VARSHAVKA | Горячие блюда | 164.12 | BLOCKED | BLOCK | 6 | DRAFT_WITH_ASSUMPTIONS |
| VKM-022 | Миньоны из говяжьей вырезки | Горячие блюда | 301.04 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-023 | Запечённый картофель | Гарниры | `null` | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-024 | Рис жасмин | Гарниры | 5.64 | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-025 | Горячие овощи | Гарниры | `null` | BLOCKED | BLOCK | 5 | DRAFT_WITH_ASSUMPTIONS |
| VKM-029 | Черничный торт VARSHAVKA | Десерты | 834.72 | BLOCKED | BLOCK | 6 | DRAFT_WITH_ASSUMPTIONS |
| VKM-030 | Кростата с солёной карамелью | Десерты | 517.22 | BLOCKED | BLOCK | 6 | DRAFT_WITH_ASSUMPTIONS |
| VKM-031 | Мадлен | Десерты | 225.79 | BLOCKED | BLOCK | 6 | DRAFT_WITH_ASSUMPTIONS |

## Решения шеф-повара

1. Утвердить либо скорректировать состав, брутто/нетто, выход и проектные потери всех 28 рецептур.
2. Разрешить варианты `VSF-001/002` либо выбрать единые формулы; декомпозировать `VSF-017` и `VSF-030`.
3. Зафиксировать точные покупные SKU для всех альтернатив, соусов, бульонов, маринадов, глазурей и декора.
4. Провести 28 контрольных проработок с фактическими массами, временем, оборудованием, температурными измерениями и сенсорным решением.
5. Передать frozen recipe version FoodSafetyAgent для повторного version-locked review.

Полный реестр содержит 144 вопроса: по пять на большинство блюд и по шесть для `VKM-021`, `VKM-029…031`.

## Решения владельца / Procurement / Operations

1. Получить коммерческие предложения и спецификации: из 68 публичных наблюдений после red-team price audit допустимы 46, 22 отклонены; цены есть только для 19/113 ингредиентов.
2. Подтвердить поставщиков, фасовку, MOQ, доставку, НДС/налог, комиссии каналов и упаковку.
3. Подтвердить паспорта выбранного оборудования, наличие/состояние/подключения и утверждённый peak mix.
4. Решить `REQ-BAK-PREP`, shared-oven windows, инвентарь, посуду, упаковку и санитарное разделение.
5. Определить, требуется ли лабораторное подтверждение пищевой ценности.
6. После закрытия блокеров утвердить проектные цены; сейчас полный COGS, цена, food cost, маржа и marginal profit отсутствуют для 28/28.

## Safety и nutrition

- FoodSafety veto: `BLOCK` для 28/28.
- 112 safety-critical значений оставлены `null`; температуры и сроки не придуманы.
- 224 полей Б/Ж/У/энергии оставлены `null`; все 28 строк `BLOCKED_PENDING_VALIDATION`.
- До exact SKU, валидированных режимов, HACCP/ППК и повторного review ни одно блюдо нельзя перевести в `READY_FOR_CHEF_REVIEW`.

## Ресурсные решения

- 155/155 операций имеют функциональное сопоставление.
- Паспортная мощность, demand-based партии и факт подключений не подтверждены.
- Открыты 14 технических/CAPEX разрывов: паспорта, активы, подключения, timing/batch, peak demand, capacity-model QA, bakery prep, условные slicer/veg-cutter, shared oven, inventory, tableware, packaging и safety limits.

## Owner/Chef Gate

Ни одна позиция не имеет статус `APPROVED`. Перевод возможен только после документированных решений, контрольных проработок, повторных предметных handoff и FoodSafety re-review. Issue #82 и итоговый PR не закрываются/не сливаются автоматически.
