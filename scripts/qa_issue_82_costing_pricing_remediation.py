#!/usr/bin/env python3
"""Deterministic QA for the Issue #82 costing/pricing remediation package."""

from __future__ import annotations

import csv
import math
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/07-operations/issue-82"
SCOPE = {f"VKM-{i:03d}" for i in range(1, 26)} | {"VKM-029", "VKM-030", "VKM-031"}


def rows(name: str):
    with (OUT / name).open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def num(value: str) -> float:
    return float(value)


def close(a: float, b: float, tol: float = 1e-5) -> bool:
    return math.isclose(a, b, rel_tol=tol, abs_tol=tol)


prices = rows("RAW_MATERIAL_PRICE_REGISTER.csv")
sources = rows("PRICE_SOURCE_REGISTER.csv")
cards = rows("COSTING_CARDS.csv")
vsf = rows("SEMI_FINISHED_COSTING.csv")
channel = rows("CHANNEL_PRICING_TABLE.csv")
sensitivity = rows("SENSITIVITY_REPORT.csv")
blockers = rows("ECONOMIC_BLOCKER_REGISTER.csv")
decisions = rows("OWNER_PROCUREMENT_DECISION_PACK_ECONOMICS.csv")

assert len(prices) == 113
assert len(cards) == 28 and {r["dish_code"] for r in cards} == SCOPE
assert len(channel) == 101 and {r["dish_code"] for r in channel} == SCOPE
assert len(sensitivity) == 168
assert len(vsf) == 40
assert len(blockers) == 31

# Every selected price is positive, dated, and supported by one or more active
# direct-card source rows. Unknown prices remain null, never zero.
source_by_id = {r["price_source_id"]: r for r in sources}
selected_count = 0
for r in prices:
    if r["selected_price_rub_per_kg"]:
        selected_count += 1
        assert num(r["selected_price_rub_per_kg"]) > 0
        assert r["price_as_of"] == "2026-08-03"
        ids = r["price_source_ids"].split(";")
        assert ids and all(i in source_by_id for i in ids)
        assert all(source_by_id[i]["provenance_review_status"] == "VERIFIED_DIRECT_CARD" for i in ids)
    else:
        assert r["parameter_status"] == "BLOCKED"
assert selected_count == 39
assert len(sources) == 68
assert all(r["source_url"].startswith("https://") and r["price_date"] == "2026-08-03" for r in sources)

# All 28 cards have a numeric known-cost floor, but no card may claim complete
# cost while an input is missing. No zero-for-unknown substitution is accepted.
assert all(r["partial_known_food_cost_rub"] and num(r["partial_known_food_cost_rub"]) > 0 for r in cards)
assert all(not r["complete_food_cost_rub"] for r in cards)
assert all(r["missing_price_or_vsf_ids"] and r["cost_status"] == "BLOCKED_PENDING_VALIDATION" for r in cards)
assert all(r["double_counting_check"] == "PASS" for r in cards)
assert all(r["double_counting_check"] == "PASS" for r in vsf)

# Recalculate every one of the 101 channel lower-bound rows.
card_by_dish = {r["dish_code"]: r for r in cards}
for r in channel:
    partial = num(card_by_dish[r["dish_code"]]["partial_known_food_cost_rub"])
    pack = num(r["packaging_rub"])
    target = num(r["target_cogs_ratio"])
    partial_kitchen = partial * 1.015
    lower_price = (partial_kitchen + pack) / target
    assert close(num(r["partial_kitchen_cogs_lower_bound_rub"]), partial_kitchen)
    assert close(num(r["provisional_price_lower_bound_rub"]), lower_price)
    assert close(num(r["provisional_food_cost_ratio_lower_bound"]), partial_kitchen / lower_price)
    assert close(num(r["provisional_gross_margin_lower_bound_before_channel_costs_rub"]), lower_price - partial_kitchen)
    assert close(num(r["provisional_contribution_lower_bound_before_tax_commission_rub"]), lower_price - partial_kitchen - pack)
    assert not r["project_price_rub"] and not r["food_cost_ratio"]
    assert not r["tax_rate"] and r["tax_rate_status"] == "BLOCKED_OWNER_FINANCE_INPUT"
    assert not r["aggregator_commission_rate"] and r["aggregator_commission_status"] == "BLOCKED_OWNER_CONTRACT_INPUT"
    assert r["packaging_status"] == "PROJECT_INPUT_NOT_QUOTED"
    assert r["pricing_status"] == "BLOCKED_PENDING_VALIDATION" and r["blockers"]

# Exact scope cardinalities and channel expansion.
counts = Counter(r["channel"] for r in channel)
assert sum(counts.values()) == 101
assert set(counts) <= {"À la carte", "Бизнес-ланч", "Гостиничные ужины", "Доставка", "Навынос"}

# Sensitivity arithmetic from the published partial-cost base.
for r in sensitivity:
    base = num(card_by_dish[r["dish_code"]]["partial_known_food_cost_rub"])
    expected = base * num(r["raw_price_factor"]) * num(r["yield_cost_factor"]) + num(r["packaging_delta_rub"])
    assert close(num(r["partial_known_cost_result_rub"]), expected)
    assert not r["complete_cogs_result_rub"]

# One decision for every blocked ingredient plus four global economic decisions.
blocked_ids = {r["ingredient_id"] for r in prices if not r["selected_price_rub_per_kg"]}
decision_scopes = {r["scope"] for r in decisions}
assert blocked_ids <= decision_scopes
assert len(decisions) == len(blocked_ids) + 4 == 78
assert all(r["status"] == "OPEN" and r["unblock_condition"] for r in decisions)

print({
    "result": "PASS",
    "priced_ingredients": selected_count,
    "blocked_ingredients": len(blocked_ids),
    "cost_cards": len(cards),
    "numeric_cost_lower_bounds": sum(bool(r["partial_known_food_cost_rub"]) for r in cards),
    "complete_cogs": sum(bool(r["complete_food_cost_rub"]) for r in cards),
    "channel_rows": len(channel),
    "numeric_channel_lower_bounds": sum(bool(r["provisional_price_lower_bound_rub"]) for r in channel),
    "complete_project_prices": sum(bool(r["project_price_rub"]) for r in channel),
    "decision_items": len(decisions),
})
