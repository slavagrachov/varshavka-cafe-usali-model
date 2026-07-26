import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const ROOT = process.env.S03_REPO_ROOT
  ? path.resolve(process.env.S03_REPO_ROOT)
  : path.resolve(import.meta.dirname, "../..");
const FILE = path.join(
  ROOT,
  "models/scenarios/S03/FINMODEL_VARSHAVKA_USALI_SCENARIO_S03_v0.1.6.xlsx",
);
const EXPECTED_SHA =
  "1ad3258200ccc2293a4167961a144262aae34299e0b4ed54a2bc124e95c6d7b8";

const bytes = await fs.readFile(FILE);
const sha = crypto.createHash("sha256").update(bytes).digest("hex");
if (sha !== EXPECTED_SHA) {
  throw new Error(`SHA-256 mismatch: ${sha}`);
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
if (sheetNames.length !== 15) {
  throw new Error(`Expected 15 sheets, received ${sheetNames.length}`);
}
for (const required of [
  "13_ИЗМЕНЕНИЯ_v0.1.6",
  "14_ПРОГРАММА_КУХНИ",
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
  range: "A1:G37",
  include: "values",
  tableMaxRows: 40,
  tableMaxCols: 7,
  maxChars: 30000,
});
const table = JSON.parse(checks.ndjson.split("\n")[0]);
const failed = table.values.filter((row) => row[5] === "ОШИБКА");
if (failed.length > 0) {
  throw new Error(`Failed checks: ${JSON.stringify(failed)}`);
}
for (const code of [
  "CHK.BANQ.CASH",
  "CHK.HOTEL.TOTAL",
  "CHK.COFFEE.QTY",
  "CHK.COFFEE.COGS",
  "CHK.LUNCH.CHECK",
  "CHK.STAFF.MEALS",
]) {
  const row = table.values.find((item) => item[0] === code);
  if (!row || row[5] !== "OK") {
    throw new Error(`Required check is not OK: ${code}`);
  }
}

console.log(
  JSON.stringify({
    file: FILE,
    sha256: sha,
    sheets: sheetNames.length,
    formula_errors: 0,
    required_checks: 6,
    status: "OK",
  }),
);
