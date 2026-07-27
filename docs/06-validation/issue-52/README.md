# Пакет подготовки закрытия Issue №52

Статус пакета: **ПОДГОТОВЛЕНО, ДОКАЗАТЕЛЬСТВА НЕ ПОЛУЧЕНЫ**.

Пакет определяет документы, испытания и автоматические проверки, необходимые
для подтверждения себестоимости гостиничного завтрака в VARSHAVKA v3.0.0,
сценарий S04.

На этапе подготовки пакета:

- запросы поставщикам не отправлялись;
- цены и расчётные значения Excel не изменялись;
- `S04_inputs.csv` не изменялся;
- Issue №52 и записи `V-I-082`, `V-I-098`–`V-I-103` не закрывались.

## Состав

- [единая матрица доказательств](ISSUE_52_CLOSURE_EVIDENCE_MATRIX.md);
- [форма проработки яичницы](CONTROL_TRIAL_FRIED_EGGS.md);
- [форма проработки омлета](CONTROL_TRIAL_OMELET.md);
- [форма проработки овсяной каши](CONTROL_TRIAL_OATMEAL.md);
- [форма проработки круассана](CONTROL_TRIAL_CROISSANT.md);
- [форма проработки сырной порции](CONTROL_TRIAL_CHEESE_PORTION.md);
- [форма проверки напитка бариста](CONTROL_TRIAL_BARISTA_DRINK.md);
- [протокол Fontina DOP / Fontal](TASTING_PROTOCOL_FONTINA_FONTAL.md);
- [протокол сравнения круассанов](TASTING_PROTOCOL_CROISSANTS.md);
- [проект автоматических проверок](ISSUE_52_FINAL_RECALC_CHECKS.md).

Результаты испытаний следует сохранять в отдельной датированной папке
`docs/06-validation/issue-52/results/YYYY-MM-DD/`. Документы поставщиков
сохраняются в `sources/procurement/breakfast/YYYY-MM-DD_<vendor>/`.
