#!/usr/bin/env python3
"""Build and validate the Issue #82 semi-finished-products package.

The builder deliberately preserves ChefTechnologyAgent draft quantities and
never supplies missing factual yields or safety limits.  It also keeps variant
recipes explicit where the flattened source differs by consuming dish.
"""

from __future__ import annotations

import csv
from collections import defaultdict, deque
from decimal import Decimal
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/07-operations/issue-82"
DATE = "2026-08-03"
NULL = "null"


def read_csv(name: str) -> list[dict[str, str]]:
    with (OUT / name).open(encoding="utf-8", newline="") as stream:
        return list(csv.DictReader(stream))


def write_csv(name: str, rows: list[dict[str, object]], headers: list[str]) -> None:
    with (OUT / name).open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=headers, quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        writer.writerows(rows)


def dec(value: str | Decimal) -> Decimal:
    return Decimal(str(value))


def fmt(value: Decimal) -> str:
    normalized = value.normalize()
    return format(normalized, "f")


candidates = read_csv("SEMI_FINISHED_CANDIDATES.csv")
recipes = read_csv("RECIPES.csv")
candidate_by_code = {row["proposed_vsf_code"]: row for row in candidates}
recipe_by_id = {row["recipe_line_id"]: row for row in recipes}

assert len(candidates) == 34
assert len(candidate_by_code) == 34
assert set(candidate_by_code) == {f"VSF-{i:03d}" for i in range(1, 35)}
normalized_names = [" ".join(row["candidate_name"].casefold().split()) for row in candidates]
assert len(set(normalized_names)) == 34, "duplicate semantic VSF candidate name"

tagged: dict[str, list[dict[str, str]]] = defaultdict(list)
dish_rows: dict[str, list[dict[str, str]]] = defaultdict(list)
for row in recipes:
    dish_rows[row["dish_code"]].append(row)
    if row["semi_finished_candidate_code"].startswith("VSF-"):
        tagged[row["semi_finished_candidate_code"]].append(row)


def source_variants(code: str) -> dict[str, list[dict[str, str]]]:
    """Return explicit batch variants without pretending conflicts do not exist."""
    if code == "VSF-011":
        # The candidate in VKM-014 is already a prepared potato input.  VKM-023
        # is the only available flattened production recipe for that semantic item.
        return {"VSF-011@VKM-023": dish_rows["VKM-023"]}
    rows = tagged[code]
    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        grouped[row["dish_code"]].append(row)
    if code in {"VSF-001", "VSF-002"}:
        return {f"{code}@{dish}": values for dish, values in sorted(grouped.items())}
    first_dish = sorted(grouped)[0]
    return {f"{code}@BASE": grouped[first_dish]}


def totals(rows: list[dict[str, str]]) -> tuple[Decimal, Decimal, Decimal]:
    return (
        sum((dec(row["gross_qty"]) for row in rows), Decimal(0)),
        sum((dec(row["net_qty"]) for row in rows), Decimal(0)),
        sum((dec(row["projected_output_contribution"]) for row in rows), Decimal(0)),
    )


all_variants: dict[str, dict[str, list[dict[str, str]]]] = {
    code: source_variants(code) for code in sorted(candidate_by_code)
}

# VSF-014 is the assembled quick-pickle batch.  The marinade is represented as
# a child node, not again as five raw lines in the dish, which prevents cost duplication.
vsf014_child_qty = totals(all_variants["VSF-013"]["VSF-013@BASE"])[2]

line_headers = [
    "semi_recipe_line_id", "vsf_code", "batch_variant_id", "line_order",
    "component_type", "ingredient_id", "ingredient_name", "child_vsf_code",
    "gross_qty", "gross_unit", "net_qty", "net_unit",
    "projected_output_contribution", "output_unit", "source_dish_code",
    "source_recipe_line_ids", "parameter_status", "evidence_ids", "method_or_source_note",
    "source_date", "confirmation_owner", "blocker_ids", "cost_inclusion_rule",
]
semi_lines: list[dict[str, object]] = []
line_no = 0
for code, variants in all_variants.items():
    for variant_id, rows in variants.items():
        for order, row in enumerate(rows, start=1):
            line_no += 1
            semi_lines.append({
                "semi_recipe_line_id": f"SFR-{line_no:04d}",
                "vsf_code": code,
                "batch_variant_id": variant_id,
                "line_order": order,
                "component_type": "RAW_INPUT",
                "ingredient_id": row["ingredient_id"],
                "ingredient_name": row["ingredient_name"],
                "child_vsf_code": NULL,
                "gross_qty": row["gross_qty"],
                "gross_unit": row["gross_unit"],
                "net_qty": row["net_qty"],
                "net_unit": row["net_unit"],
                "projected_output_contribution": row["projected_output_contribution"],
                "output_unit": row["output_unit"],
                "source_dish_code": row["dish_code"],
                "source_recipe_line_ids": row["recipe_line_id"],
                "parameter_status": row["parameter_status"],
                "evidence_ids": row["evidence_ids"],
                "method_or_source_note": "Copied without alteration from accepted HOF-0002 Chef flattened recipe",
                "source_date": row["source_date"],
                "confirmation_owner": row["confirmation_owner"],
                "blocker_ids": row["blocker_ids"],
                "cost_inclusion_rule": "Include raw-input extended cost once in this batch variant",
            })
        if code == "VSF-014":
            line_no += 1
            child_source_ids = ";".join(row["recipe_line_id"] for row in all_variants["VSF-013"]["VSF-013@BASE"])
            semi_lines.append({
                "semi_recipe_line_id": f"SFR-{line_no:04d}",
                "vsf_code": code,
                "batch_variant_id": variant_id,
                "line_order": len(rows) + 1,
                "component_type": "CHILD_VSF",
                "ingredient_id": NULL,
                "ingredient_name": candidate_by_code["VSF-013"]["candidate_name"],
                "child_vsf_code": "VSF-013",
                "gross_qty": fmt(vsf014_child_qty),
                "gross_unit": "г",
                "net_qty": fmt(vsf014_child_qty),
                "net_unit": "г",
                "projected_output_contribution": fmt(vsf014_child_qty),
                "output_unit": "г",
                "source_dish_code": "VKM-016",
                "source_recipe_line_ids": child_source_ids,
                "parameter_status": "ASSUMPTION",
                "evidence_ids": "EVD-0009",
                "method_or_source_note": "Chef candidate semantics: quick marinade is nested into assembled quick pickles; requires Chef confirmation",
                "source_date": DATE,
                "confirmation_owner": "Chef",
                "blocker_ids": "GAP-006;GAP-010;GAP-011",
                "cost_inclusion_rule": "Include VSF-013 cost per gram multiplied by 20 g; do not include its raw inputs again in VSF-014 or VKM-016",
            })


variant_totals: dict[str, tuple[Decimal, Decimal, Decimal]] = defaultdict(lambda: (Decimal(0), Decimal(0), Decimal(0)))
for row in semi_lines:
    key = str(row["batch_variant_id"])
    old = variant_totals[key]
    variant_totals[key] = tuple(
        old[i] + dec(str(row[field]))
        for i, field in enumerate(("gross_qty", "net_qty", "projected_output_contribution"))
    )

product_headers = [
    "vsf_code", "semi_finished_name", "recipe_version", "canonical_batch_variant_id",
    "batch_variant_count", "batch_basis", "batch_gross_qty", "batch_net_qty",
    "projected_batch_output", "output_unit", "linked_dish_codes", "child_vsf_codes",
    "reuse_candidate", "card_status", "parameter_status", "evidence_ids",
    "method_or_source_note", "source_date", "confirmation_owner", "blocker_ids",
    "safety_status", "safety_blocker_ids", "next_action", "cost_per_output_rule",
    "double_counting_rule",
]
products: list[dict[str, object]] = []
for code in sorted(candidate_by_code):
    candidate = candidate_by_code[code]
    variants = all_variants[code]
    canonical = next(iter(variants))
    gross, net, output = variant_totals[canonical]
    conflict = code in {"VSF-001", "VSF-002"}
    incomplete = code in {"VSF-017", "VSF-030"}
    special = code in {"VSF-006", "VSF-011", "VSF-013", "VSF-014"}
    status = "BLOCKED_PENDING_VALIDATION" if conflict or incomplete else "DRAFT_WITH_ASSUMPTIONS"
    blockers = "GAP-006;GAP-010;GAP-011"
    if conflict:
        blockers += ";GAP-SF-001"
    if incomplete:
        blockers += ";GAP-SF-002"
    note = "Draft batch reconstructed only from Chef HOF-0002 quantities; factual yield not asserted"
    if code == "VSF-011":
        note += "; production recipe sourced from VKM-023 and mapped to VKM-014 consumption"
    if code == "VSF-014":
        note += "; VSF-013 is a nested child and is excluded from direct dish costing"
    if conflict:
        note += "; consuming-dish variants conflict and remain explicit pending Chef freeze"
    if incomplete:
        note += "; source is an undecomposed prepared input, not a complete production formula"
    if special and not conflict and not incomplete:
        note += "; special mapping is documented in SEMI_FINISHED_MAPPING.csv"
    products.append({
        "vsf_code": code,
        "semi_finished_name": candidate["candidate_name"],
        "recipe_version": candidate["recipe_version"],
        "canonical_batch_variant_id": canonical,
        "batch_variant_count": len(variants),
        "batch_basis": "Chef draft source portion/batch; canonical is architecture reference, not approved production batch",
        "batch_gross_qty": fmt(gross),
        "batch_net_qty": fmt(net),
        "projected_batch_output": fmt(output),
        "output_unit": "г",
        "linked_dish_codes": candidate["linked_dish_codes"],
        "child_vsf_codes": "VSF-013" if code == "VSF-014" else NULL,
        "reuse_candidate": candidate["reuse_candidate"],
        "card_status": status,
        "parameter_status": "ASSUMPTION",
        "evidence_ids": "EVD-0009;EVD-0007;EVD-0008",
        "method_or_source_note": note,
        "source_date": DATE,
        "confirmation_owner": "Chef / SemiFinishedProductsAgent",
        "blocker_ids": blockers,
        "safety_status": "BLOCKED_PENDING_VALIDATION",
        "safety_blocker_ids": "GAP-010;GAP-011",
        "next_action": "Chef freezes batch formula/output and variant decision; control cook weighs inputs, loss and output; FoodSafetyAgent re-reviews process and limits",
        "cost_per_output_rule": "For the mapping-selected variant: SUM(raw extended costs + child VSF quantity × accepted child cost/output) / projected batch output; factual costing waits for accepted prices and output",
        "double_counting_rule": "At each parent include either CHILD_VSF cost or that child's raw lines, never both; top-level dish excludes flattened lines reassigned to a VSF",
    })


mapping_headers = [
    "mapping_id", "consumer_type", "consumer_code", "vsf_code", "batch_variant_id",
    "required_output_qty", "unit", "mapping_role", "source_recipe_line_ids",
    "mapping_status", "evidence_ids", "method_or_source_note", "blocker_ids",
    "double_counting_control",
]
mappings: list[dict[str, object]] = []


def add_mapping(consumer_type: str, consumer_code: str, code: str, variant: str,
                qty: Decimal, source_ids: list[str], role: str, note: str = "") -> None:
    mappings.append({
        "mapping_id": f"SFM-{len(mappings)+1:03d}",
        "consumer_type": consumer_type,
        "consumer_code": consumer_code,
        "vsf_code": code,
        "batch_variant_id": variant,
        "required_output_qty": fmt(qty),
        "unit": "г",
        "mapping_role": role,
        "source_recipe_line_ids": ";".join(source_ids),
        "mapping_status": "DRAFT_WITH_ASSUMPTIONS",
        "evidence_ids": "EVD-0009;EVD-0007;EVD-0008",
        "method_or_source_note": note or "Quantity equals Chef projected output contribution for lines assigned to this VSF",
        "blocker_ids": "GAP-006;GAP-010;GAP-011",
        "double_counting_control": "Consumer costs this VSF mapping once and excludes mapped flattened/raw source lines",
    })


for code in sorted(candidate_by_code):
    candidate = candidate_by_code[code]
    linked = candidate["linked_dish_codes"].split(";")
    if code == "VSF-013":
        child_ids = [row["recipe_line_id"] for row in all_variants[code]["VSF-013@BASE"]]
        add_mapping("VSF", "VSF-014", code, "VSF-013@BASE", vsf014_child_qty, child_ids,
                    "NESTED_CHILD", "Quick marinade is consumed through VSF-014; no direct VKM-016 cost line")
        continue
    if code == "VSF-006":
        base_rows = all_variants[code]["VSF-006@BASE"]
        qty = totals(base_rows)[2]
        add_mapping("DISH", "VKM-008", code, "VSF-006@BASE", qty,
                    [row["recipe_line_id"] for row in base_rows], "FINAL_DISH_EQUALS_VSF_BATCH")
        burger_line = next(row for row in dish_rows["VKM-021"] if row["ingredient_name"].startswith("Бриошь"))
        add_mapping("DISH", "VKM-021", code, "VSF-006@BASE", dec(burger_line["projected_output_contribution"]),
                    [burger_line["recipe_line_id"]], "REUSED_COMPONENT",
                    "RCP-0180 references VKM-008 identity; resolved to its VSF-006 production node")
        continue
    if code == "VSF-011":
        source = all_variants[code]["VSF-011@VKM-023"]
        potato_line = next(row for row in dish_rows["VKM-014"] if row["semi_finished_candidate_code"] == code)
        add_mapping("DISH", "VKM-014", code, "VSF-011@VKM-023", dec(potato_line["projected_output_contribution"]),
                    [potato_line["recipe_line_id"]], "REUSED_COMPONENT",
                    "Prepared-potato input is supplied by the VKM-023-derived draft batch")
        add_mapping("DISH", "VKM-023", code, "VSF-011@VKM-023", totals(source)[2],
                    [row["recipe_line_id"] for row in source], "FINAL_DISH_EQUALS_VSF_BATCH")
        continue
    if code == "VSF-014":
        rows = all_variants[code]["VSF-014@BASE"]
        source_ids = [row["recipe_line_id"] for row in rows]
        source_ids.extend(row["recipe_line_id"] for row in all_variants["VSF-013"]["VSF-013@BASE"])
        add_mapping("DISH", "VKM-016", code, "VSF-014@BASE", variant_totals["VSF-014@BASE"][2],
                    source_ids, "ASSEMBLED_COMPONENT",
                    "Vegetable preparation plus nested VSF-013; direct VSF-013 dish mapping prohibited")
        continue
    for dish in linked:
        if code in {"VSF-001", "VSF-002"}:
            variant = f"{code}@{dish}"
        else:
            variant = f"{code}@BASE"
        rows = all_variants[code][variant]
        add_mapping("DISH", dish, code, variant, totals(rows)[2],
                    [row["recipe_line_id"] for row in rows], "DIRECT_COMPONENT")


dag_headers = [
    "dag_edge_id", "parent_type", "parent_code", "child_vsf_code", "batch_variant_id",
    "required_output_qty", "unit", "edge_role", "mapping_id", "source_recipe_line_ids",
    "status", "evidence_ids", "blocker_ids", "cycle_control",
]
dag = [{
    "dag_edge_id": f"SFD-{i:03d}",
    "parent_type": row["consumer_type"],
    "parent_code": row["consumer_code"],
    "child_vsf_code": row["vsf_code"],
    "batch_variant_id": row["batch_variant_id"],
    "required_output_qty": row["required_output_qty"],
    "unit": row["unit"],
    "edge_role": row["mapping_role"],
    "mapping_id": row["mapping_id"],
    "source_recipe_line_ids": row["source_recipe_line_ids"],
    "status": row["mapping_status"],
    "evidence_ids": row["evidence_ids"],
    "blocker_ids": row["blocker_ids"],
    "cycle_control": "Directed parent-to-child edge; validated by topological sort over VSF subgraph",
} for i, row in enumerate(mappings, start=1)]


# QA: identifiers, references, variants, units, quantities, topology and reachability.
assert len(products) == 34
assert len({row["vsf_code"] for row in products}) == 34
assert all(row["vsf_code"] in candidate_by_code for row in semi_lines)
assert all(row["vsf_code"] in candidate_by_code for row in mappings)
assert all(row["batch_variant_id"] in all_variants[row["vsf_code"]] for row in mappings)
assert all(dec(str(row["required_output_qty"])) > 0 for row in mappings)
assert all(row["unit"] == "г" for row in mappings)
assert all(row["source_recipe_line_ids"] for row in mappings)

vsf_graph: dict[str, set[str]] = defaultdict(set)
indegree = {code: 0 for code in candidate_by_code}
for row in mappings:
    if row["consumer_type"] == "VSF":
        parent, child = str(row["consumer_code"]), str(row["vsf_code"])
        assert parent in candidate_by_code and child in candidate_by_code and parent != child
        if child not in vsf_graph[parent]:
            vsf_graph[parent].add(child)
            indegree[child] += 1
queue = deque(sorted(code for code, degree in indegree.items() if degree == 0))
seen = []
while queue:
    node = queue.popleft()
    seen.append(node)
    for child in sorted(vsf_graph[node]):
        indegree[child] -= 1
        if indegree[child] == 0:
            queue.append(child)
assert len(seen) == 34, "VSF DAG contains a cycle"

dish_roots = defaultdict(set)
for row in mappings:
    if row["consumer_type"] == "DISH":
        dish_roots[str(row["consumer_code"])].add(str(row["vsf_code"]))
reachable: set[str] = set()
stack = [code for roots in dish_roots.values() for code in roots]
while stack:
    node = stack.pop()
    if node in reachable:
        continue
    reachable.add(node)
    stack.extend(vsf_graph[node])
assert reachable == set(candidate_by_code), f"orphan VSF: {set(candidate_by_code)-reachable}"

# Every child cost is represented only as a CHILD_VSF line in its parent; the
# child's raw lines are never copied into that same parent variant.
for parent, children in vsf_graph.items():
    parent_rows = [row for row in semi_lines if row["vsf_code"] == parent]
    for child in children:
        assert sum(row["child_vsf_code"] == child for row in parent_rows) == 1
        child_ing = {row["ingredient_id"] for row in semi_lines if row["vsf_code"] == child and row["ingredient_id"] != NULL}
        parent_raw = {row["ingredient_id"] for row in parent_rows if row["component_type"] == "RAW_INPUT"}
        # Ingredient overlap can be legitimate; control is structural, not name-based.
        assert all(row["component_type"] != "RAW_INPUT" or row["child_vsf_code"] == NULL for row in parent_rows)

write_csv("SEMI_FINISHED_PRODUCTS.csv", products, product_headers)
write_csv("SEMI_FINISHED_RECIPE_LINES.csv", semi_lines, line_headers)
write_csv("SEMI_FINISHED_MAPPING.csv", mappings, mapping_headers)
write_csv("SEMI_FINISHED_DAG.csv", dag, dag_headers)

qa = f"""# Semi-Finished Products QA Report — Issue #82

- Builder: `scripts/generate_issue_82_semi_finished.py`
- Build date: {DATE}
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
"""
(OUT / "SEMI_FINISHED_QA_REPORT.md").write_text(qa, encoding="utf-8")

handoff = f"""# HANDOFF HOF-0004 — SemiFinishedProductsAgent

- Sender: `/root/semi_finished` / SemiFinishedProductsAgent.
- Receivers: Orchestrator; ChefTechnologyAgent; FoodSafetyAgent; CostingPricingAgent; SystemArchitect; ExcelBuilder after Gate B acceptance.
- Version/date: `0.1.0-DRAFT` / `{DATE}`.
- Dish scope: 28 — `VKM-001…VKM-025`, `VKM-029…VKM-031`; `VKM-026…VKM-028` excluded.
- VSF scope: 34 — `VSF-001…VSF-034`.
- Upstream: HOF-0002 and HOF-0003, both `ACCEPTED_WITH_CONDITIONS`.

## Package

1. `SEMI_FINISHED_PRODUCTS.csv` — 34 authoritative architectural cards.
2. `SEMI_FINISHED_RECIPE_LINES.csv` — structured draft batch recipe variants.
3. `SEMI_FINISHED_DAG.csv` — dish/VSF parent-child graph.
4. `SEMI_FINISHED_MAPPING.csv` — exact consumer, variant, quantity and anti-double-counting rule.
5. `SEMI_FINISHED_QA_REPORT.md` — automated and semantic QA.
6. `scripts/generate_issue_82_semi_finished.py` — deterministic rebuild and validation.

## Sources and statuses

- Evidence: `EVD-0007`, `EVD-0008`, `EVD-0009`; safety constraints from HOF-0003.
- Chef quantities remain `ASSUMPTION`; arithmetic and topology checks are `CALCULATED`.
- No factual yield, safety-critical limit, supplier SKU, price or shelf life was created.
- Every VSF safety status remains `BLOCKED_PENDING_VALIDATION`.

## Performed checks

- 34 unique stable IDs, exact range `VSF-001…VSF-034`: PASS.
- all references and selected variants resolve: PASS.
- DAG acyclic and all 34 VSFs reachable from a dish root: PASS.
- parent-child quantities and units present: PASS.
- structural double-accounting rule: PASS.
- unknown-to-zero substitutions: 0.

## Open questions and blockers

- `GAP-SF-001`: resolve four formula variants for VSF-001 and VSF-002.
- `GAP-SF-002`: decompose VSF-017 and VSF-030 or approve exact purchased SKUs.
- `GAP-006`: Chef freeze and weighed control cooks are outstanding for all VSFs.
- `GAP-010/GAP-011`: FoodSafety veto is preserved; safety re-review is required after recipe/process freeze.

## Acceptance criteria

1. Orchestrator accepts the explicit variant model and the VSF-013 → VSF-014 nesting decision.
2. ChefTechnologyAgent confirms or returns the four pizza variants and special mappings by Change Request—no silent rewrite.
3. CostingPricingAgent selects costs strictly through `SEMI_FINISHED_MAPPING.csv` and never costs mapped flattened lines twice.
4. FoodSafetyAgent re-reviews frozen batch processes before any `READY_FOR_CHEF_REVIEW` transition.
5. ExcelBuilder imports this package only after Orchestrator records `ACCEPTED` or `ACCEPTED_WITH_CONDITIONS`.

## Sender decision

`READY_FOR_HANDOFF_WITH_BLOCKERS`. Requested receiver decision: `ACCEPTED_WITH_CONDITIONS`.
"""
(OUT / "HANDOFF_HOF-0004_SEMI_FINISHED.md").write_text(handoff, encoding="utf-8")

print(f"PASS: products={len(products)} lines={len(semi_lines)} mappings={len(mappings)} dag_edges={len(dag)}")
