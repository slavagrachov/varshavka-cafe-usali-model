# import-varshavka-video

Служебная Supabase Edge Function проекта `GVP_project`.

## Текущее состояние

- функция развернута в Supabase;
- `verify_jwt = true`;
- публичный импорт отключён;
- любой вызов возвращает HTTP `403`;
- функция не используется для просмотра видео конечными получателями.

## Назначение

Функция временно использовалась для серверного переноса MP4 из HeyGen CDN в Supabase Storage. После успешной загрузки файла `varshavka-video/varshavka-2026-2027.mp4` импорт был отключён.

## Безопасность

В репозитории не хранятся API-ключи, service-role ключи, JWT или временные подписанные URL HeyGen.

## Развёрнутая версия на дату фиксации

| Параметр | Значение |
|---|---|
| Supabase project ref | `narqdnyjnqqekdjpysye` |
| Function slug | `import-varshavka-video` |
| Version | `4` |
| Status | `ACTIVE` |
| JWT verification | enabled |
| SHA-256 сборки | `c04d3305b9c5b1d231a7abec266f6a000646ea3e06b21d751c88c2f08a3e83d5` |

Каноническое описание всей схемы публикации находится в `book/video-publication.md`.
