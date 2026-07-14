$ErrorActionPreference = "Stop"
$Repo = "slavagrachov/varshavka-cafe-usali-model"
$Model = "models/FINMODEL_VARSHAVKA_USALI_2026-2027_v0.1.0.xlsx"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "Install GitHub CLI from https://cli.github.com/"
}

gh auth status | Out-Null

& gh repo view $Repo *> $null
if ($LASTEXITCODE -ne 0) {
    gh repo create $Repo --private --source=. --remote=origin --push
} else {
    Write-Host "Repository already exists: $Repo"
}

& git remote get-url origin *> $null
if ($LASTEXITCODE -ne 0) {
    git remote add origin "git@github.com:$Repo.git"
}

git push -u origin main
git push origin v0.1.0

& gh release view v0.1.0 --repo $Repo *> $null
if ($LASTEXITCODE -ne 0) {
    gh release create v0.1.0 $Model --repo $Repo --title "VARSHAVKA Cafe USALI Model v0.1.0" --notes-file docs/08-releases/v0.1.0.md
} else {
    Write-Host "Release v0.1.0 already exists"
}

Write-Host "Published: https://github.com/$Repo"
