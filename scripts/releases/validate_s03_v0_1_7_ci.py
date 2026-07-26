#!/usr/bin/env python3
"""Dependency-free CI validation for S03 v0.1.7."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import zipfile


ROOT = Path(__file__).resolve().parents[2]
NAME = "FINMODEL_VARSHAVKA_USALI_SCENARIO_S03_v0.1.7.xlsx"
FILE = ROOT / "models/scenarios/S03" / NAME
SUMS = ROOT / "models/scenarios/S03/SHA256SUMS.txt"
NS = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_NS = {
    "r": "http://schemas.openxmlformats.org/package/2006/relationships"
}


def shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    return [
        "".join(node.itertext())
        for node in root.findall("x:si", NS)
    ]


def sheet_targets(archive: zipfile.ZipFile) -> dict[str, str]:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    targets = {
        rel.attrib["Id"]: rel.attrib["Target"]
        for rel in rels.findall("r:Relationship", REL_NS)
    }
    result: dict[str, str] = {}
    relation_key = (
        "{http://schemas.openxmlformats.org/officeDocument/2006/"
        "relationships}id"
    )
    sheets_node = workbook.find("x:sheets", NS)
    assert sheets_node is not None
    for sheet in sheets_node:
        target = targets[sheet.attrib[relation_key]].lstrip("/")
        if not target.startswith("xl/"):
            target = f"xl/{target}"
        result[sheet.attrib["name"]] = target
    return result


def cell_values(
    archive: zipfile.ZipFile, target: str, strings: list[str]
) -> dict[str, str]:
    root = ET.fromstring(archive.read(target))
    result: dict[str, str] = {}
    for cell in root.findall(".//x:c", NS):
        ref = cell.attrib["r"]
        kind = cell.attrib.get("t")
        if kind == "inlineStr":
            inline = cell.find("x:is", NS)
            result[ref] = "".join(inline.itertext()) if inline is not None else ""
            continue
        value = cell.findtext("x:v", default="", namespaces=NS)
        if kind == "s" and value:
            result[ref] = strings[int(value)]
        else:
            result[ref] = value
    return result


def main() -> None:
    digest = hashlib.sha256(FILE.read_bytes()).hexdigest()
    expected = {
        parts[-1]: parts[0]
        for line in SUMS.read_text(encoding="utf-8").splitlines()
        if (parts := line.split())
    }[NAME]
    assert digest == expected, (digest, expected)

    with zipfile.ZipFile(FILE) as archive:
        strings = shared_strings(archive)
        sheets = sheet_targets(archive)
        assert len(sheets) == 16, len(sheets)
        assert "15_ЗАВТРАК_v0.1.7" in sheets

        formula_count = 0
        error_cells: list[str] = []
        for name, target in sheets.items():
            root = ET.fromstring(archive.read(target))
            formula_count += len(root.findall(".//x:f", NS))
            error_cells.extend(
                f"{name}!{cell.attrib['r']}"
                for cell in root.findall(".//x:c[@t='e']", NS)
            )
        assert formula_count == 7755, formula_count
        assert not error_cells, error_cells

        checks = cell_values(archive, sheets["08_ПРОВЕРКИ"], strings)
        required = {
            "CHK.BREAKFAST.MIX",
            "CHK.BREAKFAST.EXCLUDED",
            "CHK.BREAKFAST.DRINK",
            "CHK.BREAKFAST.EXTERNAL",
            "CHK.BREAKFAST.SURCHARGE",
            "CHK.BREAKFAST.COGS",
            "CHK.BREAKFAST.FC",
            "CHK.MENU.POSITIONS",
            "CHK.BREAKFAST.RESERVE",
        }
        found: set[str] = set()
        for row in range(1, 47):
            code = checks.get(f"A{row}", "")
            status = checks.get(f"F{row}", "")
            if code in required:
                assert status == "OK", (code, status)
                found.add(code)
        assert found == required, required - found

        inputs = cell_values(archive, sheets["01_ВВОД"], strings)
        expected_inputs = {
            "HOTEL_BREAKFAST_ACTIVE_VARIANTS": 3,
            "HOTEL_BREAKFAST_EXTERNAL_SALE": 0,
            "HOTEL_BREAKFAST_BENEDICT_SHARE": 0,
            "HOTEL_BREAKFAST_SALMON_CROISSANT_SHARE": 0,
            "KITCHEN_ACTIVE_MENU_POSITIONS": 31,
            "TRAINING_CONTROL_BATCHES": 63,
        }
        actual: dict[str, float] = {}
        for row in range(138, 168):
            code = inputs.get(f"A{row}", "")
            if code in expected_inputs:
                actual[code] = float(inputs[f"D{row}"])
        assert actual == expected_inputs, actual

    json.loads((ROOT / "inputs/model_manifest.json").read_text(encoding="utf-8"))
    print(
        json.dumps(
            {
                "file": str(FILE),
                "sha256": digest,
                "sheets": 16,
                "formulas": formula_count,
                "formula_errors": 0,
                "required_breakfast_checks": len(required),
                "status": "OK",
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
