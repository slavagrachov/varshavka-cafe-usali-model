import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const ROOT = process.env.S04_REPO_ROOT
  ? path.resolve(process.env.S04_REPO_ROOT)
  : path.resolve(import.meta.dirname, "../..");
const FILE = path.join(
  ROOT,
  "models/scenarios/S04/FINMODEL_VARSHAVKA_USALI_SCENARIO_S04_v3.0.0.xlsx",
);
const OUT = path.join("/tmp", "varshavka-s04-validation");
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(FILE));

const sheetInspect = await workbook.inspect({
  kind: "sheet",
  include: "id,name",
  maxChars: 10000,
});
for (const required of ["PRICE_REGISTER", "BREAKFAST_RECIPES", "BREAKFAST_COSTING"]) {
  if (!sheetInspect.ndjson.includes(required)) throw new Error(`Missing required sheet: ${required}`);
  workbook.worksheets.getItem(required);
}

const costing = workbook.worksheets.getItem("BREAKFAST_COSTING");
const formulas = costing.getRange("D4:I30").formulas.flat().filter(Boolean);
if (formulas.length < 61) throw new Error(`Expected formula-driven costing, found ${formulas.length} formulas`);
const normFormulas = costing.getRange("D4:D19").formulas.flat();
const expectedNormFormulas = Array.from(
  { length: 16 },
  (_, index) => `='BREAKFAST_RECIPES'!F${index + 4}`,
);
if (JSON.stringify(normFormulas) !== JSON.stringify(expectedNormFormulas)) {
  throw new Error(`Gross norms are not formula-linked:\n${JSON.stringify(normFormulas)}`);
}

const checks = workbook.worksheets.getItem("08_ПРОВЕРКИ");
const checkValues = checks.getRange("A46:F47").values;
for (const row of checkValues) {
  if (row[5] !== "OK") throw new Error(`Failed breakfast check: ${JSON.stringify(row)}`);
}

const pnl = workbook.worksheets.getItem("07_PNL_НАЛОГИ");
const hotelAnnual = pnl.getRange("P49:P57").values.flat();
const expectedHotelAnnual = [
  4015000,
  1487739.4910277778,
  2527260.508972222,
  3650000,
  1095000,
  2555000,
  7665000,
  2582739.4910277778,
  5082260.508972222,
];
hotelAnnual.forEach((value, index) => {
  if (Math.abs(value - expectedHotelAnnual[index]) > 0.01) {
    throw new Error(`Hotel P&L mismatch at P${index + 49}: ${value}`);
  }
});

const errorScan = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
  maxChars: 12000,
});
if (errorScan.ndjson.includes("#REF!") || errorScan.ndjson.includes("#DIV/0!") ||
    errorScan.ndjson.includes("#VALUE!") || errorScan.ndjson.includes("#NAME?")) {
  throw new Error(`Formula errors detected:\n${errorScan.ndjson}`);
}

await fs.mkdir(OUT, { recursive: true });
for (const sheetName of ["PRICE_REGISTER", "BREAKFAST_COSTING"]) {
  const preview = await workbook.render({
    sheetName,
    autoCrop: "all",
    scale: 1,
    format: "png",
  });
  await fs.writeFile(
    path.join(OUT, `${sheetName}.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}

console.log(JSON.stringify({
  file: FILE,
  sheets: 19,
  requiredSheets: 3,
  costingFormulas: formulas.length,
  normLinks: normFormulas.length,
  breakfastChecks: "passed",
  hotelPnlMemo: "passed",
  errorScan: "passed",
  previews: OUT,
}));
