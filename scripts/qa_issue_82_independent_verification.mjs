#!/usr/bin/env node
/** Independent, read-only verification of the frozen Issue #82 workbook. */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA = path.join(ROOT, "docs/07-operations/issue-82");
const RC = path.join(DATA, "VARSHAVKA_MENU_COSTING_TECH_CARDS_DRAFT_v2.0.0.xlsx");
const BUILDER = path.join(ROOT, "releases/builds/build_issue_82_menu_cards.mjs");
const TMP = process.env.ISSUE82_IV_TMP || "/tmp/issue82_independent_verification";
const EXPECTED_SHA = "914a70c4c5ba67c8cba1750a17c667157bdf97b79e0b2ea5da7ef64a114cc0b6";
const EXPECTED_DISHES = new Set([...Array.from({ length: 25 }, (_, i) => `VKM-${String(i + 1).padStart(3, "0")}`), "VKM-029", "VKM-030", "VKM-031"]);
const EXPECTED_SHEETS = [
  "00_ПАСПОРТ", "01_МЕНЮ", "02_РЕЦЕПТУРЫ", "03_ПОЛУФАБРИКАТЫ",
  "04_КАЛЬКУЛЯЦИИ", "05_ТЕХКАРТЫ", "06_СЫРЬЁ_И_ЦЕНЫ", "07_ЦЕНООБРАЗОВАНИЕ",
  "08_ОБОРУДОВАНИЕ", "09_ИНВЕНТАРЬ_И_ПОСУДА", "10_АЛЛЕРГЕНЫ_БЕЗОПАСНОСТЬ",
  "11_ПИЩЕВАЯ_ЦЕННОСТЬ", "12_ВОПРОСЫ_ШЕФУ", "13_СОГЛАСОВАНИЕ",
  "14_КОНТРОЛЬНЫЕ_ПРОРАБОТКИ", "15_ПРОВЕРКИ", "16_ИСТОЧНИКИ",
];
const REJECTED_PRICE_IDS = new Set([
  "PSR-0002", "PSR-0008", "PSR-0011", "PSR-0012", "PSR-0016", "PSR-0022",
  "PSR-0024", "PSR-0029", "PSR-0030", "PSR-0036", "PSR-0037", "PSR-0039",
  "PSR-0042", "PSR-0043", "PSR-0045", "PSR-0053", "PSR-0059", "PSR-0060",
  "PSR-0065", "PSR-0066", "PSR-0067", "PSR-0068",
]);

const moduleRoot = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
if (!moduleRoot) throw new Error("CODEX_PRIMARY_RUNTIME_NODE_MODULES is required");
const artifactModule = pathToFileURL(path.join(moduleRoot, "@oai/artifact-tool/dist/artifact_tool.mjs")).href;
const { FileBlob, SpreadsheetFile } = await import(artifactModule);

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
function split(value) { return String(value || "").split(";").filter(x => x && x !== "null"); }
function blank(value) { return value == null || value === "" || value === "null"; }
function assert(condition, message) { if (!condition) throw new Error(message); }
function setEq(a, b) { return a.size === b.size && [...a].every(x => b.has(x)); }
function byDish(rows) { return new Map(rows.map(r => [r.dish_code, r])); }
function group(rows, key) { const out = new Map(); for (const r of rows) { const k = r[key]; if (!out.has(k)) out.set(k, []); out.get(k).push(r); } return out; }
function sha(bytes) { return crypto.createHash("sha256").update(bytes).digest("hex"); }
function deterministicScore(value) { return crypto.createHash("sha256").update(`issue82-iv|${value}`).digest("hex"); }
function valueKey(v) { if (v == null || v === "") return null; return v instanceof Date ? v.toISOString().slice(0, 10) : v; }

await fs.mkdir(TMP, { recursive: true });
const frozenBytes = await fs.readFile(RC);
assert(sha(frozenBytes) === EXPECTED_SHA, "Frozen RC hash mismatch");
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(RC));
const sheetNames = wb.worksheets.items.map(s => s.name);
assert(JSON.stringify(sheetNames) === JSON.stringify(EXPECTED_SHEETS), "Worksheet list/order mismatch");

const [completeness, passports, recipes, tech, mass, semiProducts, semiLines, mappings, dag,
  costing, sfCosting, rawPrices, priceSources, channels, resources, equipment, inventory,
  tableware, safety, ccp, nutrition, questions, cook] = await Promise.all([
  csv("COMPLETENESS_MATRIX_28x13.csv"), csv("DISH_PASSPORTS.csv"), csv("RECIPES.csv"),
  csv("TECH_CARDS.csv"), csv("MASS_BALANCE_REPORT.csv"), csv("SEMI_FINISHED_PRODUCTS.csv"),
  csv("SEMI_FINISHED_RECIPE_LINES.csv"), csv("SEMI_FINISHED_MAPPING.csv"), csv("SEMI_FINISHED_DAG.csv"),
  csv("COSTING_CARDS.csv"), csv("SEMI_FINISHED_COSTING.csv"), csv("RAW_MATERIAL_PRICE_REGISTER.csv"),
  csv("PRICE_SOURCE_REGISTER.csv"), csv("CHANNEL_PRICING_TABLE.csv"), csv("RESOURCE_CARDS.csv"),
  csv("EQUIPMENT_FUNCTION_MATRIX.csv"), csv("INVENTORY_REGISTER.csv"), csv("TABLEWARE_REGISTER.csv"),
  csv("SAFETY_CARDS.csv"), csv("CCP_CONTROL_REGISTER.csv"), csv("DISH_NUTRITION.csv"),
  csv("CHEF_QUESTIONS_REGISTER.csv"), csv("CONTROL_COOK_PLAN.csv"),
]);

// Exact 28 x 13 completeness, with evidence-backed outcomes rather than empty templates.
const deliverableFields = ["passport", "recipe", "semi_finished", "costing", "tech_card", "equipment_capacity",
  "inventory_tableware", "allergen_safety", "nutrition", "channel_pricing", "chef_questions", "control_cook_form", "approval_sheet"];
assert(completeness.length === 28, "Completeness row count != 28");
assert(setEq(new Set(completeness.map(r => r.dish_code)), EXPECTED_DISHES), "Completeness dish scope mismatch");
assert(completeness.every(r => deliverableFields.every(f => r[f] && !["PLANNED", "TEMPLATE", "EMPTY"].includes(r[f]))), "Template/empty completeness outcome counted");
const recipesByDish = group(recipes, "dish_code");
const mappingByDish = new Map();
for (const r of mappings.filter(r => r.consumer_type === "DISH")) {
  if (!mappingByDish.has(r.consumer_code)) mappingByDish.set(r.consumer_code, []);
  mappingByDish.get(r.consumer_code).push(r);
}
const questionsByDish = group(questions, "dish_code");
const channelsByDish = group(channels, "dish_code");
const approvalRows = wb.worksheets.getItem("13_СОГЛАСОВАНИЕ").getRange("A6:L33").values;
const approvalCodes = new Set(approvalRows.map(r => r[0]));
for (const dish of EXPECTED_DISHES) {
  assert(passports.some(r => r.dish_code === dish), `${dish} missing passport`);
  assert((recipesByDish.get(dish) || []).length > 0, `${dish} empty recipe template`);
  const hasVsfRecipeMarker = (recipesByDish.get(dish) || []).some(r => !blank(r.semi_finished_candidate_code));
  assert(!hasVsfRecipeMarker || (mappingByDish.get(dish) || []).length > 0, `${dish} VSF marker lacks mapping`);
  assert(costing.some(r => r.dish_code === dish) && tech.some(r => r.dish_code === dish), `${dish} missing cost/tech result`);
  assert(resources.some(r => r.dish_code === dish) && equipment.some(r => r.dish_code === dish), `${dish} missing equipment result`);
  assert(inventory.some(r => r.dish_code === dish) && tableware.some(r => r.dish_code === dish), `${dish} missing inventory/tableware result`);
  assert(safety.some(r => r.dish_code === dish) && nutrition.some(r => r.dish_code === dish), `${dish} missing safety/nutrition result`);
  assert((channelsByDish.get(dish) || []).length > 0 && (questionsByDish.get(dish) || []).length > 0, `${dish} empty channel/question template`);
  assert(cook.some(r => r.dish_code === dish) && approvalCodes.has(dish), `${dish} missing control-cook/approval result`);
}

// Full accepted price partition and exact source-to-workbook comparison; sample is deterministic >=20%.
const activeIds = new Set(priceSources.map(r => r.price_source_id));
const universe = new Set(Array.from({ length: 68 }, (_, i) => `PSR-${String(i + 1).padStart(4, "0")}`));
assert(activeIds.size === 46 && REJECTED_PRICE_IDS.size === 22 && setEq(new Set([...activeIds, ...REJECTED_PRICE_IDS]), universe), "Price partition is not 46+22=68");
assert([...activeIds].every(id => !REJECTED_PRICE_IDS.has(id)), "Rejected price source remains active");
for (const r of priceSources) {
  assert(r.provenance_review_status === "VERIFIED_DIRECT_CARD", `${r.price_source_id} is not verified`);
  assert(r.source_url && r.observed_product && r.price_date && Number(r.pack_qty) > 0 && Number(r.pack_price_rub) > 0, `${r.price_source_id} incomplete provenance`);
  assert(Math.abs(Number(r.normalized_price_rub) - Number(r.pack_price_rub) / Number(r.pack_qty)) < 1e-6, `${r.price_source_id} normalization defect`);
}
for (const r of rawPrices) assert(split(r.price_source_ids).every(id => activeIds.has(id)), `${r.ingredient_id} selects inactive/rejected source`);
const workbookSourceRows = wb.worksheets.getItem("06_СЫРЬЁ_И_ЦЕНЫ").getRange("A122:M167").values;
assert(workbookSourceRows.length === 46, "Workbook accepted source row count != 46");
const workbookSourceById = new Map(workbookSourceRows.map(r => [r[0], r]));
const sampledSources = [...priceSources]
  .sort((a, b) => deterministicScore(a.price_source_id).localeCompare(deterministicScore(b.price_source_id)))
  .slice(0, Math.ceil(priceSources.length * 0.20));
for (const r of sampledSources) {
  const w = workbookSourceById.get(r.price_source_id);
  assert(w, `${r.price_source_id} absent from workbook`);
  const expected = [r.price_source_id, r.ingredient_id, r.ingredient_name, r.observed_product, r.supplier_or_retailer,
    Number(r.pack_qty), r.pack_unit, Number(r.pack_price_rub), Number(r.normalized_price_rub), r.price_date, r.source_url,
    Number(r.selection_flag), r.provenance_review_status];
  assert(expected.every((v, i) => String(valueKey(w[i])) === String(v)), `${r.price_source_id} workbook provenance mismatch at field index`);
}
const allCellText = [];
for (const name of EXPECTED_SHEETS) {
  const used = wb.worksheets.getItem(name).getUsedRange();
  if (!used) continue;
  for (const row of used.values) for (const v of row) if (v != null) allCellText.push(String(v));
}
const frozenWorkbookText = allCellText.join("\n");
assert([...REJECTED_PRICE_IDS].every(id => !frozenWorkbookText.includes(id)), "Rejected source ID present in workbook");
const builderText = await fs.readFile(BUILDER, "utf8");
assert(!builderText.includes("v0.1.0_COSTING") && !builderText.includes("v0.2.0_COSTING"), "Builder references superseded costing handoff");

// 100% safety-critical field/veto tests in source and frozen workbook.
const criticalFields = ["temperature_critical_limit", "cooling_critical_limit", "reheating_critical_limit", "storage_shelf_life"];
assert(safety.length === 28 && safety.every(r => r.readiness_veto === "BLOCK"), "Safety veto not BLOCK 28/28");
assert(safety.every(r => r.source_recipe_version === "null" && criticalFields.every(f => r[f] === "null")), "Safety critical unknown/version improperly populated");
const ccpNull = ccp.filter(r => r.critical_limit === "null" && r.status === "BLOCKED_PENDING_VALIDATION");
const ccpTraceability = ccp.filter(r => r.stage === "TRACEABILITY_AND_CONSUMER_INFORMATION" && r.status === "DRAFT" && !blank(r.critical_limit));
assert(ccp.length === 140 && ccpNull.length === 112 && ccpTraceability.length === 28 && ccp.every(r => r.blocker), "CCP critical field/blocker defect");
const wbSafety = wb.worksheets.getItem("10_АЛЛЕРГЕНЫ_БЕЗОПАСНОСТЬ").getRange("A6:O33").values;
assert(wbSafety.length === 28 && wbSafety.every(r => blank(r[3]) && [4, 5, 6, 7].every(i => blank(r[i])) && r[9] === "BLOCK"), "Workbook safety critical/veto propagation defect");

// Mass balance, VSF/DAG and double-counting controls.
for (const r of mass) {
  assert(r.arithmetic_check === "PASS_DRAFT_ARITHMETIC", `${r.dish_code} mass balance status`);
  assert(Math.abs(Number(r.reconciled_output) - Number(r.draft_target_output)) < 1e-8, `${r.dish_code} mass balance mismatch`);
}
assert(semiProducts.length === 34 && setEq(new Set(semiProducts.map(r => r.vsf_code)), new Set(Array.from({ length: 34 }, (_, i) => `VSF-${String(i + 1).padStart(3, "0")}`))), "VSF set mismatch");
assert(dag.length === 42 && mappings.length === 42, "DAG/mapping edge count mismatch");
const graph = new Map(); const mappedRecipeLineCounts = new Map(); const recipeIdSet = new Set(recipes.map(r => r.recipe_line_id));
for (const r of mappings) {
  assert(semiProducts.some(x => x.vsf_code === r.vsf_code), `${r.mapping_id} missing VSF`);
  if (r.consumer_type === "VSF") {
    if (!graph.has(r.consumer_code)) graph.set(r.consumer_code, []);
    graph.get(r.consumer_code).push(r.vsf_code);
  } else for (const id of split(r.source_recipe_line_ids)) {
    assert(recipeIdSet.has(id), `${r.mapping_id} missing recipe line`);
    mappedRecipeLineCounts.set(id, (mappedRecipeLineCounts.get(id) || 0) + 1);
  }
  assert(r.double_counting_control === "Consumer costs this VSF mapping once and excludes mapped flattened/raw source lines", `${r.mapping_id} double count control`);
}
assert([...mappedRecipeLineCounts.values()].every(n => n === 1), "Recipe line mapped to VSF more than once");
const visiting = new Set(), visited = new Set();
function visit(node) { assert(!visiting.has(node), `VSF cycle at ${node}`); if (visited.has(node)) return; visiting.add(node); for (const child of graph.get(node) || []) visit(child); visiting.delete(node); visited.add(node); }
for (const r of semiProducts) visit(r.vsf_code);

// Independent recursive costing recomputation; at least one dish from each of 8 menu sections.
const sourceByIng = group(priceSources, "ingredient_id");
const selectedPrice = new Map();
for (const r of rawPrices) {
  const compatible = (sourceByIng.get(r.ingredient_id) || []).filter(s => s.pack_unit === "кг").map(s => Number(s.normalized_price_rub)).sort((a, b) => a - b);
  if (!blank(r.selected_price_rub_per_kg)) {
    const median = compatible.length % 2 ? compatible[(compatible.length - 1) / 2] : (compatible[compatible.length / 2 - 1] + compatible[compatible.length / 2]) / 2;
    assert(Math.abs(median - Number(r.selected_price_rub_per_kg)) < 1e-6, `${r.ingredient_id} selected price is not median`);
    selectedPrice.set(r.ingredient_id, median);
  }
}
const sfLinesByVariant = group(semiLines, "batch_variant_id"); const sfCache = new Map();
function sfUnitCost(variant) {
  if (sfCache.has(variant)) return sfCache.get(variant);
  const rows = sfLinesByVariant.get(variant) || []; let total = 0; let known = 0;
  const output = rows.reduce((s, r) => s + Number(r.projected_output_contribution), 0);
  for (const r of rows) {
    if (r.component_type === "RAW_INPUT" && selectedPrice.has(r.ingredient_id)) { total += Number(r.gross_qty) / 1000 * selectedPrice.get(r.ingredient_id); known++; }
    else if (r.component_type === "CHILD_VSF") { const child = sfUnitCost(`${r.child_vsf_code}@BASE`); if (child != null) { total += Number(r.gross_qty) * child; known++; } }
  }
  const result = known && output ? total / output : null; sfCache.set(variant, result); return result;
}
const mappedRecipeIdsByDish = new Map();
for (const r of mappings.filter(r => r.consumer_type === "DISH")) {
  if (!mappedRecipeIdsByDish.has(r.consumer_code)) mappedRecipeIdsByDish.set(r.consumer_code, new Set());
  for (const id of split(r.source_recipe_line_ids)) mappedRecipeIdsByDish.get(r.consumer_code).add(id);
}
const costingByDish = byDish(costing); const passportByDish = byDish(passports);
const sections = [...new Set(passports.map(r => r.menu_section))].sort();
const manualDishCodes = sections.map(section => passports.filter(r => r.menu_section === section).map(r => r.dish_code).sort()[0]);
const manualRecompute = [];
for (const dish of manualDishCodes) {
  let partial = 0; let known = 0;
  for (const r of recipesByDish.get(dish) || []) {
    if ((mappedRecipeIdsByDish.get(dish) || new Set()).has(r.recipe_line_id)) continue;
    if (selectedPrice.has(r.ingredient_id)) { partial += Number(r.gross_qty) / 1000 * selectedPrice.get(r.ingredient_id); known++; }
  }
  for (const r of mappingByDish.get(dish) || []) { const unit = sfUnitCost(r.batch_variant_id); if (unit != null) { partial += Number(r.required_output_qty) * unit; known++; } }
  const actual = blank(costingByDish.get(dish).partial_known_food_cost_rub) ? null : Number(costingByDish.get(dish).partial_known_food_cost_rub);
  const expected = known ? partial : null;
  assert((expected == null) === (actual == null) && (actual == null || Math.abs(expected - actual) < 1e-5), `${dish} manual cost recompute mismatch`);
  manualRecompute.push({ section: passportByDish.get(dish).menu_section, dish_code: dish, expected_partial_rub: expected, stored_partial_rub: actual, delta: actual == null ? null : actual - expected });
}
assert(manualRecompute.length === sections.length && manualRecompute.length >= 5, "Manual recompute section coverage insufficient");

// Equipment/inventory/tableware referential coverage.
const capex = parseCsv(await fs.readFile(path.join(ROOT, "docs/10-investment/CAPEX_QUANTITY_SPECIFICATION.csv"), "utf8"));
const capexCodes = new Set(capex.map(r => r.INV_CODE)); const equipmentByDish = group(equipment, "dish_code");
for (const dish of EXPECTED_DISHES) {
  const rr = resources.find(r => r.dish_code === dish); const inv = inventory.find(r => r.dish_code === dish); const tw = tableware.find(r => r.dish_code === dish);
  assert(Number(rr.operation_count) === (equipmentByDish.get(dish) || []).length && Number(rr.mapped_operation_count) === (equipmentByDish.get(dish) || []).length, `${dish} equipment operation coverage`);
  assert(rr.inventory_set_code === inv.inventory_set_code && rr.tableware_set_code === tw.tableware_set_code, `${dish} resource set link`);
  for (const e of equipmentByDish.get(dish) || []) for (const code of split(e.capex_inv_codes)) assert(capexCodes.has(code), `${e.mapping_id} unresolved CAPEX ${code}`);
}

// Frozen formula/value/error scan, all costing recalculation and formula reactivity on an in-memory copy.
let formulaCount = 0;
for (const name of EXPECTED_SHEETS) {
  const used = wb.worksheets.getItem(name).getUsedRange(); if (!used) continue;
  for (const row of used.formulas) for (const f of row) if (f) formulaCount++;
}
const formulaErrors = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!", options: { useRegex: true, maxResults: 500 }, summary: "Independent formula error scan" });
assert(!formulaErrors.ndjson.includes('"count":1') && !formulaErrors.ndjson.match(/#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A|#NUM!|#NULL!/), "Formula error token found");
const costValues = wb.worksheets.getItem("04_КАЛЬКУЛЯЦИИ").getRange("F6:N33").values;
const costFormulas = wb.worksheets.getItem("04_КАЛЬКУЛЯЦИИ").getRange("F6:N33").formulas;
assert(costValues.every(r => Number(r[1]) === Number(r[0]) && [2, 3, 4, 5, 6, 7, 8].every(i => blank(r[i]))), "All-costing frozen recalculation/unknown guard defect");
assert(costFormulas.every(r => r[1] && r[3] && r[4] && r[5] && r[8]), "Costing formula coverage defect");
const reactiveWb = await SpreadsheetFile.importXlsx(await FileBlob.load(RC));
const reactiveSheet = reactiveWb.worksheets.getItem("04_КАЛЬКУЛЯЦИИ");
const before = Number(reactiveSheet.getRange("G6").values[0][0]);
reactiveSheet.getRange("F6").values = [[Number(reactiveSheet.getRange("F6").values[0][0]) + 1]];
const after = Number(reactiveSheet.getRange("G6").values[0][0]);
assert(Math.abs(after - before - 1) < 1e-9, "Formula reactivity failed");

// Render every sheet with artifact-tool for independent visual review.
const renderDir = path.join(TMP, "renders"); await fs.mkdir(renderDir, { recursive: true });
for (const name of EXPECTED_SHEETS) {
  const png = await wb.render({ sheetName: name, autoCrop: "all", scale: 0.8, format: "png" });
  await fs.writeFile(path.join(renderDir, `${name}.png`), new Uint8Array(await png.arrayBuffer()));
}

// LibreOffice recalc on an isolated copy/profile, then artifact-tool reinspection.
const loInputDir = path.join(TMP, "lo_input"), loOutputDir = path.join(TMP, "lo_output"), loProfile = path.join(TMP, "lo_profile");
await fs.mkdir(loInputDir, { recursive: true }); await fs.mkdir(loOutputDir, { recursive: true }); await fs.mkdir(loProfile, { recursive: true });
const loInput = path.join(loInputDir, "iv_recalc.xlsx"); await fs.copyFile(RC, loInput);
const soffice = process.env.ISSUE82_SOFFICE || "/opt/codex/runtimes/codex-primary-runtime/dependencies/bin/override/soffice";
const lo = spawnSync(soffice, [`-env:UserInstallation=${pathToFileURL(loProfile).href}`, "--headless", "--convert-to", "xlsx", "--outdir", loOutputDir, loInput], { encoding: "utf8", timeout: 120000 });
assert(lo.status === 0, `LibreOffice recalc failed: ${lo.stderr || lo.stdout}`);
const loOutput = path.join(loOutputDir, "iv_recalc.xlsx");
const loWb = await SpreadsheetFile.importXlsx(await FileBlob.load(loOutput));
const loErrors = await loWb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!", options: { useRegex: true, maxResults: 500 }, summary: "Post-LibreOffice error scan" });
assert(!loErrors.ndjson.match(/#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A|#NUM!|#NULL!/), "Post-LibreOffice formula error token found");
assert(loWb.worksheets.getItem("15_ПРОВЕРКИ").getRange("F6:F20").values.every(r => r[0] === "PASS"), "Post-LibreOffice Gate D checks not all PASS");

// Builder/source reproducibility in an isolated root; compare workbook values and formulas semantically.
const rebuildRoot = path.join(TMP, "rebuild_root"); const rebuildData = path.join(rebuildRoot, "docs/07-operations/issue-82");
await fs.mkdir(rebuildData, { recursive: true });
for (const entry of await fs.readdir(DATA)) if (entry.endsWith(".csv")) await fs.copyFile(path.join(DATA, entry), path.join(rebuildData, entry));
try { await fs.symlink(moduleRoot, path.join(TMP, "node_modules"), "dir"); } catch (error) { if (error.code !== "EEXIST") throw error; }
const builderCopy = path.join(TMP, "build_issue_82_menu_cards.mjs"); await fs.copyFile(BUILDER, builderCopy);
const node = process.env.CODEX_PRIMARY_RUNTIME_NODE;
assert(node, "CODEX_PRIMARY_RUNTIME_NODE is required");
const rebuild = spawnSync(node, [builderCopy], { cwd: TMP, env: { ...process.env, ISSUE82_REPO_ROOT: rebuildRoot }, encoding: "utf8", timeout: 180000 });
assert(rebuild.status === 0, `Builder reproduction failed: ${rebuild.stderr || rebuild.stdout}`);
const rebuiltPath = path.join(rebuildData, path.basename(RC));
const rebuiltWb = await SpreadsheetFile.importXlsx(await FileBlob.load(rebuiltPath));
assert(JSON.stringify(rebuiltWb.worksheets.items.map(s => s.name)) === JSON.stringify(EXPECTED_SHEETS), "Rebuilt sheet list mismatch");
for (const name of EXPECTED_SHEETS) {
  const a = wb.worksheets.getItem(name).getUsedRange(), b = rebuiltWb.worksheets.getItem(name).getUsedRange();
  const av = a.values.map(r => r.map(valueKey)), bv = b.values.map(r => r.map(valueKey));
  if (JSON.stringify(av) !== JSON.stringify(bv)) {
    const differences = [];
    for (let i = 0; i < Math.max(av.length, bv.length); i++) for (let j = 0; j < Math.max(av[i]?.length || 0, bv[i]?.length || 0); j++) if (String(av[i]?.[j]) !== String(bv[i]?.[j])) differences.push({ row: i + 1, col: j + 1, frozen: av[i]?.[j], rebuilt: bv[i]?.[j] });
    throw new Error(`${name} rebuilt values differ: ${JSON.stringify(differences.slice(0, 10))}`);
  }
  assert(JSON.stringify(a.formulas) === JSON.stringify(b.formulas), `${name} rebuilt formulas differ`);
}
assert(sha(await fs.readFile(RC)) === EXPECTED_SHA, "Frozen RC mutated during verification");

const summary = {
  verdict_basis: "Structural/model checks passed; known subject blockers remain open",
  frozen_sha256: EXPECTED_SHA,
  sheets: sheetNames,
  dishes: EXPECTED_DISHES.size,
  completeness: { rows: completeness.length, result_fields: deliverableFields.length, outcomes: completeness.length * deliverableFields.length, empty_or_template_counted: 0 },
  price_provenance: { active: activeIds.size, rejected: REJECTED_PRICE_IDS.size, sample_size: sampledSources.length, sample_percent: sampledSources.length / priceSources.length, sample: sampledSources.map(r => ({ price_source_id: r.price_source_id, ingredient: r.ingredient_name, product: r.observed_product, pack_qty: Number(r.pack_qty), pack_unit: r.pack_unit, pack_price_rub: Number(r.pack_price_rub), normalized_price_rub: Number(r.normalized_price_rub), price_date: r.price_date, url: r.source_url })) },
  safety: { cards: safety.length, veto_block: safety.filter(r => r.readiness_veto === "BLOCK").length, dish_critical_nulls: safety.reduce((n, r) => n + criticalFields.filter(f => r[f] === "null").length, 0), ccp_rows: ccp.length, ccp_critical_nulls: ccpNull.length, ccp_traceability_draft_limits: ccpTraceability.length },
  manual_recompute: manualRecompute,
  mass_balance: { rows: mass.length, pass: mass.filter(r => r.arithmetic_check === "PASS_DRAFT_ARITHMETIC").length },
  vsf: { cards: semiProducts.length, dag_edges: dag.length, mapping_edges: mappings.length, cycles: 0, multiply_mapped_recipe_lines: 0 },
  resources: { equipment_operations: equipment.length, inventory_sets: inventory.length, tableware_sets: tableware.length },
  formulas: { count: formulaCount, all_costing_rows_recalculated: costValues.length, reactivity_delta: after - before, error_scan: formulaErrors.ndjson },
  libreoffice: { status: "PASS", gate_d_pass: 15, error_scan: loErrors.ndjson },
  builder_reproducibility: { semantic_values: "PASS", semantic_formulas: "PASS", rebuilt_sha256: sha(await fs.readFile(rebuiltPath)) },
  visual_renders: { count: EXPECTED_SHEETS.length, directory: renderDir },
};
await fs.writeFile(path.join(TMP, "verification_summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
