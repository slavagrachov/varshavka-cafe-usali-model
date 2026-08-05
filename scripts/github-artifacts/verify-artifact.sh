#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "$0")"&&pwd)"; source "$ROOT/lib/common.sh"; init_log verify
[[ $# -ge 1 && $# -le 2 ]]||blocked "Неверные параметры проверки." "Запустите: verify-github-artifact issue-N [commit-SHA]"
load_config "$1"; need_cmd git; need_cmd shasum; need_cmd python3; ensure_gh_auth
REF="${2:-$(gh pr list --repo "$REPOSITORY" --head "$WORK_BRANCH" --state open --json headRefOid --jq '.[0].headRefOid // empty' 2>>"$LOG_FILE")}"
[[ -n "$REF" ]]||blocked "Не удалось определить exact commit SHA." "Укажите SHA вторым параметром."

# Получаем blob SHA файла из exact commit, затем скачиваем Git blob и
# декодируем base64 через Python. Маршрут безопасен для текстовых и бинарных файлов.
REMOTE_BLOB=$(gh api "repos/$REPOSITORY/contents/$TARGET_PATH?ref=$REF" --jq '.sha' 2>>"$LOG_FILE") || \
  blocked "Файл отсутствует в commit $REF." "Проверьте путь и публикацию."
[[ -n "$REMOTE_BLOB" ]] || blocked "GitHub не вернул Git blob SHA." "Проверьте публикацию."
TMP=$(mktemp)
B64=$(mktemp)
gh api "repos/$REPOSITORY/git/blobs/$REMOTE_BLOB" --jq '.content' >"$B64" 2>>"$LOG_FILE" || \
  blocked "Не удалось скачать Git blob $REMOTE_BLOB." "Проверьте доступ к GitHub."
python3 - "$B64" "$TMP" <<'PY'
import base64
import pathlib
import sys
src = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
pathlib.Path(sys.argv[2]).write_bytes(base64.b64decode(src))
PY

validate_artifact "$TMP" "$FILE_TYPE"; S256=$(sha256_file "$TMP"); BLOB=$(blob_sha_file "$TMP"); SIZE=$(file_size "$TMP")
[[ "$BLOB" == "$REMOTE_BLOB" ]] || blocked "Git blob SHA скачанного файла не совпадает." "Повторите публикацию."
IFS=',' read -ra A<<<"$EXPECTED_FILES"; for I in "${A[@]}"; do gh api "repos/$REPOSITORY/contents/${I# }?ref=$REF" --silent 2>>"$LOG_FILE"||blocked "В commit отсутствует файл пакета: ${I# }" "Опубликуйте полный пакет."; done
[[ -z "${EXPECTED_SHA256:-}" || "$EXPECTED_SHA256" == "$S256" ]]||blocked "SHA-256 не совпадает с ожидаемым." "Повторите публикацию утверждённого файла."
printf 'REF=%s\nSIZE=%s\nSHA256=%s\nGIT_BLOB_SHA=%s\n' "$REF" "$SIZE" "$S256" "$BLOB"; pass
