# HOF-0020 — RegisterSyncAgent exact-head remediation for RC2

## Identification

- Session: `VAR-ISSUE-82-S02-REMEDIATION`.
- Issue / draft PR: #82 / #83.
- Sender: separate RegisterSyncAgent `/root/register_sync_remediation`.
- Defects: `IV-017 / S2`, `IV-013 / S2`, `IV-015 / S2`.
- `candidate_data_sha=0d22ac8d0bb1ab198dcd18da21f3a8b741d186c1`.
- Workbook: unchanged; exact identity remains HOF-0016.
- Sender disposition: `READY_FOR_EXACT_HEAD_PUBLICATION_CI_AND_IV_RETEST`.

## Non-self-referential publication contract

This file cannot embed the SHA of the commit that contains itself: changing
the file to add that SHA would produce a different commit. Therefore:

1. `candidate_data_sha` identifies exact immutable input data.
2. `publication_commit_sha` is defined as the Git commit containing the exact
   blobs of these three owned files:
   - `docs/05-data/ISSUE_REGISTER.md`;
   - `docs/07-operations/issue-82/READINESS_STATUS_REPORT.md`;
   - `docs/07-operations/issue-82/HANDOFF_HOF-0020_REGISTER_SYNC_RC2.md`.
3. After publication, GitHub metadata attestation records the exact
   `publication_commit_sha`, each blob SHA and exact-head workflow run.
4. PR body and existing comment updates are metadata-only; they do not alter
   `publication_commit_sha`.

## Preserved evidence history

- [RC1 final report](https://github.com/slavagrachov/varshavka-cafe-usali-model/blob/4fec6712b16a8b20d4fe8036d802537da63aff20/docs/07-operations/issue-82/FINAL_INDEPENDENT_VERIFICATION_REPORT_RC1.md):
  candidate `49cd9f4bd896ea11dc8afbce3a93539f761b52a6`, workflow run
  `30830497424`, verdict `FAIL / NOT_MERGE_READY`.
- [RC1 HOF-0018](https://github.com/slavagrachov/varshavka-cafe-usali-model/blob/4fec6712b16a8b20d4fe8036d802537da63aff20/docs/07-operations/issue-82/HANDOFF_HOF-0018_FINAL_INDEPENDENT_VERIFICATION.md).
- HOF-0019 remediates IV-016 at `candidate_data_sha`; it does not rewrite RC1.

## Readiness propagated

- structural: 28/28, 364 controlled cells, 17 sheets;
- substantive: approved recipes 0/28, evidence COGS 0/28, approved prices 0/101;
- scenario: nutrition 28/28 calculated-not-lab, proxy COGS 28/28 and channel
  economics 101/101;
- blocked: safety `BLOCK` 28/28, passport suitability 0/28, actual capacity
  proof 0/28;
- Owner/Chef Gate: `NOT_READY`;
- RC2 Independent Verification: `PENDING`.

## Publication and receiver actions

1. Fast-forward publish `publication_commit_sha` as exact RC2 head.
2. Wait for the Issue #82 profile workflow on that exact head; all four
   substantive QA steps must pass.
3. Update PR #83 body and comments `5168772097`, `5168772442`, `5168772239`
   and `5168771958` in place to identify exact RC2 head/run and state
   `RC2 IV=PENDING`, while preserving RC1 `FAIL` links.
4. Provide exact publication commit, three blob SHAs, workflow run and comment
   URLs to Orchestrator and IndependentVerifier.
5. IndependentVerifier decides whether IV-017, IV-013 and IV-015 close.

## Defect disposition

| Defect | Sender disposition | Closure condition |
|---|---|---|
| IV-017 | READY_FOR_IV_RETEST after exact-head CI and metadata update | IndependentVerifier confirms all readiness surfaces bind exact RC2 and preserve RC1 history |
| IV-013 | READY_FOR_IV_RETEST after exact-head CI and metadata update | IndependentVerifier confirms register and linked GitHub states agree and no object was closed |
| IV-015 | READY_FOR_IV_RETEST after exact-head CI and PR-body update | IndependentVerifier confirms PR body matches exact RC2, exact CI and current `IV=PENDING` state |

## Prohibitions

No merge, closure, `PASS`, merge-ready, approval or `SUPERSEDED` closure claim
is made. Domain files, workbook, Defect Register and session handoff register
must remain unchanged by this handoff.
