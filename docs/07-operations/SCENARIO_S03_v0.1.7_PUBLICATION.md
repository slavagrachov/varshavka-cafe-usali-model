# Публикация S03 v0.1.7

## Артефакты

- `models/scenarios/S03/FINMODEL_VARSHAVKA_USALI_SCENARIO_S03_v0.1.7.xlsx`;
- `scripts/releases/build_s03_v0_1_7_breakfast.mjs`;
- `scripts/releases/validate_s03_v0_1_7.mjs`;
- `docs/scenarios/SCENARIO_S03_v0.1.7.md`;
- `docs/scenarios/SCENARIO_S03_v0.1.7_CHANGES.md`;
- `docs/06-validation/SCENARIO_S03_v0.1.7_VALIDATION.md`;
- `docs/07-operations/HOTEL_BREAKFAST_DECISION_2026-07-27.md`;
- `docs/07-operations/KITCHEN_MENU_3.0.0.md`;
- `docs/08-releases/S03-v0.1.7-draft.md`.

## Порядок

1. Модель собрана из утверждённой S03 v0.1.6.
2. Формулы, новые контрольные строки и визуальное представление проверены.
3. SHA-256 внесён в `SHA256SUMS.txt` и manifest.
4. Изменения публикуются как draft PR из ветки
   `agent/hotel-breakfast-31`.
5. Слияние в `main` этим шагом не выполняется.
6. Issue #52 не закрывается до документов поставщиков и контрольных
   проработок.
