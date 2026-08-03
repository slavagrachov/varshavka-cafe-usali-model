# S03 Owner Gate package QA report

Timestamp: 2026-08-03T19:30:00Z  
Package data head: `b9b83a9adf64a47c6a1ad6c790471c05935cde57`  
Status: `PASS_STRUCTURE / SUBJECT_EVIDENCE_OPEN`

## Checks

| Check | Result |
|---|---:|
| Financial-model bridge rows | 31 |
| Unique position codes | 31 |
| Exact code set VKM-001…VKM-031 | PASS |
| Channel bridge rows | 104 |
| Unique position×channel keys | 104 |
| Evidence-coverage rows | 31 |
| Evidence fields in calculation bridges | all blank |
| Evidence/RFQ/quotation/dispatch registers | headers only |
| Issue #82 formula: model food + model spoilage = model kitchen COGS | 28/28 PASS |
| Breakfast formula: kitchen + packaging + drink = complete direct cost | 3/3 PASS |
| Weighted breakfast complete direct cost | 203.7999302778 RUB |
| Proxy/model value promoted to evidence | 0 |
| RFQ marked sent | 0 |

The QA result proves schema, grain, arithmetic mapping and non-promotion controls. It does not prove supplier prices, recipes, safety, nutrition, equipment or physical-test results and does not close any defect.
