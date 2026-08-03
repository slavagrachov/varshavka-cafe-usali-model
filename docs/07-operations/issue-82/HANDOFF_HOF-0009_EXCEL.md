# HANDOFF HOF-0009 — ExcelBuilder replacement

- Sender: `/root/excel_builder_replacement` / ExcelBuilder.
- Receiver: Orchestrator, then IndependentVerifier.
- Version/date: `2.0.0-DRAFT` / 2026-08-03.
- Scope: 28 dishes — `VKM-001…VKM-025`, `VKM-029…VKM-031`; `VKM-026…VKM-028` excluded.
- Input decision: HOF-0001…0004, HOF-0005 v0.2.1 only, HOF-0006…0008; all accepted with conditions.

## Delivered files

1. `VARSHAVKA_MENU_COSTING_TECH_CARDS_DRAFT_v2.0.0.xlsx` — exact 17 sheets.
2. `releases/builds/build_issue_82_menu_cards.mjs` — deterministic semantic rebuild.
3. `BUILD_LOG.md`, `FORMULA_QA_REPORT.md`, `VISUAL_QA_REPORT.md`, `DATA_DICTIONARY.md`, `README.md`.

## Preserved controls

- HOF-0005 v0.2.1: 46 accepted price observations; 22 rejected observations excluded from active selections.
- Complete COGS, channel price, food cost and margin are blank.
- Safety veto is `BLOCK` for 28/28.
- Eight nutrition numeric fields are null for 28/28.
- Unknown values are blank/null, not zero.
- VSF topology: 34 cards, 42 edges, no orphan/cycle under Gate C QA.
- Stable `VKM/VKC/VKT` identity and exact scope are retained.

## QA

- Workbook checks: 15/15 PASS.
- Common formula errors: 0 before and after LibreOffice recalc.
- Formula reactivity: PASS.
- All 17 sheets rendered and visually inspected: PASS.
- Integration QA: `gate_c=PASS_WITH_CONDITIONS`.

## Open blockers

`INT-C-002…INT-C-008` remain open as documented. Chef/Owner approval, safety version lock and limits, complete cost inputs, approved channel economics, nutrition mappings, equipment/capacity facts and VSF decisions remain outstanding.

## Gate D decision

`PASS_WITH_CONDITIONS`. The workbook is structurally ready for IndependentVerifier. It is not approved for production, safety release, pricing publication or nutrition declaration.

## CR-0002 addendum — IV-008

- Defect: long exact sheet names in `15_ПРОВЕРКИ!A31:A47` were clipped.
- Fix: widened column A and enabled wrapping on A31:A47 only.
- Verification: before/after render PASS; artifact formula error scan 0; embedded checks 15/15 PASS; LibreOffice recalc and artifact re-inspection PASS.
- Subject data and formulas changed: none.
- Updated workbook SHA-256: `914a70c4c5ba67c8cba1750a17c667157bdf97b79e0b2ea5da7ef64a114cc0b6`.
- IV-008 status: `RESOLVED`.
