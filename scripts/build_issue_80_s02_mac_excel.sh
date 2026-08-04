#!/usr/bin/env bash
set -euo pipefail

repo_root="${ISSUE80_ROOT:-$(git rev-parse --show-toplevel)}"
out="${ISSUE80_XLSX_OUT:-$repo_root/docs/07-operations/issue-80/s02/VARSHAVKA_MENU_COSTING_TECH_CARDS_31_MAC_LTSC2021_v3.0.13.xlsx}"
tmp_root="${ISSUE80_TMP:-$(mktemp -d)}"

ISSUE80_ROOT="$repo_root" ISSUE80_TMP="$tmp_root" ISSUE80_XLSX_OUT="$out" \
  "${CODEX_PRIMARY_RUNTIME_NODE:-node}" "$repo_root/releases/builds/build_issue_80_s02_workbook.mjs"
ISSUE80_PLAIN_RANGES=1 ISSUE80_LEGACY_MAC=1 \
  python3 "$repo_root/scripts/postprocess_issue_80_s02_xlsx.py" "$out"
python3 "$repo_root/scripts/verify_issue_80_excel_compatibility.py" "$out"
printf '%s\n' "$out"
