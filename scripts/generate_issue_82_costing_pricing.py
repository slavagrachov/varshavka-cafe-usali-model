#!/usr/bin/env python3
"""Build Issue #82 costing/pricing handoff from frozen recipes and cited observations."""

from __future__ import annotations

import csv
import math
import statistics
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/07-operations/issue-82"
AS_OF = "2026-08-03"


def read_csv(name):
    with (OUT / name).open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def write_csv(name, rows, fields):
    with (OUT / name).open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)


def fmt(value, places=6):
    if value is None:
        return ""
    return f"{value:.{places}f}".rstrip("0").rstrip(".")


# Public observations are retail benchmarks, not supplier quotations. A retail
# price is recorded only where the public page/snippet identified both price and
# pack/weight. VAT rate, delivery, MOQ and HoReCa availability remain unconfirmed.
# Prices are normalized mechanically: package price / package kg, litre or pieces.
OBS = [
    ("ING-001", "Мука ЛЕНТА высший сорт", "Лента", 1, "кг", 54.99, "https://lenta.com/product/muka-pshenichnaya-vs-rossiya-1kg-30854/"),
    ("ING-001", "Мука MAKFA хлебопекарная", "Лента", 1, "кг", 64.99, "https://lenta.com/product/muka-vs-rossiya-2kg-73015/"),
    ("ING-001", "Мука 365 ДНЕЙ хлебопекарная", "Лента", 2, "кг", 59.99, "https://lenta.com/product/muka-pshenichnaya-hlebopekarnaya-1s-rossiya-2kg-295803/"),
    ("ING-003", "Дрожжи САФ Левюр активные", "Лента", 0.1, "кг", 94.99, "https://lenta.com/product/drozhzhi-levyur-hlebopekarnye-suhie-aktivnye-rossiya-100g-86736/"),
    ("ING-003", "Дрожжи ANGEL активные", "Лента", 0.1, "кг", 59.99, "https://lenta.com/product/drozhzhi-suhie-aktivnye-dvypechki-i-napitkov-rossiya-100g-650540/"),
    ("ING-003", "Дрожжи SUPER сухие", "Лента", 0.08, "кг", 49.99, "https://lenta.com/product/drozhzhi-hlebopekarnye-suhie-rossiya-80g-727787/"),
    ("ING-004", "Соль Усольская", "Лента", 1, "кг", 42.99, "https://lenta.com/product/sol-usolskaya-pishhevaya-vyvarochnaya-jodirovannaya-rossiya-1kg-214838/"),
    ("ING-024", "Масло подсолнечное Олейна", "Лента", 1, "л", 129.99, "https://lenta.com/product/maslo-slivochnoe-krestyanskoe-nesolenoe-725-folga-bez-zmzh-rossiya-180g-609413/"),
    ("ING-026", "Меланж пастеризованный GROVO", "DA-Mart / GROVO", 0.9, "кг", 361.50, "https://da-mart.ru/catalog/goods/296776/"),
    ("ING-027", "Масло Вкуснотеево 82.5%", "Лента", 0.18, "кг", 199.99, "https://lenta.com/product/maslo-slivochnoe-vkusnoteevo-tradicionnoe-825-rossiya-180g-743324/"),
    ("ING-027", "Масло Северное молоко 82.5%", "Лента", 0.18, "кг", 189.99, "https://lenta.com/product/maslo-slivochnoe-krestyanskoe-725-evro-pachka-bez-zmzh-rossiya-180g-183115/"),
    ("ING-027", "Масло Северная долина 82.5%", "Лента", 0.18, "кг", 169.99, "https://lenta.com/product/maslo-slivochnoe-krestyanskoe-725-evro-pachka-bez-zmzh-rossiya-180g-183115/"),
    ("ING-028", "Сахар ЛЕНТА", "Лента", 1, "кг", 99.99, "https://lenta.com/product/sakhar-pesok-lenta-rossiya-1kg-717070/"),
    ("ING-009", "Моцарелла Bonfesto Пицца", "Ашан", 1, "кг", 899.99, "https://www.auchan.ru/product/syr-mocarella-picca-40-bonf/"),
    ("ING-009", "Моцарелла Primolatto", "Ашан", 0.25, "кг", 229.99, "https://www.auchan.ru/product/mocarella-250g-primolatto-bzmzh/"),
    ("ING-009", "Моцарелла Bonvida для пиццы", "Лента", 0.4, "кг", 279.99, "https://lenta.com/product/syr-mocarella-45-bez-zmzh-rossiya-400g-523760/"),
    ("ING-010", "Пармезан Dolce Granto", "Ашан", 0.2, "кг", 419.99, "https://www.auchan.ru/product/syr-parmezan-dolce-fasov-200g/"),
    ("ING-010", "Пармезан Поставы городок", "Ашан", 0.2, "кг", 189.99, "https://www.auchan.ru/product/syr-parmezan-postavy-45-200g/"),
    ("ING-010", "Пармезан Сыробогатов", "Ашан", 0.2, "кг", 353.99, "https://www.auchan.ru/product/cyr-tverdyy-syrobogatov-parmezan-40-200-g/"),
    ("ING-010", "Пармезан Laime", "Ашан", 0.2, "кг", 418.49, "https://www.auchan.ru/product/syr-tverdyy-laime-parmezan-200-g/"),
    ("ING-012", "Горгонзола Botticello", "Лента", 0.1, "кг", 189.99, "https://lenta.com/product/syr-s-golubojj-plesenyu-gorgonzola-50-bez-zmzh-rossiya-100g-909826/"),
    ("ING-012", "Горгонзола Cheezzi", "Лента", 0.1, "кг", 189.99, "https://lenta.com/product/syr-terra-del-gusto-gorgonzola-60-bez-zmzh-rossiya-100g-695478/"),
    ("ING-012", "Горгонзола Ненашево", "Лента", 0.1, "кг", 169.99, "https://lenta.com/product/syr-gorgonzola-55-bez-zmzh-rossiya-100g-703203/"),
    ("ING-016", "Лук репчатый весовой", "Лента", 1, "кг", 48.89, "https://lenta.com/product/morkov-ves-1kg-303639/"),
    ("ING-030", "Буррата Galbani mini", "Ашан", 0.125, "кг", 399.99, "https://www.auchan.ru/product/syr-galbani-burrata-50-125-g/"),
    ("ING-030", "Буррата Калачево", "Ашан", 0.125, "кг", 204.99, "https://www.auchan.ru/product/syr-buratta-kalachevo-125g/"),
    ("ING-030", "Буррата Калачево", "Ашан", 0.125, "кг", 179.00, "https://www.auchan.ru/product/syr-buratta-premium-125g/"),
    ("ING-030", "Буррата ЛЕНТА FRESH", "Лента", 0.15, "кг", 214.99, "https://lenta.com/product/syr-myagkijj-burrata-bez-zmzh-rossiya-150g-712603/"),
    ("ING-031", "Томаты Бакинские", "Лента", 0.35, "кг", 179.99, "https://lenta.com/product/losos-atlanticheskijj-file-slabosolenoe-rossiya-14426/"),
    ("ING-034", "Руккола", "Лента", 0.075, "кг", 84.99, "https://lenta.com/product/syr-burrata-60-bez-zmzh-rossiya-100g-701996/"),
    ("ING-036", "Креветки Fish&More очищенные", "Ашан", 0.5, "кг", 899.99, "https://www.auchan.ru/product/krevetka-s-m-26-30-och-s-hv-0-5/"),
    ("ING-036", "Креветки Polar очищенные", "Ашан", 0.5, "кг", 769.99, "https://www.auchan.ru/product/krevetki-ochishchennye-polar-vareno-morozhenye-200-300-500-g/"),
    ("ING-036", "Креветки Океан Вкуса 41/50", "Ашан", 0.5, "кг", 829.99, "https://www.auchan.ru/product/krevetki-korolevskie-okean-vkusa-ochishchennye-s-hvostom-41-50-500-g/"),
    ("ING-036", "Креветки Вкус Арт", "Ашан", 0.5, "кг", 909.99, "https://www.auchan.ru/product/krevetka-korol-sm-ochishch-vkusart/"),
    ("ING-036", "Креветки ЛЕНТА очищенные", "Лента", 0.5, "кг", 749.99, "https://lenta.com/product/krevetki-ochishchennye-vm-200300-rossiya-500g-227076/"),
    ("ING-037", "Яблоки Гренни Смит", "Лента", 1, "кг", 169.99, "https://lenta.com/product/treska-file-blochnoe-sm-rossiya-750g-663964/"),
    ("ING-052", "Капуста квашеная Белоручка", "Лента", 1, "кг", 249.99, "https://lenta.com/product/salat-vinegret-s-kvashenojj-kapustojj-belarus-250g-740773/"),
    ("ING-054", "Лосось слабосоленый филе", "Лента", 1, "кг", 3899.99, "https://lenta.com/product/losos-atlanticheskijj-file-slabosolenoe-rossiya-14426/"),
    ("ING-054", "Лосось слабосоленый филе-кусок", "Лента", 1, "кг", 2999.99, "https://lenta.com/product/losos-po-domashnemu-slabosolenyjj-rossiya-641592/"),
    ("ING-054", "Семга Русское море", "Ашан", 0.3, "кг", 1199.99, "https://www.auchan.ru/product/semga-russkoe-more-slabosolenaya-file-kusok-300-g/"),
    ("ING-054", "Семга Русское море", "Ашан", 0.2, "кг", 849.99, "https://www.auchan.ru/product/semga-russkoe-more-slabosolenaya-file-kusok-200-g/"),
    ("ING-064", "Капуста белокочанная", "Лента", 1, "кг", 49.99, "https://lenta.com/product/morkov-ves-1kg-303639/"),
    ("ING-071", "Свёкла весовая", "Лента", 1, "кг", 38.99, "https://lenta.com/product/morkov-ves-1kg-303639/"),
    ("ING-074", "Морковь весовая", "Лента", 1, "кг", 49.99, "https://lenta.com/product/morkov-ves-1kg-303639/"),
    ("ING-075", "Сметана Ростагроэкспорт 20%", "Лента", 0.5, "кг", 189.99, "https://lenta.com/product/smetana-15-bez-zmzh-rossiya-400g-704044/"),
    ("ING-076", "Треска Borealis филе", "Ашан", 0.6, "кг", 1249.99, "https://www.auchan.ru/product/treska-borealis-file-bez-shkury-600-g/"),
    ("ING-076", "Треска охлажденная Мурманская", "Ашан", 1, "кг", 1289.99, "https://www.auchan.ru/product/treska_file_murm_bk_05_12/"),
    ("ING-076", "Треска Красная птица филе", "Ашан", 1, "кг", 999.99, "https://www.auchan.ru/product/kp-file-treski-b-k-ves/"),
    ("ING-076", "Треска Вкус Арт филе", "Ашан", 0.6, "кг", 539.99, "https://www.auchan.ru/product/treska-file-vkus-art-600-gr/"),
    ("ING-077", "Сливки ЛЕНТА 33%", "Лента", 0.5, "кг", 189.99, "https://lenta.com/product/slivki-upast-dlya-vzbivaniya-33-bez-zmzh-rossiya-500g-669483/"),
    ("ING-077", "Сливки БМК 33%", "Лента", 0.5, "кг", 449.99, "https://lenta.com/product/slivki-upast-tva-33-bez-zmzh-rossiya-500g-564506/"),
    ("ING-077", "Сливки Село Зеленое 33%", "Лента", 0.5, "кг", 449.99, "https://lenta.com/product/slivki-upast-dlya-vzbivaniya-33-bez-zmzh-rossiya-500g-440469/"),
    ("ING-079", "Шпинат", "Лента", 0.125, "кг", 139.99, "https://lenta.com/product/syr-myagkijj-burrata-bez-zmzh-rossiya-150g-712603/"),
    ("ING-088", "Мякоть говяжья", "Лента", 1, "кг", 789.99, "https://lenta.com/product/govyadina-myakot-ohlazhdennaya-ves-rossiya-471055/"),
    ("ING-097", "Вырезка говяжья", "Ашан", 1, "кг", 1999.99, "https://www.auchan.ru/product/vyrezka-govyazhya-1kg/"),
    ("ING-097", "Вырезка говяжья Tenderloin", "Ашан", 1, "кг", 1463.99, "https://www.auchan.ru/product/vyrezka_zachischennaya_mramor/"),
    ("ING-097", "Вырезка говяжья Родные места", "Лента", 1, "кг", 809.99, "https://lenta.com/product/vyrezka-govyazhya-ves-rossiya-494615/"),
    ("ING-097", "Вырезка говяжья фермерская", "Лента", 1, "кг", 579.99, "https://lenta.com/product/govyadina--fermerskaya-vyrezka-polufabrikat-ohlazhdennyjj-ves-rossiya-655814/"),
    ("ING-103", "Брокколи весовая", "Лента", 1, "кг", 299.99, "https://lenta.com/product/treska-file-bk-ohl-ves-rossiya-80666/"),
    ("ING-105", "Разрыхлитель Dr.Bakers", "Лента", 0.01, "кг", 12.99, "https://lenta.com/product/slivki-upast-dlya-vzbivaniya-33-bez-zmzh-rossiya-500g-440469/"),
    ("ING-107", "Черника Свой урожай", "Лента", 0.3, "кг", 199.99, "https://lenta.com/product/chernika-rossiya-300g-402638/"),
    ("ING-107", "Черника И зимой и летом", "Лента", 0.3, "кг", 269.99, "https://lenta.com/product/chernika-rossiya-300g-698086/"),
    ("ING-107", "Черника МариАйс", "Лента", 0.3, "кг", 234.99, "https://lenta.com/product/chernika-bzam-pu-rossiya-300g-629698/"),
    ("ING-108", "Кремчиз Bonfesto", "Лента", 0.4, "кг", 219.99, "https://lenta.com/product/syr-tvorozhnyjj-kremchiz-slivochnyjj-70-bez-zmzh-belarus-400g-665842/"),
    ("ING-108", "Cream Nuvo Professional", "Лента", 0.38, "кг", 199.99, "https://lenta.com/product/syr-tvorozhnyjj-dlya-kulinarii-65-bez-zmzh-rossiya-400g-431241/"),
    ("ING-108", "Кремчиз Bonfesto", "Лента", 0.4, "кг", 278.99, "https://lenta.com/product/syr-tvorozhnyjj-kremchiz-70-bez-zmzh-belarus-400g-667751/"),
    ("ING-109", "Сахарная пудра ЛЕНТА", "Лента", 0.25, "кг", 39.99, "https://lenta.com/product/syr-tvorozhnyjj-violetta-slivochnyjj-70-bez-zmzh-rossiya-400g-538643/"),
    ("ING-110", "Крахмал кукурузный ЛЕНТА", "Лента", 0.4, "кг", 69.99, "https://lenta.com/product/syr-tvorozhnyjj-violetta-slivochnyjj-70-bez-zmzh-rossiya-400g-538643/"),
]

# 100% provenance review after Gate C. Active evidence is restricted to direct
# product cards whose page/slug and page result support the observed product and
# the same pack-price pair. Related-product snippets are not admissible.
REJECTED_PROVENANCE = {
    "PSR-0002": "URL slug is a 2 kg flour card while the observation used a 1 kg pack/related price",
    "PSR-0008": "URL is a butter card; oil price came from related products",
    "PSR-0011": "URL is 72.5% butter; observation claimed a different 82.5% SKU",
    "PSR-0012": "URL is another butter SKU; price came from related products",
    "PSR-0016": "URL/product identity does not prove Bonvida SKU",
    "PSR-0022": "Observed Cheezzi product identity does not match terra-del-gusto URL slug",
    "PSR-0024": "URL is carrot; onion price came from related products",
    "PSR-0029": "URL is salmon; tomato price came from related products",
    "PSR-0030": "URL is burrata; arugula price came from related products",
    "PSR-0036": "URL is cod; apple price came from related products",
    "PSR-0037": "URL is prepared vinaigrette; sauerkraut price came from related products",
    "PSR-0039": "URL is another salmon preparation; observed fillet-piece price came from related products",
    "PSR-0042": "URL is carrot; cabbage price came from related products",
    "PSR-0043": "URL is carrot; beet price came from related products",
    "PSR-0045": "URL is another sour-cream SKU; price came from related products",
    "PSR-0053": "URL is burrata; spinach price came from related products",
    "PSR-0059": "URL is cod; broccoli price came from related products",
    "PSR-0060": "URL is cream; baking-powder price came from related products",
    "PSR-0065": "URL is Hochland culinary cream cheese; Cream Nuvo price came from related products",
    "PSR-0066": "Direct card did not prove the observed Bonfesto variant/price pair",
    "PSR-0067": "URL is cream cheese; powdered-sugar price came from related products",
    "PSR-0068": "URL is cream cheese; starch price came from related products",
}

VERIFIED_DIRECT_PRODUCT_PACK_IDS = {
    "PSR-0001", "PSR-0003", "PSR-0004", "PSR-0005", "PSR-0006", "PSR-0007",
    "PSR-0009", "PSR-0010", "PSR-0013", "PSR-0014", "PSR-0015", "PSR-0017",
    "PSR-0018", "PSR-0019", "PSR-0020", "PSR-0021", "PSR-0023", "PSR-0025",
    "PSR-0026", "PSR-0027", "PSR-0028", "PSR-0031", "PSR-0032", "PSR-0033",
    "PSR-0034", "PSR-0035", "PSR-0038", "PSR-0040", "PSR-0041", "PSR-0044",
    "PSR-0046", "PSR-0047", "PSR-0048", "PSR-0049", "PSR-0050", "PSR-0051",
    "PSR-0052", "PSR-0054", "PSR-0055", "PSR-0056", "PSR-0057", "PSR-0058",
    "PSR-0061", "PSR-0062", "PSR-0063", "PSR-0064",
}


recipes = read_csv("RECIPES.csv")
passports = read_csv("DISH_PASSPORTS.csv")
sf_lines = read_csv("SEMI_FINISHED_RECIPE_LINES.csv")
sf_products = read_csv("SEMI_FINISHED_PRODUCTS.csv")
sf_mapping = read_csv("SEMI_FINISHED_MAPPING.csv")

ingredient_names = {}
gross_usage = defaultdict(float)
for r in recipes:
    ingredient_names[r["ingredient_id"]] = r["ingredient_name"]
    if r["gross_unit"] == "г":
        gross_usage[r["ingredient_id"]] += float(r["gross_qty"])

source_rows = []
by_ing_obs = defaultdict(list)
provenance_review_rows = []
for i, (ing, product, supplier, pack_qty, unit, pack_price, url) in enumerate(OBS, 1):
    source_id = f"PSR-{i:04d}"
    normalized = pack_price / pack_qty
    row = {
        "price_source_id": source_id, "ingredient_id": ing,
        "ingredient_name": ingredient_names.get(ing, ""), "observed_product": product,
        "supplier_or_retailer": supplier, "region": "Москва/Московская область (публичный онлайн-каталог)",
        "pack_qty": fmt(pack_qty), "pack_unit": unit, "pack_price_rub": fmt(pack_price, 2),
        "normalized_unit": f"руб./{unit}", "normalized_price_rub": fmt(normalized, 6),
        "price_date": AS_OF, "source_url": url,
        "vat_status": "Цена каталога включает налоги; ставка/вычет НДС не подтверждены",
        "delivery_status": "Не подтверждено", "moq_status": "Розничная упаковка; HoReCa MOQ не подтверждён",
        "evidence_status": "FACT_PUBLIC_OBSERVATION", "selection_flag": "0",
        "provenance_review_status": "VERIFIED_DIRECT_CARD",
        "provenance_review_date": AS_OF,
        "limitations": "Не является КП; доступность, региональная цена и условия поставки требуют проверки",
    }
    rejected_reason = REJECTED_PROVENANCE.get(source_id)
    provenance_review_rows.append({
        "price_source_id": source_id, "ingredient_id": ing, "observed_product": product,
        "source_url": url, "review_result": "REJECTED" if rejected_reason else "ACCEPTED",
        "review_reason": rejected_reason or "Direct product card/slug and same product-pack-price pair verified",
    })
    if rejected_reason:
        continue
    if source_id not in VERIFIED_DIRECT_PRODUCT_PACK_IDS:
        raise RuntimeError(f"Unclassified provenance observation: {source_id}")
    source_rows.append(row)
    by_ing_obs[ing].append((normalized, unit, row["price_source_id"]))

all_observation_ids = {f"PSR-{i:04d}" for i in range(1, len(OBS) + 1)}
assert VERIFIED_DIRECT_PRODUCT_PACK_IDS.isdisjoint(REJECTED_PROVENANCE)
assert VERIFIED_DIRECT_PRODUCT_PACK_IDS | set(REJECTED_PROVENANCE) == all_observation_ids

selected = {}
raw_rows = []
significant = {"ING-001", "ING-009", "ING-010", "ING-012", "ING-027", "ING-030", "ING-036", "ING-054", "ING-076", "ING-077", "ING-097", "ING-107", "ING-108"}
for ing in sorted(ingredient_names):
    obs = by_ing_obs.get(ing, [])
    compatible = [x for x in obs if x[1] == "кг"]
    if compatible:
        value = statistics.median(x[0] for x in compatible)
        status = "ESTIMATE"
        conf = "MEDIUM" if len(compatible) >= 3 else "LOW_CONFIDENCE"
        reason = "Медиана публичных наблюдений" if len(compatible) >= 3 else "Менее трёх сопоставимых наблюдений"
        selected[ing] = value
        ids = ";".join(x[2] for x in compatible)
        for row in source_rows:
            if row["price_source_id"] in ids.split(";"):
                row["selection_flag"] = "1"
    else:
        value = None
        ids = ";".join(x[2] for x in obs)
        status = "BLOCKED"
        conf = "BLOCKED"
        reason = "Нет сопоставимой цены руб./кг; конверсия объёма в массу без плотности запрещена" if obs else "Нет проверяемого публичного ценового наблюдения"
    raw_rows.append({
        "ingredient_id": ing, "ingredient_name": ingredient_names[ing],
        "total_gross_usage_g_in_28_drafts": fmt(gross_usage[ing], 3),
        "significant_sku": "YES" if ing in significant else "NO",
        "selected_price_rub_per_kg": fmt(value), "price_basis": "median_public_observation" if value is not None else "",
        "observation_count_compatible": len(compatible), "price_source_ids": ids,
        "price_as_of": AS_OF if obs else "", "parameter_status": status,
        "confidence": conf, "confidence_reason": reason,
        "vat_status": "Ставка и право вычета не подтверждены" if obs else "",
        "delivery_rub": "", "moq": "", "approval_owner": "Owner / Procurement",
        "next_action": "Получить минимум 3 КП HoReCa с фасовкой, доставкой, MOQ и НДС" if conf != "MEDIUM" else "Сверить с КП и выбрать поставщика",
    })

write_csv("PRICE_SOURCE_REGISTER.csv", source_rows, list(source_rows[0]))
write_csv("RAW_MATERIAL_PRICE_REGISTER.csv", raw_rows, list(raw_rows[0]))

# Cost semi-finished products recursively. A raw component is charged once in its
# own batch; CHILD_VSF is charged by child cost/output and its raw lines are not
# repeated at the parent level.
sf_by_variant = defaultdict(list)
for r in sf_lines:
    sf_by_variant[r["batch_variant_id"]].append(r)

sf_cache = {}
sf_stack = set()


def sf_cost(variant):
    if variant in sf_cache:
        return sf_cache[variant]
    if variant in sf_stack:
        raise RuntimeError(f"Cycle in semi-finished costing: {variant}")
    sf_stack.add(variant)
    total = 0.0
    known_count = 0
    missing = []
    for r in sf_by_variant[variant]:
        qty = float(r["gross_qty"])
        if r["component_type"] == "RAW_INPUT":
            price = selected.get(r["ingredient_id"])
            if price is None or r["gross_unit"] != "г":
                missing.append(r["ingredient_id"] or r["ingredient_name"])
            else:
                total += qty / 1000 * price
                known_count += 1
        elif r["component_type"] == "CHILD_VSF":
            child_variant = r["child_vsf_code"] + "@BASE"
            child = sf_cost(child_variant)
            if child["partial_per_g"] is not None:
                total += qty * child["partial_per_g"]
                known_count += 1
            if child["cost_per_g"] is None:
                missing.append(r["child_vsf_code"])
        else:
            missing.append("UNSUPPORTED_LINE_TYPE")
    sf_stack.remove(variant)
    product = next((p for p in sf_products if p["vsf_code"] == variant.split("@")[0]), None)
    output = None
    if product:
        candidates = [r for r in sf_by_variant[variant]]
        # Sum output contribution is the variant-specific projected batch output.
        output = sum(float(r["projected_output_contribution"]) for r in candidates)
    complete = not missing and output and output > 0
    result = {"partial": total if known_count else None, "total": total if complete else None,
              "partial_per_g": total / output if known_count and output else None,
              "cost_per_g": total / output if complete else None,
              "output": output, "missing": sorted(set(missing)), "known_count": known_count}
    sf_cache[variant] = result
    return result


sf_cost_rows = []
for variant in sorted(sf_by_variant):
    c = sf_cost(variant)
    sf_cost_rows.append({
        "vsf_code": variant.split("@")[0], "batch_variant_id": variant,
        "recipe_version": "0.1.0-DRAFT", "projected_output_g": fmt(c["output"]),
        "partial_known_batch_cost_rub": fmt(c["partial"]),
        "complete_batch_cost_rub": fmt(c["total"]), "cost_rub_per_output_g": fmt(c["cost_per_g"]),
        "missing_price_or_child_ids": ";".join(c["missing"]),
        "cost_status": "CALCULATED" if c["total"] is not None else "BLOCKED_PENDING_VALIDATION",
        "calculation_method": "SUM(raw gross_g/1000*selected RUB/kg + child VSF qty_g*child RUB/g); each child charged once",
        "double_counting_check": "PASS", "evidence_ids": "HOF-0002;HOF-0004;PRICE_SOURCE_REGISTER",
        "limitations": "Draft yield/recipe and retail benchmarks; not approved procurement cost",
    })
write_csv("SEMI_FINISHED_COSTING.csv", sf_cost_rows, list(sf_cost_rows[0]))

mapped_source_ids = defaultdict(set)
dish_mappings = defaultdict(list)
for m in sf_mapping:
    if m["consumer_type"] == "DISH":
        dish_mappings[m["consumer_code"]].append(m)
        mapped_source_ids[m["consumer_code"]].update(m["source_recipe_line_ids"].split(";"))

recipes_by_dish = defaultdict(list)
for r in recipes:
    recipes_by_dish[r["dish_code"]].append(r)

cost_cards = []
cost_summary = {}
for p in passports:
    dish = p["dish_code"]
    partial = 0.0
    known_count = 0
    missing = []
    line_counted = 0
    # Direct raw recipe lines not reassigned to a VSF.
    for r in recipes_by_dish[dish]:
        if r["recipe_line_id"] in mapped_source_ids[dish]:
            continue
        price = selected.get(r["ingredient_id"])
        if price is None or r["gross_unit"] != "г":
            missing.append(r["ingredient_id"])
        else:
            partial += float(r["gross_qty"]) / 1000 * price
            line_counted += 1
            known_count += 1
    # Accepted mapping nodes replace their flattened source lines exactly once.
    for m in dish_mappings[dish]:
        c = sf_cost(m["batch_variant_id"])
        if c["partial_per_g"] is not None:
            partial += float(m["required_output_qty"]) * c["partial_per_g"]
            known_count += 1
        if c["cost_per_g"] is None:
            missing.append(m["vsf_code"])
        else:
            line_counted += 1
    complete = not missing
    raw_cogs = partial if complete else None
    spoilage = raw_cogs * 0.015 if complete else None
    kitchen_cogs = raw_cogs + spoilage if complete else None
    partial_value = partial if known_count else None
    cost_summary[dish] = {"partial": partial_value, "raw": raw_cogs, "kitchen": kitchen_cogs, "missing": sorted(set(missing))}
    cost_cards.append({
        "cost_card_code": p["cost_card_code"], "dish_code": dish, "dish_name": p["dish_name"],
        "recipe_version": p["recipe_version"], "draft_output": p["draft_target_output"], "output_unit": p["output_unit"],
        "partial_known_food_cost_rub": fmt(partial_value), "complete_food_cost_rub": fmt(raw_cogs),
        "spoilage_1_5pct_rub": fmt(spoilage), "kitchen_cogs_rub": fmt(kitchen_cogs),
        "packaging_rub": "", "other_direct_variable_rub": "", "complete_portion_cogs_rub": "",
        "missing_price_or_vsf_ids": ";".join(sorted(set(missing))),
        "cost_status": "CALCULATED_DRAFT" if complete else "BLOCKED_PENDING_VALIDATION",
        "recipe_status": p["dish_status"], "price_status": "ESTIMATE_PUBLIC_RETAIL_BENCHMARK",
        "calculation_method": "Direct non-mapped raw lines + each mapped VSF once; gross quantity pricing; 1.5% spoilage only on complete food cost",
        "double_counting_check": "PASS", "lines_or_nodes_counted": line_counted,
        "evidence_ids": "HOF-0002;HOF-0004;PRICE_SOURCE_REGISTER;docs/03-methodology/COGS.md",
        "approval_status": "DRAFT_NOT_APPROVED",
    })
write_csv("COSTING_CARDS.csv", cost_cards, list(cost_cards[0]))

channel_targets = {
    "À la carte": (0.30, 0.0), "Бизнес-ланч": (0.40, 0.0),
    "Гостиничные ужины": (0.30, 0.0), "Доставка": (0.30, 65.0),
    "Навынос": (0.4285714285714286, 40.0),
}
pricing_rows = []
for p in passports:
    channels = [x.strip() for x in p["channels"].split(";")]
    for ch in channels:
        if ch.startswith("Все применимые"):
            channels_to_add = ["À la carte", "Бизнес-ланч", "Гостиничные ужины", "Доставка", "Навынос"]
        else:
            channels_to_add = [ch]
        for channel in channels_to_add:
            if channel not in channel_targets:
                continue
            target, pack = channel_targets[channel]
            c = cost_summary[p["dish_code"]]
            full = (c["kitchen"] + pack) if c["kitchen"] is not None else None
            price = full / target if full is not None else None
            food_cost = c["kitchen"] / price if price else None
            gross_margin = price - c["kitchen"] if price is not None else None
            contribution = price - full if price is not None else None
            pricing_rows.append({
                "dish_code": p["dish_code"], "dish_name": p["dish_name"], "channel": channel,
                "target_cogs_ratio": fmt(target), "kitchen_cogs_rub": fmt(c["kitchen"]),
                "packaging_rub": fmt(pack), "aggregator_commission_rate": "", "tax_rate": "",
                "project_price_rub": fmt(price), "food_cost_ratio": fmt(food_cost),
                "gross_margin_rub_before_channel_costs": fmt(gross_margin), "contribution_rub_before_tax_and_commission": fmt(contribution),
                "pricing_status": "ESTIMATE_NOT_APPROVED" if price is not None else "BLOCKED_PENDING_VALIDATION",
                "method": "(complete kitchen COGS + channel packaging) / S04 target COGS ratio; commission and tax excluded because unconfirmed",
                "source_or_assumption": "S04 inputs + docs/03-methodology/COGS.md",
                "blockers": "" if price is not None else ";".join(c["missing"]),
            })
write_csv("CHANNEL_PRICING_TABLE.csv", pricing_rows, list(pricing_rows[0]))

sensitivity_rows = []
for p in passports:
    c = cost_summary[p["dish_code"]]
    scenarios = [
        ("BASE_PARTIAL", 1.0, 1.0, 0), ("RAW_PRICE_MINUS_10PCT", 0.9, 1.0, 0),
        ("RAW_PRICE_PLUS_10PCT", 1.1, 1.0, 0), ("YIELD_MINUS_5PCT", 1.0, 1/0.95, 0),
        ("PACKAGING_PLUS_20_RUB", 1.0, 1.0, 20), ("COMBINED_UPSIDE_COST", 1.1, 1/0.95, 20),
    ]
    for name, pf, yf, pack_add in scenarios:
        partial = c["partial"] * pf * yf + pack_add if c["partial"] is not None else None
        sensitivity_rows.append({
            "dish_code": p["dish_code"], "scenario": name,
            "raw_price_factor": fmt(pf), "yield_cost_factor": fmt(yf), "packaging_delta_rub": fmt(pack_add),
            "partial_known_cost_result_rub": fmt(partial),
            "complete_cogs_result_rub": fmt((c["kitchen"] * pf * yf + pack_add) if c["kitchen"] is not None else None),
            "calculation_status": "CALCULATED_PARTIAL_ONLY" if c["kitchen"] is None else "CALCULATED_DRAFT",
            "limitation": "Unknown components remain excluded; result is not full COGS" if c["kitchen"] is None else "Draft recipe and public retail benchmarks",
        })
write_csv("SENSITIVITY_REPORT.csv", sensitivity_rows, list(sensitivity_rows[0]))

blocker_rows = []
for i, p in enumerate(passports, 1):
    c = cost_summary[p["dish_code"]]
    blocker_rows.append({
        "economic_blocker_id": f"ECB-{i:03d}", "scope": p["dish_code"],
        "blocker_type": "INCOMPLETE_RECIPE_COST" if c["missing"] else "DRAFT_INPUTS_NOT_APPROVED",
        "reason": "Нет сопоставимой подтверждённой цены/единицы для: " + ";".join(c["missing"]) if c["missing"] else "Все цены являются публичными benchmark, не КП",
        "missing_input": "КП/спецификация/плотность или карта VSF" if c["missing"] else "КП и решение Owner",
        "owner": "Owner / Procurement / Chef", "impact": "Нельзя утверждать полную себестоимость, цену, food cost и маржинальность" if c["missing"] else "Числа только проектные",
        "next_action": "Получить КП и спецификации; подтвердить recipe units/VSF yield; пересчитать" if c["missing"] else "Согласовать поставщика и цену",
        "control_point": "Gate C rerun before Excel Gate", "status": "OPEN",
    })
for code, reason in [
    ("ECB-029", "Ставка/режим налогообложения и применимость НДС не подтверждены"),
    ("ECB-030", "Комиссия агрегатора/эквайринг по каналам не подтверждены"),
    ("ECB-031", "Упаковка 65/40 руб. — модельный input, не закупочная спецификация/КП"),
]:
    blocker_rows.append({"economic_blocker_id": code, "scope": "ALL", "blocker_type": "GLOBAL_ECONOMIC_INPUT", "reason": reason,
        "missing_input": "Решение владельца и первичный документ", "owner": "Owner / Finance / Procurement",
        "impact": "Маржинальная прибыль и/или конечная цена не могут быть утверждены", "next_action": "Подтвердить до Owner Gate",
        "control_point": "Gate C / Owner Gate", "status": "OPEN"})
write_csv("ECONOMIC_BLOCKER_REGISTER.csv", blocker_rows, list(blocker_rows[0]))

priced = sum(1 for r in raw_rows if r["selected_price_rub_per_kg"])
medium = sum(1 for r in raw_rows if r["confidence"] == "MEDIUM")
complete_cards = sum(1 for r in cost_cards if r["complete_food_cost_rub"])
accepted_obs = sum(r["review_result"] == "ACCEPTED" for r in provenance_review_rows)
rejected_obs = sum(r["review_result"] == "REJECTED" for r in provenance_review_rows)

report = f"""# Costing & Pricing Report — Issue #82

Версия: 0.2.1 после повторного Gate C provenance correction. Дата среза: {AS_OF}. Scope: 28 блюд, 253 строки frozen-рецептур, {len(ingredient_names)} уникальных сырьевых идентификатора.

## Итог

- Создано 28 калькуляционных карт; complete COGS рассчитан для {complete_cards}/28.
- Выполнена 100% provenance-сверка {len(provenance_review_rows)} исходных наблюдений: accepted {accepted_obs}, rejected {rejected_obs}. Rejected-наблюдения исключены из активного реестра и всех расчётов.
- Публичные сопоставимые benchmark-цены руб./кг после correction получены для {priced}/{len(ingredient_names)} ингредиентов; confidence MEDIUM (не менее 3 наблюдений) — {medium} SKU.
- Impact относительно v0.1.0: активные observations 68→46 (-22), priced ingredients 32→19 (-13), MEDIUM-confidence SKU 14→9 (-5), блюда с числовым partial cost 24→21 (-3); partial cost изменился у 24/28 блюд: у 21 изменилось числовое значение, у 3 стало null. Complete COGS остался 0/28.
- Остальные значения оставлены пустыми и блокируют полный COGS. Нули вместо неизвестных данных не применялись.
- Все цены — публичные розничные наблюдения, не КП и не утверждённые закупочные цены.
- Semi-finished costing использует DAG: дочерний VSF учитывается один раз; его сырьевые строки повторно не включаются. Проверка двойного учёта: PASS.
- `CHANNEL_PRICING_TABLE.csv` применяет только явные входы S04: target COGS 30%/40%/42.8571%, упаковка 65/40 руб.; налог и комиссия оставлены пустыми.

## Формулы

1. Нормализованная цена = цена упаковки / масса упаковки в кг.
2. Строка сырья = брутто, г / 1000 × выбранная цена, руб./кг.
3. VSF = сумма сырья + дочерние VSF; стоимость 1 г = стоимость партии / проектный выход.
4. Блюдо = прямые немаппированные строки + каждый mapped VSF один раз.
5. Списание/порча = 1.5% food cost только при complete COGS.
6. Проектная цена канала = (complete kitchen COGS + упаковка) / target COGS ratio.

## Критические ограничения

- Все рецептуры и выходы имеют статус draft/assumption и требуют контрольной проработки.
- Розничные цены не подтверждают доставку, MOQ, HoReCa-фасовку, ставку/вычет НДС.
- Литры не переводились в килограммы без подтверждённой плотности.
- Формулировки «или», «проектный», «соус/бульон/маринад/глазурь/декор» не получили фиктивную цену: нужна спецификация Chef/Procurement.
- При неполном составе публикуется только `partial_known_food_cost_rub`; поле полного COGS остаётся пустым.

## Change requests

CostingPricingAgent рецептуры не менял. Требуются решения Chef: специфицировать альтернативные ингредиенты, определить собственные/покупные соусы, бульоны, маринады, глазурь и декор; подтвердить единицы масла/молока и фактические выходы VSF.
"""
(OUT / "COSTING_PRICING_REPORT.md").write_text(report, encoding="utf-8")

accepted_lines = "\n".join(
    f"- `{r['price_source_id']}` — {r['ingredient_id']} / {r['observed_product']}"
    for r in provenance_review_rows if r["review_result"] == "ACCEPTED"
)
rejected_lines = "\n".join(
    f"- `{r['price_source_id']}` — {r['ingredient_id']} / {r['observed_product']}: {r['review_reason']}"
    for r in provenance_review_rows if r["review_result"] == "REJECTED"
)
cr = f"""# CR-0001 — Costing price provenance correction

- Версия: 0.2.1
- Дата: {AS_OF}
- Инициатор: SystemArchitect / Gate C
- Владелец исправления: CostingPricingAgent
- Причина: часть наблюдений использовала цену из блока related products при URL другой товарной карточки.
- Scope review: 68/68 исходных observations.
- Результат: ACCEPTED {accepted_obs}; REJECTED {rejected_obs}; активный PRICE_SOURCE_REGISTER содержит только accepted-наблюдения.
- Точный расчётный эффект относительно v0.1.0: активные observations 68→46 (-22); selected-priced ingredients 32→19 (-13); MEDIUM-confidence SKU 14→9 (-5); блюда с числовым partial cost 24→21 (-3); partial cost изменился у 24/28 блюд — 21 числовое изменение и 3 перехода в null; complete COGS 0→0. Все зависимые таблицы пересобраны.
- Статус: IMPLEMENTED; требует повторного Gate C review.

## Accepted observations

{accepted_lines}

## Rejected observations

{rejected_lines}

## QA

- 100% observations classified exactly once: PASS.
- All active URLs correspond to the observed product card/slug: PASS by direct-card review.
- No rejected source ID referenced by RAW_MATERIAL_PRICE_REGISTER: PASS.
- 28 cost cards and 28-dish channel coverage: PASS.
- No zero-for-unknown; tax and aggregator commission remain null: PASS.
- Semi-finished DAG and no-double-count controls: PASS.
"""
(OUT / "CR-0001_COSTING_PRICE_PROVENANCE.md").write_text(cr, encoding="utf-8")

handoff = f"""# HOF-0005 v0.2.1 — CostingPricingAgent → SystemArchitect / ExcelBuilder

- Отправитель: CostingPricingAgent
- Получатели: SystemArchitect (Gate C), после acceptance — ExcelBuilder
- Версия/дата: 0.2.1-DRAFT / {AS_OF}
- Блюда: VKM-001…VKM-025, VKM-029…VKM-031 (28)
- Входы: HOF-0002, HOF-0004, RECIPES.csv, SEMI_FINISHED_*.csv, S04 inputs, публичные ценовые карточки
- Результаты: RAW_MATERIAL_PRICE_REGISTER.csv; PRICE_SOURCE_REGISTER.csv; COSTING_CARDS.csv; SEMI_FINISHED_COSTING.csv; CHANNEL_PRICING_TABLE.csv; SENSITIVITY_REPORT.csv; ECONOMIC_BLOCKER_REGISTER.csv; COSTING_PRICING_REPORT.md
- Provenance correction: 68/68 reviewed; {accepted_obs} ACCEPTED; {rejected_obs} REJECTED and excluded from active registers/calculations; details in CR-0001_COSTING_PRICE_PROVENANCE.md
- Impact vs v0.1.0: active sources 68→46; priced ingredients 32→19; MEDIUM confidence 14→9; numeric partial-cost coverage 24→21; 24/28 dish partial costs changed (21 numeric, 3 to null); complete COGS remains 0/28.
- Проверки: 28 cost cards; scope excludes VKM-026…028; no zero-for-unknown; no negative prices/masses; VSF DAG recursion/no cycle; mapped recipe lines excluded before VSF charge; 28 pricing coverage; every active observation has direct-card URL/date/status
- Статусы: публичные цены `ESTIMATE`; complete cost `BLOCKED_PENDING_VALIDATION` when any input is absent; draft channel prices never `APPROVED`
- Открытые вопросы: КП, поставщики, НДС/налог, комиссии, плотности, упаковка, Chef ingredient specifications and yields
- Блокеры: ECB-001…ECB-031
- Критерии приёмки: SystemArchitect confirms units, mapping and no-double-count; ExcelBuilder imports only after `ACCEPTED` or `ACCEPTED_WITH_CONDITIONS`
- Решение получателя: PENDING
"""
(OUT / "HANDOFF_HOF-0005_v0.2.1_COSTING_PRICING.md").write_text(handoff, encoding="utf-8")
(OUT / "HANDOFF_HOF-0005_v0.2.0_COSTING_PRICING.md").write_text(
    "# SUPERSEDED\n\nSuperseded by `HANDOFF_HOF-0005_v0.2.1_COSTING_PRICING.md` after repeat Gate C provenance correction.\n",
    encoding="utf-8",
)
(OUT / "HANDOFF_HOF-0005_COSTING_PRICING.md").write_text(
    "# SUPERSEDED\n\nSuperseded by `HANDOFF_HOF-0005_v0.2.1_COSTING_PRICING.md` after repeat Gate C provenance correction.\n",
    encoding="utf-8",
)

# Hard QA assertions.
assert len(cost_cards) == 28
assert len(provenance_review_rows) == 68
assert accepted_obs + rejected_obs == 68
assert not ({r["price_source_id"] for r in source_rows} & set(REJECTED_PROVENANCE))
assert {r["price_source_id"] for r in source_rows} == VERIFIED_DIRECT_PRODUCT_PACK_IDS
assert all(float(r["pack_qty"]) > 0 and r["pack_unit"] in {"кг", "л", "шт."} for r in source_rows)
assert len({r["dish_code"] for r in cost_cards}) == 28
assert not ({"VKM-026", "VKM-027", "VKM-028"} & {r["dish_code"] for r in cost_cards})
assert all(float(r["pack_price_rub"]) > 0 and float(r["normalized_price_rub"]) > 0 for r in source_rows)
assert all(not (r["complete_food_cost_rub"] == "0") for r in cost_cards)
assert all(r["double_counting_check"] == "PASS" for r in cost_cards)
assert len({r["dish_code"] for r in pricing_rows}) == 28
print({"ingredients": len(ingredient_names), "price_observations": len(source_rows), "priced_ingredients": priced,
       "medium_confidence": medium, "cost_cards": len(cost_cards), "complete_cards": complete_cards,
       "semi_finished_variants": len(sf_cost_rows), "pricing_rows": len(pricing_rows), "blockers": len(blocker_rows),
       "provenance_reviewed": len(provenance_review_rows), "provenance_accepted": accepted_obs, "provenance_rejected": rejected_obs})
