# VARSHAVKA Excel compatibility standard

## Profile

The mandatory default profile for owner-facing workbooks is
`MAC_EXCEL_LTSC_2021_SAFE`.

Reference client: Microsoft Excel for Mac 16.111.2, Office LTSC Standard for
Mac 2021. The accepted reference artifact is
`VARSHAVKA_MENU_COSTING_TECH_CARDS_31_MAC_LTSC2021_v3.0.13.xlsx`.

## Formation rules

1. Use ordinary formatted ranges instead of structured Excel Tables.
2. Use worksheet AutoFilters covering the populated range.
3. Remove empty DrawingML parts and their relationships.
4. Remove optional worksheet extension lists not required by package content.
5. Preserve values, formulas, styles, freeze panes, validation and print areas.
6. Never replace unknown values with zero during compatibility conversion.

The postprocessor enables these controls by default. Explicit controls are:

- `ISSUE80_PLAIN_RANGES=1`;
- `ISSUE80_LEGACY_MAC=1`.

## Release gate

A workbook is not owner-ready until the compatibility verifier confirms:

- valid ZIP/OOXML package;
- exact 17 worksheets;
- zero structured table parts;
- zero drawing parts;
- 17 worksheet AutoFilters;
- exact 270 formulas for the Issue 80 S02 workbook;
- no literal `#REF!`, `#DIV/0!` or `#VALUE!` errors;
- successful reopen by at least one independent spreadsheet engine;
- manual opening on the reference Mac Excel client for a new generator version.

The manual client check is required because server-side engines cannot prove
compatibility with every Microsoft Excel build.
