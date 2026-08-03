#!/usr/bin/env python3
"""Build the Issue #82 nutrition handoff without substituting unknowns with zero."""

from __future__ import annotations

import csv
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "07-operations" / "issue-82"
DATE = "2026-08-03"
NULL = "null"
SCOPE = [f"VKM-{i:03d}" for i in range(1, 26)] + ["VKM-029", "VKM-030", "VKM-031"]


def read_csv(name: str) -> list[dict[str, str]]:
    with (OUT / name).open(encoding="utf-8-sig", newline="") as stream:
        return list(csv.DictReader(stream))


def write_csv(name: str, fields: list[str], rows: list[dict[str, object]]) -> None:
    with (OUT / name).open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields, extrasaction="raise", lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def source_rows() -> list[dict[str, str]]:
    return [
        {
            "nutrition_source_id": "NUT-SRC-001",
            "source_name": "Frozen ChefTechnology recipe package HOF-0002",
            "source_url_or_locator": "docs/07-operations/issue-82/RECIPES.csv",
            "source_version_or_date": "0.1.0-DRAFT / 2026-08-03",
            "source_class": "accepted project handoff",
            "source_status": "DRAFT",
            "allowed_use": "ingredient identifiers, draft net quantities and recipe version",
            "prohibited_use": "treat draft quantities or yields as observed facts",
            "evidence_ids": "EVD-0005;EVD-0007;EVD-0008;EVD-0028",
            "retrieved_or_issued_date": DATE,
            "confirmation_owner": "Chef / Orchestrator",
        },
        {
            "nutrition_source_id": "NUT-SRC-002",
            "source_name": "Dish passports HOF-0002",
            "source_url_or_locator": "docs/07-operations/issue-82/DISH_PASSPORTS.csv",
            "source_version_or_date": "0.1.0-DRAFT / 2026-08-03",
            "source_class": "accepted project handoff",
            "source_status": "DRAFT",
            "allowed_use": "dish identity, draft output and sales-unit basis",
            "prohibited_use": "claim measured output or approved serving mass",
            "evidence_ids": "EVD-0003;EVD-0004;EVD-0005",
            "retrieved_or_issued_date": DATE,
            "confirmation_owner": "Chef / Owner",
        },
        {
            "nutrition_source_id": "NUT-SRC-003",
            "source_name": "Issue #82 Evidence Matrix",
            "source_url_or_locator": "docs/07-operations/issue-82/EVIDENCE_MATRIX.csv#EVD-0027,EVD-0028",
            "source_version_or_date": "2026-08-03",
            "source_class": "accepted evidence gate",
            "source_status": "FACT",
            "allowed_use": "enforce source hierarchy and nutrition blocker",
            "prohibited_use": "infer missing nutrient values",
            "evidence_ids": "EVD-0027;EVD-0028",
            "retrieved_or_issued_date": DATE,
            "confirmation_owner": "SourceAuditor / NutritionDataAgent",
        },
        {
            "nutrition_source_id": "NUT-SRC-004",
            "source_name": "ТР ТС 022/2011 — Пищевая продукция в части ее маркировки",
            "source_url_or_locator": "https://eec.eaeunion.org/comission/department/deptexreg/tr/PischevkaMarkirovka.php",
            "source_version_or_date": "official EEC page; accessed 2026-08-03",
            "source_class": "official regulatory primary source",
            "source_status": "FACT",
            "allowed_use": "required presentation basis: energy and protein/fat/carbohydrate per 100 g/ml and/or serving",
            "prohibited_use": "use as ingredient-composition database or legal approval of this draft package",
            "evidence_ids": "EVD-0027;METHOD-NUT-001",
            "retrieved_or_issued_date": DATE,
            "confirmation_owner": "NutritionDataAgent / LegalCompliance owner",
        },
        {
            "nutrition_source_id": "NUT-SRC-005",
            "source_name": "USDA FoodData Central",
            "source_url_or_locator": "https://fdc.nal.usda.gov/",
            "source_version_or_date": "dynamic official database; accessed 2026-08-03",
            "source_class": "official professional composition database",
            "source_status": "MONITOR",
            "allowed_use": "candidate composition values only after exact FDC record mapping, basis and date are recorded",
            "prohibited_use": "automatic fuzzy match from Russian generic ingredient names; substitute manufacturer declaration",
            "evidence_ids": "EVD-0027;METHOD-NUT-001",
            "retrieved_or_issued_date": DATE,
            "confirmation_owner": "NutritionDataAgent / Procurement",
        },
        {
            "nutrition_source_id": "NUT-SRC-006",
            "source_name": "Supplier/manufacturer specification or label for exact purchased SKU",
            "source_url_or_locator": NULL,
            "source_version_or_date": NULL,
            "source_class": "required primary document",
            "source_status": "BLOCKED",
            "allowed_use": "preferred source for branded/processed ingredients after SKU approval",
            "prohibited_use": "invent supplier, SKU, label values or effective date",
            "evidence_ids": "EVD-0016;EVD-0027",
            "retrieved_or_issued_date": NULL,
            "confirmation_owner": "Procurement / NutritionDataAgent",
        },
        {
            "nutrition_source_id": "NUT-SRC-007",
            "source_name": "Frozen semi-finished-product package HOF-0004",
            "source_url_or_locator": "docs/07-operations/issue-82/SEMI_FINISHED_MAPPING.csv",
            "source_version_or_date": "0.1.0-DRAFT / 2026-08-03",
            "source_class": "accepted project handoff",
            "source_status": "DRAFT",
            "allowed_use": "resolve VSF relationships and enforce the anti-double-counting rule",
            "prohibited_use": "add mapped semi-finished lines on top of the already flattened RECIPES.csv ingredient basis",
            "evidence_ids": "EVD-0009;EVD-0028",
            "retrieved_or_issued_date": DATE,
            "confirmation_owner": "SemiFinishedProductsAgent / SystemArchitect",
        },
    ]


def serving_mass(passport: dict[str, str]) -> tuple[str, str, str]:
    output = float(passport["draft_target_output"])
    code = passport["dish_code"]
    if code == "VKM-029":
        return f"{output / 12:g}", "г", "CALCULATED_FROM_DRAFT: 1800 г / 12 порций"
    if code == "VKM-030":
        return f"{output / 10:g}", "г", "CALCULATED_FROM_DRAFT: 1200 г / 10 порций"
    if code == "VKM-031":
        return f"{output * 2 / 20:g}", "г", "CALCULATED_FROM_DRAFT: 600 г × 2 шт. / 20 шт."
    return f"{output:g}", passport["output_unit"], "DRAFT: target output used as one sales unit"


def main() -> None:
    passports = read_csv("DISH_PASSPORTS.csv")
    recipes = read_csv("RECIPES.csv")
    assert [row["dish_code"] for row in passports] == SCOPE
    assert {row["dish_code"] for row in recipes} == set(SCOPE)
    assert not ({"VKM-026", "VKM-027", "VKM-028"} & {row["dish_code"] for row in recipes})

    ingredient_stats: dict[tuple[str, str], dict[str, object]] = {}
    for row in recipes:
        key = (row["ingredient_id"], row["ingredient_name"])
        stat = ingredient_stats.setdefault(key, {"lines": 0, "dishes": set()})
        stat["lines"] = int(stat["lines"]) + 1
        cast_set = stat["dishes"]
        assert isinstance(cast_set, set)
        cast_set.add(row["dish_code"])

    ingredient_rows = []
    nutrient_fields = [
        "protein_g_per_100g", "fat_g_per_100g", "carbohydrate_g_per_100g", "energy_kcal_per_100g"
    ]
    for idx, ((ingredient_id, name), stat) in enumerate(sorted(ingredient_stats.items()), 1):
        dishes = stat["dishes"]
        assert isinstance(dishes, set)
        row: dict[str, object] = {
            "nutrition_ingredient_record_id": f"NUT-ING-{idx:03d}",
            "ingredient_id": ingredient_id,
            "ingredient_name": name,
            "recipe_line_count": stat["lines"],
            "dish_count": len(dishes),
            "dish_codes": ";".join(sorted(dishes)),
            "composition_source_id": NULL,
            "composition_source_record_id": NULL,
            "composition_basis": NULL,
            **{field: NULL for field in nutrient_fields},
            "nutrient_value_status": "BLOCKED_PENDING_VALIDATION",
            "evidence_ids": "EVD-0016;EVD-0027;EVD-0028",
            "method_or_source_note": "Exact approved SKU/specification or exact official database record is not mapped; no fuzzy or zero substitution",
            "source_version_or_date": NULL,
            "confirmation_owner": "Procurement / NutritionDataAgent",
            "blocker_ids": "GAP-013;GAP-023",
            "next_action": "Approve SKU and map label/specification or exact official composition record, including edible-state basis",
        }
        ingredient_rows.append(row)

    ingredient_fields = list(ingredient_rows[0])
    write_csv("INGREDIENT_NUTRITION_REGISTER.csv", ingredient_fields, ingredient_rows)

    dish_rows = []
    recipe_by_dish: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in recipes:
        recipe_by_dish[row["dish_code"]].append(row)
    for idx, passport in enumerate(passports, 1):
        code = passport["dish_code"]
        sale_mass, sale_unit, mass_method = serving_mass(passport)
        row = {
            "nutrition_record_id": f"NUT-DISH-{idx:03d}",
            "dish_code": code,
            "cost_card_code": passport["cost_card_code"],
            "tech_card_code": passport["tech_card_code"],
            "menu_section": passport["menu_section"],
            "dish_name": passport["dish_name"],
            "recipe_version": passport["recipe_version"],
            "production_sales_unit": passport["production_sales_unit"],
            "draft_batch_or_item_output_mass": passport["draft_target_output"],
            "output_unit": passport["output_unit"],
            "draft_sale_portion_mass": sale_mass,
            "sale_portion_unit": sale_unit,
            "portion_mass_method_status": mass_method,
            "ingredient_line_count": len(recipe_by_dish[code]),
            "protein_g_per_declared_output": NULL,
            "fat_g_per_declared_output": NULL,
            "carbohydrate_g_per_declared_output": NULL,
            "energy_kcal_per_declared_output": NULL,
            "protein_g_per_100g": NULL,
            "fat_g_per_100g": NULL,
            "carbohydrate_g_per_100g": NULL,
            "energy_kcal_per_100g": NULL,
            "calculation_status": "BLOCKED_PENDING_VALIDATION",
            "laboratory_confirmed": "false",
            "evidence_ids": "EVD-0005;EVD-0007;EVD-0008;EVD-0027;EVD-0028;METHOD-NUT-001",
            "calculation_method": "Σ(net_qty_g × accepted ingredient nutrient per 100 g / 100), then normalize to frozen output; execute only when all ingredient mappings and processing basis are accepted",
            "source_date": DATE,
            "confirmation_owner": "NutritionDataAgent / Procurement / Chef",
            "blocker_ids": "GAP-005;GAP-013;GAP-023",
            "limitation": "All ingredient composition values are unresolved; recipe and yield remain draft; calculated nutrition cannot be released",
            "next_action": "Map every ingredient to an accepted composition record, resolve processed-state/yield basis, rebuild and review",
        }
        dish_rows.append(row)

    dish_fields = list(dish_rows[0])
    write_csv("DISH_NUTRITION.csv", dish_fields, dish_rows)
    write_csv("NUTRITION_SOURCE_REGISTER.csv", list(source_rows()[0]), source_rows())

    limitations = [
        {
            "limitation_id": "NUT-LIM-001", "scope": "ALL_28", "limitation": "Ingredient nutrition values are absent from accepted upstream data.",
            "impact": "B/F/C and energy are null for every dish.", "status": "BLOCKED_PENDING_VALIDATION", "evidence_ids": "EVD-0027;EVD-0028", "owner": "Procurement / NutritionDataAgent", "next_action": "Obtain and map exact source records for all 113 ingredient IDs."
        },
        {
            "limitation_id": "NUT-LIM-002", "scope": "ALL_28", "limitation": "Ingredient names do not identify approved supplier SKU, brand, fat percentage, drained state or prepared/raw state.",
            "impact": "Generic database matching could materially misstate nutrients.", "status": "BLOCKED", "evidence_ids": "EVD-0016;EVD-0027", "owner": "Procurement / Chef", "next_action": "Freeze purchasing specifications and edible-state basis."
        },
        {
            "limitation_id": "NUT-LIM-003", "scope": "ALL_28", "limitation": "Recipe net quantities, process losses and output are draft rather than observed.",
            "impact": "Per-serving and per-100 g normalization is not validated.", "status": "BLOCKED_PENDING_VALIDATION", "evidence_ids": "EVD-0005;EVD-0007;EVD-0008;EVD-0030", "owner": "Chef / Operations", "next_action": "Complete weighed control cooks and approve recipe version."
        },
        {
            "limitation_id": "NUT-LIM-004", "scope": "VKM-029;VKM-030;VKM-031", "limitation": "Sale-portion masses are arithmetically derived from draft batch output and stated equal portion count.",
            "impact": "Portion nutrition will change if actual piece/portion weights vary.", "status": "CALCULATED", "evidence_ids": "EVD-0004;EVD-0005;METHOD-NUT-001", "owner": "Chef", "next_action": "Weigh sale portions during control cook."
        },
        {
            "limitation_id": "NUT-LIM-005", "scope": "ALL_28", "limitation": "No retention factors or laboratory tests are available for processing effects.",
            "impact": "Future database calculation remains an estimate even after source mapping.", "status": "BLOCKED_PENDING_VALIDATION", "evidence_ids": "EVD-0008;EVD-0028", "owner": "NutritionDataAgent / Chef", "next_action": "Document method choice and commission testing if the owner requires laboratory confirmation."
        },
        {
            "limitation_id": "NUT-LIM-006", "scope": "ALL_28", "limitation": "Regulatory source defines presentation requirements but does not supply the ingredient composition inputs.",
            "impact": "Regulatory citation cannot unblock nutrient numbers.", "status": "FACT", "evidence_ids": "METHOD-NUT-001", "owner": "NutritionDataAgent / LegalCompliance owner", "next_action": "Reconfirm applicable edition at release and keep composition provenance separately."
        },
    ]
    write_csv("NUTRITION_LIMITATIONS.csv", list(limitations[0]), limitations)

    # QA: exact scope/count, no excluded breakfast, and no numeric zero in unknown nutrient fields.
    assert len(dish_rows) == 28 and {row["dish_code"] for row in dish_rows} == set(SCOPE)
    assert len(ingredient_rows) == 113
    dessert_masses = {row["dish_code"]: row["draft_sale_portion_mass"] for row in dish_rows if row["dish_code"] in {"VKM-029", "VKM-030", "VKM-031"}}
    assert dessert_masses == {"VKM-029": "150", "VKM-030": "120", "VKM-031": "60"}
    assert all(row[field] == NULL for row in ingredient_rows for field in nutrient_fields)
    dish_nutrient_fields = [field for field in dish_fields if field.startswith(("protein_", "fat_", "carbohydrate_", "energy_"))]
    assert all(row[field] == NULL for row in dish_rows for field in dish_nutrient_fields)
    assert not any(code in str(dish_rows) for code in ("VKM-026", "VKM-027", "VKM-028"))
    print(f"PASS: {len(dish_rows)} dishes; {len(ingredient_rows)} ingredients; unknown nutrient fields remain '{NULL}'")


if __name__ == "__main__":
    main()
