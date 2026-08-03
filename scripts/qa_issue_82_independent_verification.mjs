#!/usr/bin/env node
/**
 * Read-only repository QA for the current Issue #82 remediation package.
 *
 * This is intentionally portable: CI needs only Node, Python and openpyxl.
 * The exact workbook identity is derived from immutable HOF-0016 rather than
 * duplicated as a stale constant in this script.
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA = path.join(ROOT, "docs/07-operations/issue-82");
const WORKBOOK = path.join(DATA, "VARSHAVKA_MENU_COSTING_TECH_CARDS_DRAFT_v2.0.0.xlsx");
const WORKBOOK_QA = path.join(ROOT, "scripts/qa_issue_82_workbook.py");
const HOF0016 = path.join(DATA, "HANDOFF_HOF-0016_EXCELBUILDER_REMEDIATION.md");
const EXPECTED_DISHES = new Set([
  ...Array.from({ length: 25 }, (_, i) => `VKM-${String(i + 1).padStart(3, "0")}`),
  "VKM-029", "VKM-030", "VKM-031",
]);
const REQUIRED_TECH_FIELDS = [
  "application_scope", "raw_material_requirements", "raw_material_preparation",
  "allowable_deviations", "organoleptic_indicators", "storage_and_realization",
];
const NUTRITION_HEADLINE = [
  "protein_g_per_declared_output", "fat_g_per_declared_output",
  "carbohydrate_g_per_declared_output", "energy_kcal_per_declared_output",
  "protein_g_per_100g", "fat_g_per_100g", "carbohydrate_g_per_100g",
  "energy_kcal_per_100g",
];
const SAFETY_CRITICAL = [
  "temperature_critical_limit", "cooling_critical_limit",
  "reheating_critical_limit", "storage_shelf_life",
];
const REJECTED_PRICE_IDS = new Set([
  "PSR-0002", "PSR-0008", "PSR-0011", "PSR-0012", "PSR-0016", "PSR-0022",
  "PSR-0024", "PSR-0029", "PSR-0030", "PSR-0036", "PSR-0037", "PSR-0039",
  "PSR-0042", "PSR-0043", "PSR-0045", "PSR-0053", "PSR-0059", "PSR-0060",
  "PSR-0065", "PSR-0066", "PSR-0067", "PSR-0068",
]);

function parseCsv(text) {
  const rows = []; let row = []; let field = ""; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (field.length || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  const headers = rows.shift() || [];
  return rows.filter(r => r.some(v => v !== "")).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
}
async function csv(name) { return parseCsv(await fs.readFile(path.join(DATA, name), "utf8")); }
function assert(condition, message) { if (!condition) throw new Error(message); }
function split(value) { return String(value || "").split(";").filter(x => x && x !== "null"); }
function blank(value) { return value == null || value === "" || value === "null"; }
function numeric(value) { return !blank(value) && Number.isFinite(Number(value)); }
function setEq(a, b) { return a.size === b.size && [...a].every(x => b.has(x)); }
function exactDishScope(rows, label) {
  const scope = new Set(rows.map(r => r.dish_code));
  assert(setEq(scope, EXPECTED_DISHES), `${label}: dish scope mismatch`);
}
function sha256(bytes) { return crypto.createHash("sha256").update(bytes).digest("hex"); }
function gitBlobSha(bytes) {
  return crypto.createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
}

const hofText = await fs.readFile(HOF0016, "utf8");
const expectedWorkbookSha = hofText.match(/Binary SHA-256:\s*`([0-9a-f]{64})`/i)?.[1];
assert(expectedWorkbookSha, "HOF-0016 does not contain exact workbook SHA-256");
const workbookBytes = await fs.readFile(WORKBOOK);
const actualWorkbookSha = sha256(workbookBytes);
assert(actualWorkbookSha === expectedWorkbookSha, `Workbook SHA mismatch: HOF=${expectedWorkbookSha}, actual=${actualWorkbookSha}`);

const [completeness, passports, recipes, tech, mass, costing, rawPrices, priceSources,
  channels, proxyPrices, proxyCosting, proxyChannels, nutrition, safety, ccp,
  resources, equipment, capacity, inventory, tableware] = await Promise.all([
  csv("COMPLETENESS_MATRIX_28x13.csv"), csv("DISH_PASSPORTS.csv"), csv("RECIPES.csv"),
  csv("TECH_CARDS.csv"), csv("MASS_BALANCE_REPORT.csv"), csv("COSTING_CARDS.csv"),
  csv("RAW_MATERIAL_PRICE_REGISTER.csv"), csv("PRICE_SOURCE_REGISTER.csv"),
  csv("CHANNEL_PRICING_TABLE.csv"), csv("PROXY_SCENARIO_PRICE_REGISTER.csv"),
  csv("PROVISIONAL_PROXY_SCENARIO_COSTING.csv"),
  csv("PROVISIONAL_PROXY_SCENARIO_CHANNEL_PRICING.csv"), csv("DISH_NUTRITION.csv"),
  csv("SAFETY_CARDS.csv"), csv("CCP_CONTROL_REGISTER.csv"), csv("RESOURCE_CARDS.csv"),
  csv("EQUIPMENT_FUNCTION_MATRIX.csv"), csv("CAPACITY_BOTTLENECK_REPORT.csv"),
  csv("INVENTORY_REGISTER.csv"), csv("TABLEWARE_REGISTER.csv"),
]);

for (const [name, rows] of Object.entries({
  completeness, passports, recipes, tech, mass, costing, channels, proxyCosting,
  proxyChannels, nutrition, safety, resources, equipment, capacity, inventory, tableware,
})) exactDishScope(rows, name);
assert(passports.length === 28 && completeness.length === 28, "28-dish package count failed");
assert(recipes.length === 253, "Recipe line count must be 253");
assert(mass.length === 28 && mass.every(r => r.arithmetic_check === "PASS_DRAFT_ARITHMETIC"), "Mass-balance contract failed");

const deliverableFields = [
  "passport", "recipe", "semi_finished", "costing", "tech_card", "equipment_capacity",
  "inventory_tableware", "allergen_safety", "nutrition", "channel_pricing",
  "chef_questions", "control_cook_form", "approval_sheet",
];
assert(completeness.every(r => deliverableFields.every(f => r[f] && !["PLANNED", "TEMPLATE", "EMPTY"].includes(r[f]))), "28×13 structural matrix contains empty/template result");

assert(tech.length === 28, "TECH_CARDS row count must be 28");
for (const row of tech) for (const field of REQUIRED_TECH_FIELDS) {
  assert(!blank(row[field]), `${row.dish_code}: ${field} is blank`);
  assert(!blank(row[`${field}_status`]), `${row.dish_code}: ${field}_status is blank`);
}

const activeIds = new Set(priceSources.map(r => r.price_source_id));
const priceUniverse = new Set(Array.from({ length: 90 }, (_, i) => `PSR-${String(i + 1).padStart(4, "0")}`));
assert(activeIds.size === 68 && REJECTED_PRICE_IDS.size === 22, "Price partition counts must be 68 accepted + 22 rejected");
assert(setEq(new Set([...activeIds, ...REJECTED_PRICE_IDS]), priceUniverse), "Price partition does not cover PSR-0001…0090 exactly");
assert([...activeIds].every(id => !REJECTED_PRICE_IDS.has(id)), "Rejected price source remains active");
assert(priceSources.every(r => r.provenance_review_status === "VERIFIED_DIRECT_CARD" && numeric(r.pack_qty) && numeric(r.pack_price_rub) && numeric(r.normalized_price_rub)), "Accepted price provenance contract failed");
assert(rawPrices.every(r => split(r.price_source_ids).every(id => activeIds.has(id))), "Raw price register selects inactive/rejected source");

assert(costing.length === 28 && costing.every(r => blank(r.complete_food_cost_rub) && blank(r.kitchen_cogs_rub) && blank(r.complete_portion_cogs_rub)), "Evidence COGS blanks were overwritten");
assert(channels.length === 101 && channels.every(r => blank(r.project_price_rub) && blank(r.food_cost_ratio) && blank(r.gross_margin_rub_before_channel_costs) && r.pricing_status === "BLOCKED_PENDING_VALIDATION"), "Evidence channel contract failed");
assert(proxyPrices.length === 113, "Proxy price register must contain 113 ingredients");
assert(proxyCosting.length === 28 && proxyCosting.every(r => numeric(r.scenario_kitchen_cogs_rub) && r.scenario_status === "ASSUMPTION_BLOCKED_PENDING_VALIDATION" && r.confidence === "LOW_CONFIDENCE"), "Proxy costing contract failed");
assert(proxyChannels.length === 101 && proxyChannels.every(r => ["scenario_kitchen_cogs_rub", "scenario_price_rub_before_tax_commission", "scenario_food_cost_ratio", "scenario_gross_margin_before_channel_costs_rub", "scenario_contribution_before_tax_commission_rub"].every(f => numeric(r[f])) && r.scenario_status === "ASSUMPTION_BLOCKED_PENDING_VALIDATION" && r.confidence === "LOW_CONFIDENCE"), "Proxy channel contract failed");

const recipeBytes = await fs.readFile(path.join(DATA, "RECIPES.csv"));
const recipeBlobSha = gitBlobSha(recipeBytes);
const recipeVersions = new Set(recipes.map(r => r.recipe_version));
assert(recipeVersions.size === 1, "Recipe version is not unique");
const recipeVersion = [...recipeVersions][0];
assert(safety.length === 28 && safety.every(r => r.source_recipe_version === recipeVersion && r.source_recipe_blob_sha === recipeBlobSha && r.readiness_veto === "BLOCK" && SAFETY_CRITICAL.every(f => r[f] === "null")), "Version-locked safety contract failed");
assert(ccp.length === 140 && ccp.filter(r => r.critical_limit === "null" && r.status === "BLOCKED_PENDING_VALIDATION").length === 112, "CCP null/block contract failed");

assert(nutrition.length === 28 && nutrition.every(r => NUTRITION_HEADLINE.every(f => numeric(r[f])) && r.release_status === "BLOCKED_PENDING_VALIDATION" && r.laboratory_confirmed === "false"), "Nutrition calculation/release contract failed");
assert(resources.length === 28 && equipment.length === 155 && capacity.length === 28 && inventory.length === 28 && tableware.length === 28, "Equipment/capacity/inventory scope failed");
assert(equipment.every(r => blank(r.selected_manufacturer) && blank(r.selected_model_article) && blank(r.passport_capacity) && r.suitability_status.startsWith("BLOCKED_")), "Equipment passport/suitability blocker contract failed");

const python = process.env.ISSUE82_PYTHON || "python3";
const workbookQaRun = spawnSync(python, [WORKBOOK_QA, WORKBOOK], { cwd: ROOT, encoding: "utf8", timeout: 120000 });
assert(workbookQaRun.status === 0, `Workbook QA failed: ${workbookQaRun.stderr || workbookQaRun.stdout}`);
const workbookQa = JSON.parse(workbookQaRun.stdout.trim());
assert(workbookQa.status === "PASS" && workbookQa.sha256 === actualWorkbookSha, "Workbook QA status/SHA mismatch");
assert(Object.keys(workbookQa.freeze_panes).length === 17 && Object.values(workbookQa.freeze_panes).every(Boolean), "Workbook freeze panes must pass 17/17");
assert(workbookQa.formula_count >= 809 && workbookQa.formula_error_literals.length === 0, "Workbook formula contract failed");
assert(workbookQa.scope.dishes === 28 && workbookQa.scope.evidence_channel_rows === 101 && workbookQa.scope.proxy_channel_rows === 101 && workbookQa.scope.proxy_cost_rows === 28, "Workbook 28/101 scope contract failed");

const summary = {
  result: "PASS",
  workbook: { sha256: actualWorkbookSha, source: "HOF-0016", sheets: 17, freeze_panes: 17, formulas: workbookQa.formula_count },
  scope: { dishes: 28, recipe_lines: recipes.length, completeness_outcomes: completeness.length * deliverableFields.length },
  economics: { accepted_price_sources: activeIds.size, rejected_price_sources: REJECTED_PRICE_IDS.size, evidence_cost_cards: costing.length, evidence_channel_rows: channels.length, proxy_cost_cards: proxyCosting.length, proxy_channel_rows: proxyChannels.length },
  safety: { cards: safety.length, recipe_version: recipeVersion, recipe_blob_sha: recipeBlobSha, veto_block: safety.filter(r => r.readiness_veto === "BLOCK").length, critical_nulls: safety.reduce((n, r) => n + SAFETY_CRITICAL.filter(f => r[f] === "null").length, 0) },
  nutrition: { calculated_rows: nutrition.length, release_blocked: nutrition.filter(r => r.release_status === "BLOCKED_PENDING_VALIDATION").length, laboratory_confirmed: nutrition.filter(r => r.laboratory_confirmed === "true").length },
  equipment: { resource_cards: resources.length, operation_mappings: equipment.length, capacity_rows: capacity.length, passport_claims: equipment.filter(r => !blank(r.passport_capacity)).length },
  workbook_qa: workbookQa,
};
console.log(JSON.stringify(summary, null, 2));
