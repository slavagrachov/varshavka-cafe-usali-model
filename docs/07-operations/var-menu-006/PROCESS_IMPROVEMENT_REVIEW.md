# Process Improvement Review — Issue #106

## Result

`COMPLETED_WITH_ACTIONS`

## What worked

1. Wave-based development with Owner Gates prevented premature approval.
2. Separate V1/V2 scenarios made the water-balance difference explicit.
3. Unknown values remained visible instead of being replaced with zeros.
4. The three-sheet workbook is suitable for chef/manager review.
5. macOS Terminal publication preserved binary XLSX integrity.
6. SHA-256 checks detected publication integrity reliably.

## Problems observed

1. A cancelled build method remained documented too long.
2. Publication records initially contained stale lifecycle states and empty placeholders.
3. Binary publication was temporarily confused with connector publication.
4. Repeated verification passes increased cycle time.
5. `gh api` raw binary output failed with `transform: short source buffer`.

## Mandatory improvements

1. Remove cancelled-method artifacts before draft PR.
2. Use one canonical filename from Owner Gate 3 onward.
3. Use Terminal macOS only for the binary publication and byte-level verification steps.
4. Generate final records only after all SHA values are available.
5. Use one pre-publication QA and one post-merge QA unless workbook structure changes.
6. Verify a pulled binary directly from local `main`; do not pipe XLSX through `gh api`.
7. Keep merge distinct from production approval.
8. Preserve safety blockers until factual validation.

## Status

The process-review requirement for closing Issue #106 is fulfilled.
