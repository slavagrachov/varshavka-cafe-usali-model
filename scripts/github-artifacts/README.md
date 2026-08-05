# GITHUB-ARTIFACT-PUBLISH-001 v1.0

Единый механизм публикации, проверки и завершения публикации файлов в GitHub.

## Команды

```bash
publish-github-artifact issue-98
verify-github-artifact issue-98
complete-github-artifact issue-98
```

## Установка на macOS

```bash
cd scripts/github-artifacts
./install-macos.sh
source ~/.zprofile
publish-github-artifact --self-test
```

## Карточки публикации

Каждая операция задаётся файлом `configs/issue-N.conf`. Карточку готовит агент; пользователь её не редактирует. До письменного Owner/Merge Gate поля `MERGE_ALLOWED` и `CLOSE_ISSUE_ALLOWED` остаются `false`.

## Тесты

```bash
./tests/run-tests.sh
```

Подробные правила находятся в `docs/01-project/GITHUB_ARTIFACT_PUBLICATION_REGULATION.md`.
