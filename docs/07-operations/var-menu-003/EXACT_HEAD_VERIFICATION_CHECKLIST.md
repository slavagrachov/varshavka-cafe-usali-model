# Exact-head verification checklist — PR #95

- Confirm PR head SHA after publication commit.
- Confirm XLSX path exists.
- Confirm temporary `.github/tmp/vkm003_xlsx/` is absent.
- Confirm `.github/workflows/publish-vkm003-xlsx.yml` is absent.
- Confirm workbook blob matches expected Git blob SHA.
- Confirm SHA-256 from local source: `c550ba53962dea5a1e1f341fa200ae3eacefda07e1a5b71a07688951f5687de5`.
- Confirm PR remains draft and unmerged.
