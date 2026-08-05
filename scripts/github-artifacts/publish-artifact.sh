#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "$0")"&&pwd)"; source "$ROOT/lib/common.sh"; init_log publish
if [[ "${1:-}" == --self-test ]]; then
  need_cmd git; need_cmd shasum; need_cmd python3
  TEST_DIR=$(mktemp -d); printf '# self-test\n' >"$TEST_DIR/self-test.md"
  DOWNLOADS_DIR="$TEST_DIR"; SOURCE_PATTERN="self-test.md"; resolve_source; validate_artifact "$SOURCE_FILE" md
  [[ "$SOURCE_FILE" == "$TEST_DIR/self-test.md" ]]||blocked "Функциональный self-test не пройден." "Переустановите команды."
  rm -rf "$TEST_DIR"
  printf 'VERSION=%s\n' "$PROGRAM_VERSION"; pass; exit 0
fi
[[ $# -eq 1 ]]||blocked "Не указана карточка публикации." "Запустите: publish-github-artifact issue-N"
load_config "$1"; need_cmd git; need_cmd shasum; ensure_gh_auth; resolve_source; validate_artifact "$SOURCE_FILE" "$FILE_TYPE"
REPO_DIR=$(repo_root); require_clean_tree "$REPO_DIR"
git -C "$REPO_DIR" fetch origin "$BASE_BRANCH" "$WORK_BRANCH" >&3 2>&1 || git -C "$REPO_DIR" fetch origin "$BASE_BRANCH" >&3 2>&1
git -C "$REPO_DIR" checkout "$BASE_BRANCH" >&3 2>&1
git -C "$REPO_DIR" reset --hard "origin/$BASE_BRANCH" >&3 2>&1
if git -C "$REPO_DIR" show-ref --verify --quiet "refs/heads/$WORK_BRANCH"; then
  git -C "$REPO_DIR" checkout "$WORK_BRANCH" >&3 2>&1
elif git -C "$REPO_DIR" show-ref --verify --quiet "refs/remotes/origin/$WORK_BRANCH"; then
  git -C "$REPO_DIR" checkout -b "$WORK_BRANCH" --track "origin/$WORK_BRANCH" >&3 2>&1
else
  git -C "$REPO_DIR" checkout -b "$WORK_BRANCH" >&3 2>&1
fi
git -C "$REPO_DIR" rebase "origin/$BASE_BRANCH" >&3 2>&1||blocked "Рабочую ветку нельзя обновить." "Разрешите конфликт ветки."
mkdir -p "$REPO_DIR/$(dirname "$TARGET_PATH")"; cp "$SOURCE_FILE" "$REPO_DIR/$TARGET_PATH"; validate_artifact "$REPO_DIR/$TARGET_PATH" "$FILE_TYPE"; check_expected_files_local "$REPO_DIR"
S256=$(sha256_file "$REPO_DIR/$TARGET_PATH"); BLOB=$(blob_sha_file "$REPO_DIR/$TARGET_PATH"); SIZE=$(file_size "$REPO_DIR/$TARGET_PATH")
git -C "$REPO_DIR" add -- "$TARGET_PATH" ${ADDITIONAL_PATHS:-}; git -C "$REPO_DIR" diff --cached --quiet||git -C "$REPO_DIR" commit -m "GOV-GITHUB-001: publish artifact for issue #$ISSUE_NUMBER" >&3 2>&1; git -C "$REPO_DIR" push -u origin "$WORK_BRANCH" >&3 2>&1||blocked "Не удалось отправить рабочую ветку в GitHub." "Передайте агенту путь к журналу."
HEAD_SHA=$(git -C "$REPO_DIR" rev-parse HEAD); PR=$(gh pr list --repo "$REPOSITORY" --head "$WORK_BRANCH" --state open --json number --jq '.[0].number // empty' 2>>"$LOG_FILE")
[[ -n "$PR" ]]||PR=$(gh pr create --repo "$REPOSITORY" --base "$BASE_BRANCH" --head "$WORK_BRANCH" --draft --title "Публикация артефакта Issue #$ISSUE_NUMBER" --body "Автоматическая публикация. Closes #$ISSUE_NUMBER" 2>>"$LOG_FILE"|sed -E 's#.*/([0-9]+)$#\1#')
TMP=$(mktemp); gh api -H 'Accept: application/vnd.github.raw+json' "repos/$REPOSITORY/contents/$TARGET_PATH?ref=$HEAD_SHA" >"$TMP" 2>>"$LOG_FILE"||blocked "Не удалось скачать файл из exact head SHA." "Проверьте PR."; cmp -s "$REPO_DIR/$TARGET_PATH" "$TMP"||blocked "Побайтовая проверка не пройдена." "Повторите публикацию."; [[ "$S256" == "$(sha256_file "$TMP")" ]]||blocked "SHA-256 не совпадает." "Повторите публикацию."
printf 'ISSUE=%s\nPR=%s\nHEAD_SHA=%s\nSIZE=%s\nSHA256=%s\nGIT_BLOB_SHA=%s\n' "$ISSUE_NUMBER" "$PR" "$HEAD_SHA" "$SIZE" "$S256" "$BLOB"; pass
