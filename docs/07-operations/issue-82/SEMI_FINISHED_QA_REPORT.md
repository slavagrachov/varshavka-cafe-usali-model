# Semi-Finished Products QA Report — Issue #82

- Builder: `scripts/generate_issue_82_semi_finished.py`
- Build date: 2026-08-03
- Scope: 34 candidates `VSF-001…VSF-034`, reachable only from the 28 in-scope dishes.
- Upstream: HOF-0002 `ACCEPTED_WITH_CONDITIONS`; HOF-0003 safety veto preserved.

## Automated results

| Check | Result | Evidence |
|---|---:|---|
| Unique stable VSF identifiers | PASS | 34 rows; exact set `VSF-001…VSF-034` |
| Every referenced VSF exists | PASS | all recipe, mapping and DAG references resolve |
| Explicit formulation variants | PASS | VSF-001 and VSF-002 retain four dish-specific variants; no conflict hidden |
| Parent-child quantities unambiguous | PASS | every mapping has one variant, positive quantity and unit |
| VSF DAG acyclic | PASS | topological sort visited all 34 nodes |
| Orphan VSF | PASS | 0; all nodes reachable from a dish root, including VSF-013 through VSF-014 |
| Duplicate semantic candidates | PASS | 0 normalized-name duplicates; special reuse mappings remain one stable node |
| Semantic candidate resolution | PASS_WITH_BLOCKERS | VSF-006 maps brioche reuse; VSF-011 uses VKM-023 production recipe; VSF-013 nests into VSF-014 |
| Structural double-accounting control | PASS | parent uses child cost once; child raw lines are not copied into parent/dish costing |
| Unknowns substituted with zero | PASS | 0 substitutions; unknown facts use `null` or blocker status |
| Factual yields invented | PASS | 0; all quantities remain Chef `ASSUMPTION`/project figures |
| Safety veto preserved | PASS | all 34 cards remain `BLOCKED_PENDING_VALIDATION` for safety |

## Candidate disposition

- Accepted as stable architectural nodes: all 34 candidates; no code was deleted, merged or renumbered.
- `VSF-001` and `VSF-002`: retained with explicit dish-specific variants because the flattened Chef formulas differ. Their canonical variant is only an architecture reference; Chef must select/freeze the production formula.
- `VSF-006`: `VKM-008` is the production/formulation source and `VKM-021` consumes 85 g through a resolved VSF mapping. The malformed semantic reference in `RCP-0180` is not silently edited.
- `VSF-011`: production lines are derived from `VKM-023`; `VKM-014` consumes 110 g. This prevents treating the prepared-potato placeholder as a self-recipe.
- `VSF-013`: nested exactly once inside `VSF-014`; no direct VKM-016 cost mapping remains.
- `VSF-017` and `VSF-030`: retained, but their source rows are undecomposed prepared inputs. The cards are non-empty architectural results and explicitly blocked; they are not represented as complete production recipes.

## Open blockers

1. `GAP-SF-001`: Chef must resolve/freeze the conflicting pizza-dough and pizza-sauce variants or approve formal variants.
2. `GAP-SF-002`: Chef must provide decomposed batch recipes for meat broth (`VSF-017`) and project glaze (`VSF-030`) or classify exact supplier SKUs as purchased inputs.
3. `GAP-006`: all 34 batch sizes, projected outputs and mappings require Chef approval and weighed control cooks.
4. `GAP-010/GAP-011`: HOF-0003 veto remains binding; no shelf life, temperature, cooling, reheating or realization regime is inferred here.

## Costing rule

For a mapping-selected variant, unit cost is `SUM(raw extended costs + child VSF required quantity × accepted child unit cost) / projected batch output`. At a parent level, either the child VSF cost or the child's raw lines may be used—never both. The top-level dish must exclude flattened recipe lines that have been reassigned to a mapped VSF. This rule prevents double counting but does not create missing purchase prices or approve projected output.
