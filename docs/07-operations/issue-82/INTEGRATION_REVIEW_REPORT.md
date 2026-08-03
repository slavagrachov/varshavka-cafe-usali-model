# Integration Review — Issue #82 / Gate C

## Verdict

**Gate C: `PASS_WITH_CONDITIONS`.** The structural cross-domain model is coherent, and corrected HOF-0005 v0.2.1 passes independent source exclusion, normalization, recursive costing and double-counting checks. ExcelBuilder may start Gate D using only HOF-0005 v0.2.1 and the other accepted-with-conditions handoffs.

The initial Gate C review failed HOF-0005 v0.1.0 for price provenance. CR-0001 then performed two owner-controlled correction loops: v0.2.0 rejected 19/68 observations, and the integration recheck returned three residual locator contradictions; v0.2.1 rejects 22/68 and retains 46 verified direct-card observations. No subject-matter data was silently changed by SystemArchitect.

## Scope and inputs

- Exact scope: 28 dishes — `VKM-001…VKM-025`, `VKM-029…VKM-031`.
- Excluded: `VKM-026…VKM-028`.
- Reviewed handoffs: HOF-0002…HOF-0007, with corrected economics from HOF-0005 v0.2.1; each is accepted with conditions.
- Frozen draft recipe version: `0.1.0-DRAFT`.
- Integration outputs: this report, `CROSS_DOMAIN_RECONCILIATION_MATRIX.csv`, `INTEGRATION_CONFLICT_REGISTER.csv`, HOF-0008 and `scripts/qa_issue_82_integration.py`.

## Reconciliation results

| Check | Result | Interpretation |
|---|---:|---|
| Exact dish scope | 28/28 PASS | No excluded breakfast code found in domain records |
| Stable identity | 28/28 PASS | `VKM-nnn → VKC-nnn → VKT-nnn` is exact |
| Recipe coverage | 253 lines / 28 dishes PASS | Every line resolves to a dish and stable card codes |
| Recipe version | 28/28 PASS outside safety | Recipe, tech, cost, resource and nutrition records use `0.1.0-DRAFT` |
| Output and unit | 28/28 PASS | Draft targets agree across passport, tech, mass, cost, resource and nutrition; all recipe mass units are `г` |
| Mass balance | 28/28 `PASS_DRAFT_ARITHMETIC` | Arithmetic reconciles; factual yield remains blocked pending weighed trials |
| Semi-finished structure | 34 VSF / 42 mappings PASS | No orphan reference, cycle or multiply mapped source line |
| Cost double counting | 28/28 PASS mechanics | Independent recomputation matches stored partial-cost arithmetic; semantic source conflict remains |
| Equipment mapping | 155/155 PASS structure | Every operation maps to a function or explicit gap; referenced CAPEX IDs resolve |
| Inventory/tableware links | 28/28 PASS structure | Resource-card set codes resolve; quantities/availability remain blocked |
| Safety propagation | 28/28 PASS blocker handling | All vetoes and 112 safety-critical nulls are preserved |
| Nutrition propagation | 28/28 PASS blocker handling | All eight numerical fields per dish remain `null`, not zero |

The reproducible QA command is:

```bash
python scripts/qa_issue_82_integration.py
```

Current output ends with `gate_c=PASS_WITH_CONDITIONS`.

## Resolved economic provenance conflict

Initial `INT-C-001` identified product/locator contradictions in HOF-0005 v0.1.0. The 100% owner audit ultimately rejected 22/68 observations, including the original contradictions and three residual records returned during the v0.2.0 recheck. Examples included:

- `PSR-0029`: tomatoes cite a salmon product URL;
- `PSR-0024`: onion cites a carrot product URL;
- `PSR-0030`: salad greens cite a burrata product URL;
- `PSR-0036`: apple cites a cod product URL;
- `PSR-0067`: powdered sugar cites a cream-cheese product URL.

HOF-0005 v0.2.1 retains 46 observations covering 19 ingredients; 22 rejected source IDs are absent from the active source register and raw-material selection. Independent recomputation matches 28 costing cards, with 21 partial known costs and 0 complete COGS. `INT-C-001` is resolved for the draft integration, while supplier quotations and approved purchase prices remain open under `INT-C-004`.

## Other blocker propagation

- Complete COGS: 0/28. Project channel price: 0/101 rows. Food cost and margin are not numerically reportable.
- Food Safety: 28/28 `BLOCK`; safety cards have `source_recipe_version=null`, so no dish-specific review is version-locked.
- Nutrition: 28/28 `BLOCKED_PENDING_VALIDATION`; all B/F/C/energy outputs remain unknown.
- Capacity: 28/28 bottleneck conclusions remain blocked; passport capacity, demand and installed/connected status are absent.
- Semi-finished products: variant/decomposition decisions remain open, and every VSF retains a safety blocker.
- `REQ-BAK-PREP` is a requirement gap for `VKM-005…VKM-008`, not an equipment asset.

## Cross-Issue impacts

- **Issue #37:** control-cook forms must capture gross/net/output, actual losses, operation time, equipment load, safety measurements and sensory decisions. Current mass balance is draft arithmetic only.
- **Issue #38:** final recipe/VSF, equipment, inventory, cleaning, cross-contact, critical limits and shelf-life basis require a FoodSafety re-review. Current veto remains binding.
- **Issue #39:** procurement must provide exact SKU/specification, valid supplier price evidence, pack/MOQ/delivery/VAT terms and supplier documents. CR-0001 is a direct dependency.
- **Issue #47:** complete COGS, channel pricing, margins, capacity/energy/CAPEX allocations and taxes/commissions cannot enter the economic model until the corresponding blockers close.

## ExcelBuilder entry criteria

ExcelBuilder may start Gate D under these binding conditions:

1. import HOF-0005 v0.2.1 only; superseded v0.1.0 and v0.2.0 must not be used;
2. preserve all 22 rejected price IDs outside active formulas/selections;
3. preserve all blank/`null` unknowns, EvidenceIDs, owners, blocker IDs and FoodSafety vetoes;
4. do not convert partial known cost into complete COGS, price, food cost or margin;
5. preserve `REQ-BAK-PREP` as a requirement gap, not an asset;
6. rerun `scripts/qa_issue_82_integration.py` and workbook formula/visual QA after integration.

All other open items may remain visible blockers in a draft workbook; none may be represented as approved data.
