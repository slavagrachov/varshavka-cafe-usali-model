# Публикация сценария S02 в GitHub

## Целевая ветка

`scenario/2-banquet-day-and-hotel-dinners`

## Связанная задача

`#4 — model: разработать альтернативный операционный сценарий`

## Файлы для загрузки

Загрузите все файлы пакета, кроме каталога `_delivery`.

## Commit

`model: add S02 banquet-day operations and hotel dinners`

## Pull Request

- Base: `main`
- Compare: `scenario/2-banquet-day-and-hotel-dinners`
- Title: `model: add S02 alternative operating scenario`
- В описание добавить: `Closes #4`

## Проверка перед PR

- базовый Excel не изменён;
- новый Excel находится в `models/scenarios/S02/`;
- SHA-256 совпадает;
- все 20 проверок имеют статус `OK`;
- обновлены README, changelog и manifest;
- присутствуют ADR, validation report и release notes.
