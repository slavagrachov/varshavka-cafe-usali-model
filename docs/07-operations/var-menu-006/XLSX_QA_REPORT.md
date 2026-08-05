# XLSX QA Report — Issue #106

## File

`VKM-006_TOMATO_CIABATTA_CHEF_MANAGER_APPROVAL_DRAFT_v1.0.1.xlsx`

## Structure

- `КАЛЬКУЛЯЦИЯ`
- `ТЕХКАРТА`
- `АНКЕТА`

Exactly three sheets: `PASS`.

## Formula QA

- `#REF!`: 0
- `#NAME?`: 0
- `#DIV/0!`: 0
- `#VALUE!`: 0
- `#N/A`: 0

## Functional checks

- V1/V2 scenarios: `PASS`
- Paste water deducted from base water: `PASS`
- Cross-sheet references: `PASS`
- Project price 120 RUB: `PASS`
- Unknown values are not replaced with zeros: `PASS`
- Round-trip open/save/open: `PASS`
- Visual review: `PASS`

## Status

`PASS_FOR_PUBLICATION_VERIFICATION`

The workbook is not `APPROVED` and not `READY_FOR_PRODUCTION`.
