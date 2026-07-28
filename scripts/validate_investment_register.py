#!/usr/bin/env python3
"""Validate the VARSHAVKA v3.0.0 investment package."""

from __future__ import annotations

import csv
from collections import Counter
from pathlib import Path
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "docs/10-investment"

FILES = {
    "capex": "CAPEX_QUANTITY_SPECIFICATION.csv",
    "gates": "CONDITIONAL_EQUIPMENT_GATES.csv",
    "rfq": "RFQ_PRICE_COLLECTION_TEMPLATE.csv",
    "comparison": "RFQ_COMPARISON_TEMPLATE.csv",
    "wc": "WORKING_CAPITAL_INPUT_TEMPLATE.csv",
    "cash": "CASH_FLOW_13W_INPUT_TEMPLATE.csv",
    "checks": "INVESTMENT_CONTROL_CHECKS.csv",
    "docs": "MISSING_INVESTMENT_DOCUMENTS_REGISTER.csv",
    "legacy": "LEGACY_EQUIPMENT_CODE_MAPPING.csv",
}

ALLOWED_DIRECTIONS = {"CAFE", "BANQUETS", "BAR", "SHARED"}
ALLOWED_STATUSES = {
    "MANDATORY",
    "CONDITIONAL",
    "EXCLUDED",
    "ENGINEERED",
    "DATA_REQUIRED",
}
ALLOWED_DRIVERS = {
    "D01_DIRECT",
    "D02_AREA",
    "D03_AVOIDABLE",
    "D04_MACHINE_HOURS",
    "D05_CAPACITY",
    "D06_STORAGE",
    "D07_DISHWASH",
    "D08_COVERS",
    "D09_TRANSACTIONS",
    "D10_LABOR_HOURS",
    "D11_CONSUMPTION",
    "D12_CASH_FLOW",
    "D13_DIRECT_COST",
    "D14_REVENUE_FALLBACK",
}
EXPECTED_XLSX_SHEETS = {
    "README",
    "CAPEX Quantity",
    "Conditional Gates",
    "RFQ Collection",
    "RFQ Comparison",
    "Working Capital",
    "Cash Flow 13W",
    "Checks",
    "Missing Documents",
    "Legacy Mapping",
}


def read_csv(name: str) -> list[dict[str, str]]:
    path = PACKAGE / name
    assert path.exists(), f"Missing file: {path}"
    with path.open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def numeric(value: str) -> float:
    return float(value) if value not in {"", None} else 0.0


def validate_xlsx() -> None:
    path = PACKAGE / "INVESTMENT_PACKAGE_TEMPLATES_v3.0.0.xlsx"
    assert path.exists(), path
    assert path.stat().st_size > 30_000, "XLSX is unexpectedly small"
    with ZipFile(path) as archive:
        names = set(archive.namelist())
        assert "[Content_Types].xml" in names
        assert "xl/workbook.xml" in names
        workbook_xml = archive.read("xl/workbook.xml").decode("utf-8")
        for sheet in EXPECTED_XLSX_SHEETS:
            assert f'name="{sheet}"' in workbook_xml, f"Missing XLSX sheet: {sheet}"


def main() -> None:
    data = {key: read_csv(name) for key, name in FILES.items()}
    capex = data["capex"]
    ids = [row["INV_CODE"] for row in capex]

    assert len(capex) == 137, len(capex)
    assert len(ids) == len(set(ids)), "Duplicate INV_CODE"
    assert all(ids), "Blank INV_CODE"
    assert all(row["CURRENT_FUNC_CODE"] for row in capex)
    assert {row["BUSINESS_DIRECTION"] for row in capex} <= ALLOWED_DIRECTIONS
    assert {row["MANDATORY_STATUS"] for row in capex} <= ALLOWED_STATUSES
    assert {row["ALLOCATION_DRIVER"] for row in capex} <= ALLOWED_DRIVERS

    conditional = [row for row in capex if row["MANDATORY_STATUS"] == "CONDITIONAL"]
    excluded = [row for row in capex if row["MANDATORY_STATUS"] == "EXCLUDED"]
    assert conditional, "No conditional positions"
    assert excluded, "No excluded positions"
    assert all(numeric(row["BASE_SCENARIO_QTY"]) == 0 for row in conditional)
    assert all(numeric(row["BASE_SCENARIO_QTY"]) == 0 for row in excluded)
    assert all(numeric(row["CURRENT_PRICE_RUB"]) == 0 for row in conditional)
    assert all(numeric(row["CURRENT_PRICE_RUB"]) == 0 for row in excluded)
    assert all(row["ACTIVATION_GATE"] for row in conditional)

    gate_ids = {row["GATE_ID"] for row in data["gates"]}
    gate_inv = {row["INV_CODE"] for row in data["gates"]}
    assert len(data["gates"]) == 11
    assert len(gate_ids) == len(data["gates"])
    assert all(row["INV_CODE"] in ids for row in data["gates"])
    assert all(row["ACTIVATION_GATE"] in gate_ids for row in conditional)
    assert {row["INV_CODE"] for row in conditional} <= gate_inv

    assert len(data["legacy"]) == 43
    assert len({row["LEGACY_FUNC_CODE"] for row in data["legacy"]}) == 43
    hashes = {row["SOURCE_SHA256"] for row in data["legacy"]}
    assert hashes == {
        "b3231fa6159a529f52dfd8eb82f309de825469f1d3666d0a109c1d9a66bf6d62"
    }

    historical = sum(numeric(row["HISTORICAL_ESTIMATE_RUB"]) for row in capex)
    assert historical == 372_013, historical
    assert all(
        row["CURRENT_PRICE_RUB"] == ""
        for row in capex
        if row["PRICE_STATUS"] == "NOT_REQUESTED"
    )

    assert len(data["rfq"]) == 20
    assert all(row["PRICE_STATUS"] == "NOT_REQUESTED" for row in data["rfq"])
    price_fields = {
        "PRICE_EX_VAT_RUB",
        "VAT_RUB",
        "PRICE_INC_VAT_RUB",
        "DELIVERY_RUB",
        "INSTALLATION_RUB",
        "COMMISSIONING_RUB",
        "TRAINING_RUB",
        "REQUIRED_ACCESSORIES_RUB",
    }
    assert all(not row[field] for row in data["rfq"] for field in price_fields)

    cash_counts = Counter(row["BUSINESS_CONTOUR"] for row in data["cash"])
    assert cash_counts == {"CAFE": 13, "BANQUETS": 13}, cash_counts
    assert len(data["wc"]) == 23
    assert len(data["docs"]) == 33
    assert len(data["checks"]) == 20
    assert all(row["PRODUCTION_RESERVE_ALREADY_INCLUDED"] for row in data["wc"])

    validate_xlsx()

    forbidden = [
        ROOT / "models/scenarios/S04/FINMODEL_VARSHAVKA_USALI_SCENARIO_S04_v3.0.0.xlsx"
    ]
    assert all(path.exists() for path in forbidden), "Canonical S04 missing"

    print(f"CAPEX rows: {len(capex)}")
    print(f"Directions: {dict(Counter(row['BUSINESS_DIRECTION'] for row in capex))}")
    print(f"Statuses: {dict(Counter(row['MANDATORY_STATUS'] for row in capex))}")
    print(f"Conditional gates: {len(data['gates'])}")
    print(f"Historical mapping rows: {len(data['legacy'])}")
    print(f"Historical tableware estimate: {historical:,.2f} RUB")
    print(f"RFQ groups: {len(data['rfq'])}; all NOT_REQUESTED")
    print(f"Cash-flow contours: {dict(cash_counts)}")
    print("Investment package validation passed.")


if __name__ == "__main__":
    main()
