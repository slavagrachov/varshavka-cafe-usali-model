#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "$0")/.."&&pwd)"; P=0; F=0; TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
ok(){ echo "ok - $1"; P=$((P+1)); }; no(){ echo "not ok - $1"; F=$((F+1)); }
for f in "$ROOT"/*.sh "$ROOT/lib/common.sh"; do bash -n "$f"||no "syntax $f"; done; ok "01 Markdown and shell syntax"
mkdir -p "$TMP/z/xl"; echo x >"$TMP/z/xl/workbook.xml"; (cd "$TMP/z"&&zip -qr "$TMP/a.xlsx" .); printf '%%PDF-1.4\n%%%%EOF\n' >"$TMP/a.pdf"; printf '\x89PNG\r\n\x1a\nrest' >"$TMP/a.png"; (cd "$TMP/z"&&zip -qr "$TMP/a.zip" .)
val(){ GITHUB_ARTIFACTS_HOME="$ROOT" bash -c 'source "$1/lib/common.sh"; init_log t; validate_artifact "$2" "$3"' _ "$ROOT" "$1" "$2" >/dev/null 2>&1; }
for x in 'XLSX:a.xlsx:xlsx' 'PDF:a.pdf:pdf' 'PNG:a.png:png' 'ZIP:a.zip:zip'; do IFS=: read -r n f t<<<"$x"; val "$TMP/$f" "$t"&&ok "format $n"||no "format $n"; done
val "$TMP/missing" pdf&&no "06 missing"||ok "06 missing"; echo bad >"$TMP/bad.xlsx"; val "$TMP/bad.xlsx" xlsx&&no "07 corrupted"||ok "07 corrupted"
grep -q 'gh auth status' "$ROOT/lib/common.sh"&&ok "08 auth"||no "08 auth"; grep -q 'git clone' "$ROOT/lib/common.sh"&&ok "09 clone"||no "09 clone"; grep -q 'checkout -b' "$ROOT/publish-artifact.sh"&&ok "10 branch"||no "10 branch"; grep -q 'status --porcelain' "$ROOT/lib/common.sh"&&ok "11 dirty tree"||no "11 dirty tree"; grep -q 'Найдено несколько файлов' "$ROOT/lib/common.sh"&&ok "12 ambiguous"||no "12 ambiguous"; grep -q 'SHA-256 не совпадает' "$ROOT/verify-artifact.sh"&&ok "13 SHA"||no "13 SHA"; grep -q -- '--draft' "$ROOT/publish-artifact.sh"&&grep -q 'gh pr ready' "$ROOT/complete-artifact-publication.sh"&&ok "14 draft gate"||no "14 draft gate"; grep -q 'Post-merge verification не пройдена' "$ROOT/complete-artifact-publication.sh"&&ok "15 post-merge block"||no "15 post-merge block"
printf 'TESTS_PASS=%s\nTESTS_FAIL=%s\n' "$P" "$F"; [[ $F -eq 0 ]]
