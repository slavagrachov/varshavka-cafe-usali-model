# Source Audit — Issue #93

## Owner-approved inputs

- VKM-004 / VKC-004 / VKT-004.
- Наименование «Пепперони».
- Выход 500 г; единица 1 пицца.
- Базовая томатная концепция без дополнительных овощей.
- Рецептура: тесто 250 г; соус 72 г; моцарелла 130 г; пепперони 75 г; масло 3 г.
- Массо-баланс: 527 − 30 + 3 = 500 г.
- Recipe COGS 258,60 ₽.
- Единая проектная цена 890 ₽.
- Wave 3 принят `ACCEPTED_WITH_CONDITIONS`.

## Reused controlled inputs

Структура пакета, общие сущности пицц и инструкция `VAR-XLSX-QA-001` использованы из результатов Issue #92 как проверяемые источники, а не как автоматически утверждённые производственные факты.

## Assumptions pending verification

Закупочные цены, SKU, свойства сырья, режим печи, диаметр, потери, упаковка, эквайринг, комиссия, сроки хранения и норматив времени.

## Product boundary

`PENDING_CHEF_MANAGER_VERIFICATION`; `SAFETY_BLOCKED_PENDING_VALIDATION`; не `APPROVED`; не `READY_FOR_PRODUCTION`.
