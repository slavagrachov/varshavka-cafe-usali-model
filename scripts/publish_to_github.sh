#!/usr/bin/env bash
set -euo pipefail

REPO="slavagrachov/varshavka-cafe-usali-model"
MODEL="models/FINMODEL_VARSHAVKA_USALI_2026-2027_v0.1.0.xlsx"

command -v gh >/dev/null || { echo "Install GitHub CLI: https://cli.github.com/"; exit 1; }
gh auth status >/dev/null || { echo "Run: gh auth login"; exit 1; }

if gh repo view "$REPO" >/dev/null 2>&1; then
  echo "Repository already exists: $REPO"
else
  gh repo create "$REPO" --private --source=. --remote=origin --push
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "git@github.com:${REPO}.git"
fi

git push -u origin main
git push origin v0.1.0

if gh release view v0.1.0 --repo "$REPO" >/dev/null 2>&1; then
  echo "Release v0.1.0 already exists"
else
  gh release create v0.1.0 "$MODEL" \
    --repo "$REPO" \
    --title "VARSHAVKA Cafe USALI Model v0.1.0" \
    --notes-file docs/08-releases/v0.1.0.md
fi

echo "Published: https://github.com/$REPO"
