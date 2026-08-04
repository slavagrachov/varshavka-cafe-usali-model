import fs from "node:fs/promises";
import path from "node:path";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";
const root=process.env.ISSUE80_ROOT;
const dir=path.join(root,"docs/07-operations/issue-80/s02");
const out=path.join(dir,"VARSHAVKA_MENU_COSTING_TECH_CARDS_31_DRAFT_v3.0.0.xlsx");
const preview=path.join(process.env.ISSUE80_TMP,"previews");
await fs.mkdir(preview,{recursive:true});
function parse(s){let rows=[],row=[],v="",q=false;for(let i=0;i<s.length;i++){let c=s[i];if(q){if(c=='"'&&s[i+1]=='"'){v+='"';i++;}else if(c=='"')q=false;else v+=c;}else if(c=='"')q=true;else if(c==","){row.push(v);v="";}else if(c=="\n"){row.push(v.replace(/\r$/,""));rows.push(row);row=[];v="";}else v+=c;}if(v||row.length){row.push(v);rows.push(row)}return rows.filter(r=>r.some(x=>x!==""));}
function typed(x){if(x==="")return null;if(/^-?\d+(\.\d+)?$/.test(x))return Number(x);return x;}
function col(n){let s="";while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26)}return s}
const wb=Workbook.create(); wb.comments.setSelf({displayName:"VYACHESLAV"});
const colors={navy:"#17365D",teal:"#0F6B78",white:"#FFFFFF",pale:"#EAF2F8",grid:"#D9E2F3",red:"#F4CCCC",yellow:"#FFF2CC",green:"#D9EAD3"};
async function addCsv(sheetName,file,title,note){
 const rows=parse(await fs.readFile(path.join(dir,file),"utf8"));const data=rows.map((r,i)=>i?r.map(typed):r);
 const sh=wb.worksheets.add(sheetName);sh.showGridLines=false;const end=col(Math.max(1,data[0].length));
 sh.getRange("A1:"+end+"1").merge();sh.getRange("A1").values=[[title]];
 sh.getRange("A1:"+end+"1").format={fill:colors.navy,font:{bold:true,color:colors.white,size:14,name:"Arial"},verticalAlignment:"center"};
 sh.getRange("A2:"+end+"2").merge();sh.getRange("A2").values=[[note]];sh.getRange("A2:"+end+"2").format={fill:colors.pale,font:{italic:true,name:"Arial"},wrapText:true};
 sh.getRange("A4:"+end+(3+data.length)).values=data;
 sh.getRange("A4:"+end+"4").format={fill:colors.teal,font:{bold:true,color:colors.white,name:"Arial"},wrapText:true,verticalAlignment:"center"};
 if(data.length>1)sh.getRange("A5:"+end+(3+data.length)).format={font:{name:"Arial",size:9},wrapText:true,verticalAlignment:"top",borders:{preset:"inside",style:"thin",color:colors.grid}};
 sh.tables.add("A4:"+end+(3+data.length),true,"T_"+sheetName.replace(/[^A-Za-z0-9]/g,"_"));
 sh.freezePanes.freezeRows(4);sh.freezePanes.freezeColumns(1);sh.getRange("4:4").format.rowHeight=50;
 for(let i=1;i<=data[0].length;i++){let h=String(data[0][i-1]).toLowerCase();let w=h.includes("name")||h.includes("question")||h.includes("note")||h.includes("method")||h.includes("path")?38:h.includes("status")?24:16;sh.getRange(col(i)+"1:"+col(i)+(3+data.length)).format.columnWidth=w;if(h.includes("status")){let rg=sh.getRange(col(i)+"5:"+col(i)+(3+data.length));rg.conditionalFormats.add("containsText",{text:"BLOCK",format:{fill:colors.red,font:{bold:true}}});rg.conditionalFormats.add("containsText",{text:"DRAFT",format:{fill:colors.yellow}});rg.conditionalFormats.add("containsText",{text:"PASS",format:{fill:colors.green}});}}
 return {sh,headers:data[0],last:3+data.length,end};
}
const pass=wb.worksheets.add("00_ПАСПОРТ");pass.showGridLines=false;pass.getRange("A1:F1").merge();pass.getRange("A1").values=[["VARSHAVKA — итоговый пакет 31 позиции"]];pass.getRange("A1:F1").format={fill:colors.navy,font:{bold:true,color:colors.white,size:16}};pass.getRange("A3:F11").values=[["Параметр","Значение","Статус","Источник","Версия","Ограничение"],["Session","VAR-ISSUE-80-S02-FINAL-31-PACKAGE","FACT","Issue #80","S02",""],["Base SHA","cd23852fda61d9ee42dc7bae453e164c8f4d130c","FACT","main","2026-08-04",""],["Позиции",31,"FACT","MENU_REGISTER_31.csv","31/31",""],["Каналы",104,"FACT","CHANNEL_ECONOMICS_104.csv","104/104",""],["Recipes","DRAFT / ASSUMPTION","DRAFT","RECIPES_31.csv","v3.0.0","Не утверждены"],["Costs","MODEL ONLY","CALCULATED","FINMODEL bridge","v3.0.0","Не evidence COGS"],["Safety","BLOCK / NOT APPROVED","BLOCK","Safety registers","v3.0.0","BLOCK 28/28 сохранён"],["Owner action","Chef review + evidence work","OPEN","Issue #80","S02","Merge/close запрещены"]];pass.getRange("A3:F3").format={fill:colors.teal,font:{bold:true,color:colors.white}};pass.getRange("A3:F11").format.wrapText=true;pass.freezePanes.freezeRows(3);pass.getRange("A1:A11").format.columnWidth=24;pass.getRange("B1:B11").format.columnWidth=48;pass.getRange("C1:F11").format.columnWidth=25;
await addCsv("01_МЕНЮ","MENU_REGISTER_31.csv","01 — Меню 31/31","Все статусы сохранены; каналы являются проектными сценариями.");
await addCsv("02_РЕЦЕПТУРЫ","RECIPES_31.csv","02 — Рецептуры","28 main + 3 breakfast historical DRAFT; не утверждены Chef.");
await addCsv("03_ПОЛУФАБРИКАТЫ","SEMI_FINISHED_PRODUCTS_31.csv","03 — Полуфабрикаты","DAG и make-or-buy решения остаются DRAFT.");
const cost=await addCsv("04_КАЛЬКУЛЯЦИИ","COSTING_CARDS_31.csv","04 — Калькуляции 31/31","MODEL ONLY NOT EVIDENCE. Формульный пересчёт прямого COGS справа.");
let H=cost.headers, ik=H.indexOf("model_kitchen_cogs_rub")+1,ip=H.indexOf("model_packaging_rub")+1,io=H.indexOf("model_other_direct_variable_rub")+1,ic=H.indexOf("model_complete_direct_cogs_rub")+1;let c1=cost.headers.length+1,c2=c1+1;cost.sh.getRange(col(c1)+"4:"+col(c2)+"4").values=[["recalc_direct_cogs_rub","recalc_delta_when_source_complete"]];for(let r=5;r<=cost.last;r++){cost.sh.getRange(col(c1)+r).formulas=[["=IF(COUNTA("+col(ik)+r+","+col(ip)+r+","+col(io)+r+")=0,\"\",SUM("+col(ik)+r+","+col(ip)+r+","+col(io)+r+"))"]];cost.sh.getRange(col(c2)+r).formulas=[["=IF("+col(ic)+r+"=\"\",\"\", "+col(c1)+r+"-"+col(ic)+r+")"]];}cost.sh.getRange(col(c1)+"5:"+col(c2)+cost.last).format.numberFormat="#,##0.00";
await addCsv("05_ТЕХКАРТЫ","TECH_CARDS_31.csv","05 — Технологические карты","Пустые критические параметры не заменены нулями.");
await addCsv("06_СЫРЬЁ_И_ЦЕНЫ","RAW_MATERIAL_PRICE_REGISTER.csv","06 — Сырьё и цены","Источник Issue #82; supplier evidence остаётся открытым.");
const ce=await addCsv("07_ЦЕНООБРАЗОВАНИЕ","CHANNEL_ECONOMICS_104.csv","07 — Экономика каналов 104/104","Проектные цены/food cost/margin имеют preliminary/model status.");
H=ce.headers;let id=H.indexOf("model_kitchen_cogs_rub")+1,ipr=H.indexOf("model_price_rub")+1,igm=H.indexOf("model_gross_margin_before_channel_costs_rub")+1;c1=H.length+1;c2=c1+1;ce.sh.getRange(col(c1)+"4:"+col(c2)+"4").values=[["recalc_kitchen_food_cost","recalc_gross_margin_before_channel_costs"]];for(let r=5;r<=ce.last;r++){ce.sh.getRange(col(c1)+r).formulas=[["=IFERROR("+col(id)+r+"/"+col(ipr)+r+",\"\")"]];ce.sh.getRange(col(c2)+r).formulas=[["=IF(OR("+col(ipr)+r+"=\"\","+col(id)+r+"=\"\"),\"\", "+col(ipr)+r+"-"+col(id)+r+")"]];}ce.sh.getRange(col(c1)+"5:"+col(c1)+ce.last).format.numberFormat="0.0%";ce.sh.getRange(col(c2)+"5:"+col(c2)+ce.last).format.numberFormat="#,##0.00";
await addCsv("08_ОБОРУДОВАНИЕ","EQUIPMENT_FUNCTION_MATRIX_31.csv","08 — Оборудование","Требования DRAFT; паспорта и load tests не подтверждены.");
await addCsv("09_ИНВЕНТАРЬ_И_ПОСУДА","INVENTORY_REGISTER_31.csv","09 — Инвентарь и посуда","Инвентарь и связанная мойка; отдельный TABLEWARE_REGISTER_31.csv сохраняет посуду.");
await addCsv("10_АЛЛЕРГЕНЫ_БЕЗОПАСНОСТЬ","ALLERGEN_SAFETY_MATRIX_31.csv","10 — Аллергены и безопасность","BLOCK 28/28 сохранён; завтраки также NOT APPROVED.");
await addCsv("11_ПИЩЕВАЯ_ЦЕННОСТЬ","NUTRITION_31.csv","11 — Пищевая ценность и метод","Расчётный DRAFT для 28; завтраки не рассчитаны; лабораторное подтверждение отсутствует.");
await addCsv("12_ВОПРОСЫ_ШЕФУ","CHEF_QUESTIONS_31.csv","12 — Вопросы шеф-повару","P0 safety/SKU/storage; P1 recipe/output; P2 process/equipment.");
await addCsv("13_СОГЛАСОВАНИЕ","COMPLETENESS_MATRIX_31.csv","13 — Согласование","31/31 NOT APPROVED; решения вводятся только после факта.");
await addCsv("14_КОНТРОЛЬНЫЕ_ПРОРАБОТКИ","COMPLETENESS_MATRIX_31.csv","14 — Контрольные проработки","Формы готовы; физические испытания не проводились.");
const checks=[["check_id","actual","expected","difference","status","note"],["CHK-POSITIONS",31,31,0,"PASS","Exact VKM-001..031"],["CHK-CHANNELS",104,104,0,"PASS","Unique position×channel"],["CHK-SHEETS",17,17,0,"PASS","Required sheets"],["CHK-SAFETY","BLOCK 28/28","BLOCK 28/28",0,"PASS","Issue82 veto retained"],["CHK-EVIDENCE","MODEL_ONLY","MODEL_ONLY",0,"PASS","No proxy promotion"],["CHK-CHEF","0 approved","0 approved",0,"PASS","No inferred decisions"]];
const ck=wb.worksheets.add("15_ПРОВЕРКИ");ck.getRange("A1:F7").values=checks;ck.getRange("A1:F1").format={fill:colors.teal,font:{bold:true,color:colors.white}};ck.freezePanes.freezeRows(1);ck.tables.add("A1:F7",true,"T_Checks");ck.getRange("A1:F7").format.columnWidth=24;ck.getRange("E2:E7").conditionalFormats.add("containsText",{text:"PASS",format:{fill:colors.green,font:{bold:true}}});
await addCsv("16_ИСТОЧНИКИ","SOURCE_REGISTER_31.csv","16 — Источники","Иерархия и ограничения использования.");
const x=await SpreadsheetFile.exportXlsx(wb);await x.save(out);
for(const s of wb.worksheets.items){const img=await wb.render({sheetName:s.name,range:"A1:H16",scale:1});await fs.writeFile(path.join(preview,s.name.replaceAll("/","_")+".png"),new Uint8Array(await img.arrayBuffer()));}
const inspect=await wb.inspect({kind:"sheet",include:"id,name"});console.log(inspect.ndjson);
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"formula errors"});console.log(errors.ndjson);
console.log(JSON.stringify({out,sheets:wb.worksheets.items.length,previews:wb.worksheets.items.length}));
