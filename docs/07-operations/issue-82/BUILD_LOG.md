# BUILD LOG — Issue #82 workbook v2.0.0 remediation RC

- Builder: `releases/builds/build_issue_82_menu_cards.mjs`
- Output: `VARSHAVKA_MENU_COSTING_TECH_CARDS_DRAFT_v2.0.0.xlsx`
- Frozen domain input head: `9efd2de7ffe2092d40419f9d93dff73fcb1eec34`
- Build date / data cut-off: 2026-08-03
- Runtime: Codex primary runtime Node + `@oai/artifact-tool`; Python 3 + `openpyxl`
- Scope: 28 dishes (`VKM-001…VKM-025`, `VKM-029…VKM-031`); `VKM-026…VKM-028` excluded.

## Accepted handoffs consumed

- HOF-0011: six mandatory technology-card fields and statuses.
- HOF-0012: recipe-blob-locked safety profiles; 28/28 vetoes remain `BLOCK`.
- HOF-0013: 28/28 calculated nutrition records with sensitivity and release locks.
- HOF-0014 v1.1: evidence economics plus a separately labelled proxy scenario.
- HOF-0015: equipment mapping and planning capacity scenario with passport/site blockers.

## Reproducible build sequence

1. Schema/scope contracts are checked before workbook creation.
2. The exact 17 sheets are created in their required order.
3. Evidence economics blanks are preserved; proxy scenario COGS (28) and channel metrics (101) are placed in separate tables.
4. The exact nutrition, safety and equipment handoff statuses are carried into the workbook without readiness promotion.
5. The OOXML post-processor sets the explicit 17-sheet freeze map, automatic/full recalculation flags and canonical package metadata/order.
6. Two consecutive final builds produced the same binary SHA-256: `38462a6df3c9c429e17bc759fb522f4fb6aee7c28c378d8e421c0441a14ac382`.
7. All 17 sheets were rendered and visually inspected.

## Final build facts

- 17 worksheets; freeze panes 17/17 (`00_ПАСПОРТ=A13`, all others `A6`).
- 23 structured/filterable tables; 809 formula cells; 4 data-validation rules; 18 conditional-format ranges.
- 28 dishes; 253 recipe lines; 34 VSF cards; 42 DAG edges.
- 28 evidence cost cards with complete evidence COGS still blank; 28 isolated proxy COGS rows.
- 101 evidence channel rows with project price still blank; 101 isolated proxy-scenario rows.
- 28 nutrition rows with 16 displayed calculated numeric fields; 28 release blocks; 0 laboratory-confirmed rows.
- 28 safety profiles; 28 `BLOCK`; 112 unsupported numeric safety cells blank.
- 155 equipment mappings; 28 capacity sensitivity rows; selected passport/suitability remains blocked.
- Formula error literal scan: 0.

## External recalculation note

The artifact runtime recalculated formulas during construction, and the saved package is flagged `calcMode=auto`, `fullCalcOnLoad=true`, `forceFullCalc=true`. LibreOffice is not installed in this execution environment, so no claim of a LibreOffice run is made. Exact external Excel/LibreOffice opening/recalculation remains an IndependentVerifier retest item; unknown evidence inputs are expected to remain blank after recalculation.

## Gate D

`STRUCTURAL PASS`. Subject-matter readiness remains blocked/conditional exactly as stated by the domain handoffs. This workbook is not an approved technological, safety, pricing or production release.
