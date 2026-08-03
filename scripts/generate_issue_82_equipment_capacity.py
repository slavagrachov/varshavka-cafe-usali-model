#!/usr/bin/env python3
"""Build EquipmentCapacityAgent Wave 2 package for Issue #82.

All equipment capacities remain evidence-classified. The generator never
converts preliminary CAPEX requirements into purchased/installed/passport facts.
"""

from __future__ import annotations

import csv
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/07-operations/issue-82"
DATE = "2026-08-03"
SCOPE = [f"VKM-{i:03d}" for i in range(1, 26)] + [f"VKM-{i:03d}" for i in range(29, 32)]


def read_csv(path: Path, delimiter: str = ",") -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f, delimiter=delimiter))


def write_csv(name: str, fields: list[str], rows: list[dict[str, object]]) -> None:
    path = OUT / name
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)


tech = read_csv(OUT / "TECH_CARDS.csv")
passports = {r["dish_code"]: r for r in read_csv(OUT / "DISH_PASSPORTS.csv")}
dag = read_csv(OUT / "SEMI_FINISHED_DAG.csv")
capex = read_csv(ROOT / "docs/10-investment/CAPEX_QUANTITY_SPECIFICATION.csv")
assets = {r["CURRENT_FUNC_CODE"]: r for r in capex if r.get("CURRENT_FUNC_CODE")}

assert [r["dish_code"] for r in tech] == SCOPE, "TECH_CARDS scope/order mismatch"


def join_codes(codes: list[str]) -> str:
    out: list[str] = []
    for code in codes:
        if code and code not in out:
            out.append(code)
    return ";".join(out)


def area_and_group(section: str) -> tuple[str, str, float | None, str]:
    if section == "Пицца":
        return "Пицца, хлеб, десерты", "PIZZA", 25, "ед./ч"
    if section == "Хлеб":
        return "Пицца, хлеб, десерты", "BAKERY", 20, "ед./ч"
    if section in {"Салаты", "Холодные закуски"}:
        return "Холодный участок", "COLD", 16, "ед./ч"
    if section in {"Супы", "Горячие блюда"}:
        return "Горячий участок", "HOT", 21, "ед./ч"
    if section == "Гарниры":
        return "Горячий участок", "SIDE", 12, "ед./ч"
    if section == "Десерты":
        return "Пицца, хлеб, десерты", "PASTRY", 20, "ед./ч"
    return "Не определён", "UNMAPPED", None, ""


def operation_functions(section: str, operation: str) -> tuple[list[str], str, str]:
    """Return codes, role, and mapping note without inventing model facts."""
    o = operation.lower().strip()
    codes: list[str] = []
    role = "MANUAL_PREPARATION"
    note = "Manual operation mapped to an existing work surface/inventory function."

    if section == "Пицца":
        if "выпеч" in o:
            codes = ["BAK-01"]
            role = "THERMAL_PROCESS"
        elif "выдерж" in o:
            codes = ["STO-08"]
            role = "CONTROLLED_HOLDING"
        elif "тесто" in o:
            codes = ["BAK-03", "BAK-12"]
            role = "MIXING_AND_PREP"
            if "соус" in o:
                codes.append("HOT-05B")
                role = "MIXING_SAUCE_AND_PREP"
        elif "соус" in o:
            codes = ["HOT-05B", "BAK-12"]
            role = "SAUCE_PREP_AND_ASSEMBLY"
        else:
            codes = ["BAK-12"]
            role = "FORMING_ASSEMBLY_FINISH"
    elif section == "Хлеб":
        if "выпеч" in o:
            codes = ["BAK-02"]
            role = "THERMAL_PROCESS"
        elif "охлад" in o or "стабилиз" in o:
            codes = ["BAK-06"]
            role = "COOLING_HOLDING"
        elif "рассто" in o:
            codes = ["BAK-05"]
            role = "PROOFING"
        elif "брож" in o:
            codes = ["STO-08"]
            role = "FERMENTATION"
        elif "замес" in o or "смеш" in o or "тесто" in o:
            codes = ["BAK-03"]
            role = "MIXING"
        else:
            codes = ["REQ-BAK-PREP"]
            role = "MANUAL_FORMING_GAP"
            note = "Dedicated bakery preparation surface/inventory is not separately coded in current CAPEX; functional requirement only."
    elif section in {"Салаты", "Холодные закуски"}:
        if "охлад" in o:
            codes = ["HOT-09", "STO-10"]
            role = "COOLING_HOLDING"
        elif "запеч" in o:
            codes = ["HOT-01"]
            role = "THERMAL_PROCESS"
        elif "подсуш" in o:
            codes = ["BAK-02"]
            role = "THERMAL_PROCESS"
        else:
            codes = ["CLD-03", "CLD-07"]
            role = "COLD_PREP_ASSEMBLY"
            if any(k in o for k in ["нарез", "порционир", "зачист"]):
                note = "Manual baseline; CLD-08/CLD-09 remain conditional until the applicable timing gate."
    elif section == "Супы":
        if "бульон" in o or "соедин" in o or "довести" in o or "пассер" in o:
            codes = ["HOT-05A", "HOT-13"]
            role = "BOILING_SAUTE_COOKING"
        else:
            codes = ["HOT-12", "HOT-13"]
            role = "HOT_PREP_PORTIONING"
    elif section == "Горячие блюда":
        if "рис" in o:
            codes = ["HOT-06"]
            role = "RICE_COOKING"
        elif "кревет" in o or "лапш" in o or "кокос" in o:
            codes = ["HOT-03", "HOT-13"]
            role = "WOK_COOKING"
        elif "треск" in o or "рыб" in o or "шпинат" in o:
            codes = ["HOT-01", "HOT-13"]
            role = "FISH_THERMAL_PROCESS"
        elif "котлет" in o or "вырез" in o or "миньон" in o or "обработ" in o:
            codes = ["HOT-02", "HOT-13"]
            role = "CONTACT_THERMAL_PROCESS"
        elif "соус" in o:
            codes = ["HOT-05B", "HOT-13"]
            role = "SAUCE_COOKING"
        else:
            codes = ["HOT-12", "HOT-13"]
            role = "HOT_PREP_ASSEMBLY"
    elif section == "Гарниры":
        if "рис" in o or "свар" in o:
            codes = ["HOT-06", "HOT-13"]
            role = "RICE_COOKING"
        elif "запеч" in o:
            codes = ["HOT-01", "HOT-13"]
            role = "OVEN_COOKING"
        elif "обрабаты" in o:
            codes = ["HOT-03", "HOT-13"]
            role = "WOK_COOKING"
        else:
            codes = ["HOT-12", "HOT-13"]
            role = "HOT_PREP_PORTIONING"
    elif section == "Десерты":
        if "выпеч" in o:
            codes = ["BAK-02", "BAK-07"]
            role = "THERMAL_PROCESS"
            if any(k in o for k in ["приготов", "смеш", "замес"]):
                codes.insert(0, "BAK-04")
                role = "MIXING_FORMING_THERMAL_PROCESS"
        elif "охлад" in o:
            codes = ["BAK-06", "STO-09"]
            role = "COOLING"
        elif "стабилиз" in o:
            codes = ["STO-09"]
            role = "CONTROLLED_HOLDING"
        elif "смеш" in o or "замес" in o or "крем" in o or "карамел" in o or "компоте" in o or "глазур" in o:
            codes = ["BAK-04", "BAK-07"]
            role = "MIXING_COMPONENT_PREP"
            if any(k in o for k in ["карамел", "компоте", "глазур"]):
                codes.append("HOT-05B")
                role = "MIXING_AND_HEATED_COMPONENT_PREP"
        else:
            codes = ["BAK-07"]
            role = "FORMING_DECORATING_PORTIONING"
    else:
        codes = ["REQ-UNMAPPED"]
        note = "No current functional code resolved."

    return codes, role, note


def inventory_for(section: str, dish_code: str) -> tuple[str, str]:
    if section == "Пицца":
        return "Весы; контейнеры теста; скребок; лопатка/лопата для пиццы; резак; ёмкости для топпингов", "BAK-12;CLD-07;WSH-07;WSH-08"
    if section == "Хлеб":
        return "Весы; дежа; скребок; формы/противни; решётка охлаждения; термощуп после утверждения ППК", "BAK-03;BAK-05;BAK-06;HOT-13;WSH-07;WSH-08"
    if section in {"Салаты", "Холодные закуски"}:
        return "Весы; маркированные ножи и доски; GN с крышками; миски; щипцы/ложки; гастроёмкости", "CLD-06;CLD-07;WSH-07;WSH-08"
    if section == "Супы":
        return "Весы; маркированные ножи и доски; кастрюли; сотейник; половник; GN; термощуп после утверждения ППК", "HOT-13;CLD-07;WSH-07;WSH-08"
    if section == "Горячие блюда":
        return "Весы; маркированные ножи и доски; щипцы; сковороды/ёмкости GN; сотейник; лопатка; термощуп после утверждения ППК", "HOT-13;CLD-07;WSH-07;WSH-08"
    if section == "Гарниры":
        return "Весы; ножи и доски; GN/противни; кастрюля/чаша; лопатка/ложка; порционный инвентарь", "HOT-13;CLD-07;WSH-07;WSH-08"
    return "Весы; дежа; венчик/лопатка; формы; противни; решётки; шпатели; нож порционный", "BAK-04;BAK-06;BAK-07;WSH-07;WSH-08"


def tableware_for(section: str, channels: str) -> tuple[str, str, str, str]:
    delivery = "Доставка" in channels or "Навынос" in channels
    if section == "Пицца":
        item = "Тарелка мелкая D=260 мм; вилка; нож; коробка/подложка для доставки при применимом канале"
        sku = "03011857;03112213;03114123"
    elif section == "Хлеб":
        item = "Тарелка D=175 мм либо хлебная корзина/доска; прибор по сервисному стандарту"
        sku = "03010413"
    elif section == "Супы":
        item = "Тарелка глубокая 400 мл; ложка столовая; подстановочная тарелка по решению сервиса"
        sku = "03010981;03110167"
    elif section in {"Салаты", "Холодные закуски"}:
        item = "Тарелка D=230 мм или D=260 мм; вилка; нож при необходимости"
        sku = "03011456;03011857;03112213;03114123"
    elif section in {"Горячие блюда", "Гарниры"}:
        item = "Тарелка D=260 мм; вилка; нож или ложка по характеру блюда"
        sku = "03011857;03112213;03114123;03110167"
    else:
        item = "Тарелка D=175 мм или D=230 мм; десертная вилка/ложка — отдельный SKU не подтверждён"
        sku = "03010413;03011456"
    packaging = "Тип, размер, герметичность и SKU упаковки не подтверждены" if delivery else "Не определено применимостью канала"
    return item, sku, packaging, "TBL-01;TBL-05"


function_rows: list[dict[str, object]] = []
resource_rows: list[dict[str, object]] = []
capacity_rows: list[dict[str, object]] = []
inventory_rows: list[dict[str, object]] = []
tableware_rows: list[dict[str, object]] = []

for dish_idx, row in enumerate(tech, 1):
    code = row["dish_code"]
    p = passports[code]
    section = p["menu_section"]
    area, group, group_capacity, cap_unit = area_and_group(section)
    operations = [x.strip() for x in row["operation_sequence"].split(";") if x.strip()]
    all_codes: list[str] = []
    conditional_candidates: list[str] = []
    for op_no, operation in enumerate(operations, 1):
        codes, role, note = operation_functions(section, operation)
        all_codes.extend(codes)
        if section in {"Салаты", "Холодные закуски", "Супы", "Гарниры"} and any(k in operation.lower() for k in ["нарез", "овощ", "порционир"]):
            conditional_candidates.append("CLD-09")
        if any(k in operation.lower() for k in ["ростбиф", "лосось", "вырез"]):
            conditional_candidates.append("CLD-08")
        capex_codes = [assets[c]["INV_CODE"] for c in codes if c in assets]
        names = [assets[c]["ASSET_NAME"] if c in assets else "Проектное функциональное требование без действующего CAPEX-кода" for c in codes]
        availability = "BLOCKED" if any(c.startswith("REQ-") for c in codes) else "UNCONFIRMED_NOT_ASSET_FACT"
        function_rows.append({
            "mapping_id": f"EQM-{len(function_rows)+1:04d}",
            "dish_code": code,
            "dish_name": row["dish_name"],
            "menu_section": section,
            "recipe_version": row["recipe_version"],
            "operation_no": op_no,
            "operation_text": operation,
            "functional_codes": join_codes(codes),
            "functional_equipment_names": ";".join(names),
            "capex_inv_codes": join_codes(capex_codes),
            "capex_requirement_statuses": join_codes([assets[c]["MANDATORY_STATUS"] for c in codes if c in assets]),
            "capex_structure_approval_statuses": join_codes([assets[c]["APPROVAL_STATUS"] for c in codes if c in assets]),
            "requirement_role": role,
            "operation_duration_min": "",
            "duration_status": "BLOCKED",
            "duration_basis": f"Only dish aggregate is available: active {row['draft_active_time']} min / total {row['draft_total_time']} min; no unsupported split by operation",
            "passport_capacity": "",
            "passport_capacity_unit": "",
            "capacity_status": "BLOCKED",
            "equipment_availability_status": "BLOCKED",
            "connections_status": "BLOCKED",
            "parameter_status": "ESTIMATE",
            "evidence_ids": "EVD-0010;EVD-0021;EVD-0022;EVD-0023",
            "source_date": DATE,
            "blocker_ids": "GAP-007;GAP-017;GAP-018;GAP-019",
            "confirmation_owner": "Operations / Engineering / Procurement",
            "mapping_note": note,
            "next_action": "Chef/Operations time the operation; Procurement supplies selected-model passport; Engineering confirms asset, placement and connections",
        })

    codes_joined = join_codes(all_codes)
    vsfs = join_codes([r["child_vsf_code"] for r in dag if r["parent_type"] == "DISH" and r["parent_code"] == code])
    inv_items, inv_func = inventory_for(section, code)
    tw_items, tw_skus, packaging, tw_func = tableware_for(section, p["channels"])
    service_codes = "DSP-04;DSP-05;DSP-10" if section in {"Салаты", "Холодные закуски", "Десерты"} else "DSP-01;DSP-05;DSP-10"
    resource_rows.append({
        "resource_card_id": f"RSC-{dish_idx:03d}", "dish_code": code, "dish_name": row["dish_name"], "menu_section": section,
        "recipe_version": row["recipe_version"], "primary_area": area, "operation_count": len(operations), "mapped_operation_count": len(operations),
        "functional_codes": codes_joined, "conditional_candidate_codes": join_codes(conditional_candidates), "vsf_codes": vsfs,
        "draft_active_time": row["draft_active_time"], "active_time_unit": row["active_time_unit"], "draft_total_time": row["draft_total_time"], "total_time_unit": row["total_time_unit"],
        "recipe_batch_basis": "One current draft recipe/card unit only; not a production-plan batch", "recipe_batch_output": row["draft_target_output"], "output_unit": row["output_unit"],
        "preliminary_recipe_batches": 1, "preliminary_batch_status": "CALCULATED", "capacity_demand_qty": "", "capacity_demand_unit": "", "required_equipment_batches": "", "capacity_status": "BLOCKED",
        "inventory_set_code": f"INVSET-{dish_idx:03d}", "tableware_set_code": f"TWS-{dish_idx:03d}", "service_flow_codes": service_codes,
        "availability_status": "BLOCKED", "connections_status": "BLOCKED", "bottleneck_status": "BLOCKED_PENDING_VALIDATION",
        "parameter_status": "ESTIMATE", "evidence_ids": "EVD-0010;EVD-0021;EVD-0022;EVD-0023;EVD-0024;EVD-0025;EVD-0026",
        "source_date": DATE,
        "blocker_ids": "GAP-007;GAP-017;GAP-018;GAP-019;GAP-020;GAP-021;GAP-022",
        "confirmation_owner": "Operations / Engineering / Procurement / Owner",
        "next_action": "Freeze process; approve peak demand; collect passports/asset/connection evidence; run timed batch and serving-matrix validation",
    })
    active = float(row["draft_active_time"])
    capacity_rows.append({
        "capacity_record_id": f"CAP-{dish_idx:03d}", "dish_code": code, "dish_name": row["dish_name"], "menu_section": section,
        "capacity_group": group, "primary_function_codes": codes_joined, "draft_active_time_min": row["draft_active_time"], "draft_total_time_min": row["draft_total_time"],
        "active_time_implied_units_per_labor_hour": round(60 / active, 3) if active else "", "labor_rate_status": "CALCULATED", "labor_rate_input_status": "ESTIMATE",
        "existing_model_group_capacity": group_capacity if group_capacity is not None else "", "existing_model_capacity_unit": cap_unit,
        "existing_model_capacity_status": "ESTIMATE", "existing_model_source_note": "KITCHEN_PRODUCTION_CAPACITY_BY_MENU_VARSHAVKA_v3.0.0.xlsx / ПАРАМЕТРЫ; not passport or observed throughput",
        "existing_model_source_version": "3.0.0 / 2026-07-28", "source_date": DATE,
        "demand_window_qty": "", "demand_window_unit": "", "passport_batch_capacity": "", "passport_capacity_unit": "", "required_batches": "",
        "preliminary_bottleneck": "Cannot conclude before demand, staffing, passport and timed-test reconciliation", "bottleneck_status": "BLOCKED_PENDING_VALIDATION",
        "conditional_gate_candidates": join_codes(conditional_candidates), "evidence_ids": "EVD-0010;EVD-0022;EVD-0024", "blocker_ids": "GAP-007;GAP-018;GAP-020",
        "confirmation_owner": "Operations / Engineering", "next_action": "Run peak-load/control-production test and replace planning values with observed and passport-backed inputs",
    })
    inventory_rows.append({
        "inventory_set_code": f"INVSET-{dish_idx:03d}", "dish_code": code, "dish_name": row["dish_name"], "menu_section": section,
        "candidate_inventory": inv_items, "linked_function_codes": inv_func, "required_quantity": "", "quantity_unit": "", "quantity_status": "BLOCKED",
        "wash_dry_flow": "WSH-07;WSH-08", "cross_contact_note": "Dedicated/color-coded assignment and changeover remain subject to HOF-0003 safety re-review",
        "parameter_status": "ESTIMATE", "evidence_ids": "EVD-0025;EVD-FS-003;EVD-FS-004", "blocker_ids": "GAP-009;GAP-021",
        "source_date": DATE,
        "confirmation_owner": "Operations / Procurement / FoodSafetyAgent", "next_action": "Chef/Operations approve item specification and quantity; Procurement confirms stock/SKU; Food Safety confirms segregation and cleaning",
    })
    tableware_rows.append({
        "tableware_set_code": f"TWS-{dish_idx:03d}", "dish_code": code, "dish_name": row["dish_name"], "menu_section": section,
        "candidate_service_set": tw_items, "historical_candidate_skus": tw_skus, "linked_capex_function_codes": tw_func,
        "delivery_takeaway_packaging": packaging, "pieces_per_service": "", "turnover_factor": "", "start_quantity": "", "warehouse_breakage_reserve": "",
        "service_status": "DRAFT", "quantity_status": "BLOCKED", "stock_verification_status": "BLOCKED",
        "parameter_status": "ESTIMATE", "evidence_ids": "EVD-0026", "blocker_ids": "GAP-022;V-I-083;V-I-118",
        "source_date": DATE,
        "confirmation_owner": "Operations / Owner / Investment Center", "next_action": "Approve plating/serving set per dish, test fit/handling, count stock, calculate turnover and 10% reserve without double counting",
    })


capex_gap_rows = [
    {"technical_gap_id":"EQG-001","scope":"ALL_28","gap_type":"PASSPORT","affected_codes":"All mapped equipment functions","missing_input":"Selected-model passports and manufacturer data","current_status":"BLOCKED","evidence_ids":"EVD-0022;EVD-0023","linked_project_items":"GAP-018;GAP-019;V-I-043;V-I-114","impact":"Passport throughput, useful capacity, batch size, dimensions, utilities, service zones and warranty cannot be stated as fact","owner":"Procurement / Engineering","next_action":"Collect DOC-INV-011 and reconcile each selected model to CAPEX function","checkpoint":"Issue #43 / Gate C"},
    {"technical_gap_id":"EQG-002","scope":"ALL_28","gap_type":"ASSET_AVAILABILITY","affected_codes":"All mapped equipment functions","missing_input":"Asset/ownership/condition register and acceptance acts","current_status":"BLOCKED","evidence_ids":"EVD-0023","linked_project_items":"GAP-019;V-I-065;V-I-113","impact":"Equipment cannot be treated as acquired, transferred, serviceable or available","owner":"Owner / Investment Center / Legal","next_action":"Obtain DOC-INV-010 and acceptance/condition records","checkpoint":"Issue #43/#50 / Gate C"},
    {"technical_gap_id":"EQG-003","scope":"ALL_28","gap_type":"CONNECTIONS","affected_codes":"HOT-*;BAK-*;CLD-*;STO-*;WSH-*","missing_input":"Layout, electrical TU, ventilation and water/drain designs","current_status":"BLOCKED","evidence_ids":"EVD-0023","linked_project_items":"GAP-019;V-I-038;V-I-041;V-I-104;V-I-106;V-I-108;V-I-109","impact":"Placement, simultaneous load and lawful/operable connection remain unresolved","owner":"Engineering / Landlord / Designer","next_action":"Approve layout and engineering designs against selected-model passports","checkpoint":"Issue #43/#50 / Gate C"},
    {"technical_gap_id":"EQG-004","scope":"ALL_28","gap_type":"TIMING_AND_BATCH","affected_codes":"All production functions","missing_input":"Observed operation times, loads, changeovers and yields","current_status":"BLOCKED_PENDING_VALIDATION","evidence_ids":"EVD-0010;EVD-0022;EVD-0024","linked_project_items":"GAP-007;GAP-018;GAP-020;V-I-030;V-I-031;V-I-116","impact":"Required batches and demonstrated throughput cannot be calculated","owner":"Chef / Operations / Engineering","next_action":"Time control cooks and peak-load trials at approved recipe versions","checkpoint":"Issue #37 / Gate C"},
    {"technical_gap_id":"EQG-005","scope":"ALL_28","gap_type":"DEMAND_PROFILE","affected_codes":"PIZZA;BAKERY;COLD;HOT;SIDE;PASTRY","missing_input":"Approved hourly dish mix, staffing and channel overlap","current_status":"BLOCKED_PENDING_VALIDATION","evidence_ids":"EVD-0024","linked_project_items":"GAP-020;V-I-024;V-I-031;V-I-034","impact":"Group bottleneck and batch count are indeterminate","owner":"Operations / Analytics / HR","next_action":"Approve peak profile and reconcile against timed station capacity","checkpoint":"Issue #37/#43 / Gate C"},
    {"technical_gap_id":"EQG-006","scope":"ALL_28","gap_type":"CAPACITY_MODEL_QA","affected_codes":"Capacity workbook computed outputs","missing_input":"Successful external-engine recalculation with no unsupported formula errors","current_status":"BLOCKED","evidence_ids":"EVD-0024","linked_project_items":"GAP-020","impact":"Current engine inspection returned unsupported-name formula errors for computed demand/capacity cells, so only explicit input assumptions may be used","owner":"SystemArchitect / ExcelBuilder","next_action":"Rebuild/recalculate in Gate D engine and validate formulas before using capacity conclusions","checkpoint":"Gate D"},
    {"technical_gap_id":"EQG-007","scope":"VKM-005…VKM-008","gap_type":"MISSING_FUNCTION_CODE","affected_codes":"REQ-BAK-PREP","missing_input":"Dedicated bakery manual preparation surface and small-inventory CAPEX function","current_status":"BLOCKED","evidence_ids":"EVD-0021;EVD-0025","linked_project_items":"GAP-017;GAP-021","impact":"Shaping/filling operations have a functional requirement but no unambiguous current CAPEX code","owner":"SystemArchitect / Investment Center / Operations","next_action":"Decide whether to add a stable CAPEX function or explicitly allocate an existing compliant workstation","checkpoint":"Gate C / ADR decision if code model changes"},
    {"technical_gap_id":"EQG-008","scope":"VKM-013;VKM-017;VKM-022","gap_type":"CONDITIONAL_EQUIPMENT","affected_codes":"CLD-08","missing_input":"Manual slicing timing trials","current_status":"MONITOR","evidence_ids":"EVD-0021;EVD-0024","linked_project_items":"GAP-020;V-I-044;V-I-116;GATE-CLD-08","impact":"Slicer remains optional; labor/bottleneck conclusion may change","owner":"Operations / HR / Investment Center","next_action":"Run three representative timing trials and apply GATE-CLD-08","checkpoint":"Issue #37/#43"},
    {"technical_gap_id":"EQG-009","scope":"VKM-009…VKM-018;VKM-023;VKM-025","gap_type":"CONDITIONAL_EQUIPMENT","affected_codes":"CLD-09","missing_input":"Vegetable-prep timing trials and approved demand mix","current_status":"MONITOR","evidence_ids":"EVD-0021;EVD-0024","linked_project_items":"GAP-020;V-I-044;V-I-116;GATE-CLD-09","impact":"Vegetable cutter remains optional; labor/bottleneck conclusion may change","owner":"Operations / HR / Investment Center","next_action":"Time manual preparation and apply GATE-CLD-09","checkpoint":"Issue #37/#43"},
    {"technical_gap_id":"EQG-010","scope":"VKM-005…VKM-008;VKM-023;VKM-029…VKM-031","gap_type":"SHARED_OVEN_WINDOWS","affected_codes":"BAK-02;BAK-08;HOT-01","missing_input":"Approved daily load diagram and cleaning/segregation validation","current_status":"BLOCKED_PENDING_VALIDATION","evidence_ids":"EVD-0024;EVD-FS-003","linked_project_items":"GAP-020;GAP-010;V-I-093;GATE-BAK-08","impact":"Bakery/dessert/potato conflicts and second-oven need cannot be resolved","owner":"Operations / Engineering / FoodSafetyAgent","next_action":"Build timed daily oven schedule, validate sanitation/segregation, apply GATE-BAK-08","checkpoint":"Issue #37/#38/#43"},
    {"technical_gap_id":"EQG-011","scope":"ALL_28","gap_type":"INVENTORY","affected_codes":"HOT-13;BAK-07;CLD-06;CLD-07;WSH-07;WSH-08","missing_input":"Approved item specifications, quantities, stock counts and cleaning allocation","current_status":"BLOCKED","evidence_ids":"EVD-0025;EVD-FS-003","linked_project_items":"GAP-009;GAP-021","impact":"Production inventory completeness, cross-contact control and CAPEX quantity remain provisional","owner":"Operations / Procurement / FoodSafetyAgent","next_action":"Approve inventory by operation; count existing stock; validate wash/changeover routes","checkpoint":"Issue #38 / Gate C"},
    {"technical_gap_id":"EQG-012","scope":"ALL_28","gap_type":"TABLEWARE","affected_codes":"TBL-01;TBL-05","missing_input":"Owner-approved serving matrix, turnover, stock count and breakage reserve","current_status":"BLOCKED","evidence_ids":"EVD-0026","linked_project_items":"GAP-022;V-I-083;V-I-118","impact":"Service set and start quantity cannot be approved; historical selection is only a candidate","owner":"Operations / Owner / Investment Center","next_action":"Review 28 dish set; verify physical stock; calculate turnover and 10% reserve without double counting","checkpoint":"Issue #53 / Gate C"},
    {"technical_gap_id":"EQG-013","scope":"Delivery-applicable dishes","gap_type":"PACKAGING","affected_codes":"DSP-07;DSP-09","missing_input":"Package type, dimensions, food-contact declaration, closure/venting and SKU","current_status":"BLOCKED","evidence_ids":"EVD-0016;EVD-0026","linked_project_items":"GAP-013;GAP-022;V-I-027;V-I-122","impact":"Delivery presentation, hold quality, allergens/label and direct cost remain unresolved","owner":"Procurement / Operations / FoodSafetyAgent","next_action":"Select/test packaging by dish and register supplier/manufacturer evidence","checkpoint":"Issue #38/#39/#47 / Gate C"},
    {"technical_gap_id":"EQG-014","scope":"ALL_28","gap_type":"SAFETY_LIMITS","affected_codes":"Thermal, cooling, holding and service functions","missing_input":"Validated critical limits and approved PPK/HACCP controls on actual equipment","current_status":"BLOCKED_PENDING_VALIDATION","evidence_ids":"EVD-0013;EVD-0014;EVD-FS-001;EVD-FS-002;EVD-FS-003","linked_project_items":"GAP-010;GAP-011","impact":"No equipment map may imply an approved temperature, cooling, reheating or shelf-life regime","owner":"FoodSafetyAgent / PPK owner / Operations","next_action":"Validate process on selected equipment and obtain FoodSafety re-review","checkpoint":"Issue #38 / Gate B-C"},
]


write_csv("RESOURCE_CARDS.csv", list(resource_rows[0]), resource_rows)
write_csv("EQUIPMENT_FUNCTION_MATRIX.csv", list(function_rows[0]), function_rows)
write_csv("CAPACITY_BOTTLENECK_REPORT.csv", list(capacity_rows[0]), capacity_rows)
write_csv("INVENTORY_REGISTER.csv", list(inventory_rows[0]), inventory_rows)
write_csv("TABLEWARE_REGISTER.csv", list(tableware_rows[0]), tableware_rows)
write_csv("CAPEX_TECHNICAL_GAPS.csv", list(capex_gap_rows[0]), capex_gap_rows)


assert len(resource_rows) == 28 and {r["dish_code"] for r in resource_rows} == set(SCOPE)
assert len(capacity_rows) == 28 and len(inventory_rows) == 28 and len(tableware_rows) == 28
assert all(r["operation_count"] == r["mapped_operation_count"] for r in resource_rows)
assert len(function_rows) == sum(int(r["operation_count"]) for r in resource_rows)
assert all(r["active_time_unit"] == "мин" and r["total_time_unit"] == "мин" for r in resource_rows)
assert all(r["passport_capacity"] == "" and r["connections_status"] == "BLOCKED" for r in function_rows)
assert all(str(r["required_equipment_batches"]) == "" for r in resource_rows)
assert all(str(r["pieces_per_service"]) == "" for r in tableware_rows)

unknown_codes = sorted({c for r in function_rows for c in str(r["functional_codes"]).split(";") if c and c not in assets and not c.startswith("REQ-")})
assert not unknown_codes, unknown_codes

report = f"""# Equipment Capacity Report — Issue #82

## Паспорт

- Role: EquipmentCapacityAgent `/root/equipment_capacity`.
- Version/date: `0.1.0-DRAFT` / `{DATE}`.
- Scope: 28 dishes — `VKM-001…VKM-025`, `VKM-029…VKM-031`; `VKM-026…VKM-028` excluded.
- Upstream accepted with conditions: HOF-0002, HOF-0003, HOF-0004.
- Evidence: `EVD-0010`, `EVD-0021…EVD-0026`; HOF-0003 safety evidence.

## Result

- 28 resource cards; one non-empty row per dish.
- {len(function_rows)} technology operations; every operation has a functional equipment/workstation mapping.
- 28 capacity/bottleneck records; draft active/total time retained in minutes.
- 28 inventory sets and 28 draft service-tableware sets.
- {len(capex_gap_rows)} explicit CAPEX/technical gaps.
- Stable existing functional codes and `INV_CODE` links are used where the current CAPEX register contains them.
- `REQ-BAK-PREP` is intentionally a gap code, not a claimed asset: the current CAPEX model has no unambiguous dedicated bakery preparation workstation for manual shaping.

## Capacity interpretation

The current resource card is a planning architecture, not proof that equipment is acquired, installed, connected, suitable or productive. `preliminary_recipe_batches = 1` means only that each ChefTechnologyAgent card describes one current draft recipe unit. It is not a demand-based production batch count.

Existing group inputs (pizza 25; bakery 20; cold 16; hot 21; sides 12; pastry 20 units/hour) are retained only as `ESTIMATE` from `KITCHEN_PRODUCTION_CAPACITY_BY_MENU_VARSHAVKA_v3.0.0.xlsx / ПАРАМЕТРЫ`. They are not manufacturer passport or observed values. Required equipment batches remain blank/`BLOCKED` until approved peak demand, staffing, selected-model passports and timed tests are available.

The external spreadsheet engine used for inspection returned unsupported-name formula errors in computed demand/capacity cells of the current capacity workbook. Therefore this package does not import its computed bottleneck conclusions. Gate D must demonstrate a clean external recalculation before those outputs are relied on.

## Preliminary bottleneck hypotheses

1. `BAK-02` is shared by bread, desserts and potentially potato operations; the second-oven gate cannot be resolved without a daily load diagram and safety/cleaning validation.
2. Manual cold preparation may trigger `CLD-08`/`CLD-09`, but these remain conditional until timing trials.
3. Hot-line interactions (`HOT-01`, `HOT-02`, `HOT-03`, `HOT-05A/B`, `HOT-06`) cannot be ranked without the approved hourly dish mix and changeover times.
4. Inventory wash/dry flow and allergen segregation require HOF-0003 re-review on the final equipment/workflow.
5. Tableware candidates are traceable to the historical register, but no per-dish service set, turnover or stock quantity is approved.

## Issue impacts

- Issue #37: control cooks and peak-load trials must capture operation time, equipment load, changeover, yield and simultaneous station demand.
- Issue #38: selected equipment and inventory must be re-reviewed for critical limits, cooling/holding, sanitation, cross-contact and traceability; no safety regime is inferred here.
- Issue #39: supplier SKU/package dimensions affect storage load and delivery packaging; equipment and tableware supplier documents remain outstanding.
- Issue #47: future economics may consume machine-hours, energy and packaging/tableware inputs only after the resource data are validated; no CAPEX or direct cost is asserted here.

## Automated QA

- exact scope 28 and excluded breakfast codes: PASS;
- operation coverage: {len(function_rows)}/{len(function_rows)} mapped: PASS;
- one capacity/inventory/tableware record per dish: 28/28/28: PASS;
- active/total time units: all `мин`: PASS;
- unsupported existing functional codes: 0: PASS;
- invented passport capacity values: 0: PASS;
- claimed installed/connected equipment: 0: PASS;
- unknown batch counts or tableware quantities replaced with zero: 0: PASS.

## Readiness

`READY_FOR_HANDOFF_WITH_BLOCKERS`. Resource architecture is complete for Gate C reconciliation, but all 28 dishes remain blocked from demonstrated capacity and confirmed equipment suitability pending `EQG-001…EQG-014` and the binding HOF-0003 safety veto.
"""
(OUT / "EQUIPMENT_CAPACITY_REPORT.md").write_text(report, encoding="utf-8")

handoff = f"""# HANDOFF HOF-0006 — EquipmentCapacityAgent

- Sender: `/root/equipment_capacity` / EquipmentCapacityAgent.
- Receivers: Orchestrator; SystemArchitect; CostingPricingAgent; FoodSafetyAgent; ExcelBuilder after Gate C acceptance.
- Version/date: `0.1.0-DRAFT` / `{DATE}`.
- Dish scope: 28 — `VKM-001…VKM-025`, `VKM-029…VKM-031`; `VKM-026…VKM-028` excluded.
- Upstream: HOF-0002, HOF-0003 and HOF-0004, all accepted with conditions.
- Sender decision: `READY_FOR_HANDOFF_WITH_BLOCKERS`.
- Requested receiver decision: `ACCEPTED_WITH_CONDITIONS`.

## Package

1. `RESOURCE_CARDS.csv` — 28 integrated dish resource cards.
2. `EQUIPMENT_FUNCTION_MATRIX.csv` — {len(function_rows)} operation-to-function mappings.
3. `CAPACITY_BOTTLENECK_REPORT.csv` — 28 capacity records and blocker-aware hypotheses.
4. `INVENTORY_REGISTER.csv` — 28 production inventory sets.
5. `TABLEWARE_REGISTER.csv` — 28 service-tableware candidate sets.
6. `CAPEX_TECHNICAL_GAPS.csv` — {len(capex_gap_rows)} evidence-backed CAPEX/technical blockers.
7. `EQUIPMENT_CAPACITY_REPORT.md` — method, interpretation, QA and cross-Issue impacts.

## Sources and statuses

- Technology process/time: HOF-0002 / `EVD-0010`; times remain `ESTIMATE` until observation.
- VSF linkage: HOF-0004 / `EVD-0009`; 34-node DAG is not modified.
- Safety: HOF-0003; all 28 vetoes and null critical limits are preserved.
- Function mapping: `EVD-0021` / source capacity workbook / current CAPEX register; `ESTIMATE`.
- Passport capacity: `EVD-0022`; blank + `BLOCKED`.
- Asset availability/connections: `EVD-0023`; `BLOCKED`.
- Bottlenecks: `EVD-0024`; `BLOCKED_PENDING_VALIDATION`.
- Inventory: `EVD-0025`; candidate set `ESTIMATE`, quantity blank + `BLOCKED`.
- Tableware: `EVD-0026`; candidate set `DRAFT/ESTIMATE`, quantity/turnover blank + `BLOCKED`.

## Checks performed

- exactly 28 unique resource/capacity/inventory/tableware records: PASS;
- exact menu scope and no `VKM-026…VKM-028`: PASS;
- {len(function_rows)} source operations and {len(function_rows)} mapped operations: PASS;
- every mapping has a functional code or an explicit technical-gap requirement code: PASS;
- active and total time units consistent (`мин`): PASS;
- no manufacturer/passport capacity invented: PASS;
- no asset marked purchased, installed, serviceable or connected: PASS;
- no unknown batch/tableware quantity replaced with zero: PASS;
- existing current codes resolve to CAPEX rows; `REQ-BAK-PREP` is explicitly non-CAPEX and blocked: PASS.

## Open questions and blockers

See `CAPEX_TECHNICAL_GAPS.csv`, `EQG-001…EQG-014`. Highest-impact items: selected-model passports; ownership/condition; engineering connections; peak demand; timed batch tests; clean capacity-workbook recalculation; bakery manual-workstation code; shared-oven schedule; inventory sanitation allocation; serving matrix and packaging.

## Acceptance criteria

1. SystemArchitect reconciles all operation codes with the stable CAPEX code model and decides `REQ-BAK-PREP` through an explicit decision/change path.
2. No downstream agent treats planning group rates, active-time-implied labor rates or candidate assets as passport/observed facts.
3. Demand-based batch counts remain blank until approved demand, staffing, passports and timing evidence are available.
4. Equipment availability/connections remain `BLOCKED`; no claim of purchase, installation or suitability is made.
5. FoodSafetyAgent re-reviews final equipment, inventory and workflow before any dish readiness upgrade.
6. ExcelBuilder preserves blank unknowns, statuses, EvidenceIDs and blocker links and demonstrates clean external recalculation at Gate D.
7. CostingPricingAgent does not assign equipment/CAPEX/energy or packaging cost from this package without accepted price/allocation evidence.

## Recipient decision

`PENDING` — receiver records `ACCEPTED / REJECTED / ACCEPTED_WITH_CONDITIONS`, date, conditions and any Change Request.
"""
(OUT / "HANDOFF_HOF-0006_EQUIPMENT_CAPACITY.md").write_text(handoff, encoding="utf-8")

print(f"PASS: 28 dishes; {len(function_rows)} operations mapped; {len(capex_gap_rows)} technical gaps; 8 output files")
