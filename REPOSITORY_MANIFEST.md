# Состав репозитория

## Базовый релиз v0.1.0

Базовая модель и документация — 41 файл.

## Сценарий S02

Утверждённая модель S02 и документация — 10 файлов.

## Сценарий S03

Исторические материалы:

- документация draft S03 v0.1.0;
- прежняя ссылка на отсутствующий source workbook сохранена только в истории Git.

Актуальная редакция S03 v0.1.5:

- `models/scenarios/S03/FINMODEL_VARSHAVKA_USALI_SCENARIO_S03_v0.1.5.xlsx`;
- `models/scenarios/S03/SHA256SUMS.txt`;
- `docs/scenarios/SCENARIO_S03_v0.1.5.md`;
- `docs/scenarios/SCENARIO_S03_v0.1.5_RESULTS.md`;
- `docs/scenarios/SCENARIO_S03_v0.1.5_CHANGES.md`;
- `docs/06-validation/SCENARIO_S03_v0.1.5_VALIDATION.md`;
- `docs/07-operations/SCENARIO_S03_v0.1.5_PUBLICATION.md`;
- `docs/08-releases/S03-v0.1.5.md`;
- `sources/tableware/2026-07-25_complexbar_hall_tableware.eml`;
- `sources/tableware/2026-07-25_complexbar_bar_glassware.eml`;
- `sources/tableware/2026-07-25_complexbar_tableware_register.csv`;
- `scripts/releases/build_s03_v0_1_5_tableware.mjs`;
- `scripts/releases/add_s03_v0_1_5_hyperlinks.py`;
- `S03_BUILD_SUCCESS.json` — технический отчёт успешной воспроизводимой сборки.

## Правило

S03 v0.1.4 воспроизводимо строится из утверждённой S02 скриптом `scripts/s03_model_builder.py`. S03 v0.1.5 строится из S03 v0.1.4 скриптами в `scripts/releases/`.

## Операционная разработка VARSHAVKA 3.0.0

- `docs/05-data/ISSUE_REGISTER.md` — единый полный реестр вопросов,
  зависимостей, испытаний и корректирующих действий;
- `docs/07-operations/KITCHEN_SESSION_2026-07-26.md` — консолидированный
  протокол разработки МЕНЮ КУХНИ, производственной программы, оборудования
  и БАНКЕТОВ;
- `docs/06-validation/UNRESOLVED_DATA_AUDIT_2026-07-26.md` — межчатовая
  верификация незакрытых данных и расхождений с S03;
- `scripts/validate_issue_register.py` — автоматическая проверка полноты,
  уникальности и непрерывности кодов единого реестра;
- GitHub Issues #36–#53 — открытые тематические пакеты исполнения.
