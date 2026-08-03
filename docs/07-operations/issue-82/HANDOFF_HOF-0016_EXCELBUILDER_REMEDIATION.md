# HOF-0016 — ExcelBuilder remediation handoff

## Identification

- Session: `VAR-ISSUE-82-S02-REMEDIATION`.
- Issue / draft PR: #82 / #83.
- Role: separate ExcelBuilder `/root/excel_builder_remediation`.
- Exact frozen domain input head: `9efd2de7ffe2092d40419f9d93dff73fcb1eec34`.
- ExcelBuilder package commit: `1412d181e6ccc0b169538054a72485b24224f6cc`.
- Sender decision: `STRUCTURAL_PASS_READY_FOR_INDEPENDENT_RETEST`.
- Subject-matter decision: unchanged; evidence, Owner/Chef, safety and equipment gates remain binding.

## Exact workbook identity

- File: `VARSHAVKA_MENU_COSTING_TECH_CARDS_DRAFT_v2.0.0.xlsx`.
- Git blob SHA: `c8e4c5a9fbbad70121a7717a4395b0efb7a1b823`.
- Binary SHA-256: `38462a6df3c9c429e17bc759fb522f4fb6aee7c28c378d8e421c0441a14ac382`.
- Determinism: two consecutive final builds produced that exact SHA-256.

## Inputs consumed without readiness promotion

| Handoff | Workbook treatment |
|---|---|
| HOF-0011 | Six mandatory technology fields and their statuses displayed separately for 28/28 |
| HOF-0012 | Exact recipe blob displayed; 28/28 `BLOCK`; 112 unsupported numeric safety fields blank |
| HOF-0013 | 28/28 calculated nutrition records and sensitivity displayed; 28 release blocks and 0 lab confirmations preserved |
| HOF-0014 v1.1 | Evidence layer kept blank where incomplete; separate 28-dish/101-channel LOW_CONFIDENCE proxy scenario displayed |
| HOF-0015 | 155 mappings and 28 planning capacity rows displayed; passports, site status and suitability remain blocked |

## QA result

- exact sheet names/order: 17/17 PASS;
- exact non-null freeze panes: 17/17 PASS (`00_ПАСПОРТ=A13`; other 16 sheets `A6`);
- workbook Gate D assertions: 17/17 PASS;
- formula cells: 809; common formula-error literals: 0;
- null/zero guard and formula-reactivity probe: PASS;
- structured/filterable tables: 23; data-validation rules: 4;
- scope: 28 dishes; 253 recipe lines; 28 evidence cost rows; 28 isolated proxy COGS rows; 101 evidence channel rows; 101 isolated proxy channel rows;
- nutrition: 28 rows × 16 displayed numeric fields; release block 28/28;
- safety: veto 28/28; unsupported numeric blanks 112/112; recipe blob lock 28/28;
- equipment: 155 operation mappings; 28 capacity-scenario rows;
- renders: 17/17 generated and inspected; visual verdict PASS;
- cross-domain QA: `gate_c=PASS_WITH_CONDITIONS`;
- CostingPricing QA: PASS; evidence complete COGS 0/28 and project prices 0/101 remain openly blocked.

## Exact owned artifacts

| Artifact | Blob SHA |
|---|---|
| `.github/workflows/validate-issue-82-menu-package.yml` | `b83bd1d9549150957b0116f859504cab4776b02d` |
| `BUILD_LOG.md` | `e91e98af4c9cce46f84fe0d1b53d16f4a0a23646` |
| `DATA_DICTIONARY.md` | `a6b403894b6d1ff9598dabcb87cea7aae9a2d750` |
| `FORMULA_QA_REPORT.md` | `80097f535f3b293d9eedef716a6a066c5551626f` |
| workbook | `c8e4c5a9fbbad70121a7717a4395b0efb7a1b823` |
| `VISUAL_QA_REPORT.md` | `ffb79ffe39ba79e7abadce7c621c799910900fc9` |
| `releases/builds/build_issue_82_menu_cards.mjs` | `629af585841f5d8175fbdc74b2ef216c8fab3bdc` |
| `scripts/qa_issue_82_integration.py` | `6812f169a5cbb6ccd28be2f6cf45677b4e3f9b86` |
| `scripts/qa_issue_82_workbook.py` | `4dadedff5a8aa633ae5d4aecb1f72758b18e9eef` |

## Defect disposition submitted to IndependentVerifier

| Defect | Sender disposition | Evidence / remaining condition |
|---|---|---|
| IV-009 / S3 | `READY_FOR_IV_RETEST` | 17/17 exact freeze panes plus automated assertion |
| IV-010 / S2 | `READY_FOR_IV_RETEST` for workbook/schema surface | Six fields/statuses are present for 28/28; substantive DRAFT/BLOCKED decisions remain honestly open |
| IV-014 / S2 | `READY_FOR_CI_RUN_AND_IV_RETEST` | Issue #82 workflow exists; closure requires successful GitHub Actions run on the exact published RC head |
| IV-005 / S2 | `READY_FOR_IV_RETEST` | 28/28 nutrition calculations are surfaced; release/lab validation remains blocked |
| IV-004 / S1 | `OPEN` | Complete evidence COGS 0/28 and project price 0/101 remain absent; proxy scenario cannot close the defect |
| IV-002 / S1 | `OPEN` | Safety veto remains `BLOCK` 28/28 |
| IV-006 / S2 | `OPEN` | Demonstrated equipment suitability/capacity remains 0/28 without passports/site/timed tests |

## External recalculation limitation

The build engine recalculated the workbook before export, the saved package requests automatic full recalculation, and formula/error/null-guard checks pass. LibreOffice is not installed in this environment. IndependentVerifier must open/recalculate the exact blob in Excel or LibreOffice and confirm that evidence blanks remain blank and all 17 checks remain PASS. No external-recalc claim is made by ExcelBuilder.

## Receiver rules

1. Integrate only the exact package commit and this handoff.
2. Do not replace blank evidence inputs with proxy values or zeros.
3. Do not treat structural Gate D PASS as subject-matter readiness.
4. Run the Issue #82 workflow on the exact published RC head; an existing workflow without a successful run does not close IV-014.
5. IndependentVerifier must retest all 17 sheets and exact workbook blob; ExcelBuilder does not self-close defects.
