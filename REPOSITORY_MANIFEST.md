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
