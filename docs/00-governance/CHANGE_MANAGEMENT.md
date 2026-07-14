# Управление изменениями

## Классы изменений

| Класс | Пример | Действие |
|---|---|---|
| Data update | новая ставка аренды | Issue + PR + changelog |
| Method change | новая методика COGS | ADR + Issue + PR |
| Architecture change | новый расчётный лист | ADR + validation |
| Correction | исправление формулы | Issue + regression checks |
| Release | утверждённая версия | Tag + Release + checksum |

## Правила версии

Используется Semantic Versioning:

- `MAJOR` — несовместимая архитектурная переработка;
- `MINOR` — новый расчётный блок или существенная функция;
- `PATCH` — исправление, обновление inputs или документации без смены архитектуры.
