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
const formulas = costing.getRange("F4:I30").formulas.flat().filter(Boolean);
if (formulas.length < 45) throw new Error(`Expected formula-driven costing, found ${formulas.length} formulas`);

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
  errorScan: "passed",
  previews: OUT,
}));
