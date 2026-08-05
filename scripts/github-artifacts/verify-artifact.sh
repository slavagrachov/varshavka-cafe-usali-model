#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "$0")"&&pwd)"; source "$ROOT/lib/common.sh"; init_log verify
[[ $# -ge 1 && $# -le 2 ]]||blocked "Неверные параметры проверки." "Запустите: verify-github-artifact issue-N [commit-SHA]"
load_config "$1"; need_cmd git; need_cmd shasum; ensure_gh_auth
REF="${2:-$(gh pr list --repo "$REPOSITORY" --head "$WORK_BRANCH" --state open --json headRefOid --jq '.[0].headRefOid // empty' 2>>"$LOG_FILE")}"
[[ -n "$REF" ]]||blocked "Не удалось определить exact commit SHA." "Укажите SHA вторым параметром."
TMP=$(mktemp); gh api -H 'Accept: application/vnd.github.raw+json' "repos/$REPOSITORY/contents/$TARGET_PATH?ref=$REF" >"$TMP" 2>>"$LOG_FILE"||blocked "Файл отсутствует в commit $REF." "Проверьте путь и публикацию."
validate_artifact "$TMP" "$FILE_TYPE"; S256=$(sha256_file "$TMP"); BLOB=$(blob_sha_file "$TMP"); SIZE=$(file_size "$TMP")
IFS=',' read -ra A<<<"$EXPECTED_FILES"; for I in "${A[@]}"; do gh api "repos/$REPOSITORY/contents/${I# }?ref=$REF" --silent 2>>"$LOG_FILE"||blocked "В commit отсутствует файл пакета: ${I# }" "Опубликуйте полный пакет."; done
[[ -z "${EXPECTED_SHA256:-}" || "$EXPECTED_SHA256" == "$S256" ]]||blocked "SHA-256 не совпадает с ожидаемым." "Повторите публикацию утверждённого файла."
printf 'REF=%s\nSIZE=%s\nSHA256=%s\nGIT_BLOB_SHA=%s\n' "$REF" "$SIZE" "$S256" "$BLOB"; pass
