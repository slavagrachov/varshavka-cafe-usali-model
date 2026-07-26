#!/usr/bin/env python3
"""Validate the canonical VARSHAVKA issue register."""

from __future__ import annotations

from collections import Counter
from hashlib import sha256
from pathlib import Path
import re


REGISTER = Path(__file__).resolve().parents[1] / "docs/05-data/ISSUE_REGISTER.md"
ALLOWED_STATUSES = {
    "OPEN",
    "BLOCKED",
    "PLANNED",
    "MONITOR",
    "CLOSED",
    "SUPERSEDED",
}
ALLOWED_PRIORITIES = {"P0", "P1", "P2", "P3"}
EXPECTED_TOTAL = 97
EXPECTED_UNCLOSED = 87


def parse_rows() -> list[list[str]]:
    rows: list[list[str]] = []
    for line in REGISTER.read_text(encoding="utf-8").splitlines():
        if re.match(r"^\| `V-I-\d{3}` \|", line):
            cells = [cell.strip() for cell in line.strip("|").split("|")]
            if len(cells) != 8:
                raise ValueError(f"Unexpected column count: {line}")
            rows.append(cells)
    return rows


def main() -> None:
    rows = parse_rows()
    ids = [row[0].strip("`") for row in rows]
    numbers = [int(issue_id.rsplit("-", 1)[1]) for issue_id in ids]
    descriptions = [row[2].casefold() for row in rows]
    statuses = [row[3] for row in rows]
    priorities = [row[4] for row in rows]
    unclosed = [row for row in rows if row[3] != "CLOSED"]

    assert len(rows) == EXPECTED_TOTAL, (len(rows), EXPECTED_TOTAL)
    assert len(unclosed) == EXPECTED_UNCLOSED, (
        len(unclosed),
        EXPECTED_UNCLOSED,
    )
    assert len(set(ids)) == len(ids), "Duplicate issue IDs"
    assert numbers == list(range(1, EXPECTED_TOTAL + 1)), "Non-sequential IDs"
    assert len(set(descriptions)) == len(descriptions), "Duplicate descriptions"
    assert set(statuses) <= ALLOWED_STATUSES, set(statuses) - ALLOWED_STATUSES
    assert set(priorities) <= ALLOWED_PRIORITIES, (
        set(priorities) - ALLOWED_PRIORITIES
    )

    normalized = "\n".join("|".join(row) for row in unclosed).encode("utf-8")
    digest = sha256(normalized).hexdigest()

    print(f"Register: {REGISTER}")
    print(f"Total records: {len(rows)}")
    print(f"Unclosed records: {len(unclosed)}")
    print(f"Statuses: {dict(Counter(statuses))}")
    print(f"SHA-256 unclosed rows: {digest}")
    print("Issue register validation passed.")


if __name__ == "__main__":
    main()
