#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "$0")"&&pwd)"; source "$ROOT/lib/common.sh"; init_log install
need_cmd git; need_cmd gh; gh auth status -h github.com >&3 2>&1||blocked "GitHub CLI не авторизован." "Выполните gh auth login."
BIN="$HOME/bin"; mkdir -p "$BIN"; ln -sfn "$ROOT/publish-artifact.sh" "$BIN/publish-github-artifact"; ln -sfn "$ROOT/verify-artifact.sh" "$BIN/verify-github-artifact"; ln -sfn "$ROOT/complete-artifact-publication.sh" "$BIN/complete-github-artifact"
PROFILE="$HOME/.zprofile"; touch "$PROFILE"; grep -Fq 'export PATH="$HOME/bin:$PATH"' "$PROFILE"||printf '\n# GitHub artifact publication commands\nexport PATH="$HOME/bin:$PATH"\n' >>"$PROFILE"
PATH="$HOME/bin:$PATH" publish-github-artifact --self-test >&3 2>&1||blocked "Self-test после установки не пройден." "Откройте журнал и передайте его агенту."
printf 'УСТАНОВЛЕНО: %s\n' "$BIN"; pass
