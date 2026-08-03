# CR-0001 — Costing price provenance correction

- Версия: 0.2.1
- Дата: 2026-08-03
- Инициатор: SystemArchitect / Gate C
- Владелец исправления: CostingPricingAgent
- Причина: часть наблюдений использовала цену из блока related products при URL другой товарной карточки.
- Scope review: 68/68 исходных observations.
- Результат: ACCEPTED 46; REJECTED 22; активный PRICE_SOURCE_REGISTER содержит только accepted-наблюдения.
- Точный расчётный эффект относительно v0.1.0: активные observations 68→46 (-22); selected-priced ingredients 32→19 (-13); MEDIUM-confidence SKU 14→9 (-5); блюда с числовым partial cost 24→21 (-3); partial cost изменился у 24/28 блюд — 21 числовое изменение и 3 перехода в null; complete COGS 0→0. Все зависимые таблицы пересобраны.
- Статус: IMPLEMENTED; требует повторного Gate C review.

## Accepted observations

- `PSR-0001` — ING-001 / Мука ЛЕНТА высший сорт
- `PSR-0003` — ING-001 / Мука 365 ДНЕЙ хлебопекарная
- `PSR-0004` — ING-003 / Дрожжи САФ Левюр активные
- `PSR-0005` — ING-003 / Дрожжи ANGEL активные
- `PSR-0006` — ING-003 / Дрожжи SUPER сухие
- `PSR-0007` — ING-004 / Соль Усольская
- `PSR-0009` — ING-026 / Меланж пастеризованный GROVO
- `PSR-0010` — ING-027 / Масло Вкуснотеево 82.5%
- `PSR-0013` — ING-028 / Сахар ЛЕНТА
- `PSR-0014` — ING-009 / Моцарелла Bonfesto Пицца
- `PSR-0015` — ING-009 / Моцарелла Primolatto
- `PSR-0017` — ING-010 / Пармезан Dolce Granto
- `PSR-0018` — ING-010 / Пармезан Поставы городок
- `PSR-0019` — ING-010 / Пармезан Сыробогатов
- `PSR-0020` — ING-010 / Пармезан Laime
- `PSR-0021` — ING-012 / Горгонзола Botticello
- `PSR-0023` — ING-012 / Горгонзола Ненашево
- `PSR-0025` — ING-030 / Буррата Galbani mini
- `PSR-0026` — ING-030 / Буррата Калачево
- `PSR-0027` — ING-030 / Буррата Калачево
- `PSR-0028` — ING-030 / Буррата ЛЕНТА FRESH
- `PSR-0031` — ING-036 / Креветки Fish&More очищенные
- `PSR-0032` — ING-036 / Креветки Polar очищенные
- `PSR-0033` — ING-036 / Креветки Океан Вкуса 41/50
- `PSR-0034` — ING-036 / Креветки Вкус Арт
- `PSR-0035` — ING-036 / Креветки ЛЕНТА очищенные
- `PSR-0038` — ING-054 / Лосось слабосоленый филе
- `PSR-0040` — ING-054 / Семга Русское море
- `PSR-0041` — ING-054 / Семга Русское море
- `PSR-0044` — ING-074 / Морковь весовая
- `PSR-0046` — ING-076 / Треска Borealis филе
- `PSR-0047` — ING-076 / Треска охлажденная Мурманская
- `PSR-0048` — ING-076 / Треска Красная птица филе
- `PSR-0049` — ING-076 / Треска Вкус Арт филе
- `PSR-0050` — ING-077 / Сливки ЛЕНТА 33%
- `PSR-0051` — ING-077 / Сливки БМК 33%
- `PSR-0052` — ING-077 / Сливки Село Зеленое 33%
- `PSR-0054` — ING-088 / Мякоть говяжья
- `PSR-0055` — ING-097 / Вырезка говяжья
- `PSR-0056` — ING-097 / Вырезка говяжья Tenderloin
- `PSR-0057` — ING-097 / Вырезка говяжья Родные места
- `PSR-0058` — ING-097 / Вырезка говяжья фермерская
- `PSR-0061` — ING-107 / Черника Свой урожай
- `PSR-0062` — ING-107 / Черника И зимой и летом
- `PSR-0063` — ING-107 / Черника МариАйс
- `PSR-0064` — ING-108 / Кремчиз Bonfesto

## Rejected observations

- `PSR-0002` — ING-001 / Мука MAKFA хлебопекарная: URL slug is a 2 kg flour card while the observation used a 1 kg pack/related price
- `PSR-0008` — ING-024 / Масло подсолнечное Олейна: URL is a butter card; oil price came from related products
- `PSR-0011` — ING-027 / Масло Северное молоко 82.5%: URL is 72.5% butter; observation claimed a different 82.5% SKU
- `PSR-0012` — ING-027 / Масло Северная долина 82.5%: URL is another butter SKU; price came from related products
- `PSR-0016` — ING-009 / Моцарелла Bonvida для пиццы: URL/product identity does not prove Bonvida SKU
- `PSR-0022` — ING-012 / Горгонзола Cheezzi: Observed Cheezzi product identity does not match terra-del-gusto URL slug
- `PSR-0024` — ING-016 / Лук репчатый весовой: URL is carrot; onion price came from related products
- `PSR-0029` — ING-031 / Томаты Бакинские: URL is salmon; tomato price came from related products
- `PSR-0030` — ING-034 / Руккола: URL is burrata; arugula price came from related products
- `PSR-0036` — ING-037 / Яблоки Гренни Смит: URL is cod; apple price came from related products
- `PSR-0037` — ING-052 / Капуста квашеная Белоручка: URL is prepared vinaigrette; sauerkraut price came from related products
- `PSR-0039` — ING-054 / Лосось слабосоленый филе-кусок: URL is another salmon preparation; observed fillet-piece price came from related products
- `PSR-0042` — ING-064 / Капуста белокочанная: URL is carrot; cabbage price came from related products
- `PSR-0043` — ING-071 / Свёкла весовая: URL is carrot; beet price came from related products
- `PSR-0045` — ING-075 / Сметана Ростагроэкспорт 20%: URL is another sour-cream SKU; price came from related products
- `PSR-0053` — ING-079 / Шпинат: URL is burrata; spinach price came from related products
- `PSR-0059` — ING-103 / Брокколи весовая: URL is cod; broccoli price came from related products
- `PSR-0060` — ING-105 / Разрыхлитель Dr.Bakers: URL is cream; baking-powder price came from related products
- `PSR-0065` — ING-108 / Cream Nuvo Professional: URL is Hochland culinary cream cheese; Cream Nuvo price came from related products
- `PSR-0066` — ING-108 / Кремчиз Bonfesto: Direct card did not prove the observed Bonfesto variant/price pair
- `PSR-0067` — ING-109 / Сахарная пудра ЛЕНТА: URL is cream cheese; powdered-sugar price came from related products
- `PSR-0068` — ING-110 / Крахмал кукурузный ЛЕНТА: URL is cream cheese; starch price came from related products

## QA

- 100% observations classified exactly once: PASS.
- All active URLs correspond to the observed product card/slug: PASS by direct-card review.
- No rejected source ID referenced by RAW_MATERIAL_PRICE_REGISTER: PASS.
- 28 cost cards and 28-dish channel coverage: PASS.
- No zero-for-unknown; tax and aggregator commission remain null: PASS.
- Semi-finished DAG and no-double-count controls: PASS.
