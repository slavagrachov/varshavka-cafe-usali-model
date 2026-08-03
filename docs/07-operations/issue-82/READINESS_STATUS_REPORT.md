# Readiness Status Report — Issue #82 remediation RC2

Срез: `2026-08-03`; пакет: draft PR #83.

## 1. Exact-object traceability

| Object | Exact identity | Meaning |
|---|---|---|
| RC2 input data | `candidate_data_sha=0d22ac8d0bb1ab198dcd18da21f3a8b741d186c1` | Exact domain, workbook and IV-016 QA input; RegisterSyncAgent did not edit those artifacts |
| Readiness publication | `publication_commit_sha = commit containing the exact blobs of this report, ISSUE_REGISTER and HOF-0020` | Deliberately resolved externally after commit; embedding its own SHA would change the commit and create impossible self-reference |
| RC2 head | exact `publication_commit_sha` after fast-forward publication to `agent/issue-82-menu-docs` | Object on which the Issue #82 workflow must succeed and which the next IndependentVerifier must inspect |

The external GitHub attestation must bind the final publication commit, the
three exact file blob SHAs and the exact-head workflow run. Updating PR body
or existing comments after that is metadata-only and does not change RC2.

## 2. Preserved RC1 result

- RC1 subject candidate:
  `49cd9f4bd896ea11dc8afbce3a93539f761b52a6`.
- RC1 Issue #82 workflow:
  [run 30830497424](https://github.com/slavagrachov/varshavka-cafe-usali-model/actions/runs/30830497424),
  `success`.
- RC1 final Independent Verification:
  [`FAIL / NOT_MERGE_READY`](https://github.com/slavagrachov/varshavka-cafe-usali-model/blob/4fec6712b16a8b20d4fe8036d802537da63aff20/docs/07-operations/issue-82/FINAL_INDEPENDENT_VERIFICATION_REPORT_RC1.md).
- RC1 failed because IV-016 and IV-017 remained open. Its historical verdict
  is not overwritten by RC2 remediation.

## 3. Canonical readiness taxonomy

| Dimension | Metric | RC2 pre-IV status |
|---|---:|---|
| Structural coverage | 28/28 positions; 364/364 controlled cells; TECH_CARDS mandatory schema 28/28 | STRUCTURAL_COMPLETE |
| Substantive recipes | approved recipes 0/28; recipe version `0.1.0-DRAFT` | NOT_READY |
| Evidence economics | complete evidence COGS 0/28; approved project prices 0/101 | BLOCKED |
| Scenario economics | LOW_CONFIDENCE proxy COGS 28/28; proxy channel economics 101/101 | ASSUMPTION_BLOCKED_PENDING_VALIDATION |
| Nutrition | calculated draft 28/28; laboratory confirmed 0/28; release-ready 0/28 | CALCULATED_DRAFT / BLOCKED_FOR_RELEASE |
| Safety | profiles 28/28; veto `BLOCK` 28/28 | BLOCKED |
| Equipment | functional maps 28/28; passport-backed suitability 0/28; actual capacity proof 0/28 | BLOCKED |
| Excel | 17/17 sheets; `freeze_panes` 17/17; workbook unchanged from HOF-0016 | STRUCTURAL_PASS |
| IV-016 QA remediation | repository IV contract QA updated and added as fourth workflow step at `candidate_data_sha` | READY_FOR_EXACT_HEAD_CI_AND_IV_RETEST |
| Owner/Chef Gate | required decisions, documents and trials incomplete | NOT_READY |
| RC2 Independent Verification | not yet issued | PENDING |

`364/364` means structural controlled cells only. `DRAFT`, `ASSUMPTION`,
`BLOCKED` and `BLOCKED_PENDING_VALIDATION` are not completed documents.

## 4. GitHub status

| Object | Status |
|---|---|
| Issue #69 | OPEN; #82 remains an urgent child contour and does not close Gate 0 |
| Issue #80 | OPEN; no restart in this session |
| Issue #82 | OPEN / RC2 REMEDIATION |
| PR #81 | OPEN / DRAFT / NOT MERGED / reference-only; no authorized `SUPERSEDED` closure |
| PR #83 | OPEN / DRAFT / NOT_MERGE_READY; RC1 `FAIL` preserved; RC2 IV `PENDING` |

## 5. RC2 acceptance sequence

1. Publish the register-sync commit; it becomes `publication_commit_sha` and
   exact RC2 head.
2. Obtain `Validate Issue 82 menu package = success` on that exact head,
   including all four substantive QA steps.
3. Update PR #83 body and the prior synchronization comments in place with
   exact RC2 head/run and `RC2 IV=PENDING`; this is metadata-only.
4. Submit exact RC2 to a separate IndependentVerifier.
5. Treat IV-017, IV-013 and IV-015 only as `READY_FOR_IV_RETEST`, not resolved.

## 6. Prohibitions

- no merge or closure;
- no `PASS` or merge-ready claim before RC2 Independent Verification;
- no approval claim for recipes, cards, prices, nutrition release, safety or equipment;
- no substitution of proxy values for evidence;
- no removal of safety/equipment/economics blockers;
- no rewriting of the RC1 `FAIL` history.
