import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const input=process.env.ISSUE80_XLSX,out=process.env.ISSUE80_RENDER_OUT;
await fs.mkdir(out,{recursive:true});
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(input));
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"final exact sha error scan"});
console.log(errors.ndjson);
for(const s of wb.worksheets.items){const img=await wb.render({sheetName:s.name,range:"A1:H16",scale:1});await fs.writeFile(path.join(out,s.name+".png"),new Uint8Array(await img.arrayBuffer()));}
console.log(JSON.stringify({sheets:wb.worksheets.items.length,renders:wb.worksheets.items.length}));
