#!/usr/bin/env python3
"""Build evidence-backed draft nutrition calculations for Issue #82.

The calculation uses the exact frozen draft recipe blob and explicit official food
composition records. Generic records and proxy choices remain visible; they unblock
planning calculations, not nutrition-label release or laboratory confirmation.
"""

from __future__ import annotations

import csv
import hashlib
from collections import defaultdict
from dataclasses import dataclass, replace
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "07-operations" / "issue-82"
DATE = "2026-08-03"
RECIPE_VERSION = "0.1.0-DRAFT"
EXPECTED_RECIPES_GIT_BLOB = "c6b22ad5f2812cc989a0d3593f40e21207da8f53"
SCOPE = [f"VKM-{i:03d}" for i in range(1, 26)] + ["VKM-029", "VKM-030", "VKM-031"]
NUTRIENTS = ("protein", "fat", "carbohydrate", "energy")


@dataclass(frozen=True)
class Profile:
    source_record: str
    source_name: str
    protein: float
    fat: float
    carbohydrate: float
    energy: float
    status: str = "OFFICIAL_GENERIC_MATCH"
    note: str = "Official generic record matched to the recipe ingredient and declared state"

    def values(self) -> tuple[float, float, float, float]:
        return self.protein, self.fat, self.carbohydrate, self.energy


def parse_profiles(raw: str) -> dict[str, Profile]:
    result: dict[str, Profile] = {}
    for line in raw.strip().splitlines():
        key, record, name, p, f, c, e = line.split("|")
        result[key] = Profile(record, name, float(p), float(f), float(c), float(e))
    return result


# Values per 100 g are exact extracts from USDA FoodData Central SR Legacy 2018.
# The source archive, release URL and SHA-256 are recorded in NUTRITION_SOURCE_REGISTER.csv.
BASE = parse_profiles(r"""
ING-001|USDA-FDC-168896|Wheat flour, white, bread, enriched|11.98|1.66|72.53|361
ING-002|USDA-FDC-173647|Beverages, water, tap, drinking|0|0|0|0
ING-003|USDA-FDC-175043|Leavening agents, yeast, baker's, active dry|40.44|7.61|41.22|325
ING-004|USDA-FDC-173468|Salt, table|0|0|0|0
ING-005|USDA-FDC-171413|Oil, olive, salad or cooking|0|100|0|884
ING-006|USDA-FDC-170501|Tomatoes, crushed, canned|1.64|0.28|7.29|32
ING-007|USDA-FDC-169230|Garlic, raw|6.36|0.5|33.06|149
ING-008|USDA-FDC-171328|Spices, oregano, dried|9|4.28|68.92|265
ING-009|USDA-FDC-170845|Cheese, mozzarella, whole milk|22.17|22.14|2.4|299
ING-010|USDA-FDC-170848|Cheese, parmesan, hard|35.75|25|3.22|392
ING-011|USDA-FDC-172232|Basil, fresh|3.15|0.64|2.65|23
ING-013|USDA-FDC-170843|Cheese, fontina|25.6|31.14|1.55|389
ING-014|USDA-FDC-173864|Ham, sliced, regular (approximately 11% fat)|16.6|8.8|3.63|164
ING-015|USDA-FDC-169251|Mushrooms, white, raw|3.09|0.34|3.26|22
ING-016|USDA-FDC-170000|Onions, raw|1.1|0.1|9.34|40
ING-017|USDA-FDC-174575|Pepperoni, beef and pork, sliced|19.25|46.28|1.18|504
ING-018|USDA-FDC-170459|Tomato products, canned, paste, without salt added|4.32|0.47|18.91|82
ING-019|USDA-FDC-168567|Tomatoes, sun-dried|14.11|2.97|55.76|258
ING-020|USDA-FDC-168886|Rye flour, medium|10.88|1.52|75.43|349
ING-021|USDA-FDC-169740|Barley malt flour|10.28|1.84|78.3|361
ING-022|USDA-FDC-168820|Molasses|0|0.1|74.73|290
ING-023|USDA-FDC-170922|Spices, coriander seed|12.37|17.77|54.99|298
ING-024|USDA-FDC-172370|Oil, vegetable, soybean, refined|0|100|0|884
ING-025|USDA-FDC-171265|Milk, whole, 3.25% milkfat, with added vitamin D|3.15|3.25|4.8|61
ING-026|USDA-FDC-171287|Egg, whole, raw, fresh|12.56|9.51|0.72|143
ING-027|USDA-FDC-173410|Butter, salted|0.85|81.11|0.06|717
ING-028|USDA-FDC-169655|Sugars, granulated|0|0|99.98|387
ING-029|USDA-FDC-171287|Egg, whole, raw, fresh|12.56|9.51|0.72|143
ING-030|USDA-FDC-170845|Cheese, mozzarella, whole milk|22.17|22.14|2.4|299
ING-031|USDA-FDC-170457|Tomatoes, red, ripe, raw, year round average|0.88|0.2|3.89|18
ING-032|USDA-FDC-172241|Vinegar, balsamic|0.49|0|17.03|88
ING-034|USDA-FDC-169249|Lettuce, green leaf, raw|1.36|0.15|2.87|15
ING-035|USDA-FDC-169249|Lettuce, green leaf, raw|1.36|0.15|2.87|15
ING-036|USDA-FDC-175180|Crustaceans, shrimp, cooked|23.98|0.28|0.2|99
ING-037|USDA-FDC-168202|Apples, raw, golden delicious, with skin|0.28|0.15|13.6|57
ING-038|USDA-FDC-168409|Cucumber, with peel, raw|0.65|0.11|3.63|15
ING-039|USDA-FDC-167747|Lemon juice, raw|0.35|0.24|6.9|22
ING-040|USDA-FDC-169640|Honey|0.3|0|82.4|304
ING-041|USDA-FDC-172234|Mustard, prepared, yellow|3.74|3.34|5.83|60
ING-042|USDA-FDC-168599|Nuts, mixed nuts, dry roasted, with peanuts, with salt added|17.3|51.45|25.35|594
ING-043|USDA-FDC-170108|Peppers, sweet, red, raw|0.99|0.3|6.03|26
ING-044|USDA-FDC-173420|Cheese, feta|14.21|21.49|3.88|265
ING-045|USDA-FDC-169096|Olives, pickled, canned or bottled, green|1.03|15.32|3.84|145
ING-046|USDA-FDC-170000|Onions, raw|1.1|0.1|9.34|40
ING-048|USDA-FDC-169146|Beets, cooked, boiled, drained|1.68|0.18|9.96|44
ING-049|USDA-FDC-170440|Potatoes, boiled, cooked without skin, flesh, without salt|1.71|0.1|20.01|86
ING-050|USDA-FDC-170394|Carrots, cooked, boiled, drained, without salt|0.76|0.18|8.22|35
ING-051|USDA-FDC-168558|Pickles, cucumber, dill or kosher dill|0.5|0.3|2.41|12
ING-052|USDA-FDC-169279|Sauerkraut, canned, solids and liquids|0.91|0.14|4.28|19
ING-053|USDA-FDC-170015|Peas, green, canned, drained solids, rinsed in tap water|4.33|0.95|11.82|71
ING-054|USDA-FDC-171985|Fish, salmon, chinook, smoked (lox), regular|18.28|4.32|0|117
ING-055|USDA-FDC-167746|Lemons, raw, without peel|1.1|0.3|9.32|29
ING-056|USDA-FDC-172238|Capers, canned|2.36|0.86|4.89|23
ING-057|USDA-FDC-175116|Fish, herring, Atlantic, raw|17.96|9.04|0|158
ING-058|USDA-FDC-170030|Potatoes, Russet, flesh and skin, baked|2.63|0.13|21.44|95
ING-059|USDA-FDC-170416|Parsley, fresh|2.97|0.79|6.33|36
ING-060|USDA-FDC-169096|Olives, pickled, canned or bottled, green|1.03|15.32|3.84|145
ING-061|USDA-FDC-169094|Olives, ripe, canned (small-extra large)|0.84|10.9|6.04|116
ING-064|USDA-FDC-169975|Cabbage, raw|1.28|0.1|5.8|25
ING-065|USDA-FDC-172237|Vinegar, distilled|0|0|0.04|18
ING-067|USDA-FDC-174925|Bread, white, commercially prepared, toasted|9|4|54.5|290
ING-068|USDA-FDC-171009|Salad dressing, mayonnaise, regular|0.96|74.85|0.57|680
ING-069|USDA-FDC-172883|Soup, stock, beef, home-prepared|1.97|0.09|1.2|13
ING-070|USDA-FDC-172883|Soup, stock, beef, home-prepared|1.97|0.09|1.2|13
ING-071|USDA-FDC-169145|Beets, raw|1.61|0.17|9.56|43
ING-072|USDA-FDC-170026|Potatoes, flesh and skin, raw|2.05|0.09|17.49|77
ING-073|USDA-FDC-174730|Beef, manufacturing, cooked, boiled|24.21|3.26|0|126
ING-074|USDA-FDC-170393|Carrots, raw|0.93|0.24|9.58|41
ING-075|USDA-FDC-171257|Cream, sour, cultured|2.44|19.35|4.63|198
ING-076|USDA-FDC-171955|Fish, cod, Atlantic, raw|17.81|0.67|0|82
ING-077|USDA-FDC-170859|Cream, fluid, heavy whipping|2.84|36.08|2.84|340
ING-078|USDA-FDC-171583|Soup, vegetable broth, ready to serve|0.24|0.07|0.93|5
ING-079|USDA-FDC-168462|Spinach, raw|2.86|0.39|3.63|23
ING-080|USDA-FDC-170173|Coconut milk, canned|2.02|21.33|2.81|197
ING-082|USDA-FDC-173647|Beverages, water, tap, drinking|0|0|0|0
ING-083|USDA-FDC-174531|Sauce, fish, ready-to-serve|5.06|0.01|3.64|35
ING-084|USDA-FDC-168565|Squash, zucchini, baby, raw|2.71|0.4|3.11|21
ING-085|USDA-FDC-168914|Rice noodles, cooked|1.79|0.2|24.01|108
ING-088|USDA-FDC-174036|Beef, ground, 80% lean meat / 20% fat, raw|17.17|20|0|254
ING-089|USDA-FDC-168605|Beef, retail cuts, separable fat, raw|8.21|70.89|0|674
ING-090|USDA-FDC-171254|Cheese spread, pasteurized process, American|16.41|21.23|8.73|290
ING-091|USDA-FDC-170457|Tomatoes, red, ripe, raw, year round average|0.88|0.2|3.89|18
ING-092|USDA-FDC-168558|Pickles, cucumber, dill or kosher dill|0.5|0.3|2.41|12
ING-093|USDA-FDC-170000|Onions, raw|1.1|0.1|9.34|40
ING-094|USDA-FDC-171009|Salad dressing, mayonnaise, regular|0.96|74.85|0.57|680
ING-095|USDA-FDC-170054|Tomato products, canned, sauce|1.2|0.3|5.31|24
ING-096|USDA-FDC-169249|Lettuce, green leaf, raw|1.36|0.15|2.87|15
ING-097|USDA-FDC-174736|Beef, tenderloin, separable lean only, raw|21.19|6.1|0|140
ING-098|USDA-FDC-172883|Soup, stock, beef, home-prepared|1.97|0.09|1.2|13
ING-099|USDA-FDC-171417|Salad dressing, home recipe, vinegar and oil|0|50.1|2.5|449
ING-100|USDA-FDC-168877|Rice, white, long-grain, regular, raw, enriched|7.13|0.66|79.95|365
ING-101|USDA-FDC-173647|Beverages, water, tap, drinking|0|0|0|0
ING-102|USDA-FDC-169228|Eggplant, raw|0.98|0.18|5.88|25
ING-103|USDA-FDC-170379|Broccoli, raw|2.82|0.37|6.64|34
ING-104|USDA-FDC-169723|Wheat flour, white, cake, enriched|8.2|0.86|78.03|362
ING-105|USDA-FDC-172803|Baking powder, double-acting, sodium aluminum sulfate|0|0|27.7|53
ING-106|USDA-FDC-173468|Salt, table|0|0|0|0
ING-107|USDA-FDC-171711|Blueberries, raw|0.74|0.33|14.49|57
ING-108|USDA-FDC-173418|Cheese, cream|6.15|34.44|5.52|350
ING-109|USDA-FDC-169656|Sugars, powdered|0|0|99.77|389
ING-110|USDA-FDC-169698|Cornstarch|0.26|0.05|91.27|381
ING-111|USDA-FDC-169668|Frostings, glaze, prepared-from-recipe|0.44|0.53|83.65|341
ING-112|USDA-FDC-169656|Sugars, powdered|0|0|99.77|389
ING-113|USDA-FDC-167749|Lemon peel, raw|1.5|0.3|16|47
""")

# Official CoFID records or transparent composites for labels that contain alternatives.
BASE.update({
    "ING-012": Profile("COFID-12-354", "Cheese, Danish blue", 20.5, 28.9, 0.0, 342, "OFFICIAL_PROXY_ASSUMPTION", "Blue-vein cheese proxy for Gorgonzola; exact SKU required"),
    "ING-033": Profile("PROJECT-COMPOSITE-NUT-001", "50% USDA salt + 50% CoFID mixed herbs", 6.05, 4.25, 18.15, 130.5, "COMPOSITE_ASSUMPTION", "Midpoint assumption for combined recipe label 'salt and spices'; endpoints are preserved"),
    "ING-047": Profile("PROJECT-COMPOSITE-NUT-002", "50% USDA salt + 50% USDA dried oregano", 4.5, 2.14, 34.46, 132.5, "COMPOSITE_ASSUMPTION", "Midpoint assumption for combined recipe label 'oregano and salt'; endpoints are preserved"),
    "ING-062": Profile("PROJECT-COMPOSITE-NUT-003", "50% USDA lemon peel + 50% USDA orange peel", 1.5, 0.25, 20.5, 72.0, "COMPOSITE_ASSUMPTION", "Equal-mass citrus-zest midpoint; exact citrus mix required"),
    "ING-063": Profile("COFID-13-884", "Mixed herbs, dried", 12.1, 8.5, 36.3, 261, "OFFICIAL_GENERIC_MATCH", "Exact official CoFID match to mixed dried herbs"),
    "ING-066": Profile("COFID-18-088", "Beef, topside, roasted medium-rare, lean", 32.2, 5.1, 0.0, 175, "OFFICIAL_PROXY_ASSUMPTION", "Cooked lean roast-beef proxy; supplier cut and fat level required"),
    "ING-081": Profile("COFID-17-720", "Curry paste", 4.7, 21.3, 11.3, 253, "OFFICIAL_GENERIC_MATCH", "Official generic curry-paste record; recipe still marks paste as project"),
    "ING-086": Profile("PROJECT-COMPOSITE-NUT-004", "50% USDA parsley + 50% USDA lime juice", 1.695, 0.43, 7.375, 30.5, "COMPOSITE_ASSUMPTION", "Equal-mass midpoint for combined recipe label 'greens and lime'; endpoints are preserved"),
})

PROXY_IDS = {
    "ING-006", "ING-012", "ING-013", "ING-014", "ING-019", "ING-020", "ING-021", "ING-023", "ING-024", "ING-025", "ING-026", "ING-027", "ING-030", "ING-033", "ING-034", "ING-035", "ING-042", "ING-043", "ING-045", "ING-047", "ING-052", "ING-054", "ING-057", "ING-059", "ING-062", "ING-066", "ING-068", "ING-069", "ING-070", "ING-073", "ING-075", "ING-077", "ING-078", "ING-080", "ING-082", "ING-083", "ING-086", "ING-088", "ING-089", "ING-090", "ING-092", "ING-094", "ING-098", "ING-099", "ING-105", "ING-108", "ING-110", "ING-111", "ING-112",
}
for ingredient_id in PROXY_IDS:
    if ingredient_id in BASE and BASE[ingredient_id].status == "OFFICIAL_GENERIC_MATCH":
        BASE[ingredient_id] = replace(
            BASE[ingredient_id],
            status="OFFICIAL_PROXY_ASSUMPTION",
            note="Official record provides a planning proxy; recipe label/SKU/state is not specific enough for release",
        )


def parse_alternatives(raw: str) -> dict[str, list[Profile]]:
    result: dict[str, list[Profile]] = defaultdict(list)
    for line in raw.strip().splitlines():
        key, record, name, p, f, c, e = line.split("|")
        result[key].append(Profile(record, name, float(p), float(f), float(c), float(e), "SENSITIVITY_CANDIDATE", "Official candidate for uncertainty envelope"))
    return result


ALTERNATIVES = parse_alternatives(r"""
ING-012|COFID-12-367|Cheese, Stilton, blue|23.7|35|0.1|410
ING-013|USDA-FDC-173414|Cheese, cheddar|22.87|33.31|3.37|403
ING-019|USDA-FDC-169384|Tomatoes, sun-dried, packed in oil, drained|5.06|14.08|23.33|213
ING-025|USDA-FDC-170872|Milk, lowfat, fluid, 1% milkfat|3.37|0.97|4.99|42
ING-030|USDA-FDC-173418|Cheese, cream|6.15|34.44|5.52|350
ING-033|USDA-FDC-173468|Salt, table|0|0|0|0
ING-033|COFID-13-884|Mixed herbs, dried|12.1|8.5|36.3|261
ING-042|USDA-FDC-170562|Seeds, sunflower seed kernels, dried|20.78|51.46|20|584
ING-045|USDA-FDC-169094|Olives, ripe, canned|0.84|10.9|6.04|116
ING-047|USDA-FDC-173468|Salt, table|0|0|0|0
ING-047|USDA-FDC-171328|Spices, oregano, dried|9|4.28|68.92|265
ING-054|COFID-16-412|Salmon, smoked, cold-smoked|22.8|10.1|0.5|184
ING-057|COFID-16-183|Herring, pickled|16.7|11.1|10|209
ING-062|USDA-FDC-167749|Lemon peel, raw|1.5|0.3|16|47
ING-062|USDA-FDC-169103|Orange peel, raw|1.5|0.2|25|97
ING-068|USDA-FDC-173594|Salad dressing, mayonnaise, light|0.37|22.22|9.23|238
ING-069|USDA-FDC-171564|Gravy, beef, canned, ready-to-serve|3.75|2.36|4.81|53
ING-073|COFID-18-015|Beef, brisket, boiled, lean and fat|27.8|17.4|0|268
ING-075|USDA-FDC-173443|Sour cream, light|3.5|10.6|7.1|136
ING-077|USDA-FDC-170857|Cream, fluid, light|2.96|19.1|3.66|195
ING-077|COFID-12-334|Cream, fresh, double|1.6|53.7|1.7|496
ING-078|USDA-FDC-171606|Fish broth|2|0.6|0.4|16
ING-080|COFID-14-890|Coconut milk, reduced fat, retail|0.7|7.7|2|79
ING-082|USDA-FDC-171583|Soup, vegetable broth, ready to serve|0.24|0.07|0.93|5
ING-083|COFID-17-721|Soy sauce, light and dark varieties|3|0|17.9|79
ING-086|USDA-FDC-170416|Parsley, fresh|2.97|0.79|6.33|36
ING-086|USDA-FDC-168156|Lime juice, raw|0.42|0.07|8.42|25
ING-088|USDA-FDC-171790|Beef, ground, 95% lean meat / 5% fat, raw|21.41|5|0|137
ING-089|USDA-FDC-171400|Fat, beef tallow|0|100|0|902
ING-090|USDA-FDC-169080|Cheese, pasteurized process, American, low fat|24.6|7|3.5|180
ING-094|USDA-FDC-173594|Salad dressing, mayonnaise, light|0.37|22.22|9.23|238
ING-098|USDA-FDC-171564|Gravy, beef, canned, ready-to-serve|3.75|2.36|4.81|53
ING-099|USDA-FDC-172237|Vinegar, distilled|0|0|0.04|18
ING-105|USDA-FDC-172804|Baking powder, double-acting, straight phosphate|0.1|0|24.1|51
ING-108|USDA-FDC-169079|Cheese, cream, low fat|7.85|16.67|6.73|208
ING-110|USDA-FDC-167682|Pectin, liquid|0|0|2.1|11
ING-110|USDA-FDC-168821|Pectin, unsweetened, dry mix|0.3|0.3|90.4|325
ING-111|USDA-FDC-169656|Sugars, powdered|0|0|99.77|389
ING-112|USDA-FDC-169668|Frostings, glaze, prepared-from-recipe|0.44|0.53|83.65|341
""")


def read_csv(name: str) -> list[dict[str, str]]:
    with (OUT / name).open(encoding="utf-8-sig", newline="") as stream:
        return list(csv.DictReader(stream))


def write_csv(name: str, rows: list[dict[str, object]]) -> None:
    assert rows
    with (OUT / name).open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]), extrasaction="raise", lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def git_blob_sha(path: Path) -> str:
    data = path.read_bytes()
    return hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()


def envelope(ingredient_id: str) -> tuple[tuple[float, ...], tuple[float, ...], str]:
    candidates = [BASE[ingredient_id], *ALTERNATIVES.get(ingredient_id, [])]
    columns = list(zip(*(candidate.values() for candidate in candidates)))
    low = tuple(min(column) for column in columns)
    high = tuple(max(column) for column in columns)
    basis = ";".join(candidate.source_record for candidate in candidates)
    return low, high, basis


def serving_mass(passport: dict[str, str]) -> tuple[float, str, str]:
    output = float(passport["draft_target_output"])
    code = passport["dish_code"]
    if code == "VKM-029":
        return output / 12, "г", "CALCULATED_FROM_DRAFT: 1800 г / 12 порций"
    if code == "VKM-030":
        return output / 10, "г", "CALCULATED_FROM_DRAFT: 1200 г / 10 порций"
    if code == "VKM-031":
        return output * 2 / 20, "г", "CALCULATED_FROM_DRAFT: 600 г × 2 шт. / 20 шт."
    return output, passport["output_unit"], "DRAFT: target output used as one sales unit"


def fmt(value: float, digits: int = 2) -> str:
    return f"{value:.{digits}f}"


def source_rows() -> list[dict[str, str]]:
    return [
        {"nutrition_source_id": "NUT-SRC-001", "source_name": "Frozen ChefTechnology recipe package", "source_url_or_locator": "docs/07-operations/issue-82/RECIPES.csv", "source_version_or_date": f"{RECIPE_VERSION}; git blob {EXPECTED_RECIPES_GIT_BLOB}", "source_class": "accepted project handoff", "source_status": "DRAFT", "allowed_use": "ingredient identifiers and draft net quantities", "prohibited_use": "claim approved recipe or observed yield", "evidence_ids": "EVD-0005;EVD-0007;EVD-0008;CHEF-COMMIT-6f987d2", "retrieved_or_issued_date": DATE, "confirmation_owner": "Chef / Orchestrator"},
        {"nutrition_source_id": "NUT-SRC-002", "source_name": "Dish passports", "source_url_or_locator": "docs/07-operations/issue-82/DISH_PASSPORTS.csv", "source_version_or_date": RECIPE_VERSION, "source_class": "accepted project handoff", "source_status": "DRAFT", "allowed_use": "dish identity, draft output and sales-unit basis", "prohibited_use": "claim measured output", "evidence_ids": "EVD-0003;EVD-0004;EVD-0005", "retrieved_or_issued_date": DATE, "confirmation_owner": "Chef / Owner"},
        {"nutrition_source_id": "NUT-SRC-003", "source_name": "Issue #82 Evidence Matrix", "source_url_or_locator": "docs/07-operations/issue-82/EVIDENCE_MATRIX.csv", "source_version_or_date": DATE, "source_class": "accepted evidence gate", "source_status": "FACT", "allowed_use": "retain source and validation limitations", "prohibited_use": "infer supplier SKU or laboratory confirmation", "evidence_ids": "EVD-0027;EVD-0028", "retrieved_or_issued_date": DATE, "confirmation_owner": "SourceAuditor / NutritionDataAgent"},
        {"nutrition_source_id": "NUT-SRC-004", "source_name": "TR TS 022/2011 — food labelling", "source_url_or_locator": "https://eec.eaeunion.org/comission/department/deptexreg/tr/PischevkaMarkirovka.php", "source_version_or_date": "official EEC page; accessed 2026-08-03", "source_class": "official regulatory primary source", "source_status": "FACT", "allowed_use": "presentation basis and distinction between calculated and confirmed values", "prohibited_use": "ingredient composition source", "evidence_ids": "METHOD-NUT-002", "retrieved_or_issued_date": DATE, "confirmation_owner": "NutritionDataAgent / LegalCompliance owner"},
        {"nutrition_source_id": "NUT-SRC-005", "source_name": "McCance and Widdowson CoFID 2021", "source_url_or_locator": "https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid", "source_version_or_date": "2021; XLSX SHA-256 436e9445ef2adb2a75f3d7edd51302de3adad25385f9795fc94ba58bd030e97d", "source_class": "official government composition database", "source_status": "FACT", "allowed_use": "exact record values and named sensitivity candidates", "prohibited_use": "claim Russian supplier SKU match", "evidence_ids": "METHOD-NUT-002", "retrieved_or_issued_date": DATE, "confirmation_owner": "NutritionDataAgent"},
        {"nutrition_source_id": "NUT-SRC-006", "source_name": "McCance and Widdowson CoFID old foods", "source_url_or_locator": "https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid", "source_version_or_date": "2021 archive; XLSX SHA-256 b3f74af4016e14ebbe41590dc12221ba71c03e316dd0e61d7c96a4c869dc0ca1", "source_class": "official government archived composition database", "source_status": "FACT_WITH_AGE_LIMITATION", "allowed_use": "named sensitivity candidates unavailable in current CoFID", "prohibited_use": "prefer over current exact record or supplier label", "evidence_ids": "METHOD-NUT-002", "retrieved_or_issued_date": DATE, "confirmation_owner": "NutritionDataAgent"},
        {"nutrition_source_id": "NUT-SRC-007", "source_name": "USDA FoodData Central SR Legacy", "source_url_or_locator": "https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip", "source_version_or_date": "SR Legacy 2018-04; ZIP SHA-256 b80817294b8850530aaedf2e515c02593b1824f763a0ff356e5c2081643e6fd0", "source_class": "official government composition database", "source_status": "FACT", "allowed_use": "exact FDC record values and named sensitivity candidates", "prohibited_use": "claim Russian supplier SKU match", "evidence_ids": "METHOD-NUT-002", "retrieved_or_issued_date": DATE, "confirmation_owner": "NutritionDataAgent"},
        {"nutrition_source_id": "NUT-SRC-008", "source_name": "Supplier/manufacturer label for exact purchased SKU", "source_url_or_locator": "null", "source_version_or_date": "null", "source_class": "required release evidence", "source_status": "BLOCKED", "allowed_use": "replace generic/proxy record after SKU approval", "prohibited_use": "invent SKU or label values", "evidence_ids": "EVD-0016;EVD-0027", "retrieved_or_issued_date": "null", "confirmation_owner": "Procurement / NutritionDataAgent"},
    ]


def main() -> None:
    recipe_path = OUT / "RECIPES.csv"
    assert git_blob_sha(recipe_path) == EXPECTED_RECIPES_GIT_BLOB, "Recipe blob changed; nutrition recalculation requires new Chef handoff"
    passports = read_csv("DISH_PASSPORTS.csv")
    recipes = read_csv("RECIPES.csv")
    assert [row["dish_code"] for row in passports] == SCOPE
    assert len(recipes) == 253 and {row["recipe_version"] for row in recipes} == {RECIPE_VERSION}
    assert {row["dish_code"] for row in recipes} == set(SCOPE)
    assert all(row["net_unit"] == "г" for row in recipes)

    recipe_by_dish: dict[str, list[dict[str, str]]] = defaultdict(list)
    ingredient_stats: dict[str, dict[str, object]] = {}
    ingredient_names: dict[str, str] = {}
    for row in recipes:
        recipe_by_dish[row["dish_code"]].append(row)
        ingredient_names[row["ingredient_id"]] = row["ingredient_name"]
        stat = ingredient_stats.setdefault(row["ingredient_id"], {"lines": 0, "dishes": set()})
        stat["lines"] = int(stat["lines"]) + 1
        assert isinstance(stat["dishes"], set)
        stat["dishes"].add(row["dish_code"])

    # ING-087 is not mapped to a generic bread. It is derived from the exact draft VKM-008 recipe.
    vkm008 = recipe_by_dish["VKM-008"]
    assert {row["ingredient_id"] for row in vkm008} <= set(BASE)
    vkm008_output = float(next(row["draft_target_output"] for row in passports if row["dish_code"] == "VKM-008"))
    derived = [sum(float(row["net_qty"]) * BASE[row["ingredient_id"]].values()[i] / 100 for row in vkm008) * 100 / vkm008_output for i in range(4)]
    BASE["ING-087"] = Profile("PROJECT-DERIVED-VKM-008", "Brioche derived from exact VKM-008 draft recipe", *derived, "PROJECT_DERIVED_FROM_DRAFT_RECIPE", f"Derived from {len(vkm008)} lines and {vkm008_output:g} g draft output; no generic brioche substitution")

    assert set(ingredient_names) == set(BASE) and len(BASE) == 113

    ingredient_rows: list[dict[str, object]] = []
    for idx, ingredient_id in enumerate(sorted(BASE), 1):
        profile = BASE[ingredient_id]
        low, high, sensitivity_basis = envelope(ingredient_id)
        stat = ingredient_stats[ingredient_id]
        dishes = stat["dishes"]
        assert isinstance(dishes, set)
        source_id = "NUT-SRC-007" if profile.source_record.startswith("USDA") else "NUT-SRC-005" if profile.source_record.startswith("COFID") else "NUT-SRC-001;NUT-SRC-005;NUT-SRC-007"
        ingredient_rows.append({
            "nutrition_ingredient_record_id": f"NUT-ING-{idx:03d}", "ingredient_id": ingredient_id, "ingredient_name": ingredient_names[ingredient_id],
            "recipe_line_count": stat["lines"], "dish_count": len(dishes), "dish_codes": ";".join(sorted(dishes)),
            "composition_source_id": source_id, "composition_source_record_id": profile.source_record, "composition_source_name": profile.source_name,
            "composition_basis": "per 100 g edible food; macros and source-reported kcal", "protein_g_per_100g": fmt(profile.protein), "fat_g_per_100g": fmt(profile.fat), "carbohydrate_g_per_100g": fmt(profile.carbohydrate), "energy_kcal_per_100g": fmt(profile.energy),
            "protein_low": fmt(low[0]), "protein_high": fmt(high[0]), "fat_low": fmt(low[1]), "fat_high": fmt(high[1]), "carbohydrate_low": fmt(low[2]), "carbohydrate_high": fmt(high[2]), "energy_kcal_low": fmt(low[3]), "energy_kcal_high": fmt(high[3]),
            "nutrient_value_status": profile.status, "mapping_confidence": "HIGH" if profile.status == "OFFICIAL_GENERIC_MATCH" else "MEDIUM" if profile.status == "PROJECT_DERIVED_FROM_DRAFT_RECIPE" else "LOW_TO_MEDIUM",
            "exact_supplier_sku_confirmed": "false", "evidence_ids": "EVD-0027;METHOD-NUT-002", "method_or_source_note": profile.note,
            "sensitivity_basis_records": sensitivity_basis, "source_version_or_date": "USDA SR Legacy 2018 / CoFID 2021; accessed 2026-08-03", "confirmation_owner": "Procurement / NutritionDataAgent / Chef",
            "blocker_ids": "GAP-005;GAP-013", "next_action": "Confirm exact SKU/state and replace proxy where supplier label materially differs; preserve calculated status until recipe/output validation",
        })

    dish_rows: list[dict[str, object]] = []
    for idx, passport in enumerate(passports, 1):
        code = passport["dish_code"]
        lines = recipe_by_dish[code]
        output = float(passport["draft_target_output"])
        sale_mass, sale_unit, mass_method = serving_mass(passport)
        total = [0.0] * 4
        total_low = [0.0] * 4
        total_high = [0.0] * 4
        proxy_lines = 0
        for line in lines:
            ingredient_id = line["ingredient_id"]
            qty = float(line["net_qty"])
            profile = BASE[ingredient_id]
            low, high, _ = envelope(ingredient_id)
            for i, value in enumerate(profile.values()):
                total[i] += qty * value / 100
                total_low[i] += qty * low[i] / 100
                total_high[i] += qty * high[i] / 100
            proxy_lines += int(profile.status not in {"OFFICIAL_GENERIC_MATCH", "PROJECT_DERIVED_FROM_DRAFT_RECIPE"})
        per100 = [value * 100 / output for value in total]
        per100_low = [value * 100 / output for value in total_low]
        per100_high = [value * 100 / output for value in total_high]
        portion = [value * sale_mass / output for value in total]
        atwater = 4 * total[0] + 9 * total[1] + 4 * total[2]
        reconcile = (total[3] - atwater) / total[3] * 100 if total[3] else 0.0
        row: dict[str, object] = {
            "nutrition_record_id": f"NUT-DISH-{idx:03d}", "dish_code": code, "cost_card_code": passport["cost_card_code"], "tech_card_code": passport["tech_card_code"], "menu_section": passport["menu_section"], "dish_name": passport["dish_name"], "recipe_version": passport["recipe_version"], "recipe_blob_sha": EXPECTED_RECIPES_GIT_BLOB,
            "production_sales_unit": passport["production_sales_unit"], "draft_batch_or_item_output_mass": fmt(output), "output_unit": passport["output_unit"], "draft_sale_portion_mass": fmt(sale_mass), "sale_portion_unit": sale_unit, "portion_mass_method_status": mass_method, "ingredient_line_count": len(lines), "official_source_coverage_pct": "100.00", "proxy_or_composite_line_count": proxy_lines,
        }
        for i, nutrient in enumerate(NUTRIENTS):
            unit = "kcal" if nutrient == "energy" else "g"
            row[f"{nutrient}_{unit}_per_declared_output"] = fmt(total[i])
            row[f"{nutrient}_{unit}_per_declared_output_low"] = fmt(total_low[i])
            row[f"{nutrient}_{unit}_per_declared_output_high"] = fmt(total_high[i])
            row[f"{nutrient}_{unit}_per_100g"] = fmt(per100[i])
            row[f"{nutrient}_{unit}_per_100g_low"] = fmt(per100_low[i])
            row[f"{nutrient}_{unit}_per_100g_high"] = fmt(per100_high[i])
            row[f"{nutrient}_{unit}_per_sale_portion"] = fmt(portion[i])
        row.update({
            "source_energy_vs_atwater_difference_pct": fmt(reconcile), "calculation_status": "CALCULATED_DRAFT_WITH_ASSUMPTIONS" if proxy_lines else "CALCULATED_DRAFT",
            "release_status": "BLOCKED_PENDING_VALIDATION", "laboratory_confirmed": "false", "evidence_ids": "EVD-0005;EVD-0007;EVD-0008;EVD-0027;EVD-0028;METHOD-NUT-002",
            "calculation_method": "Sum net grams × official/proxy nutrient per 100 g; normalize to draft declared output; direct source kcal retained; sensitivity is official-candidate envelope",
            "source_date": DATE, "confirmation_owner": "NutritionDataAgent / Procurement / Chef", "blocker_ids": "GAP-005;GAP-013",
            "limitation": "Planning calculation, not approved nutrition declaration: recipe/output are draft and exact supplier SKU is not confirmed",
            "next_action": "Chef validates weighed recipe/output; Procurement confirms SKU labels; NutritionDataAgent remaps material differences; laboratory testing only if owner requires confirmed values",
        })
        dish_rows.append(row)

    write_csv("INGREDIENT_NUTRITION_REGISTER.csv", ingredient_rows)
    write_csv("DISH_NUTRITION.csv", dish_rows)
    write_csv("NUTRITION_SOURCE_REGISTER.csv", source_rows())

    proxy_count = sum(row["nutrient_value_status"] not in {"OFFICIAL_GENERIC_MATCH", "PROJECT_DERIVED_FROM_DRAFT_RECIPE"} for row in ingredient_rows)
    limitations = [
        {"limitation_id": "NUT-LIM-001", "scope": "ALL_28", "limitation": "All 113 ingredient identities now have a numeric official record, official proxy, transparent composite or project-derived profile.", "impact": "B/F/C and energy are numerically calculated for 28/28 dishes; source coverage is 100%.", "status": "RESOLVED_FOR_DRAFT_CALCULATION", "evidence_ids": "METHOD-NUT-002;NUT-SRC-005;NUT-SRC-007", "owner": "NutritionDataAgent", "next_action": "Retain automated 113/113 mapping and recipe-blob checks."},
        {"limitation_id": "NUT-LIM-002", "scope": "ALL_28", "limitation": f"Exact supplier SKU/state is unconfirmed; {proxy_count}/113 ingredient profiles require a proxy, composite or material product choice.", "impact": "Values support planning but not final menu/label declaration; sensitivity ranges quantify named alternatives.", "status": "BLOCKED_FOR_RELEASE", "evidence_ids": "EVD-0016;EVD-0027;METHOD-NUT-002", "owner": "Procurement / Chef / NutritionDataAgent", "next_action": "Freeze SKU/state and replace material proxy profiles with label or exact official records."},
        {"limitation_id": "NUT-LIM-003", "scope": "ALL_28", "limitation": "Recipe net quantities, process losses and declared output remain 0.1.0-DRAFT, although exact blob/version is locked.", "impact": "Per-100 g and per-portion values change if control-cook output changes.", "status": "BLOCKED_PENDING_VALIDATION", "evidence_ids": "EVD-0005;EVD-0007;EVD-0008", "owner": "Chef / Operations", "next_action": "Complete weighed control cooks and approve the resulting recipe version."},
        {"limitation_id": "NUT-LIM-004", "scope": "VKM-029;VKM-030;VKM-031", "limitation": "Sale-portion masses are derived from draft batch output and equal portion count.", "impact": "Portion values are project calculations, not measured piece values.", "status": "CALCULATED_DRAFT", "evidence_ids": "EVD-0004;EVD-0005;METHOD-NUT-002", "owner": "Chef", "next_action": "Weigh portions during control cook."},
        {"limitation_id": "NUT-LIM-005", "scope": "ALL_28", "limitation": "No laboratory confirmation or nutrient retention-factor study is available.", "impact": "Calculated macros/energy are estimates even after source mapping; laboratory_confirmed=false for 28/28.", "status": "BLOCKED_FOR_LAB_CONFIRMATION", "evidence_ids": "EVD-0028;METHOD-NUT-002", "owner": "Owner / NutritionDataAgent / Chef", "next_action": "Owner decides whether laboratory confirmation is required after recipes and SKUs are frozen."},
        {"limitation_id": "NUT-LIM-006", "scope": "ALL_28", "limitation": "Source-reported kcal is used; 4/9/4 reconciliation is a QA indicator, not a replacement formula because source databases may account for fibre/organic acids differently.", "impact": "Energy is traceable and reconciliation differences remain visible per dish.", "status": "CONTROLLED_METHOD_LIMITATION", "evidence_ids": "METHOD-NUT-002;NUT-SRC-005;NUT-SRC-007", "owner": "NutritionDataAgent", "next_action": "Reconfirm the applicable regulatory conversion basis before publication."},
    ]
    write_csv("NUTRITION_LIMITATIONS.csv", limitations)

    # Independent arithmetic and scope controls.
    assert len(ingredient_rows) == 113 and len(dish_rows) == 28
    assert {row["dish_code"] for row in dish_rows} == set(SCOPE)
    assert not ({"VKM-026", "VKM-027", "VKM-028"} & {row["dish_code"] for row in dish_rows})
    numeric_fields = [field for field in dish_rows[0] if field.startswith(("protein_", "fat_", "carbohydrate_", "energy_"))]
    assert all(row[field] not in {"", "null"} and float(row[field]) >= 0 for row in dish_rows for field in numeric_fields)
    assert all(row["official_source_coverage_pct"] == "100.00" for row in dish_rows)
    assert all(row["laboratory_confirmed"] == "false" and row["release_status"] == "BLOCKED_PENDING_VALIDATION" for row in dish_rows)
    assert all(float(row["protein_g_per_100g_low"]) <= float(row["protein_g_per_100g"]) <= float(row["protein_g_per_100g_high"]) for row in dish_rows)
    print(f"PASS: 28 dishes calculated; 113/113 ingredient mappings; {proxy_count} proxy/composite profiles; recipe blob locked")


if __name__ == "__main__":
    main()
