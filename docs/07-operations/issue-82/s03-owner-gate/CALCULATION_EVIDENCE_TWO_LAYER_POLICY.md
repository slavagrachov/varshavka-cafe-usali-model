# VARSHAVKA — двухслойная политика расчётов и доказательств

Version: `1.0.0-DRAFT`  
Scope: 31 menu positions  
Status: `BINDING_METHOD / NO_SUBJECT_APPROVAL`

## Rule

The model contains two separate layers:

1. `CALCULATION`: planning scenario or analytical estimate;
2. `EVIDENCE`: result based only on accepted documents, measurements and profile decisions.

Numeric completeness of `CALCULATION` never promotes a value to `EVIDENCE`.

| Attribute | CALCULATION | EVIDENCE |
|---|---|---|
| Inputs | CALCULATED, ASSUMPTION, DRAFT, public proxy | accepted FACT plus approved formula |
| Raw price | retail benchmark/proxy | exact SKU plus valid quotation/invoice and landed terms |
| Yield | project value | measured and Chef-accepted |
| Safety | not a substitute for a limit | PPK/HACCP validation evidence |
| Capacity | planning estimate | passport, site evidence and timed test |
| COGS | scenario COGS | complete evidence COGS |
| Sales price | scenario/model price | Owner-approved dish×channel price |
| Removes blocker/veto | never | only after profile review |

## Technical controls

- Separate fields/tables; no `COALESCE(evidence, proxy)` in an evidence result.
- `null` means unknown; `0` requires a documented zero.
- Store value, unit, data status, approval status, source/version/date, owner, formula version and source SHA.
- A changed recipe, SKU, route, equipment or source invalidates dependent outputs.
- Issue #82 proxy rows remain planning-only; S04 breakfast values remain approved model inputs with preliminary procurement.
- The 31-row and 104-row bridges are model imports, not costing evidence.
- IndependentVerifier alone may confirm a frozen evidence candidate.
