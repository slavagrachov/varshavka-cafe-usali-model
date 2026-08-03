# Final Independent Verification Report — Issue #82 remediation RC1

## 1. Verdict

**`FAIL` — PR #83 is not merge-ready.**

The exact frozen subject candidate `49cd9f4bd896ea11dc8afbce3a93539f761b52a6`
passes the independent 28/101/17 structural, arithmetic, workbook, external
recalculation and visual tests described below. However, RC1 contains two new
internal S2 verification/publication defects (`IV-016`, `IV-017`). In addition,
the known subject blockers `IV-002/S1` and `IV-003`, `IV-004`, `IV-006`,
`IV-007/S2` remain open. `PASS` is therefore prohibited, and the internal RC1
defects require a corrected RC2 rather than acceptance of RC1 as the final
remediation result.

This report does not approve recipes, technological cards, prices, nutrition
release, food safety, equipment, merge or Issue closure.

## 2. Exact verification object

- Repository: `slavagrachov/varshavka-cafe-usali-model`.
- Issue / PR: `#82` / draft `#83`.
- Branch: `agent/issue-82-menu-docs`.
- Governance: `MULTI_AGENT_GOVERNANCE_VARSHAVKA.md v1.1.0 / Approved`.
- `candidate_sha`: `49cd9f4bd896ea11dc8afbce3a93539f761b52a6`.
- Candidate tree: `b4f80f50d9e6e798354548a5aeb0eb64c344deb2`.
- Candidate parent: `ea5cc046e2be046e4f4c9f3ba3b72f30a469aa20`.
- Base `main`: `1573dc616ead7244146c8601cf61cd3c82d3c46e`.
- Workbook blob: `c8e4c5a9fbbad70121a7717a4395b0efb7a1b823`.
- Workbook SHA-256: `38462a6df3c9c429e17bc759fb522f4fb6aee7c28c378d8e421c0441a14ac382`.
- Recipe blob: `c6b22ad5f2812cc989a0d3593f40e21207da8f53`.
- VSF blob: `ab0f20fb7bbc68981bf307d8c817d6d2d983bdfb`.
- Verifier: `/root/final_independent_verifier`; no remediation authorship.
- Verification time: `2026-08-03T16:17:36Z`.

The candidate was checked from a detached worktree. No candidate/domain,
workbook, Defect Register or PR-body file was edited by the verifier.

## 3. Independent exhaustive checks

| Area | Independent result | Acceptance meaning |
|---|---|---|
| Recipes and mass balance | 253 lines; exact 28-dish scope; 28/28 gross, net, projected output, losses and target output independently summed; `PASS_DRAFT_ARITHMETIC` 28/28 | Arithmetic only; recipes remain `0.1.0-DRAFT`, Chef approval and weighed control cooks 0/28 |
| Mandatory TECH_CARDS fields | Six separate fields plus six statuses present and non-empty for 28/28: application scope, raw-material requirements, preparation, tolerances, organoleptics, storage/realization | Structural remediation passes; all cards remain assumptions/drafts/blocked, approved 0/28 |
| Evidence costing | 28/28 cards present; complete food cost, spoilage, kitchen COGS, packaging/other variable and complete portion COGS remain blank; approval `DRAFT_NOT_APPROVED` | Correct blocker preservation; evidence-complete COGS 0/28 |
| Scenario costing | 28/28 LOW_CONFIDENCE rows independently recomputed: evidence component + proxy component, 1.5% spoilage and scenario kitchen COGS | Planning assumptions only; procurement block remains open |
| Evidence channel economics | All 101 unique dish×channel rows checked; project price, evidence food cost/margin/contribution and tax/commission inputs remain blank where unapproved | Owner-approved project prices 0/101 |
| Scenario channel economics | All 101 rows independently recomputed for scenario price, food-cost ratio, gross margin and contribution | `ASSUMPTION_BLOCKED_PENDING_VALIDATION`; tax/commission excluded and blank |
| Nutrition | 28/28 records; 113 ingredients; exact recipe blob/version lock; 112 headline sums and 336 declared-output/per-100g/sale-portion relationships recomputed; sensitivity ordering checked | Calculated draft 28/28; laboratory confirmed 0/28; release-ready 0/28 |
| Food safety | Exact recipe and VSF lock 28/28; allergens present; 28/28 veto `BLOCK`; 112/112 dish critical fields null; all 140 CCP rows and blockers checked | Safety release 0/28; `IV-002/S1` remains open |
| Equipment and capacity | 28 resource cards; 155/155 operations mapped; 28 one-recipe planning scenarios; selected manufacturer/model/passport claims 0; 151 selected-model/site blocks + 4 requirement-code blocks | Passport-backed suitability 0/28; actual demand/capacity proof 0/28 |
| Workbook | Exact 17 sheets/order; `freeze_panes`: `A13` on passport and `A6` on other 16; 809 formulas; 4 data validations; automatic full calculation flags; 0 formula-error literals | `IV-009` technical fix passes |
| Visual | Artifact render generated for all 17 sheets; full-sheet contact review plus focused passport, tech-card and Gate-D review; no new clipping/broken-chart/default-sheet defect | Prior `IV-008` remains resolved |
| Scope | 113 files differ from base; every path is inside the approved Issue #82 package, workflow, builder, QA, handoff or exact register-sync allowlist | No out-of-scope file found |

## 4. External workbook recalculation and formula reactivity

LibreOffice was available and used against isolated copies and isolated user
profiles. The frozen workbook itself was not changed.

- Engine: headless LibreOffice/Calc through the bundled `soffice` executable.
- External-recalculated copy SHA-256:
  `b191006a9d999925c7bcf7f8ab3f3678d49e286283d64345f73c095ca1cacbe9`.
- Formulas preserved: 809.
- External Gate D: 17/17 `PASS`.
- External formula-error scan: 0 occurrences of `#REF!`, `#DIV/0!`,
  `#VALUE!`, `#NAME?`, `#N/A`, `#NUM!`, `#NULL!`.
- Null guard: incomplete complete-COGS output stayed blank.
- Reactivity probe on a separate test copy: increasing
  `04_КАЛЬКУЛЯЦИИ!F6` by `1.00` increased `G6` by exactly `1.00`; all 17
  Gate-D checks remained `PASS`.
- Reactive copy SHA-256:
  `1c10c61267d4bd59f2bf62512d3ecc8c4f4706a21158b1e764c1886b59a6516b`.

The original file contains formulas and requests full recalculation on open;
cached formula results are not stored in the frozen binary. The successful
external recalculation satisfies the exact-head external-engine requirement.

## 5. GitHub workflow evidence

The Issue #82-specific workflow exists at blob
`b83bd1d9549150957b0116f859504cab4776b02d` and succeeded on the exact
candidate SHA:

- `Validate Issue 82 menu package`, run
  [30830497424](https://github.com/slavagrachov/varshavka-cafe-usali-model/actions/runs/30830497424),
  run #4, `completed/success`;
- exact associated head: `49cd9f4bd896ea11dc8afbce3a93539f761b52a6`;
- job `91742943231`, `issue-82-package-qa`, success;
- costing/proxy-scope, cross-domain 28-dish integration and exact 28/101/17
  workbook steps all succeeded.

Runs `30830497490` (investment register) and `30830497336` (S03) also
succeeded on the exact head but do not constitute Issue #82 acceptance.

## 6. Defect disposition against RC1

The verifier did not edit `DEFECT_REGISTER.csv` (candidate blob
`a64789c40e86733d45f23f2381ca5c56bd977ecd`). Dispositions below are the
independent evidence for the Orchestrator's next controlled update.

| Defect | RC1 disposition | Basis |
|---|---|---|
| IV-001 / S1 | `VERIFIED_REMEDIATED` for the version-lock defect only | Exact recipe version/blob and VSF blob on 28/28; does not close safety veto IV-002 |
| IV-002 / S1 | `OPEN_BLOCKING` | Safety veto `BLOCK` 28/28; 112 critical values null; validation evidence absent |
| IV-003 / S2 | `OPEN` | Four `REQ-BAK-PREP` requirement-code operations remain non-CAPEX gaps |
| IV-004 / S2 | `OPEN_BLOCKING` | Evidence-complete COGS 0/28 and approved prices 0/101 |
| IV-005 / S2 | `VERIFIED_REMEDIATED` for calculation completeness only | All 28 calculated and independently recomputed; laboratory/release block remains explicit |
| IV-006 / S2 | `OPEN_BLOCKING` | Passport, availability/connections, approved demand and actual capacity evidence absent |
| IV-007 / S2 | `OPEN` | VSF make/buy/variant decisions and VSF safety validation remain open |
| IV-008 / S3 | `REMAINS_RESOLVED` | No visual regression found across 17 sheets |
| IV-009 / S3 | `VERIFIED_REMEDIATED` | Meaningful non-null freeze panes 17/17 and automated exact assertion |
| IV-010 / S2 | `VERIFIED_REMEDIATED` | Six fields and per-field statuses present 28/28 |
| IV-011 / S2 | `VERIFIED_REMEDIATED` | `364/364` is explicitly structural, not substantive completion |
| IV-012 / S2 | `VERIFIED_REMEDIATED` | Canonical readiness taxonomy separates evidence, scenario, blocked and Owner/Chef states |
| IV-013 / S2 | `NOT_CLOSED` | Register/comments are semantically honest but still cite pre-freeze `e3bdbe8…` / run `30829944096`; exact RC1 outcome is not synchronized |
| IV-014 / S2 | `VERIFIED_REMEDIATED` | Exact-head profile run `30830497424` succeeded |
| IV-015 / S2 | `NOT_CLOSED` | PR body is honest about substantive readiness but its CI evidence still names the pre-freeze head/run and final verdict `PENDING` |

### New RC1 defects

| ID | Severity | Finding | Evidence | Required correction |
|---|---|---|---|---|
| IV-016 | S2 | Committed independent-verification script is stale and cannot verify RC1 | Script blob `bf58b6c22d12684d58a50d75a91d05b5189add99`; execution exits 1 with `Frozen RC hash mismatch`; it hardcodes old workbook SHA `914a70…`, old `46+22=68` price partition and expects `source_recipe_version=null` | Update the independent verification automation for the current evidence layer/version lock; include it in the profile workflow or clearly retire/version the historical script; run on RC2 |
| IV-017 | S2 | Canonical readiness/PR/GitHub synchronization does not identify the exact frozen RC1 evidence | `READINESS_STATUS_REPORT.md` blob `15f399…`, PR body and comments cite `e3bdbe8…` / `30829944096`, while exact RC1 is `49cd9f4…` / `30830497424` | Update canonical readiness, PR body and linked Issue/PR status attestations to exact RC2 SHA/run and the final verifier verdict |

Because the candidate is frozen, these findings are not inserted into its
Defect Register by the IndependentVerifier. They must be registered and owned
by the Orchestrator in RC2 without rewriting this report's RC1 history.

## 7. Readiness conclusion

| Dimension | RC1 conclusion |
|---|---|
| Structural coverage | Pass: 28/28 positions, 364 controlled matrix cells, 17 sheets |
| Substantive readiness | Not ready: approved recipes 0/28, evidence COGS 0/28, approved prices 0/101 |
| Assumption/scenario results | Available and arithmetically verified: nutrition 28/28; proxy COGS 28/28; proxy channel rows 101/101 |
| Blocked results | Safety 28/28, evidence economics, nutrition release, equipment passports/actual capacity |
| Owner/Chef Gate | `NOT_READY`; decision packs exist, but decisions/evidence/tests are not completed |
| Final RC1 verification | `FAIL` due to IV-016 and IV-017; not merge-ready |

## 8. Required next step and prohibitions

Exact next step: Orchestrator registers `IV-016/S2` and `IV-017/S2`, assigns
owners, creates a corrected frozen RC2, obtains a new exact-head Issue #82
workflow success and submits RC2 to a separate IndependentVerifier. Subject
blockers remain open and must not be replaced with invented data.

Until separate Owner authorization and a later acceptable gate:

- do not merge PR #83;
- do not close Issue #82 or Issue #80;
- do not merge or close PR #81;
- do not call PR #81 `SUPERSEDED` as a closure action;
- do not declare technological cards, recipes, prices, nutrition, safety or
  equipment approved;
- do not create new Issues or begin Issue #80;
- do not publish proxy scenario values as evidence-backed COGS or approved
  selling prices.

