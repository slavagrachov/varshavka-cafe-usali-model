# Owner / Chef / PPK Decision Pack — Food Safety, Issue #82

Статус: `DECISIONS_REQUIRED / SAFETY_VETO_BLOCK`
Дата: `2026-08-03`
Recipe lock: `0.1.0-DRAFT`, blob `c6b22ad5f2812cc989a0d3593f40e21207da8f53`

Этот пакет не предлагает владельцу «утвердить безопасность на доверии». Он фиксирует решения, после которых профильный владелец ППК/ХАССП сможет провести доказательную валидацию. До выполнения условий `D1…D5` все 28 позиций остаются `BLOCK`.

## D1 — принять точную рецептуру и варианты

- Требуемое решение: принять либо вернуть на изменение точную рецептуру `0.1.0-DRAFT`, включая все VSF и альтернативы (`или`).
- Варианты: `A` — принять без изменения; `B` — выбрать один вариант каждого альтернативного ингредиента и принять новую версию; `C` — изменить рецепт и выпустить новую версию.
- Рекомендация: `B`, потому что неразрешённые варианты не позволяют завершить аллергенный и SKU-анализ.
- Доказательства: `RECIPES.csv`, `SEMI_FINISHED_PRODUCTS.csv`, `SEMI_FINISHED_MAPPING.csv`, соответствующие контрольные приготовления.
- Влияние: меняет allergens, COGS/nutrition, технологический процесс и требования к оборудованию.
- Владелец: Chef; Owner принимает коммерческие последствия.
- Условие снятия: подписанная точная версия без неразрешённых альтернатив; новый неизменяемый blob; повторный FoodSafety review.

## D2 — выбрать SKU и собрать первичное досье

- Требуемое решение: определить конкретный SKU каждого сырья и сложного ингредиента.
- Варианты: `A` — один основной SKU + разрешённая эквивалентная замена после change review; `B` — несколько взаимозаменяемых SKU с отдельной матрицей состава; `C` — собственный полуфабрикат по принятой карте.
- Рекомендация: `A`; для критичных составных ингредиентов замена только через change control.
- Доказательства: этикетка/спецификация изготовителя, состав и allergens/cross-contact statement, партия, срок и условия хранения/перевозки, документы соответствия и ветеринарные документы где применимо.
- Влияние: allergens, shelf life, acceptance, COGS/nutrition и traceability.
- Владелец: Procurement; Chef проверяет технологическую эквивалентность; PPK owner проверяет безопасность.
- Условие снятия: 100% recipe-line-to-SKU mapping и полное первичное досье без пропусков.

## D3 — выбрать производственный маршрут по блюду и каналу

- Требуемое решение: `immediate service` либо документированный `make-ahead → cooling → storage → reheating/assembly → service`; отдельно доставка/навынос.
- Варианты: `A` — только immediate service; `B` — make-ahead с валидированными этапами; `C` — гибрид, но с раздельными картами и записями.
- Рекомендация: начать с `A` там, где это операционно возможно; `B/C` разрешать только после замеров и PPK/HACCP validation.
- Доказательства: карта потока, фактическое оборудование и измерительные средства, контрольная серия, журналы времени/температуры, упаковка и максимальная логистика по каналу.
- Влияние: safety limits, срок реализации, производительность, CAPEX/OPEX и ассортимент каналов.
- Владелец: Owner + Chef + Operations; PPK owner утверждает hazard controls.
- Условие снятия: один однозначный маршрут на сочетание «блюдо × канал», hazard analysis, валидированные limits/monitoring/corrective actions.

## D4 — утвердить allergens/cross-contact и consumer information

- Требуемое решение: утвердить карту аллергенов и допустимую организацию разделения потоков на фактической площадке.
- Варианты: `A` — физическое разделение; `B` — временное разделение + validated cleaning/changeover; `C` — исключить позицию/канал, если риск не контролируется.
- Рекомендация: применять `A`, где возможно; `B` только с проверенной уборкой и записями; `C` при недоказуемом контроле.
- Доказательства: accepted recipe + SKU dossier, карта хранения/инвентаря/оборудования, cleaning validation, обучение, утверждённая форма информирования гостя.
- Влияние: допустимость блюда, планировка/оборудование, маркировка и ответственность перед гостем.
- Владелец: PPK owner; Chef/Operations исполняют; Owner утверждает ограничения ассортимента.
- Условие снятия: 15-классная матрица без `UNKNOWN`, проверенный cross-contact control и утверждённое consumer information.

## D5 — утвердить прослеживаемость и release record

- Требуемое решение: принять схему `recipe version → SKU/lot → production batch/time → employee → portion/channel → disposition/recall`.
- Варианты: `A` — электронная запись; `B` — бумажная запись с контролем полноты; `C` — гибрид.
- Рекомендация: `A` либо `C` с единым идентификатором партии.
- Доказательства: форма, RACI, тестовая партия и mock trace/recall exercise.
- Влияние: возможность release, расследования и отзыва; дисциплина кухни и ИС.
- Владелец: Owner + Operations + PPK owner.
- Условие снятия: 100% обязательных полей и успешное испытание от сырья до канала и обратно.

## Маршрутизация 28 позиций

| Позиция | Базовый профиль | Обязательное решение D3 | Особые доказательства до снятия veto |
|---|---|---|---|
| VKM-001 | pizza/hot | immediate service или отдельный make-ahead route | dough/sauce VSF, dairy SKU, bake/holding validation |
| VKM-002 | pizza/hot | то же | четыре точных cheese SKU; убрать «иной четвёртый сыр» |
| VKM-003 | pizza/hot | то же | ham SKU, mushroom preparation, bake/holding validation |
| VKM-004 | pizza/hot | то же | pepperoni SKU/composition, bake/holding validation |
| VKM-005 | bread/baked | cooling/handling route обязателен | flour/yeast SKU, bake endpoint, post-bake protection/shelf life |
| VKM-006 | bread/baked | то же | dried tomato SKU/additives, bake/cooling/shelf life |
| VKM-007 | bread/baked | то же | rye/malt SKU, bake/cooling/stabilization/shelf life |
| VKM-008 | enriched bread | то же | milk/egg/butter SKU, bake/cooling; component use in VKM-021 |
| VKM-009 | cold RTE | cold assembly/service only unless new review | burrata cold chain, produce sanitation, dressing SKU |
| VKM-010 | cold RTE seafood | cold assembly/service | shrimp dossier; resolve seed/nut variant; mustard; cross-contact |
| VKM-011 | cold RTE | cold assembly/service | feta SKU, produce sanitation, cold-chain/service time |
| VKM-012 | cooked-components cold salad | choose same-day assembly vs validated cooling/storage | cooked vegetable cooling, pickled/canned SKU, assembly control |
| VKM-013 | RTE lightly salted fish | cold service only | fish SKU/veterinary/lot evidence, supplier storage/use-by, no assumed kill step |
| VKM-014 | mixed cold fish + cooked potato | define separate component routes | herring dossier, potato cooling, final assembly/service |
| VKM-015 | cold preserved SKU | cold service | olive/brine SKU, marinade ingredients, storage after opening |
| VKM-016 | pickled/acidified draft | choose purchased vs own manufacture and exact process | recipe/pH/process validation if own manufacture; SKU dossier if purchased |
| VKM-017 | cold RTE meat | cold service | roast-beef dossier/process, bread/mustard/mayo allergens, slicing cross-contact |
| VKM-018 | hot soup | immediate service vs make-ahead/cooling/reheat | broth/meat route, measured cook/hold or cool/reheat, sour-cream handling |
| VKM-019 | hot fish | immediate service vs make-ahead | cod dossier, fish/milk/mustard allergens, measured cook/hold/delivery route |
| VKM-020 | hot crustacean | immediate service vs make-ahead | shrimp dossier; choose fish or soy sauce; measured cook/hold/delivery route |
| VKM-021 | hot ground meat | immediate service preferred until validation | exact patty composition/process, bun/cheese/sauce SKU, measured cook/hold |
| VKM-022 | hot whole meat | define doneness policy and channel restrictions | cut/process validation; no unsupported temperature; sauce/broth/butter route |
| VKM-023 | hot side | immediate service vs make-ahead | measured bake/hold or cool/reheat route |
| VKM-024 | cooked rice | immediate service preferred; any cooling/reheat separately validated | rice process, butter allergen, time/temperature route |
| VKM-025 | hot vegetables | immediate service vs make-ahead | vegetable preparation, measured cook/hold or cool/reheat route |
| VKM-029 | cream dessert | component-wise bake/cool/chill/assembly | egg/dairy SKU, cream/coulis/glaze variants, shelf-life validation |
| VKM-030 | cream/caramel dessert | component-wise bake/cool/chill/assembly | egg/dairy SKU, caramel/cream route, shelf-life validation |
| VKM-031 | baked dessert | bake/cooling/packaging route | egg/dairy SKU, measured bake/cooling and shelf-life validation |

## Правило решения

Решение считается выполненным только при наличии ссылки на первичное доказательство и точный version/blob. Слова «согласовано», число из чужой рецептуры или проектное время из `TECH_CARDS.csv` сами по себе veto не снимают. После выполнения D1–D5 FoodSafetyAgent выпускает новый version-locked review; только он может изменить `BLOCK`.
