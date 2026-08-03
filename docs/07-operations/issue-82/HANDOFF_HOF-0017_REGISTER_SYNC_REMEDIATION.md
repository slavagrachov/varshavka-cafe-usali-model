# HOF-0017 — RegisterSyncAgent remediation handoff

## Identification

- Session: `VAR-ISSUE-82-S02-REMEDIATION`.
- Issue / draft PR: #82 / #83.
- Role: separate RegisterSyncAgent `/root/register_sync_remediation`.
- Input package head: `e3bdbe8fda42482c82adedbc4b821c7da6a2264d`.
- Upstream handoffs: HOF-0011…HOF-0016.
- Sender decision: `REGISTER_SYNC_READY_FOR_RC_INTEGRATION`.
- Final Independent Verification: `PENDING`; no verdict is inferred here.

## Owned files

1. `docs/05-data/ISSUE_REGISTER.md` — synchronized #69, #80, #82, PR #81
   and PR #83; added honest Issue #82 readiness dimensions and direct links.
2. `docs/07-operations/issue-82/READINESS_STATUS_REPORT.md` — canonical
   separation of structure, substance, assumption/scenario, blockers and
   Owner/Chef Gate readiness.
3. `docs/07-operations/issue-82/HANDOFF_HOF-0017_REGISTER_SYNC_REMEDIATION.md`
   — this handoff.

No domain CSV, workbook, Defect Register or session handoff register was
edited by RegisterSyncAgent.

## Status taxonomy propagated

| Dimension | Exact remediation status |
|---|---|
| Structural coverage | 28/28 positions; 364/364 controlled matrix cells; TECH_CARDS mandatory schema 28/28 |
| Substantive readiness | approved recipes 0/28; evidence-complete COGS 0/28; approved prices 0/101; safety-ready 0/28; passport-backed equipment suitability 0/28 |
| Assumption/scenario results | calculated nutrition 28/28 but lab-confirmed 0/28; LOW_CONFIDENCE proxy scenario COGS 28/28 and channel economics 101/101 |
| Blocked results | safety veto `BLOCK` 28/28; evidence economics, release nutrition and actual equipment capacity remain blocked |
| Owner/Chef Gate | `NOT_READY`; decisions, supplier/equipment documents, trials and final independent verification remain required |

`364/364 complete` is prohibited because it conflates non-empty structural
cells with completed documents.

## GitHub publication targets

- [Issue #69 status comment](https://github.com/slavagrachov/varshavka-cafe-usali-model/issues/69#issuecomment-5168772097): parent-program synchronization; #82 remains open remediation.
- [Issue #82 status comment](https://github.com/slavagrachov/varshavka-cafe-usali-model/issues/82#issuecomment-5168772442): canonical readiness snapshot and next gate.
- [Issue #80 status comment](https://github.com/slavagrachov/varshavka-cafe-usali-model/issues/80#issuecomment-5168772239): remains open; no restart in this session.
- [PR #81 status comment](https://github.com/slavagrachov/varshavka-cafe-usali-model/pull/81#issuecomment-5168771958): remains open draft/reference-only; no `SUPERSEDED` closure yet.
- [PR #83 body](https://github.com/slavagrachov/varshavka-cafe-usali-model/pull/83): honest metrics, exact workflow state and `PENDING` final IV.

Orchestrator must reconcile the input head with the final PR head when
integrating this handoff into the frozen release candidate. The published
comments are status snapshots and do not become closure attestations.

## CI state at handoff

- `Validate Issue 82 menu package`: run `30829944096`, `success`, exact
  published head `e3bdbe8fda42482c82adedbc4b821c7da6a2264d`.
- `Validate S03 v0.1.7`: success, but not the Issue #82 acceptance workflow.
- The successful package workflow does not close subject-matter blockers.

## Closure prohibitions

Without separate written Owner authorization:

1. do not merge PR #83;
2. do not close Issue #82 or Issue #80;
3. do not merge or close PR #81;
4. do not label PR #83 merge-ready;
5. do not call PR #81 `SUPERSEDED` as a closure action;
6. do not declare cards, prices, nutrition, safety or equipment approved;
7. do not create new Issues for blockers;
8. do not state a final IndependentVerifier verdict before the exact frozen RC
   is independently checked.

## Receiver acceptance criteria

1. Integrate the three owned files without modifying domain data.
2. Reconcile the input head with the eventual frozen RC head.
3. Preserve all status distinctions in the PR body and publication comments.
4. Have IndependentVerifier check register consistency and absence of claims
   beyond the evidence.
5. If any metric changes before freeze, issue a superseding register-sync
   handoff rather than silently editing this result.
