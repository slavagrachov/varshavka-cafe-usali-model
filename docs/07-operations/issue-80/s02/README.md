# VARSHAVKA Issue 80 S02

31-position package for Chef review. Base cd23852fda61d9ee42dc7bae453e164c8f4d130c. No production approval.

## Excel compatibility

Owner-facing releases use the `MAC_EXCEL_LTSC_2021_SAFE` profile defined in
`docs/01-project/EXCEL_COMPATIBILITY_STANDARD.md`. The validated reference
client is Microsoft Excel for Mac 16.111.2, Office LTSC Standard for Mac 2021.

Build with `scripts/build_issue_80_s02_mac_excel.sh`. The build finishes only
after `scripts/verify_issue_80_excel_compatibility.py` passes. The accepted
reference workbook is
`VARSHAVKA_MENU_COSTING_TECH_CARDS_31_MAC_LTSC2021_v3.0.13.xlsx`.
