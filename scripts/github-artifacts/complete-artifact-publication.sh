#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "$0")"&&pwd)"; source "$ROOT/lib/common.sh"; init_log complete
[[ $# -eq 1 ]]||blocked "Не указана карточка публикации." "Запустите: complete-github-artifact issue-N"
load_config "$1"; ensure_gh_auth; [[ "$MERGE_ALLOWED" == true ]]||blocked "Merge Gate в карточке не открыт." "Получите письменное разрешение владельца."
PR="${PR_NUMBER:-$(gh pr list --repo "$REPOSITORY" --head "$WORK_BRANCH" --state open --json number --jq '.[0].number // empty' 2>>"$LOG_FILE")}"
[[ -n "$PR" ]]||blocked "Открытый PR не найден." "Сначала выполните публикацию."
HEAD=$(gh pr view "$PR" --repo "$REPOSITORY" --json headRefOid --jq .headRefOid 2>>"$LOG_FILE"); [[ -z "${APPROVED_HEAD_SHA:-}" || "$HEAD" == "$APPROVED_HEAD_SHA" ]]||blocked "Head SHA изменился после согласования." "Повторно проверьте PR и Merge Gate."
"$ROOT/verify-artifact.sh" "$1" "$HEAD" >&3 2>&1||blocked "Проверка перед merge не пройдена." "Устраните ошибку."
gh pr ready "$PR" --repo "$REPOSITORY" >&3 2>&1||true; gh pr merge "$PR" --repo "$REPOSITORY" --squash --delete-branch >&3 2>&1||blocked "GitHub не выполнил merge." "Проверьте правила ветки."
MAIN_SHA=$(gh api "repos/$REPOSITORY/git/ref/heads/$BASE_BRANCH" --jq .object.sha 2>>"$LOG_FILE"); "$ROOT/verify-artifact.sh" "$1" "$MAIN_SHA" >&3 2>&1||blocked "Post-merge verification не пройдена." "Не закрывайте Issue; восстановите файл в main."
if [[ "$CLOSE_ISSUE_ALLOWED" == true ]]; then gh issue close "$ISSUE_NUMBER" --repo "$REPOSITORY" --reason completed >&3 2>&1||blocked "Merge выполнен, но Issue не закрыта." "Проверьте статус Issue."; fi
printf 'PR=%s\nMAIN_SHA=%s\n' "$PR" "$MAIN_SHA"; pass
