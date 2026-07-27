import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const ROOT = process.env.S03_REPO_ROOT
  ? path.resolve(process.env.S03_REPO_ROOT)
  : path.resolve(import.meta.dirname, "../..");
const NAME = "FINMODEL_VARSHAVKA_USALI_SCENARIO_S03_v0.1.7.xlsx";
const FILE = path.join(ROOT, "models/scenarios/S03", NAME);
const SUMS = path.join(ROOT, "models/scenarios/S03/SHA256SUMS.txt");

const bytes = await fs.readFile(FILE);
const sha = crypto.createHash("sha256").update(bytes).digest("hex");
const checksumRows = (await fs.readFile(SUMS, "utf8"))
  .trim()
  .split(/\r?\n/)
  .map((line) => line.trim().split(/\s+/));
const checksum = checksumRows.find((row) => row.at(-1) === NAME)?.[0];
if (!checksum || sha !== checksum) {
  throw new Error(`SHA-256 mismatch: file=${sha}; register=${checksum ?? "missing"}`);
}

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(FILE));
const overview = await workbook.inspect({
  kind: "workbook,sheet",
  include: "id,name",
  maxChars: 20000,
});
const sheetNames = [...overview.ndjson.matchAll(/"name":"([^"]+)"/g)].map(
  (match) => match[1],
);
if (sheetNames.length !== 16) {
  throw new Error(`Expected 16 sheets, received ${sheetNames.length}`);
}
for (const required of [
  "13_ИЗМЕНЕНИЯ_v0.1.6",
  "14_ПРОГРАММА_КУХНИ",
  "15_ЗАВТРАК_v0.1.7",
]) {
  if (!sheetNames.includes(required)) {
    throw new Error(`Missing sheet: ${required}`);
  }
}

const errorScan = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 500 },
  maxChars: 20000,
});
if (!errorScan.ndjson.includes("matched 0 entries")) {
  throw new Error(`Formula error scan failed:\n${errorScan.ndjson}`);
}

const checks = await workbook.inspect({
  kind: "table",
  sheetId: "08_ПРОВЕРКИ",
  range: "A1:G46",
  include: "values",
  tableMaxRows: 50,
  tableMaxCols: 7,
  maxChars: 40000,
});
const table = JSON.parse(checks.ndjson.split("\n")[0]);
const failed = table.values.filter((row) => row[5] === "ОШИБКА");
if (failed.length > 0) {
  throw new Error(`Failed checks: ${JSON.stringify(failed)}`);
}
const requiredChecks = [
  "CHK.BANQ.CASH",
  "CHK.HOTEL.TOTAL",
  "CHK.COFFEE.QTY",
  "CHK.COFFEE.COGS",
  "CHK.LUNCH.CHECK",
  "CHK.STAFF.MEALS",
  "CHK.BREAKFAST.MIX",
  "CHK.BREAKFAST.EXCLUDED",
  "CHK.BREAKFAST.DRINK",
  "CHK.BREAKFAST.EXTERNAL",
  "CHK.BREAKFAST.SURCHARGE",
  "CHK.BREAKFAST.COGS",
  "CHK.BREAKFAST.FC",
  "CHK.MENU.POSITIONS",
  "CHK.BREAKFAST.RESERVE",
];
for (const code of requiredChecks) {
  const row = table.values.find((item) => item[0] === code);
  if (!row || row[5] !== "OK") {
    throw new Error(`Required check is not OK: ${code}`);
  }
}

const breakfast = await workbook.inspect({
  kind: "table",
  sheetId: "01_ВВОД",
  range: "A138:G167",
  include: "values",
  tableMaxRows: 35,
  tableMaxCols: 7,
  maxChars: 25000,
});
const breakfastTable = JSON.parse(breakfast.ndjson.split("\n")[0]);
const byCode = new Map(breakfastTable.values.map((row) => [row[0], row[3]]));
for (const [code, expected] of [
  ["HOTEL_BREAKFAST_ACTIVE_VARIANTS", 3],
  ["HOTEL_BREAKFAST_EXTERNAL_SALE", 0],
  ["HOTEL_BREAKFAST_BENEDICT_SHARE", 0],
  ["HOTEL_BREAKFAST_SALMON_CROISSANT_SHARE", 0],
  ["KITCHEN_ACTIVE_MENU_POSITIONS", 31],
  ["TRAINING_CONTROL_BATCHES", 63],
]) {
  if (byCode.get(code) !== expected) {
    throw new Error(`${code}: expected ${expected}, received ${byCode.get(code)}`);
  }
}

console.log(
  JSON.stringify({
    file: FILE,
    sha256: sha,
    sheets: sheetNames.length,
    formula_errors: 0,
    required_checks: requiredChecks.length,
    active_menu_positions: 31,
    status: "OK",
  }),
);
