# INDEPENDENT VERIFICATION REPORT — Issue #80 S02

- Agent ID: /root/independent_verifier
- Frozen workbook SHA-256: a8d394811f2aa70668ee715118280b06661dd4cb31a6e84497b12d6c08c21433
- Verdict: PASS_FOR_CHEF_REVIEW / SUBJECT_EVIDENCE_OPEN

## Gate E

- exact 31/31 codes across core and resource datasets: PASS;
- 104/104 unique position × channel keys: PASS;
- permanent IDs and DAG (37 records, 45 edges; no orphan, missing child or cycle): PASS;
- nonnegative masses/prices and gross at least net for compatible units: PASS;
- 17 sheets, freeze panes, filters and full print areas: PASS;
- 10 validation rules; 270 formulas; no formula errors: PASS;
- CSV to XLSX reconciliation: PASS;
- unknown evidence direct COGS remains blank, not zero: PASS;
- channel food-cost semantics normalized to kitchen COGS / price for 104/104; source ratios retained separately: PASS;
- Issue #82 defects IV-002/S1, IV-003/S2, IV-004/S2, IV-006/S2, IV-007/S2 remain OPEN / NOT_TRANSFERRED_NOT_CLOSED: PASS;
- evidence/model separation and safety veto: PASS.

## Independent engine

LibreOffice Calc opened and saved an isolated copy of the exact frozen workbook. Output SHA-256:
542611a3a4217e97c51d21bceef356c4c11a611d6c35c9d6b24d31a9538b44e9.
The recalculated copy contains 17 sheets, 270 formulas and zero formula-error values.

## Manual recalculations

- VKM-001: food 226.667812, kitchen COGS 230.067829;
- VKM-005: food 16.949340, kitchen COGS 17.203580;
- VKM-018: food 99.788792, kitchen COGS 101.285624;
- VKM-026: kitchen 131.2826677778, direct 191.2826677778;
- VKM-031: batch kitchen 253.324424, comparable sale unit 25.3324424.

The package is suitable for line-by-line Chef review only. It is not recipe approval, production release, evidence COGS approval, safety release, merge authorization or Issue closure.
