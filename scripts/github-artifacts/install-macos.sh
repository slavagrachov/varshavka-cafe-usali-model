#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
source "$ROOT/lib/common.sh"
init_log install

need_cmd git
need_cmd gh
gh auth status -h github.com >&3 2>&1 || blocked "GitHub CLI не авторизован." "Выполните gh auth login."

# GitHub Contents API may not preserve executable bits. The installer must
# therefore make repository scripts executable explicitly.
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

create_wrapper publish-github-artifact "$ROOT/publish-artifact.sh"
create_wrapper verify-github-artifact "$ROOT/verify-artifact.sh"
create_wrapper complete-github-artifact "$ROOT/complete-artifact-publication.sh"

PROFILE="$HOME/.zprofile"
touch "$PROFILE"
grep -Fq 'export PATH="$HOME/bin:$PATH"' "$PROFILE" || printf '\n# GitHub artifact publication commands\nexport PATH="$HOME/bin:$PATH"\n' >>"$PROFILE"

PATH="$HOME/bin:$PATH" "$BIN/publish-github-artifact" --self-test >&3 2>&1 || \
  blocked "Self-test после установки не пройден." "Откройте журнал и передайте его агенту."

printf 'УСТАНОВЛЕНО: %s\n' "$BIN"
pass
