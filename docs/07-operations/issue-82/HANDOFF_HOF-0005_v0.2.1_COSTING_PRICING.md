# HOF-0005 v0.2.1 — CostingPricingAgent → SystemArchitect / ExcelBuilder

- Отправитель: CostingPricingAgent
- Получатели: SystemArchitect (Gate C), после acceptance — ExcelBuilder
- Версия/дата: 0.2.1-DRAFT / 2026-08-03
- Блюда: VKM-001…VKM-025, VKM-029…VKM-031 (28)
- Входы: HOF-0002, HOF-0004, RECIPES.csv, SEMI_FINISHED_*.csv, S04 inputs, публичные ценовые карточки
- Результаты: RAW_MATERIAL_PRICE_REGISTER.csv; PRICE_SOURCE_REGISTER.csv; COSTING_CARDS.csv; SEMI_FINISHED_COSTING.csv; CHANNEL_PRICING_TABLE.csv; SENSITIVITY_REPORT.csv; ECONOMIC_BLOCKER_REGISTER.csv; COSTING_PRICING_REPORT.md
- Provenance correction: 68/68 reviewed; 46 ACCEPTED; 22 REJECTED and excluded from active registers/calculations; details in CR-0001_COSTING_PRICE_PROVENANCE.md
- Impact vs v0.1.0: active sources 68→46; priced ingredients 32→19; MEDIUM confidence 14→9; numeric partial-cost coverage 24→21; 24/28 dish partial costs changed (21 numeric, 3 to null); complete COGS remains 0/28.
- Проверки: 28 cost cards; scope excludes VKM-026…028; no zero-for-unknown; no negative prices/masses; VSF DAG recursion/no cycle; mapped recipe lines excluded before VSF charge; 28 pricing coverage; every active observation has direct-card URL/date/status
- Статусы: публичные цены `ESTIMATE`; complete cost `BLOCKED_PENDING_VALIDATION` when any input is absent; draft channel prices never `APPROVED`
- Открытые вопросы: КП, поставщики, НДС/налог, комиссии, плотности, упаковка, Chef ingredient specifications and yields
- Блокеры: ECB-001…ECB-031
- Критерии приёмки: SystemArchitect confirms units, mapping and no-double-count; ExcelBuilder imports only after `ACCEPTED` or `ACCEPTED_WITH_CONDITIONS`
- Решение получателя: PENDING
