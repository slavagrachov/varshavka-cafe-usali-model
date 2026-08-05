#!/usr/bin/env bash
set -Eeuo pipefail
PROGRAM_VERSION="1.0.1"
LOG_FILE=""
init_log(){ mkdir -p "${TMPDIR:-/tmp}/github-artifacts-logs"; LOG_FILE="${TMPDIR:-/tmp}/github-artifacts-logs/$1-$(date +%Y%m%d-%H%M%S)-$$.log"; exec 3>>"$LOG_FILE"; }
log(){ printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" >&3; }
pass(){ printf 'PUBLICATION_RESULT=PASS\nЖУРНАЛ: %s\n' "$LOG_FILE"; }
blocked(){ printf 'PUBLICATION_RESULT=BLOCKED\nПРОБЛЕМА: %s\nЧТО СДЕЛАТЬ: %s\nЖУРНАЛ: %s\n' "$1" "$2" "$LOG_FILE"; exit 1; }
need_cmd(){ command -v "$1" >/dev/null 2>&1 || blocked "Не найдена команда $1." "Установите $1 и повторите команду."; }
sha256_file(){ shasum -a 256 "$1"|awk '{print $1}'; }
blob_sha_file(){ local s; s=$(wc -c <"$1"|tr -d ' '); { printf 'blob %s\0' "$s"; cat "$1"; }|shasum|awk '{print $1}'; }
file_size(){ wc -c <"$1"|tr -d ' '; }
lowercase(){ printf '%s' "$1" | tr '[:upper:]' '[:lower:]'; }
load_config(){ local root; root="${GITHUB_ARTIFACTS_HOME:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.."&&pwd)}"; CONFIG_FILE="$root/configs/${1%.conf}.conf"; [[ -f "$CONFIG_FILE" ]]||blocked "Не найдена карточка публикации $1." "Попросите агента создать карточку."; source "$CONFIG_FILE"; local x; for x in REPOSITORY ISSUE_NUMBER BASE_BRANCH WORK_BRANCH SOURCE_PATTERN TARGET_PATH FILE_TYPE EXPECTED_FILES MERGE_ALLOWED CLOSE_ISSUE_ALLOWED; do eval '[[ -n "${'"$x"':-}" ]]' || blocked "В карточке не заполнено поле $x." "Попросите агента исправить карточку."; done; REPO_NAME="${REPOSITORY#*/}"; }
validate_artifact(){ local f="$1" t; t=$(lowercase "$2"); [[ -f "$f" ]]||blocked "Файл не найден: $f" "Скачайте утверждённый файл в Downloads."; [[ -s "$f" ]]||blocked "Файл пуст: $f" "Скачайте файл повторно."; case "$t" in xlsx|docx|pptx|zip) need_cmd unzip; unzip -tqq "$f" >&3 2>&1||blocked "Архивная структура файла повреждена." "Сформируйте файл повторно.";; pdf) head -c5 "$f"|grep -q '^%PDF-'||blocked "Некорректный PDF-заголовок." "Скачайте PDF повторно."; tail -c2048 "$f"|grep -aq '%%EOF'||blocked "PDF не завершён." "Пересохраните PDF.";; png) need_cmd xxd; [[ "$(xxd -p -l8 "$f")" == 89504e470d0a1a0a ]]||blocked "Повреждена сигнатура PNG." "Скачайте PNG повторно.";; jpg|jpeg) need_cmd xxd; [[ "$(xxd -p -l2 "$f")" == ffd8 ]]||blocked "Повреждена сигнатура JPEG." "Скачайте JPEG повторно.";; json) python3 -m json.tool "$f" >/dev/null 2>&3||blocked "JSON содержит ошибку." "Исправьте JSON.";; csv|md|markdown|txt|sh|conf) grep -Iq . "$f"||blocked "Файл не распознан как текст." "Проверьте выбранный файл.";; *) log "Базовая проверка типа $t";; esac; }
resolve_source(){ local d="${DOWNLOADS_DIR:-$HOME/Downloads}" line; local -a m=(); while IFS= read -r line; do m[${#m[@]}]="$line"; done < <(find "$d" -maxdepth 1 -type f -name "$SOURCE_PATTERN" -print|sort); [[ ${#m[@]} -gt 0 ]]||blocked "Файл по шаблону $SOURCE_PATTERN не найден." "Скачайте файл в Downloads."; [[ ${#m[@]} -eq 1 ]]||blocked "Найдено несколько файлов по шаблону $SOURCE_PATTERN." "Оставьте один утверждённый файл."; SOURCE_FILE="${m[0]}"; }
ensure_gh_auth(){ need_cmd gh; gh auth status -h github.com >&3 2>&1||blocked "GitHub CLI не авторизован." "Выполните gh auth login."; }
repo_root(){ local b="${GITHUB_REPOS_DIR:-$HOME/GitHub}" p="$b/$REPO_NAME"; mkdir -p "$b"; [[ -d "$p/.git" ]]||git clone "https://github.com/$REPOSITORY.git" "$p" >&3 2>&1||blocked "Не удалось клонировать репозиторий." "Проверьте доступ к GitHub."; printf '%s\n' "$p"; }
require_clean_tree(){ [[ -z "$(git -C "$1" status --porcelain)" ]]||blocked "В репозитории есть несохранённые изменения." "Сохраните или отмените изменения."; }
check_expected_files_local(){ local i; IFS=',' read -ra a<<<"$EXPECTED_FILES"; for i in "${a[@]}"; do [[ -f "$1/${i# }" ]]||blocked "В пакете отсутствует файл: ${i# }" "Добавьте полный состав пакета."; done; }
