#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
source "$ROOT/lib/common.sh"
init_log install

stage() {
  printf 'ЭТАП: %s\n' "$1"
  log "ЭТАП: $1"
}

stage "Проверка Git и GitHub CLI"
need_cmd git
need_cmd gh

stage "Проверка авторизации GitHub"
if ! gh auth status -h github.com 2>&1 | tee -a "$LOG_FILE"; then
  blocked "GitHub CLI не авторизован." "Выполните gh auth login."
fi

stage "Подготовка исполняемых программ"
chmod +x \
  "$ROOT/publish-artifact.sh" \
  "$ROOT/verify-artifact.sh" \
  "$ROOT/complete-artifact-publication.sh" \
  "$ROOT/install-macos.sh"

BIN="$HOME/bin"
mkdir -p "$BIN"

create_wrapper() {
  local command_name="$1"
  local target_script="$2"
  local wrapper="$BIN/$command_name"

  cat >"$wrapper" <<EOF
#!/usr/bin/env bash
exec bash "$target_script" "\$@"
EOF
  chmod +x "$wrapper"
}

stage "Установка коротких команд в $BIN"
create_wrapper publish-github-artifact "$ROOT/publish-artifact.sh"
create_wrapper verify-github-artifact "$ROOT/verify-artifact.sh"
create_wrapper complete-github-artifact "$ROOT/complete-artifact-publication.sh"

stage "Настройка PATH"
PROFILE="$HOME/.zprofile"
touch "$PROFILE"
grep -Fq 'export PATH="$HOME/bin:$PATH"' "$PROFILE" || printf '\n# GitHub artifact publication commands\nexport PATH="$HOME/bin:$PATH"\n' >>"$PROFILE"

stage "Контроль установленной команды"
if ! PATH="$HOME/bin:$PATH" "$BIN/publish-github-artifact" --self-test 2>&1 | tee -a "$LOG_FILE"; then
  blocked "Self-test после установки не пройден." "Передайте агенту путь к журналу, показанный ниже."
fi

printf 'УСТАНОВЛЕНО: %s\n' "$BIN"
pass
