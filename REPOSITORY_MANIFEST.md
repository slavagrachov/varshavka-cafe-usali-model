# Состав репозитория

## Базовый релиз v0.1.0

Базовая модель и документация — 41 файл.

## Сценарий S02

Утверждённая модель S02 и документация — 10 файлов.

## Сценарий S03

Исторические материалы:

- документация draft S03 v0.1.0;
- прежняя ссылка на отсутствующий source workbook сохранена только в истории Git.

Актуальная редакция S03 v0.1.6:

- `models/scenarios/S03/FINMODEL_VARSHAVKA_USALI_SCENARIO_S03_v0.1.6.xlsx`;
- `models/scenarios/S03/SHA256SUMS.txt`;
- `docs/scenarios/SCENARIO_S03_v0.1.6.md`;
- `docs/scenarios/SCENARIO_S03_v0.1.6_CHANGES.md`;
- `docs/06-validation/SCENARIO_S03_v0.1.6_VALIDATION.md`;
- `docs/07-operations/SCENARIO_S03_v0.1.6_PUBLICATION.md`;
- `docs/08-releases/S03-v0.1.6.md`;
- `sources/tableware/2026-07-25_complexbar_hall_tableware.eml`;
- `sources/tableware/2026-07-25_complexbar_bar_glassware.eml`;
- `sources/tableware/2026-07-25_complexbar_tableware_register.csv`;
- `scripts/releases/build_s03_v0_1_5_tableware.mjs`;
- `scripts/releases/add_s03_v0_1_5_hyperlinks.py`;
- `scripts/releases/build_s03_v0_1_6_channels.mjs`;
- `S03_BUILD_SUCCESS.json` — технический отчёт успешной воспроизводимой сборки.

## Правило

S03 v0.1.4 воспроизводимо строится из утверждённой S02 скриптом
`scripts/s03_model_builder.py`. S03 v0.1.5 строится из S03 v0.1.4, а
S03 v0.1.6 — из S03 v0.1.5 скриптами в `scripts/releases/`.

## Сценарий S04 v3.0.0

Текущий сценарий, слитый через PR #57:

- `models/scenarios/S04/FINMODEL_VARSHAVKA_USALI_SCENARIO_S04_v3.0.0.xlsx`;
- `models/scenarios/S04/SHA256SUMS.txt`;
- `inputs/scenarios/S04_inputs.csv`;
- `inputs/model_manifest.json`;
- `scripts/releases/build_s04_v3_0_0_breakfast_costing.mjs`;
- `scripts/releases/validate_s04_v3_0_0.mjs`;
- `scripts/releases/validate_s04_v3_0_0_ci.py`;
- `docs/scenarios/SCENARIO_S04_v3.0.0.md`;
- `docs/08-releases/S04-v3.0.0.md` — официальный релиз от 28 июля
  2026 года;
- `docs/06-validation/SCENARIO_S04_v3.0.0_VALIDATION.md`;
- `docs/06-validation/S04_v3.0.0_STRUCTURAL_CORRECTIONS.md`;
- `docs/07-operations/HOTEL_BREAKFAST_DECISION_2026-07-27.md`;
- `docs/09-procurement/rfq-breakfast/` — шаблоны запросов, не отправлены;
- `docs/06-validation/issue-52/` — матрица доказательств, формы контрольных
  проработок, сравнительные протоколы и проект финальных проверок Issue №52.

S04 воспроизводимо строится из переходной технической книги S03 v0.1.7.
Расчёт гостиничного завтрака находится на листах `PRICE_REGISTER`,
`BREAKFAST_RECIPES` и `BREAKFAST_COSTING`; мемо-контур Гостиницы находится
на листе `07_PNL_НАЛОГИ`.

## Операционная разработка VARSHAVKA 3.0.0

- `docs/05-data/ISSUE_REGISTER.md` — единый полный реестр вопросов,
  зависимостей, испытаний и корректирующих действий;
- `downloads/KITCHEN_MENU_VARSHAVKA_v3.0.0.xlsx` — скачиваемая редакция
  31 активной позиции МЕНЮ КУХНИ;
- `downloads/EQUIPMENT_POWER_REGISTER_VARSHAVKA_v3.0.0.xlsx` — реестр
  оборудования Кухни с формульным расчётом установленной и пиковой
  электрической мощности;
- `downloads/KITCHEN_PRODUCTION_CAPACITY_BY_MENU_VARSHAVKA_v3.0.0.xlsx` —
  формульный прогноз спроса по всем 31 позициям, почасовой баланс общих
  участков, доступная мощность и нехватка производственной мощности;
  исходные ячейки выделены жёлтым, таблицы снабжены легендами;
- `downloads/SHA256SUMS.txt` — контрольные суммы скачиваемых операционных
  реестров;
- `docs/07-operations/KITCHEN_SESSION_2026-07-26.md` — консолидированный
  протокол разработки МЕНЮ КУХНИ, производственной программы, оборудования
  и БАНКЕТОВ;
- `docs/06-validation/UNRESOLVED_DATA_AUDIT_2026-07-26.md` — межчатовая
  верификация незакрытых данных и расхождений с S03;
- `scripts/validate_issue_register.py` — автоматическая проверка полноты,
  уникальности и непрерывности кодов единого реестра;
- GitHub Issues #36–#53 — открытые тематические пакеты исполнения.

## Инвестиционный контур VARSHAVKA 3.0.0

- `docs/10-investment/INVESTMENT_REGISTER_VARSHAVKA_v3.0.0.md` — основной
  инвестиционный реестр со сквозным ключом `INV_CODE`;
- `docs/10-investment/*.csv` — девять редактируемых приложений и карта
  исторических кодов;
- `docs/10-investment/INVESTMENT_PACKAGE_TEMPLATES_v3.0.0.xlsx` — единая
  редактируемая книга приложений с формулами и контрольными связями;
- `scripts/validate_investment_register.py` — автоматическая проверка
  кодов, классификации, нулевой базы условных позиций, RFQ, Cash Flow и
  комплектности пакета;
- `book/investment.md` — публичный раздел сайта проекта.

Исторический документ оборудования от 25 июля 2026 года остаётся локальным:
в репозитории опубликованы только его ссылка, SHA-256 и карта сопоставления.
Цены имеют статус `NOT_REQUESTED`; S04, IRR, NPV и срок окупаемости этим
пакетом не изменяются и не рассчитываются.
