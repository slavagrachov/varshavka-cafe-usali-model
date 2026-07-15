# Публикация сценария S02 в GitHub

## Итоговый статус

Сценарий S02 опубликован в `main` через Pull Request #5.

- Issue: `#4 — model: разработать альтернативный операционный сценарий`
- Рабочая ветка: `scenario/2-banquet-day-and-hotel-dinners`
- Статус ветки: удалена после merge
- Pull Request публикации: `#5 — model: add S02 banquet-day operations and hotel dinners`
- Дата merge: 15 июля 2026 года
- Техническая очистка: Pull Request #6
- Статус сценария: `approved`

## Опубликованные файлы

- `models/scenarios/S02/FINMODEL_VARSHAVKA_USALI_SCENARIO_S02_v0.1.0.xlsx`
- `models/scenarios/S02/SHA256SUMS.txt`
- `docs/scenarios/SCENARIO_S02.md`
- `docs/scenarios/SCENARIO_REGISTER.md`
- `docs/scenarios/SCENARIO_S02_RESULTS.md`
- `docs/04-decisions/ADR-0004-S02-BANQUET-DAY-OPERATIONS.md`
- `docs/06-validation/SCENARIO_S02_VALIDATION.md`
- `docs/08-releases/S02-v0.1.0.md`
- `inputs/scenarios/S02_inputs.csv`
- `inputs/model_manifest.json`

## Проверка публикации

- базовый Excel не изменён;
- новый Excel находится в `models/scenarios/S02/`;
- SHA-256 совпадает;
- все 20 проверок имеют статус `OK`;
- README, CHANGELOG и manifest обновлены;
- присутствуют ADR, validation report и release notes;
- временные транспортные файлы удалены;
- временный workflow сборки удалён;
- итоговое количество файлов соответствует `REPOSITORY_MANIFEST.md`.

## Контрольная сумма

`1023889898d46a17efd1457b883ac33342c71f74a836edc54e9264103caf2eb8`
