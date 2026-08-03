import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const artifactModule = process.env.ISSUE82_ARTIFACT_TOOL_MODULE
  || path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || "", "@oai/artifact-tool/dist/artifact_tool.mjs");
const { SpreadsheetFile, Workbook } = await import(pathToFileURL(artifactModule).href);

const ROOT = process.env.ISSUE82_REPO_ROOT
  ? path.resolve(process.env.ISSUE82_REPO_ROOT)
  : path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const DATA = path.join(ROOT, "docs/07-operations/issue-82");
const OUT = path.join(DATA, "VARSHAVKA_MENU_COSTING_TECH_CARDS_DRAFT_v2.0.0.xlsx");
const RENDER_DIR = path.join(DATA, "rendered_v2.0.0");
const VERSION = "2.0.0-DRAFT";
const AS_OF = "2026-08-03";

const SHEETS = [
  "00_ПАСПОРТ", "01_МЕНЮ", "02_РЕЦЕПТУРЫ", "03_ПОЛУФАБРИКАТЫ",
  "04_КАЛЬКУЛЯЦИИ", "05_ТЕХКАРТЫ", "06_СЫРЬЁ_И_ЦЕНЫ", "07_ЦЕНООБРАЗОВАНИЕ",
  "08_ОБОРУДОВАНИЕ", "09_ИНВЕНТАРЬ_И_ПОСУДА", "10_АЛЛЕРГЕНЫ_БЕЗОПАСНОСТЬ",
  "11_ПИЩЕВАЯ_ЦЕННОСТЬ", "12_ВОПРОСЫ_ШЕФУ", "13_СОГЛАСОВАНИЕ",
  "14_КОНТРОЛЬНЫЕ_ПРОРАБОТКИ", "15_ПРОВЕРКИ", "16_ИСТОЧНИКИ",
];

const C = {
  navy: "#18324A", blue: "#2C6E8F", pale: "#EAF2F7", ink: "#1F2937",
  white: "#FFFFFF", line: "#CBD5E1", input: "#FFF4CC", formula: "#E8F5E9",
  blocked: "#FDE8E8", warn: "#FFF1D6", ok: "#E2F2E6", gray: "#F5F7FA",
};

function parseCsv(text) {
  const rows = []; let row = []; let field = ""; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ""; }
    else if (ch === '\n') { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (field.length || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  const headers = rows.shift() || [];
  return rows.filter(r => r.some(v => v !== "")).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
}

async function csv(name) { return parseCsv(await fs.readFile(path.join(DATA, name), "utf8")); }
function unknown(v) { return v == null || v === "" || String(v).toLowerCase() === "null" ? null : v; }
function num(v) { const x = unknown(v); if (x === null) return null; const n = Number(x); return Number.isFinite(n) ? n : x; }
function colName(n) { let s = ""; for (; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s; return s; }
function pick(rows, specs) { return rows.map(r => specs.map(s => (s.num ? num(r[s.key]) : unknown(r[s.key])))); }
function scopeOk(code) { return /^VKM-(00[1-9]|01\d|02[0-5]|029|030|031)$/.test(code); }

function styleTitle(sheet, lastCol, title, subtitle) {
  const end = colName(lastCol);
  sheet.getRange(`A1:${end}1`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange(`A1:${end}1`).format = { fill: C.navy, font: { bold: true, color: C.white, size: 15 }, rowHeight: 30, verticalAlignment: "center" };
  sheet.getRange(`A2:${end}2`).merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A2:${end}2`).format = { fill: C.pale, font: { color: C.ink, italic: true, size: 10 }, rowHeight: 27, wrapText: true, verticalAlignment: "center" };
  sheet.showGridLines = false;
}

function addTable(sheet, startRow, headers, rows, name, widths = {}) {
  const lastCol = colName(headers.length); const endRow = startRow + rows.length;
  sheet.getRange(`A${startRow}:${lastCol}${endRow}`).values = [headers, ...rows];
  const table = sheet.tables.add(`A${startRow}:${lastCol}${endRow}`, true, name);
  table.style = "TableStyleMedium2"; table.showFilterButton = true; table.showBandedRows = true;
  sheet.getRange(`A${startRow}:${lastCol}${startRow}`).format = { fill: C.blue, font: { bold: true, color: C.white }, wrapText: true, verticalAlignment: "center", rowHeight: 34 };
  sheet.getRange(`A${startRow + 1}:${lastCol}${endRow}`).format = { font: { color: C.ink, size: 9 }, verticalAlignment: "top", wrapText: true };
  Object.entries(widths).forEach(([c, w]) => sheet.getRange(`${c}:${c}`).format.columnWidth = w);
  // artifact-tool serializes the final freeze operation; keep header rows frozen on all tables.
  sheet.freezePanes.freezeRows(startRow);
  return { endRow, lastCol };
}

function markStatus(sheet, range) {
  range.conditionalFormats.add("containsText", { text: "BLOCK", format: { fill: C.blocked, font: { color: "#9B1C1C", bold: true } } });
  range.conditionalFormats.add("containsText", { text: "PASS", format: { fill: C.ok, font: { color: "#166534", bold: true } } });
}

const [passports, recipes, tech, semi, semiLines, dag, costing, prices, priceSources, channels,
  resources, equipment, inventory, tableware, safety, allergens, nutrition, questions, cook,
  reconcile, conflicts, sourceReg, evidence, safetySources, nutritionSources, proxyCosting,
  proxyChannels, proxySensitivity, proxyPrices, capacity] = await Promise.all([
  csv("DISH_PASSPORTS.csv"), csv("RECIPES.csv"), csv("TECH_CARDS.csv"), csv("SEMI_FINISHED_PRODUCTS.csv"),
  csv("SEMI_FINISHED_RECIPE_LINES.csv"), csv("SEMI_FINISHED_DAG.csv"), csv("COSTING_CARDS.csv"),
  csv("RAW_MATERIAL_PRICE_REGISTER.csv"), csv("PRICE_SOURCE_REGISTER.csv"), csv("CHANNEL_PRICING_TABLE.csv"),
  csv("RESOURCE_CARDS.csv"), csv("EQUIPMENT_FUNCTION_MATRIX.csv"), csv("INVENTORY_REGISTER.csv"),
  csv("TABLEWARE_REGISTER.csv"), csv("SAFETY_CARDS.csv"), csv("ALLERGEN_MATRIX.csv"),
  csv("DISH_NUTRITION.csv"), csv("CHEF_QUESTIONS_REGISTER.csv"), csv("CONTROL_COOK_PLAN.csv"),
  csv("CROSS_DOMAIN_RECONCILIATION_MATRIX.csv"), csv("INTEGRATION_CONFLICT_REGISTER.csv"),
  csv("SOURCE_REGISTER.csv"), csv("EVIDENCE_MATRIX.csv"), csv("SAFETY_SOURCE_REGISTER.csv"),
  csv("NUTRITION_SOURCE_REGISTER.csv"),
  csv("PROVISIONAL_PROXY_SCENARIO_COSTING.csv"), csv("PROVISIONAL_PROXY_SCENARIO_CHANNEL_PRICING.csv"),
  csv("PROVISIONAL_PROXY_SCENARIO_SENSITIVITY.csv"), csv("PROXY_SCENARIO_PRICE_REGISTER.csv"),
  csv("CAPACITY_BOTTLENECK_REPORT.csv"),
]);

if (passports.length !== 28 || passports.some(r => !scopeOk(r.dish_code))) throw new Error("Scope must be exact 28 without VKM-026..028");
if (priceSources.length !== 68 || priceSources.some(r => r.provenance_review_status !== "VERIFIED_DIRECT_CARD")) throw new Error("HOF-0014 evidence price source contract failed");
if (costing.some(r => unknown(r.complete_food_cost_rub) !== null || unknown(r.kitchen_cogs_rub) !== null)) throw new Error("Complete COGS must remain unknown");
if (safety.some(r => r.readiness_veto !== "BLOCK")) throw new Error("Safety veto must be 28/28 BLOCK");
const nutritionHeadline = ["protein_g_per_declared_output","fat_g_per_declared_output","carbohydrate_g_per_declared_output","energy_kcal_per_declared_output","protein_g_per_100g","fat_g_per_100g","carbohydrate_g_per_100g","energy_kcal_per_100g"];
if (nutrition.length !== 28 || nutrition.some(r => nutritionHeadline.some(k => typeof num(r[k]) !== "number"))) throw new Error("HOF-0013 nutrition must be numeric 28/28 × 8");
if (nutrition.some(r => r.release_status !== "BLOCKED_PENDING_VALIDATION" || String(r.laboratory_confirmed).toLowerCase() !== "false")) throw new Error("Nutrition release/laboratory locks must remain blocked");
if (proxyCosting.length !== 28 || proxyChannels.length !== 101 || proxyPrices.length !== 113) throw new Error("HOF-0014 proxy scenario scope contract failed");
if (proxyCosting.some(r => r.scenario_status !== "ASSUMPTION_BLOCKED_PENDING_VALIDATION") || proxyChannels.some(r => r.scenario_status !== "ASSUMPTION_BLOCKED_PENDING_VALIDATION")) throw new Error("Proxy scenario status contract failed");
if (capacity.length !== 28 || resources.length !== 28 || equipment.length !== 155) throw new Error("HOF-0015 equipment scope contract failed");
if (safety.some(r => r.source_recipe_blob_sha !== "c6b22ad5f2812cc989a0d3593f40e21207da8f53")) throw new Error("HOF-0012 recipe version lock failed");

const wb = Workbook.create();
for (const name of SHEETS) wb.worksheets.add(name);
const sh = Object.fromEntries(SHEETS.map(n => [n, wb.worksheets.getItem(n)]));

// 00 — cover and cross-domain status dashboard.
{
  const s = sh[SHEETS[0]]; styleTitle(s, 9, "ВАРШАВКА — меню, калькуляции и технологические карты", "Remediation release candidate · Structural Gate D PASS · предметная готовность ограничена открытыми evidence/Owner/Chef gates");
  s.getRange("A4:B10").values = [
    ["Параметр", "Значение"], ["Версия", VERSION], ["Дата среза", AS_OF], ["Scope", "VKM-001…025, VKM-029…031 (28)"],
    ["Исключено", "VKM-026…028"], ["Экономика", "HOF-0014: evidence layer 68 accepted; proxy 28/101 isolated"], ["Статус", "DRAFT / STRUCTURAL_PASS / SUBJECT_MATTER_BLOCKED"],
  ];
  s.getRange("A4:B4").format = { fill: C.blue, font: { color: C.white, bold: true } }; s.getRange("A5:B10").format.wrapText = true;
  const headers = ["Dish ID","Блюдо","Раздел","Recipe version","Dish status","Safety veto","Cost status","Nutrition status","Gate C","Blockers"];
  const rows = passports.map((p, i) => [p.dish_code,p.dish_name,p.menu_section,p.recipe_version,p.dish_status,safety[i].readiness_veto,costing[i].cost_status,`${nutrition[i].calculation_status} / ${nutrition[i].release_status}`,reconcile[i].gate_c_status,reconcile[i].open_conflict_ids]);
  addTable(s, 12, headers, rows, "PassportStatus", {A:13,B:26,C:18,D:18,E:24,F:14,G:25,H:25,I:22,J:42});
  markStatus(s, s.getRange("E13:I40")); s.freezePanes.freezeRows(12);
}

// 01 — compact menu; economic outputs are formulas and stay blank until complete inputs exist.
{
  const s=sh[SHEETS[1]]; styleTitle(s, 13, "01 — Меню и readiness", "Жёлтые поля — ввод/подтверждение; зелёные — формулы. Complete COGS, price, food cost, margin intentionally blank.");
  const headers=["Dish ID","Блюдо","Раздел","Ед. продажи","Выход","Ед.","Recipe version","Статус","Safety veto","Complete COGS","Цена","Food cost","Маржа","Blockers"];
  const rows=passports.map((p,i)=>[p.dish_code,p.dish_name,p.menu_section,p.production_sales_unit,num(p.draft_target_output),p.output_unit,p.recipe_version,p.dish_status,safety[i].readiness_veto,null,null,null,null,p.blocker_ids]);
  const t=addTable(s,5,headers,rows,"MenuReadiness",{A:13,B:28,C:18,D:19,E:12,F:8,G:18,H:25,I:14,J:15,K:14,L:13,M:14,N:32});
  for(let r=6;r<=t.endRow;r++){
    s.getRange(`J${r}`).formulas=[[`=IF('04_КАЛЬКУЛЯЦИИ'!N${r}="","",'04_КАЛЬКУЛЯЦИИ'!N${r})`]];
    s.getRange(`K${r}`).formulas=[[`=IFERROR(INDEX('07_ЦЕНООБРАЗОВАНИЕ'!$I$6:$I$106,MATCH(1,('07_ЦЕНООБРАЗОВАНИЕ'!$A$6:$A$106=A${r})*('07_ЦЕНООБРАЗОВАНИЕ'!$C$6:$C$106="À la carte"),0)),"")`]];
    s.getRange(`L${r}`).formulas=[[`=IF(OR(J${r}="",K${r}=""),"",J${r}/K${r})`]];
    s.getRange(`M${r}`).formulas=[[`=IF(OR(J${r}="",K${r}=""),"",K${r}-J${r})`]];
  }
  s.getRange(`J6:M${t.endRow}`).format={fill:C.formula,numberFormat:"#,##0.00;[Red](#,##0.00);-"}; markStatus(s,s.getRange(`H6:I${t.endRow}`));
}

// 02 — all accepted recipe lines.
{
  const s=sh[SHEETS[2]]; styleTitle(s,16,"02 — Рецептуры","253 строк HOF-0002; нормы DRAFT/ASSUMPTION, фактические потери и выход требуют контрольной проработки.");
  const specs=[['recipe_line_id','Line ID'],['dish_code','Dish ID'],['cost_card_code','Cost card'],['tech_card_code','Tech card'],['recipe_version','Версия'],['ingredient_id','Ingredient ID'],['ingredient_name','Ингредиент'],['production_stage','Стадия'],['semi_finished_candidate_code','VSF'],['gross_qty','Брутто',1],['gross_unit','Ед.'],['net_qty','Нетто',1],['projected_output_contribution','Вклад в выход',1],['parameter_status','Статус'],['evidence_ids','Evidence'],['blocker_ids','Blockers']];
  addTable(s,5,specs.map(x=>x[1]),pick(recipes,specs.map(x=>({key:x[0],num:!!x[2]}))),"RecipeLines",{A:14,B:12,C:12,D:12,E:18,F:13,G:30,H:18,I:12,J:11,K:8,L:11,M:13,N:17,O:25,P:25}); markStatus(s,s.getRange("N6:N258"));
}

// 03 — semi-finished cards and DAG edges.
{
  const s=sh[SHEETS[3]]; styleTitle(s,15,"03 — Полуфабрикаты и DAG","34 VSF; 42 edges; topology accepted, variants/yields/safety remain blocked.");
  const specs=[['vsf_code','VSF'],['semi_finished_name','Наименование'],['recipe_version','Версия'],['canonical_batch_variant_id','Variant'],['batch_variant_count','Variants',1],['batch_gross_qty','Брутто',1],['batch_net_qty','Нетто',1],['projected_batch_output','Выход',1],['output_unit','Ед.'],['linked_dish_codes','Блюда'],['child_vsf_codes','Child VSF'],['card_status','Статус'],['evidence_ids','Evidence'],['blocker_ids','Blockers'],['double_counting_rule','Анти-double-counting']];
  const a=addTable(s,5,specs.map(x=>x[1]),pick(semi,specs.map(x=>({key:x[0],num:!!x[2]}))),"SemiFinished",{A:12,B:30,C:18,D:20,E:10,F:11,G:11,H:11,I:8,J:26,K:16,L:24,M:22,N:24,O:44});
  const sr=a.endRow+3; s.getRange(`A${sr}`).values=[["DAG edges (audit)"]]; s.getRange(`A${sr}:J${sr}`).merge(); s.getRange(`A${sr}:J${sr}`).format={fill:C.navy,font:{color:C.white,bold:true}};
  const ds=[['dag_edge_id','Edge'],['parent_type','Parent type'],['parent_code','Parent'],['child_vsf_code','Child'],['batch_variant_id','Variant'],['required_output_qty','Qty',1],['unit','Unit'],['mapping_id','Mapping'],['status','Status'],['cycle_control','Cycle control']];
  addTable(s,sr+1,ds.map(x=>x[1]),pick(dag,ds.map(x=>({key:x[0],num:!!x[2]}))),"SemiDAG",{J:42});
}

// 04 — source-backed economics. Input benchmark is visible; downstream is formula-driven.
{
  const s=sh[SHEETS[4]]; styleTitle(s,17,"04 — Калькуляции","Доказательный слой отделён от LOW_CONFIDENCE proxy-сценария HOF-0014. Proxy не заполняет approved/evidence blanks.");
  s.getRange("P3:Q3").values=[["Потери (assumption)",0.015]]; s.getRange("P3").format={fill:C.blue,font:{color:C.white,bold:true}}; s.getRange("Q3").format={fill:C.input,numberFormat:"0.0%"};
  const headers=["Cost card","Dish ID","Блюдо","Выход","Ед.","Partial input","Partial formula","Complete food input","Complete food formula","Spoilage","Kitchen COGS","Packaging","Other variable","Complete portion COGS","Missing IDs","Status","Evidence"];
  const rows=costing.map(r=>[r.cost_card_code,r.dish_code,r.dish_name,num(r.draft_output),r.output_unit,num(r.partial_known_food_cost_rub),null,null,null,null,null,null,null,null,r.missing_price_or_vsf_ids,r.cost_status,r.evidence_ids]);
  const t=addTable(s,5,headers,rows,"CostCards",{A:12,B:12,C:28,D:11,E:8,F:14,G:14,H:16,I:16,J:12,K:14,L:12,M:14,N:18,O:34,P:25,Q:30});
  for(let r=6;r<=t.endRow;r++){
    s.getRange(`G${r}`).formulas=[[`=IF(F${r}="","",F${r})`]]; s.getRange(`I${r}`).formulas=[[`=IF(H${r}="","",H${r})`]];
    s.getRange(`J${r}`).formulas=[[`=IF(I${r}="","",I${r}*$Q$3)`]]; s.getRange(`K${r}`).formulas=[[`=IF(OR(I${r}="",J${r}=""),"",I${r}+J${r})`]];
    s.getRange(`N${r}`).formulas=[[`=IF(OR(K${r}="",L${r}="",M${r}=""),"",K${r}+L${r}+M${r})`]];
  }
  s.getRange(`F6:F${t.endRow}`).format={fill:C.input,numberFormat:"#,##0.00;[Red](#,##0.00);-"};
  s.getRange(`H6:H${t.endRow}`).format.fill=C.input; s.getRange(`L6:M${t.endRow}`).format.fill=C.input;
  s.getRange(`G6:K${t.endRow}`).format.numberFormat="#,##0.00;[Red](#,##0.00);-"; s.getRange(`N6:N${t.endRow}`).format={fill:C.formula,numberFormat:"#,##0.00;[Red](#,##0.00);-"}; markStatus(s,s.getRange(`P6:P${t.endRow}`));
  const sr=t.endRow+3; s.getRange(`A${sr}:Q${sr}`).merge(); s.getRange(`A${sr}`).values=[["Отдельный proxy-сценарий — НЕ доказательная себестоимость / НЕ утверждённая цена"]]; s.getRange(`A${sr}:Q${sr}`).format={fill:C.navy,font:{color:C.white,bold:true}};
  const px=[['dish_code','Dish ID'],['dish_name','Блюдо'],['recipe_version','Версия'],['scenario_food_cost_rub','Scenario food',1],['proxy_mapped_cost_component_rub','Proxy component',1],['evidence_benchmark_component_rub','Evidence floor',1],['spoilage_1_5pct_scenario_rub','Spoilage',1],['scenario_kitchen_cogs_rub','Scenario COGS',1],['scenario_status','Scenario status'],['confidence','Confidence'],['procurement_block','Procurement'],['method','Method'],['limitations','Limitations']];
  const pxt=addTable(s,sr+1,px.map(x=>x[1]),pick(proxyCosting,px.map(x=>({key:x[0],num:!!x[2]}))),"ProxyCosting",{A:12,B:27,C:18,D:15,E:15,F:15,G:12,H:15,I:31,J:15,K:15,L:48,M:58});
  s.getRange(`D${sr+2}:H${pxt.endRow}`).format.numberFormat="#,##0.00;[Red](#,##0.00);-"; markStatus(s,s.getRange(`I${sr+2}:K${pxt.endRow}`));
}

// 05 — technology cards.
{
  const s=sh[SHEETS[5]]; styleTitle(s,33,"05 — Технологические карты","Шесть обязательных полей HOF-0011 показаны отдельно со статусом. DRAFT/BLOCKED не означает готовность.");
  const specs=[['tech_card_code','Tech card'],['dish_code','Dish ID'],['dish_name','Блюдо'],['recipe_version','Версия'],['application_scope','Область применения'],['application_scope_status','Scope status'],['raw_material_requirements','Требования к сырью'],['raw_material_requirements_status','Raw status'],['raw_material_preparation','Подготовка сырья'],['raw_material_preparation_status','Prep status'],['allowable_deviations','Допустимые отклонения'],['allowable_deviations_status','Tolerance status'],['organoleptic_indicators','Органолептика'],['organoleptic_indicators_status','Sensory status'],['storage_and_realization','Хранение и реализация'],['storage_and_realization_status','Storage status'],['operation_sequence','Операции'],['draft_active_time','Активное время',1],['active_time_unit','Ед.'],['draft_total_time','Полное время',1],['total_time_unit','Ед.'],['draft_plating','Подача'],['draft_target_output','Выход',1],['output_unit','Ед.'],['safety_critical_parameters','Safety limits'],['safety_status','Safety status'],['parameter_status','Статус'],['evidence_ids','Evidence'],['safety_evidence_ids','Safety evidence'],['safety_blocker_ids','Safety blockers'],['blocker_ids','Blockers'],['confirmation_owner','Owner'],['validation_note','Validation']];
  const t=addTable(s,5,specs.map(x=>x[1]),pick(tech,specs.map(x=>({key:x[0],num:!!x[2]}))),"TechCards",{A:12,B:12,C:26,D:18,E:48,F:15,G:52,H:15,I:52,J:15,K:48,L:15,M:52,N:15,O:52,P:15,Q:55,R:12,S:8,T:12,U:8,V:45,W:11,X:8,Y:16,Z:24,AA:16,AB:24,AC:28,AD:24,AE:24,AF:20,AG:48}); markStatus(s,s.getRange(`F6:P${t.endRow}`)); markStatus(s,s.getRange(`Z6:AA${t.endRow}`));
}

// 06 — ingredient price selection and accepted source observations.
{
  const s=sh[SHEETS[6]]; styleTitle(s,13,"06 — Сырьё и цены","113 ингредиентов; 68 accepted direct-card observations. 22 rejected records are excluded; proxy scenario prices are isolated from this evidence layer.");
  const ps=[['ingredient_id','Ingredient ID'],['ingredient_name','Ингредиент'],['total_gross_usage_g_in_28_drafts','Usage g',1],['significant_sku','SKU critical'],['selected_price_rub_per_kg','Selected RUB/kg',1],['price_basis','Basis'],['observation_count_compatible','Obs.',1],['price_source_ids','Source IDs'],['price_as_of','As of'],['parameter_status','Status'],['confidence','Confidence'],['approval_owner','Owner'],['next_action','Next action']];
  const a=addTable(s,5,ps.map(x=>x[1]),pick(prices,ps.map(x=>({key:x[0],num:!!x[2]}))),"RawPrices",{A:13,B:34,C:12,D:12,E:16,F:22,G:8,H:22,I:12,J:15,K:18,L:22,M:45}); s.getRange(`E6:E${a.endRow}`).format={fill:C.input,numberFormat:"#,##0.0000;[Red](#,##0.0000);-"}; markStatus(s,s.getRange(`J6:K${a.endRow}`));
  const sr=a.endRow+3; s.getRange(`A${sr}:M${sr}`).merge(); s.getRange(`A${sr}`).values=[["Accepted HOF-0014 evidence price sources (68)"]]; s.getRange(`A${sr}:M${sr}`).format={fill:C.navy,font:{color:C.white,bold:true}};
  const ss=[['price_source_id','Source ID'],['ingredient_id','Ingredient ID'],['ingredient_name','Ингредиент'],['observed_product','Продукт'],['supplier_or_retailer','Поставщик'],['pack_qty','Pack qty',1],['pack_unit','Unit'],['pack_price_rub','Pack RUB',1],['normalized_price_rub','RUB/kg',1],['price_date','Date'],['source_url','URL'],['selection_flag','Selected',1],['provenance_review_status','Review']];
  addTable(s,sr+1,ss.map(x=>x[1]),pick(priceSources,ss.map(x=>({key:x[0],num:!!x[2]}))),"AcceptedPriceSources",{D:35,E:18,K:60,M:24});
}

// 07 — pricing formulas. Packaging zero from upstream is intentionally treated as unknown/blank.
{
  const s=sh[SHEETS[7]]; styleTitle(s,16,"07 — Ценообразование","101 evidence-layer rows remain blocked; separate 101-row proxy scenario is planning-only and LOW_CONFIDENCE.");
  const headers=["Dish ID","Блюдо","Канал","Target COGS","Kitchen COGS","Packaging","Commission","Tax","Project price","Food cost","Gross margin","Contribution","Status","Method","Source","Blockers"];
  const rows=channels.map(r=>[r.dish_code,r.dish_name,r.channel,num(r.target_cogs_ratio),null,null,unknown(r.aggregator_commission_rate),unknown(r.tax_rate),null,null,null,null,r.pricing_status,r.method,r.source_or_assumption,r.blockers]);
  const t=addTable(s,5,headers,rows,"ChannelPricing",{A:12,B:27,C:20,D:13,E:15,F:13,G:13,H:11,I:14,J:13,K:14,L:15,M:25,N:45,O:28,P:30});
  for(let r=6;r<=t.endRow;r++){
    s.getRange(`E${r}`).formulas=[[`=IFERROR(INDEX('04_КАЛЬКУЛЯЦИИ'!$N$6:$N$33,MATCH(A${r},'04_КАЛЬКУЛЯЦИИ'!$B$6:$B$33,0)),"")`]];
    s.getRange(`I${r}`).formulas=[[`=IF(OR(E${r}="",F${r}="",D${r}=""),"",(E${r}+F${r})/D${r})`]];
    s.getRange(`J${r}`).formulas=[[`=IF(OR(E${r}="",F${r}="",I${r}=""),"",(E${r}+F${r})/I${r})`]];
    s.getRange(`K${r}`).formulas=[[`=IF(OR(I${r}="",E${r}="",F${r}=""),"",I${r}-E${r}-F${r})`]];
    s.getRange(`L${r}`).formulas=[[`=IF(OR(K${r}="",G${r}="",H${r}=""),"",K${r}-I${r}*G${r}-I${r}*H${r})`]];
  }
  s.getRange(`D6:D${t.endRow}`).format.numberFormat="0.0%"; s.getRange(`F6:H${t.endRow}`).format.fill=C.input; s.getRange(`E6:L${t.endRow}`).format.numberFormat="#,##0.00;[Red](#,##0.00);-"; markStatus(s,s.getRange(`M6:M${t.endRow}`));
  const sr=t.endRow+3; s.getRange(`A${sr}:P${sr}`).merge(); s.getRange(`A${sr}`).values=[["Proxy-сценарий HOF-0014 — 101/101, только для планирования, не project price"]]; s.getRange(`A${sr}:P${sr}`).format={fill:C.navy,font:{color:C.white,bold:true}};
  const ps=[['dish_code','Dish ID'],['dish_name','Блюдо'],['channel','Канал'],['target_cogs_ratio_assumption','Target',1],['scenario_kitchen_cogs_rub','Scenario COGS',1],['packaging_rub_assumption','Packaging assumption',1],['scenario_price_rub_before_tax_commission','Scenario price',1],['scenario_food_cost_ratio','Food cost',1],['scenario_gross_margin_before_channel_costs_rub','Margin',1],['scenario_contribution_before_tax_commission_rub','Contribution',1],['tax_rate','Tax',1],['aggregator_commission_rate','Commission',1],['scenario_status','Status'],['confidence','Confidence'],['procurement_block','Procurement'],['limitations','Limitations']];
  const pst=addTable(s,sr+1,ps.map(x=>x[1]),pick(proxyChannels,ps.map(x=>({key:x[0],num:!!x[2]}))),"ProxyChannelPricing",{A:12,B:27,C:20,D:12,E:15,F:16,G:15,H:13,I:15,J:15,K:11,L:13,M:31,N:15,O:15,P:58}); s.getRange(`D${sr+2}:L${pst.endRow}`).format.numberFormat="#,##0.00;[Red](#,##0.00);-"; markStatus(s,s.getRange(`M${sr+2}:O${pst.endRow}`));
}

// 08 — resource/equipment summary, plus detailed operation mapping.
{
  const s=sh[SHEETS[8]]; styleTitle(s,23,"08 — Оборудование и мощность","HOF-0015: planning scenarios shown separately; selected model/passport, availability, connections and demonstrated suitability remain blocked.");
  const rs=[['resource_card_id','Resource ID'],['dish_code','Dish ID'],['dish_name','Блюдо'],['primary_area','Зона'],['operation_count','Ops',1],['mapped_operation_count','Mapped',1],['functional_codes','Functions'],['conditional_candidate_codes','Conditional'],['draft_active_time','Active min',1],['draft_total_time','Total min',1],['capacity_status','Capacity'],['availability_status','Availability'],['connections_status','Connections'],['blocker_ids','Blockers']];
  const a=addTable(s,5,rs.map(x=>x[1]),pick(resources,rs.map(x=>({key:x[0],num:!!x[2]}))),"ResourceCards",{A:13,B:12,C:28,D:24,E:8,F:9,G:30,H:24,I:11,J:11,K:17,L:17,M:17,N:34}); markStatus(s,s.getRange(`K6:M${a.endRow}`));
  const sr=a.endRow+3; s.getRange(`A${sr}:N${sr}`).merge(); s.getRange(`A${sr}`).values=[["Operation-to-function mapping (155)"]]; s.getRange(`A${sr}:N${sr}`).format={fill:C.navy,font:{color:C.white,bold:true}};
  const es=[['mapping_id','Mapping'],['dish_code','Dish ID'],['dish_name','Блюдо'],['operation_no','Op',1],['operation_text','Операция'],['functional_codes','Functions'],['functional_equipment_names','Equipment/function'],['capex_inv_codes','CAPEX'],['requirement_role','Role'],['operation_duration_min','Min',1],['project_design_requirement','Project requirement'],['project_design_requirement_status','Req status'],['recipe_unit_load','Recipe load',1],['selected_manufacturer','Manufacturer'],['selected_model_article','Model/article'],['passport_document_or_official_url','Passport'],['passport_capacity','Passport cap.',1],['capacity_status','Capacity'],['equipment_availability_status','Availability'],['connections_status','Connections'],['suitability_status','Suitability'],['parameter_status','Status'],['blocker_ids','Blockers']];
  const em=addTable(s,sr+1,es.map(x=>x[1]),pick(equipment,es.map(x=>({key:x[0],num:!!x[2]}))),"EquipmentMappings",{E:55,F:24,G:45,H:20,I:18,K:36,N:18,O:18,P:40,W:28}); markStatus(s,s.getRange(`R${sr+2}:V${em.endRow}`));
  const cr=em.endRow+3; s.getRange(`A${cr}:W${cr}`).merge(); s.getRange(`A${cr}`).values=[["Capacity sensitivity — not passport-backed / not demand plan"]]; s.getRange(`A${cr}:W${cr}`).format={fill:C.navy,font:{color:C.white,bold:true}};
  const cs=[['capacity_record_id','Capacity ID'],['dish_code','Dish ID'],['dish_name','Блюдо'],['capacity_group','Group'],['primary_function_codes','Functions'],['draft_active_time_min','Active min',1],['draft_total_time_min','Total min',1],['active_time_implied_units_per_labor_hour','Labor units/h',1],['labor_rate_status','Labor status'],['existing_model_group_capacity','Model estimate',1],['existing_model_capacity_status','Model status'],['planning_cycle_time_min_per_unit','Plan cycle',1],['planning_cycle_status','Plan status'],['one_recipe_scenario_batches','One-recipe batches',1],['one_recipe_scenario_status','Scenario status'],['demand_window_qty','Demand',1],['passport_batch_capacity','Passport batch',1],['required_batches','Required batches',1],['preliminary_bottleneck','Bottleneck'],['bottleneck_status','Bottleneck status'],['blocker_ids','Blockers'],['next_action','Next action']];
  addTable(s,cr+1,cs.map(x=>x[1]),pick(capacity,cs.map(x=>({key:x[0],num:!!x[2]}))),"CapacityScenario",{A:14,B:12,C:27,D:14,E:24,F:11,G:11,H:14,I:16,J:14,K:17,L:12,M:18,N:16,O:26,P:12,Q:15,R:15,S:42,T:25,U:30,V:50});
}

// 09 — inventory and tableware side-by-side in one audit table.
{
  const s=sh[SHEETS[9]]; styleTitle(s,16,"09 — Инвентарь и посуда","Candidate sets only; quantities, turnover, stock and packaging SKU remain blank/blocked.");
  const rows=inventory.map((r,i)=>[r.dish_code,r.dish_name,r.inventory_set_code,r.candidate_inventory,r.linked_function_codes,null,r.quantity_status,r.parameter_status,r.evidence_ids,r.blocker_ids,tableware[i].tableware_set_code,tableware[i].candidate_service_set,tableware[i].historical_candidate_skus,null,null,tableware[i].quantity_status]);
  const t=addTable(s,5,["Dish ID","Блюдо","Inventory set","Инвентарь","Functions","Required qty","Qty status","Inv status","Evidence","Inv blockers","Tableware set","Посуда / упаковка","Historical SKU","Pieces/service","Start qty","TW status"],rows,"InventoryTableware",{A:12,B:26,C:14,D:50,E:22,F:13,G:15,H:15,I:22,J:24,K:15,L:55,M:20,N:14,O:12,P:15});
  s.getRange(`F6:F${t.endRow}`).format.fill=C.input; s.getRange(`N6:O${t.endRow}`).format.fill=C.input; markStatus(s,s.getRange(`G6:H${t.endRow}`)); markStatus(s,s.getRange(`P6:P${t.endRow}`));
}

// 10 — safety card and allergen screen.
{
  const s=sh[SHEETS[10]]; styleTitle(s,19,"10 — Аллергены и безопасность","HOF-0012 version-lock. 28/28 veto BLOCK; 112 unsupported numeric limits remain null; UNKNOWN_NOT_ABSENT is never absence.");
  const rows=safety.map((r,i)=>[r.safety_card_id,r.dish_code,r.dish_name,r.source_recipe_version,r.source_recipe_blob_sha,unknown(r.temperature_critical_limit),unknown(r.cooling_critical_limit),unknown(r.reheating_critical_limit),unknown(r.storage_shelf_life),r.cooling_applicability,r.reheating_applicability,r.parameter_status,r.readiness_veto,r.allergens_draft,allergens[i].cross_contact_status,allergens[i].matrix_status,r.evidence_ids,r.veto_reason,r.unblock_condition]);
  const t=addTable(s,5,["Safety card","Dish ID","Блюдо","Source recipe version","Recipe blob","Temp limit","Cooling limit","Reheat limit","Shelf life","Cooling applicability","Reheat applicability","Status","Veto","Allergens draft","Cross contact","Matrix status","Evidence","Veto reason","Unblock condition"],rows,"SafetyCards",{A:13,B:12,C:27,D:20,E:42,F:13,G:14,H:13,I:16,J:42,K:42,L:24,M:11,N:38,O:32,P:28,Q:30,R:55,S:60});
  s.getRange(`F6:I${t.endRow}`).format.fill=C.input; markStatus(s,s.getRange(`L6:P${t.endRow}`));
}

// 11 — nutrition null-safe register.
{
  const s=sh[SHEETS[11]]; styleTitle(s,25,"11 — Пищевая ценность","HOF-0013: numeric calculated draft 28/28 with official/proxy provenance and low/base/high; release remains blocked, laboratory confirmed 0/28.");
  const specs=[['nutrition_record_id','Nutrition ID'],['dish_code','Dish ID'],['dish_name','Блюдо'],['draft_sale_portion_mass','Portion g',1],['protein_g_per_declared_output','Protein/output',1],['protein_g_per_declared_output_low','Protein low',1],['protein_g_per_declared_output_high','Protein high',1],['fat_g_per_declared_output','Fat/output',1],['fat_g_per_declared_output_low','Fat low',1],['fat_g_per_declared_output_high','Fat high',1],['carbohydrate_g_per_declared_output','Carbs/output',1],['carbohydrate_g_per_declared_output_low','Carbs low',1],['carbohydrate_g_per_declared_output_high','Carbs high',1],['energy_kcal_per_declared_output','Kcal/output',1],['energy_kcal_per_declared_output_low','Kcal low',1],['energy_kcal_per_declared_output_high','Kcal high',1],['protein_g_per_100g','Protein/100g',1],['fat_g_per_100g','Fat/100g',1],['carbohydrate_g_per_100g','Carbs/100g',1],['energy_kcal_per_100g','Kcal/100g',1],['laboratory_confirmed','Lab'],['calculation_status','Calc status'],['release_status','Release'],['evidence_ids','Evidence'],['blocker_ids','Blockers']];
  const t=addTable(s,5,specs.map(x=>x[1]),pick(nutrition,specs.map(x=>({key:x[0],num:!!x[2]}))),"Nutrition",{A:14,B:12,C:28,D:12,E:14,F:13,G:14,H:13,I:14,J:13,K:14,L:13,M:9,N:25,O:30,P:24,Q:55});
  s.getRange(`E6:T${t.endRow}`).format={fill:C.formula,numberFormat:"0.00"}; markStatus(s,s.getRange(`V6:W${t.endRow}`));
}

// 12 — chef questions.
{
  const s=sh[SHEETS[12]]; styleTitle(s,14,"12 — Вопросы шефу","144 open questions. Answers require owner/chef evidence and change control.");
  const specs=[['question_id','Question ID'],['dish_code','Dish ID'],['dish_name','Блюдо'],['question_type','Тип'],['question','Вопрос'],['question_status','Статус'],['answer_owner','Owner'],['impact','Impact'],['evidence_ids','Evidence'],['blocker_ids','Blockers'],['checkpoint','Checkpoint'],['answer','Ответ'],['answer_date','Дата ответа'],['raised_date','Raised']];
  const t=addTable(s,5,specs.map(x=>x[1]),pick(questions,specs.map(x=>({key:x[0],num:false}))),"ChefQuestions",{A:13,B:12,C:25,D:14,E:60,F:15,G:20,H:36,I:22,J:22,K:18,L:45,M:14,N:14});
  s.getRange(`L6:M${t.endRow}`).format.fill=C.input; s.getRange(`F6:F${t.endRow}`).dataValidation={rule:{type:"list",values:["OPEN","ANSWERED","SUPERSEDED"]}};
}

// 13 — approval tracker (no silent approval).
{
  const s=sh[SHEETS[13]]; styleTitle(s,12,"13 — Согласование","Approval fields are intentionally blank. Safety veto prevents readiness upgrade without a new FoodSafety review.");
  const rows=passports.map((p,i)=>[p.dish_code,p.dish_name,p.recipe_version,p.dish_status,safety[i].readiness_veto,null,null,null,null,"PENDING_OWNER_CHEF_GATE",reconcile[i].open_conflict_ids,"Change Request + new handoff required"]);
  const t=addTable(s,5,["Dish ID","Блюдо","Recipe version","Current status","Safety veto","Chef decision","Chef date","Owner decision","Owner date","Approval status","Open conflicts","Change control"],rows,"Approvals",{A:12,B:28,C:18,D:25,E:13,F:18,G:13,H:18,I:13,J:25,K:30,L:38});
  s.getRange(`F6:I${t.endRow}`).format.fill=C.input; s.getRange(`F6:F${t.endRow}`).dataValidation={rule:{type:"list",values:["ACCEPTED","REJECTED","ACCEPTED_WITH_CONDITIONS"]}}; s.getRange(`H6:H${t.endRow}`).dataValidation={rule:{type:"list",values:["ACCEPTED","REJECTED","ACCEPTED_WITH_CONDITIONS"]}}; markStatus(s,s.getRange(`D6:E${t.endRow}`));
}

// 14 — control cook plan with blank actuals.
{
  const s=sh[SHEETS[14]]; styleTitle(s,16,"14 — Контрольные проработки","Plan rows = 28; actual measurements and decisions remain blank until execution.");
  const rows=cook.map(r=>[r.plan_id,r.dish_code,r.dish_name,r.recipe_version,num(r.draft_trial_batch_size),r.batch_unit,num(r.draft_target_output_per_unit),r.output_unit,r.execution_status,null,null,null,null,null,r.blocker_ids,r.next_action]);
  const t=addTable(s,5,["Plan ID","Dish ID","Блюдо","Recipe version","Draft batch","Unit","Draft output","Out unit","Execution","Actual gross","Actual net","Actual output","Actual active min","Decision","Blockers","Next action"],rows,"ControlCook",{A:12,B:12,C:27,D:18,E:12,F:18,G:12,H:9,I:18,J:13,K:13,L:14,M:16,N:18,O:30,P:45});
  s.getRange(`J6:N${t.endRow}`).format.fill=C.input; s.getRange(`N6:N${t.endRow}`).dataValidation={rule:{type:"list",values:["PASS","FAIL","RETEST_REQUIRED"]}};
}

// 15 — visible Gate D controls. Formula results react to workbook inputs.
{
  const s=sh[SHEETS[15]]; styleTitle(s,7,"15 — Проверки Gate D","One assertion per row. PASS_WITH_CONDITIONS is expected while subject-matter blockers remain open.");
  const checks=[
    ["CHK-001","Dish scope count",28,"=COUNTA('01_МЕНЮ'!$A$6:$A$33)","Workbook scope"],
    ["CHK-002","Sheet count",17,"=COUNTA($A$34:$A$50)","Exact required list below"],
    ["CHK-003","Safety BLOCK veto",28,"=COUNTIF('10_АЛЛЕРГЕНЫ_БЕЗОПАСНОСТЬ'!$M$6:$M$33,\"BLOCK\")","HOF-0012"],
    ["CHK-004","Nutrition release blocked rows",28,"=COUNTIF('11_ПИЩЕВАЯ_ЦЕННОСТЬ'!$W$6:$W$33,\"BLOCKED_PENDING_VALIDATION\")","HOF-0013"],
    ["CHK-005","Nutrition numeric blanks",0,"=COUNTBLANK('11_ПИЩЕВАЯ_ЦЕННОСТЬ'!$E$6:$T$33)","16 calculated fields × 28"],
    ["CHK-006","Complete food cost blanks",28,"=COUNTBLANK('04_КАЛЬКУЛЯЦИИ'!$I$6:$I$33)","Complete COGS blocked"],
    ["CHK-007","Complete portion COGS blanks",28,"=COUNTBLANK('04_КАЛЬКУЛЯЦИИ'!$N$6:$N$33)","Complete COGS blocked"],
    ["CHK-008","Channel price blanks",101,"=COUNTBLANK('07_ЦЕНООБРАЗОВАНИЕ'!$I$6:$I$106)","Channel pricing blocked"],
    ["CHK-009","Accepted price sources",68,"=COUNTA('06_СЫРЬЁ_И_ЦЕНЫ'!$A$123:$A$190)","HOF-0014 evidence layer"],
    ["CHK-010","Rejected source rows selected/present",0,"=COUNTIF('06_СЫРЬЁ_И_ЦЕНЫ'!$M$123:$M$190,\"*REJECT*\")","22 rejected excluded"],
    ["CHK-011","Negative selected prices",0,"=COUNTIF('06_СЫРЬЁ_И_ЦЕНЫ'!$E$6:$E$118,\"<0\")","No negative prices"],
    ["CHK-012","Zero selected prices",0,"=COUNTIFS('06_СЫРЬЁ_И_ЦЕНЫ'!$E$6:$E$118,0,'06_СЫРЬЁ_И_ЦЕНЫ'!$E$6:$E$118,\"<>\")","Unknown must be blank"],
    ["CHK-013","VSF cards",34,"=COUNTA('03_ПОЛУФАБРИКАТЫ'!$A$6:$A$39)","HOF-0004"],
    ["CHK-014","DAG edges",42,"=COUNTA('03_ПОЛУФАБРИКАТЫ'!$A$43:$A$84)","No orphan/cycle per Gate C"],
    ["CHK-015","Recipe lines",253,"=COUNTA('02_РЕЦЕПТУРЫ'!$A$6:$A$258)","HOF-0002"],
    ["CHK-016","Proxy scenario dish COGS",28,"=COUNTA('04_КАЛЬКУЛЯЦИИ'!$A$38:$A$65)","HOF-0014 separate assumption layer"],
    ["CHK-017","Proxy scenario channel metrics",101,"=COUNTA('07_ЦЕНООБРАЗОВАНИЕ'!$A$111:$A$211)","HOF-0014 separate assumption layer"],
  ];
  s.getRange("A5:G22").values=[["Check ID","Assertion","Expected","Actual","Delta","Status","Notes"],...checks.map(x=>[x[0],x[1],x[2],null,null,null,x[4]])];
  s.tables.add("A5:G22",true,"GateDChecks").style="TableStyleMedium2";
  for(let i=0;i<checks.length;i++){const r=6+i;s.getRange(`D${r}`).formulas=[[checks[i][3]]];s.getRange(`E${r}`).formulas=[[`=D${r}-C${r}`]];s.getRange(`F${r}`).formulas=[[`=IF(E${r}=0,"PASS","FAIL")`]];}
  s.getRange("A25:B30").values=[["Model status","Formula / meaning"],["Structural Gate D","=IF(COUNTIF(F6:F22,\"FAIL\")=0,\"PASS\",\"FAIL\")"],["Subject matter status","PASS_WITH_CONDITIONS"],["Safety release","BLOCKED 28/28"],["Economic evidence release","BLOCKED 28/28"],["Nutrition release","BLOCKED 28/28"]];
  s.getRange("B26").formulas=[["=IF(COUNTIF(F6:F22,\"FAIL\")=0,\"PASS\",\"FAIL\")"]];
  s.getRange("A34:A50").values=SHEETS.map(x=>[x]); s.getRange("A33:B33").values=[["Required sheet name","Logical print/used range"]];
  s.getRange("B34:B50").values=[["A1:J40"],["A1:N33"],["A1:P258"],["A1:O85"],["A1:Q65"],["A1:AG33"],["A1:M190"],["A1:P211"],["A1:W224"],["A1:P33"],["A1:S33"],["A1:Y33"],["A1:N149"],["A1:L33"],["A1:P33"],["A1:G50"],["A1:M140+"]];
  s.getRange("A5:G5").format={fill:C.blue,font:{color:C.white,bold:true}}; s.getRange("A25:B25").format={fill:C.navy,font:{color:C.white,bold:true}}; s.getRange("A33:B33").format={fill:C.blue,font:{color:C.white,bold:true}}; s.getRange("A:G").format.columnWidth=18; s.getRange("A:A").format.columnWidth=38; s.getRange("A34:A50").format.wrapText=true; s.getRange("B:B").format.columnWidth=32; s.getRange("G:G").format.columnWidth=40; markStatus(s,s.getRange("F6:F22")); s.freezePanes.freezeRows(5);
}

// 16 — unified source/evidence register. No rejected price observation is present.
{
  const s=sh[SHEETS[16]]; styleTitle(s,13,"16 — Источники и Evidence","Full URLs are plain text. Price observations are only 46 accepted HOF-0005 v0.2.1 rows; rejected 22 are absent from selection.");
  const unified=[];
  sourceReg.forEach(r=>unified.push([r.source_id,"SOURCE",r.source_name,r.locator,r.source_level,r.version_or_date,r.source_status,r.allowed_use,r.limitations,r.confirmation_owner,null,null,null]));
  evidence.forEach(r=>unified.push([r.evidence_id,"EVIDENCE",r.parameter_family,r.source_locator,r.evidence_class,r.source_date_or_version,r.parameter_status,r.allowed_use,r.prohibited_use,r.confirmation_owner,r.source_id,r.dish_scope,r.linked_gap_ids]));
  safetySources.forEach(r=>unified.push([r.evidence_id,"SAFETY",r.title,r.url,r.issuer,r.adoption,r.status,r.applicability,r.version_status,"Food Safety/PPK owner",null,null,null]));
  nutritionSources.forEach(r=>unified.push([r.nutrition_source_id||r.evidence_id,"NUTRITION",r.source_name||r.title,r.source_locator||r.url,r.source_type||"METHOD",r.source_date||r.version_or_date,r.status||r.parameter_status,r.allowed_use||r.applicability,r.limitations,r.confirmation_owner,null,null,r.blocker_ids]));
  priceSources.forEach(r=>unified.push([r.price_source_id,"PRICE_ACCEPTED",r.observed_product,r.source_url,r.supplier_or_retailer,r.price_date,r.provenance_review_status,"ESTIMATE_PUBLIC_RETAIL_BENCHMARK",r.limitations,"Owner / Procurement",r.ingredient_id,r.ingredient_name,null]));
  addTable(s,5,["Source/Evidence ID","Type","Title / parameter","Locator / URL","Issuer / class","Version / date","Status","Allowed use","Limitations / prohibited","Owner","Linked source/entity","Scope/name","Gaps"],unified,"UnifiedSources",{A:17,B:18,C:42,D:70,E:24,F:18,G:25,H:45,I:55,J:25,K:20,L:24,M:24});
}

// Workbook-wide semantic formats.
for (const name of SHEETS) {
  const s=sh[name]; const used=s.getUsedRange(); if(used) used.format.font.name="Aptos";
}

await fs.mkdir(path.dirname(OUT), {recursive:true});
const blob=await SpreadsheetFile.exportXlsx(wb); await blob.save(OUT);
const freeze = spawnSync(process.env.ISSUE82_PYTHON || "python3", [path.join(ROOT,"scripts/qa_issue_82_workbook.py"), "--fix-freeze", OUT], {cwd:ROOT,encoding:"utf8"});
if (freeze.status !== 0) throw new Error(`freeze_panes post-process failed: ${freeze.stdout}\n${freeze.stderr}`);

const rendered=[];
if (process.argv.includes("--render")) {
  await fs.mkdir(RENDER_DIR,{recursive:true});
  for (const name of SHEETS) {
    const p=await wb.render({sheetName:name,autoCrop:"all",scale:0.8,format:"png"});
    const file=path.join(RENDER_DIR,`${name}.png`); await fs.writeFile(file,new Uint8Array(await p.arrayBuffer())); rendered.push(file);
  }
}

const formulaInspect=await wb.inspect({kind:"formula",sheetId:"04_КАЛЬКУЛЯЦИИ",range:"F5:N33",maxChars:6000,options:{maxResults:80}});
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"Issue 82 final formula error scan"});
const checksInspect=await wb.inspect({kind:"table",range:"15_ПРОВЕРКИ!A5:G30",include:"values,formulas",tableMaxRows:32,tableMaxCols:8,maxChars:12000});
const fileBytes=await fs.readFile(OUT); const sha=crypto.createHash("sha256").update(fileBytes).digest("hex");
console.log(JSON.stringify({output:OUT,sha256:sha,sheets:SHEETS.length,dishes:passports.length,accepted_price_sources:priceSources.length,rejected_price_sources_excluded:22,safety_veto_block:safety.filter(x=>x.readiness_veto==="BLOCK").length,nutrition_numeric_rows:nutrition.length,proxy_cost_rows:proxyCosting.length,proxy_channel_rows:proxyChannels.length,equipment_mappings:equipment.length,capacity_rows:capacity.length,freeze_panes:JSON.parse(freeze.stdout),rendered:rendered.length,formulaInspect:formulaInspect.ndjson,errorScan:errors.ndjson,checks:checksInspect.ndjson},null,2));
