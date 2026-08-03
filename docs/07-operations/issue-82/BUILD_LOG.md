# BUILD LOG — Issue #82 workbook v2.0.0

- Builder: `releases/builds/build_issue_82_menu_cards.mjs`
- Output: `VARSHAVKA_MENU_COSTING_TECH_CARDS_DRAFT_v2.0.0.xlsx`
- Build date / data cut-off: 2026-08-03
- Runtime: Codex primary runtime Node + `@oai/artifact-tool`
- Scope: 28 dishes (`VKM-001…VKM-025`, `VKM-029…VKM-031`); `VKM-026…VKM-028` excluded.

## Reproducible build sequence

1. Parsed and schema-checked all Issue #82 CSV inputs.
2. Enforced HOF-0005 v0.2.1 only: 46 accepted observations; 22 rejected observations excluded.
3. Enforced 28 safety vetoes, 28 nutrition-null records, and blank complete COGS/channel outputs.
4. Built the exact 17-sheet workbook twice from the same inputs; both runs returned the same sheet/data/formula/check results.
5. The binary SHA-256 differs between artifact-tool exports because generated internal relationship/table IDs are non-deterministic. This does not affect workbook content. After CR-0002, the final artifact SHA-256 is `914a70c4c5ba67c8cba1750a17c667157bdf97b79e0b2ea5da7ef64a114cc0b6`; rebuilds should be compared semantically, not byte-for-byte.
6. Rendered all 17 sheets and completed a visual pass.
7. Recalculated a copy with LibreOffice and re-imported it for artifact-tool inspection.
8. Re-ran `scripts/qa_issue_82_integration.py`: `gate_c=PASS_WITH_CONDITIONS`.

## CR-0002 / IV-008

- IndependentVerifier defect: `15_ПРОВЕРКИ!A31:A47` clipped long required sheet names.
- Resolution: column A width increased from 18 to 38 and wrapping enabled for A31:A47 only.
- Exact names, formulas, checks and subject data were preserved.
- Artifact error/check scan, render comparison and LibreOffice re-inspection passed after the change.

## Final build facts

- 17 worksheets, 28 dishes, 253 recipe lines, 34 VSF cards, 42 DAG edges.
- 20 structured tables, 803 formula cells, 7 validation rules, 28 conditional-format rules.
- Filters are present on the working tables; header-freeze operations are declared in the builder. Logical print/used ranges are listed on `15_ПРОВЕРКИ` because the artifact-tool version used does not expose a documented print-area API.
- No common formula error token found.

## Gate D

`PASS_WITH_CONDITIONS`: workbook construction, formula, external-recalc, data and visual controls passed. Release approval remains blocked by the preserved safety, costing, nutrition, capacity and Chef/Owner conditions.
