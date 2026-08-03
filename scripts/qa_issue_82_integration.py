#!/usr/bin/env python3
"""Independent cross-domain reconciliation for Issue #82 Gate C.

The script reads accepted handoff CSVs and writes only the SystemArchitect's
28-row reconciliation matrix. It never mutates subject-matter handoff data.
"""

from __future__ import annotations

import csv
import os
import statistics
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "docs/07-operations/issue-82"
OUT = DATA / "CROSS_DOMAIN_RECONCILIATION_MATRIX.csv"
EXPECTED = {f"VKM-{i:03d}" for i in [*range(1, 26), 29, 30, 31]}
RECIPE_VERSION = "0.1.0-DRAFT"

# Locator/product contradictions found by inspecting PRICE_SOURCE_REGISTER.
# These records are quarantined pending the assigned 100% Costing owner audit.
QUARANTINED_PRICE_SOURCE_IDS = {
    # CR-0001 v0.2.0 rejected set.
    "PSR-0008", "PSR-0011", "PSR-0012", "PSR-0016", "PSR-0024",
    "PSR-0029", "PSR-0030", "PSR-0036", "PSR-0037", "PSR-0039",
    "PSR-0042", "PSR-0043", "PSR-0045", "PSR-0053", "PSR-0059",
    "PSR-0060", "PSR-0066", "PSR-0067", "PSR-0068",
    # Residual contradictions returned during the v0.2.0 integration recheck.
    "PSR-0002",  # pack_qty=1 kg while locator says 2kg
    "PSR-0022",  # Cheezzi description while locator says Terra del Gusto
    "PSR-0065",  # 0.38 kg while locator says 400g; primary proof absent
}


def read_csv(name: str) -> list[dict[str, str]]:
    with (DATA / name).open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def split_ids(value: str) -> list[str]:
    return [item for item in value.split(";") if item and item != "null"]


def assert_exact_scope(name: str, rows: list[dict[str, str]]) -> None:
    scope = {row["dish_code"] for row in rows}
    assert scope == EXPECTED, f"{name}: scope mismatch {sorted(scope ^ EXPECTED)}"


def main() -> None:
    passports = read_csv("DISH_PASSPORTS.csv")
    recipes = read_csv("RECIPES.csv")
    tech = read_csv("TECH_CARDS.csv")
    mass = read_csv("MASS_BALANCE_REPORT.csv")
    products = read_csv("SEMI_FINISHED_PRODUCTS.csv")
    sf_lines = read_csv("SEMI_FINISHED_RECIPE_LINES.csv")
    mappings = read_csv("SEMI_FINISHED_MAPPING.csv")
    costing = read_csv("COSTING_CARDS.csv")
    prices = read_csv("RAW_MATERIAL_PRICE_REGISTER.csv")
    price_sources = read_csv("PRICE_SOURCE_REGISTER.csv")
    sf_costing = read_csv("SEMI_FINISHED_COSTING.csv")
    channel_pricing = read_csv("CHANNEL_PRICING_TABLE.csv")
    resources = read_csv("RESOURCE_CARDS.csv")
    equipment = read_csv("EQUIPMENT_FUNCTION_MATRIX.csv")
    capacity = read_csv("CAPACITY_BOTTLENECK_REPORT.csv")
    inventory = read_csv("INVENTORY_REGISTER.csv")
    tableware = read_csv("TABLEWARE_REGISTER.csv")
    safety = read_csv("SAFETY_CARDS.csv")
    allergens = read_csv("ALLERGEN_MATRIX.csv")
    nutrition = read_csv("DISH_NUTRITION.csv")

    per_dish_files = {
        "DISH_PASSPORTS": passports, "RECIPES": recipes, "TECH_CARDS": tech,
        "MASS_BALANCE_REPORT": mass, "COSTING_CARDS": costing,
        "RESOURCE_CARDS": resources, "EQUIPMENT_FUNCTION_MATRIX": equipment,
        "CAPACITY_BOTTLENECK_REPORT": capacity, "INVENTORY_REGISTER": inventory,
        "TABLEWARE_REGISTER": tableware, "SAFETY_CARDS": safety,
        "ALLERGEN_MATRIX": allergens, "DISH_NUTRITION": nutrition,
    }
    for name, rows in per_dish_files.items():
        assert_exact_scope(name, rows)

    unique_files = {
        "DISH_PASSPORTS": passports, "TECH_CARDS": tech,
        "MASS_BALANCE_REPORT": mass, "COSTING_CARDS": costing,
        "RESOURCE_CARDS": resources, "CAPACITY_BOTTLENECK_REPORT": capacity,
        "INVENTORY_REGISTER": inventory, "TABLEWARE_REGISTER": tableware,
        "SAFETY_CARDS": safety, "ALLERGEN_MATRIX": allergens,
        "DISH_NUTRITION": nutrition,
    }
    for name, rows in unique_files.items():
        assert len(rows) == 28 and len({r["dish_code"] for r in rows}) == 28, name

    p_by = {r["dish_code"]: r for r in passports}
    t_by = {r["dish_code"]: r for r in tech}
    m_by = {r["dish_code"]: r for r in mass}
    c_by = {r["dish_code"]: r for r in costing}
    rs_by = {r["dish_code"]: r for r in resources}
    cap_by = {r["dish_code"]: r for r in capacity}
    inv_by = {r["dish_code"]: r for r in inventory}
    tw_by = {r["dish_code"]: r for r in tableware}
    safe_by = {r["dish_code"]: r for r in safety}
    alg_by = {r["dish_code"]: r for r in allergens}
    nut_by = {r["dish_code"]: r for r in nutrition}
    recipes_by: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in recipes:
        recipes_by[row["dish_code"]].append(row)
    equipment_by: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in equipment:
        equipment_by[row["dish_code"]].append(row)

    # Stable VKM/VKC/VKT identity, names, versions, outputs and units.
    for dish, passport in p_by.items():
        suffix = dish[-3:]
        assert passport["cost_card_code"] == f"VKC-{suffix}"
        assert passport["tech_card_code"] == f"VKT-{suffix}"
        assert passport["recipe_version"] == RECIPE_VERSION
        for row in recipes_by[dish]:
            assert row["cost_card_code"] == f"VKC-{suffix}"
            assert row["tech_card_code"] == f"VKT-{suffix}"
            assert row["recipe_version"] == RECIPE_VERSION
            assert row["gross_unit"] == row["net_unit"] == row["output_unit"] == "г"
            assert float(row["gross_qty"]) >= 0
            assert float(row["net_qty"]) >= 0
            assert float(row["projected_output_contribution"]) >= 0
            assert row["parameter_status"] and row["evidence_ids"] and row["calculation_method"]
        for row in (t_by[dish], c_by[dish], rs_by[dish], nut_by[dish]):
            assert row["dish_name"] == passport["dish_name"]
            assert row["recipe_version"] == RECIPE_VERSION
        assert nut_by[dish]["cost_card_code"] == f"VKC-{suffix}"
        assert nut_by[dish]["tech_card_code"] == f"VKT-{suffix}"
        assert alg_by[dish]["dish_name"] == passport["dish_name"]
        output_checks = [
            (t_by[dish]["draft_target_output"], t_by[dish]["output_unit"]),
            (c_by[dish]["draft_output"], c_by[dish]["output_unit"]),
            (rs_by[dish]["recipe_batch_output"], rs_by[dish]["output_unit"]),
            (nut_by[dish]["draft_batch_or_item_output_mass"], nut_by[dish]["output_unit"]),
        ]
        for qty, unit in output_checks:
            assert abs(float(qty) - float(passport["draft_target_output"])) < 1e-9
            assert unit == passport["output_unit"] == "г"

    # Recipe arithmetic and mass balance.
    for dish, rows in recipes_by.items():
        projected = sum(float(row["projected_output_contribution"]) for row in rows)
        assert abs(projected - float(p_by[dish]["draft_target_output"])) < 1e-9
        assert m_by[dish]["arithmetic_check"] == "PASS_DRAFT_ARITHMETIC"
        assert abs(float(m_by[dish]["reconciled_output"]) - projected) < 1e-9

    # VSF identities, referential integrity, mapping quantities and DAG cycle test.
    sf_codes = {row["vsf_code"] for row in products}
    assert sf_codes == {f"VSF-{i:03d}" for i in range(1, 35)}
    recipe_by_id = {row["recipe_line_id"]: row for row in recipes}
    variants = {row["batch_variant_id"] for row in sf_lines}
    mapped_recipe_ids: Counter[str] = Counter()
    graph: dict[str, set[str]] = defaultdict(set)
    dish_vsf: dict[str, set[str]] = defaultdict(set)
    for mapping in mappings:
        assert mapping["vsf_code"] in sf_codes
        assert mapping["batch_variant_id"] in variants
        if mapping["consumer_type"] == "DISH":
            assert mapping["consumer_code"] in EXPECTED
            dish_vsf[mapping["consumer_code"]].add(mapping["vsf_code"])
            source_rows = []
            for recipe_id in split_ids(mapping["source_recipe_line_ids"]):
                assert recipe_id in recipe_by_id
                assert recipe_by_id[recipe_id]["dish_code"] == mapping["consumer_code"]
                mapped_recipe_ids[recipe_id] += 1
                source_rows.append(recipe_by_id[recipe_id])
            mapped_qty = sum(float(row["projected_output_contribution"]) for row in source_rows)
            assert abs(mapped_qty - float(mapping["required_output_qty"])) < 1e-9
        elif mapping["consumer_type"] == "VSF":
            assert mapping["consumer_code"] in sf_codes
            graph[mapping["consumer_code"]].add(mapping["vsf_code"])
        else:
            raise AssertionError(f"unsupported consumer type: {mapping['consumer_type']}")
    assert not [key for key, count in mapped_recipe_ids.items() if count > 1]
    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(node: str) -> None:
        assert node not in visiting, f"VSF cycle at {node}"
        if node in visited:
            return
        visiting.add(node)
        for child in graph[node]:
            visit(child)
        visiting.remove(node)
        visited.add(node)

    for code in sf_codes:
        visit(code)

    # Price normalization and independent arithmetic recomputation. This proves
    # formula mechanics, not the semantic truth of the quarantined source links.
    source_by_ing: dict[str, list[dict[str, str]]] = defaultdict(list)
    active_price_ids = {row["price_source_id"] for row in price_sources}
    universe_price_ids = {f"PSR-{i:04d}" for i in range(1, 91)}
    assert active_price_ids.isdisjoint(QUARANTINED_PRICE_SOURCE_IDS)
    assert active_price_ids | QUARANTINED_PRICE_SOURCE_IDS == universe_price_ids
    assert len(active_price_ids) == 68 and len(QUARANTINED_PRICE_SOURCE_IDS) == 22
    for row in price_sources:
        assert row.get("provenance_review_status") == "VERIFIED_DIRECT_CARD"
        assert row["source_url"] and row["price_date"] and row["evidence_status"]
        assert float(row["pack_qty"]) > 0 and float(row["pack_price_rub"]) > 0
        expected_normalized = float(row["pack_price_rub"]) / float(row["pack_qty"])
        assert abs(expected_normalized - float(row["normalized_price_rub"])) < 1e-5
        source_by_ing[row["ingredient_id"]].append(row)
    selected: dict[str, float] = {}
    for row in prices:
        assert set(split_ids(row["price_source_ids"])).issubset(active_price_ids)
        compatible = [
            float(source["normalized_price_rub"])
            for source in source_by_ing[row["ingredient_id"]]
            if source["pack_unit"] == "кг"
        ]
        if row["selected_price_rub_per_kg"]:
            assert compatible
            median = statistics.median(compatible)
            assert abs(median - float(row["selected_price_rub_per_kg"])) < 1e-5
            selected[row["ingredient_id"]] = median
            assert median > 0 and row["parameter_status"] == "ESTIMATE"
        else:
            assert not compatible
            assert row["parameter_status"] == "BLOCKED"

    sf_by_variant: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in sf_lines:
        sf_by_variant[row["batch_variant_id"]].append(row)
    sf_cache: dict[str, tuple[float | None, float | None, list[str]]] = {}

    def sf_cost(variant: str) -> tuple[float | None, float | None, list[str]]:
        if variant in sf_cache:
            return sf_cache[variant]
        total = 0.0
        known = 0
        missing: list[str] = []
        output = sum(float(row["projected_output_contribution"]) for row in sf_by_variant[variant])
        for row in sf_by_variant[variant]:
            if row["component_type"] == "RAW_INPUT":
                price = selected.get(row["ingredient_id"])
                if price is None:
                    missing.append(row["ingredient_id"])
                else:
                    total += float(row["gross_qty"]) / 1000 * price
                    known += 1
            elif row["component_type"] == "CHILD_VSF":
                child_partial, child_complete, child_missing = sf_cost(row["child_vsf_code"] + "@BASE")
                if child_partial is not None:
                    total += float(row["gross_qty"]) * child_partial
                    known += 1
                if child_complete is None:
                    missing.extend(child_missing or [row["child_vsf_code"]])
            else:
                raise AssertionError(row["component_type"])
        partial_per_g = total / output if known and output else None
        complete_per_g = total / output if known and not missing and output else None
        sf_cache[variant] = partial_per_g, complete_per_g, sorted(set(missing))
        return sf_cache[variant]

    sf_costing_by_variant = {row["batch_variant_id"]: row for row in sf_costing}
    assert set(sf_costing_by_variant) == set(sf_by_variant)
    for variant, output_rows in sf_by_variant.items():
        partial_per_g, complete_per_g, _ = sf_cost(variant)
        output = sum(float(row["projected_output_contribution"]) for row in output_rows)
        card = sf_costing_by_variant[variant]
        expected_partial = partial_per_g * output if partial_per_g is not None else None
        actual_partial = float(card["partial_known_batch_cost_rub"]) if card["partial_known_batch_cost_rub"] else None
        assert (expected_partial is None) == (actual_partial is None)
        if actual_partial is not None:
            assert abs(expected_partial - actual_partial) < 1e-5
        expected_complete = complete_per_g * output if complete_per_g is not None else None
        actual_complete = float(card["complete_batch_cost_rub"]) if card["complete_batch_cost_rub"] else None
        assert (expected_complete is None) == (actual_complete is None)
        if actual_complete is not None:
            assert abs(expected_complete - actual_complete) < 1e-5
            assert abs(float(card["cost_rub_per_output_g"]) - complete_per_g) < 1e-5
        else:
            assert not card["cost_rub_per_output_g"]
        assert card["double_counting_check"] == "PASS"

    mapped_ids_by_dish: dict[str, set[str]] = defaultdict(set)
    mappings_by_dish: dict[str, list[dict[str, str]]] = defaultdict(list)
    for mapping in mappings:
        if mapping["consumer_type"] == "DISH":
            mappings_by_dish[mapping["consumer_code"]].append(mapping)
            mapped_ids_by_dish[mapping["consumer_code"]].update(split_ids(mapping["source_recipe_line_ids"]))
    for dish, card in c_by.items():
        partial = 0.0
        known = 0
        for row in recipes_by[dish]:
            if row["recipe_line_id"] in mapped_ids_by_dish[dish]:
                continue
            price = selected.get(row["ingredient_id"])
            if price is not None:
                partial += float(row["gross_qty"]) / 1000 * price
                known += 1
        for mapping in mappings_by_dish[dish]:
            partial_per_g, _, _ = sf_cost(mapping["batch_variant_id"])
            if partial_per_g is not None:
                partial += float(mapping["required_output_qty"]) * partial_per_g
                known += 1
        expected_partial = partial if known else None
        actual = float(card["partial_known_food_cost_rub"]) if card["partial_known_food_cost_rub"] else None
        assert (expected_partial is None) == (actual is None)
        if actual is not None:
            assert abs(expected_partial - actual) < 1e-5
            assert actual > 0
        assert card["double_counting_check"] == "PASS"

    # Channel rows are complete as architecture, but all economic outputs stay
    # blank because no dish has complete COGS. Tax/commission are also unknown.
    assert len(channel_pricing) == 101
    assert {row["dish_code"] for row in channel_pricing} == EXPECTED
    for row in channel_pricing:
        assert not row["project_price_rub"]
        assert not row["food_cost_ratio"]
        assert not row["gross_margin_rub_before_channel_costs"]
        assert not row["contribution_rub_before_tax_and_commission"]
        assert not row["aggregator_commission_rate"]
        assert not row["tax_rate"]
        assert row["pricing_status"] == "BLOCKED_PENDING_VALIDATION"

    # Equipment/inventory/tableware referential and operation coverage.
    capex = read_csv_from_path(ROOT / "docs/10-investment/CAPEX_QUANTITY_SPECIFICATION.csv")
    capex_codes = {row["INV_CODE"] for row in capex}
    for dish in EXPECTED:
        assert int(rs_by[dish]["operation_count"]) == len(equipment_by[dish])
        assert int(rs_by[dish]["mapped_operation_count"]) == len(equipment_by[dish])
        assert rs_by[dish]["inventory_set_code"] == inv_by[dish]["inventory_set_code"]
        assert rs_by[dish]["tableware_set_code"] == tw_by[dish]["tableware_set_code"]
        for row in equipment_by[dish]:
            for code in split_ids(row["capex_inv_codes"]):
                assert code in capex_codes

    # Blocker propagation: safety/capacity/evidence economics stay unknown; HOF-0013
    # nutrition is numerically calculated but remains release-blocked.
    nutrient_fields = [
        "protein_g_per_declared_output", "fat_g_per_declared_output",
        "carbohydrate_g_per_declared_output", "energy_kcal_per_declared_output",
        "protein_g_per_100g", "fat_g_per_100g", "carbohydrate_g_per_100g",
        "energy_kcal_per_100g",
    ]
    for dish in EXPECTED:
        assert safe_by[dish]["readiness_veto"] == "BLOCK"
        assert safe_by[dish]["source_recipe_version"] == RECIPE_VERSION
        assert safe_by[dish]["source_recipe_blob_sha"] == "c6b22ad5f2812cc989a0d3593f40e21207da8f53"
        for field in ("temperature_critical_limit", "cooling_critical_limit", "reheating_critical_limit", "storage_shelf_life"):
            assert safe_by[dish][field] == "null"
        assert c_by[dish]["cost_status"] == "BLOCKED_PENDING_VALIDATION"
        assert not c_by[dish]["complete_food_cost_rub"]
        assert cap_by[dish]["bottleneck_status"] == "BLOCKED_PENDING_VALIDATION"
        assert nut_by[dish]["calculation_status"].startswith("CALCULATED_DRAFT")
        assert nut_by[dish]["release_status"] == "BLOCKED_PENDING_VALIDATION"
        assert nut_by[dish]["laboratory_confirmed"] == "false"
        assert all(float(nut_by[dish][field]) >= 0 for field in nutrient_fields)

    contaminated_ingredients = {
        row["ingredient_id"] for row in price_sources
        if row["price_source_id"] in QUARANTINED_PRICE_SOURCE_IDS
    }
    contaminated_dishes = {
        row["dish_code"] for row in recipes
        if row["ingredient_id"] in contaminated_ingredients
    }
    active_quarantined = {
        row["price_source_id"] for row in price_sources
        if row["price_source_id"] in QUARANTINED_PRICE_SOURCE_IDS
    }

    fields = [
        "dish_code", "dish_name", "menu_section", "recipe_version",
        "code_integrity", "recipe_mass_balance", "semi_finished_link",
        "costing_link", "equipment_link", "safety_link", "nutrition_link",
        "unit_output_consistency", "double_counting_check",
        "blocker_propagation", "gate_c_status", "open_conflict_ids", "next_action",
    ]
    rows = []
    for dish in sorted(EXPECTED):
        conflicts = ["INT-C-002", "INT-C-004", "INT-C-005", "INT-C-006", "INT-C-007"]
        if dish in contaminated_dishes:
            conflicts.insert(0, "INT-C-001")
        if dish in {"VKM-005", "VKM-006", "VKM-007", "VKM-008"}:
            conflicts.append("INT-C-003")
        if dish in {"VKM-001", "VKM-002", "VKM-003", "VKM-004", "VKM-013", "VKM-016", "VKM-018", "VKM-020", "VKM-022", "VKM-029"}:
            conflicts.append("INT-C-008")
        rows.append({
            "dish_code": dish,
            "dish_name": p_by[dish]["dish_name"],
            "menu_section": p_by[dish]["menu_section"],
            "recipe_version": RECIPE_VERSION,
            "code_integrity": "PASS",
            "recipe_mass_balance": "PASS_DRAFT_ARITHMETIC",
            "semi_finished_link": "PASS_WITH_OPEN_VALIDATION",
            "costing_link": (
                "PASS_FORMULA_AND_SOURCE_AUDIT_COMPLETE_COGS_BLOCKED"
                if not active_quarantined else "PENDING_RECHECK_CORRECTED_HOF-0005"
            ),
            "equipment_link": "PASS_STRUCTURE_CAPACITY_BLOCKED",
            "safety_link": "PASS_LINK_VETO_BLOCK",
            "nutrition_link": "PASS_LINK_CALCULATED_DRAFT_RELEASE_BLOCKED",
            "unit_output_consistency": "PASS",
            "double_counting_check": "PASS_STRUCTURE_AND_RECALC",
            "blocker_propagation": "PASS",
            "gate_c_status": "PASS_WITH_CONDITIONS" if not active_quarantined else "PENDING_RECHECK",
            "open_conflict_ids": ";".join(conflicts),
            "next_action": (
                "Proceed to Gate D with accepted handoffs; preserve all domain blockers and unknowns"
                if not active_quarantined
                else "Re-run Gate C after accepted corrected HOF-0005; preserve all domain blockers"
            ),
        })
    if os.environ.get("ISSUE82_WRITE_RECONCILIATION") == "1":
        with OUT.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=fields)
            writer.writeheader()
            writer.writerows(rows)

    print("scope=28 PASS")
    print("stable_codes=28 PASS")
    print(f"recipe_lines={len(recipes)} mass_balance=28 PASS_DRAFT_ARITHMETIC")
    print(f"vsf={len(products)} mappings={len(mappings)} cycles=0 orphan_refs=0")
    print(f"equipment_operations={len(equipment)} mapped={len(equipment)}")
    print("cost_formula_recalculation=28 PASS_MECHANICS")
    print("semi_finished_cost_recalculation=40 PASS_MECHANICS")
    print("price_source_partition=68_ACCEPTED+22_REJECTED=90 PASS")
    print("rejected_price_ids_in_downstream_selection=0 PASS")
    print("channel_pricing=101 STRUCTURE_PASS_VALUES_BLOCKED")
    print(f"known_rejected_or_pending_price_source_ids={len(QUARANTINED_PRICE_SOURCE_IDS)}")
    print(f"active_quarantined_price_sources={len(active_quarantined)}")
    print(f"dishes_touched_by_quarantined_sources={len(contaminated_dishes)}")
    print("safety_veto=28 nutrition_calculated_release_blocked=28 capacity_blocked=28")
    gate = "PASS_WITH_CONDITIONS" if not active_quarantined else "FAIL_PENDING_COSTING_RECHECK"
    print(f"gate_c={gate}")


def read_csv_from_path(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


if __name__ == "__main__":
    main()
