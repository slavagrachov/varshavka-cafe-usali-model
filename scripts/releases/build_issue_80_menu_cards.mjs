import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const ROOT = process.env.ISSUE80_REPO_ROOT
  ? path.resolve(process.env.ISSUE80_REPO_ROOT)
  : path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, "docs/07-operations/issue-80/VARSHAVKA_MENU_COSTING_TECH_CARDS_DRAFT_v1.0.0.xlsx");
const RENDER_DIR = process.env.ISSUE80_RENDER_DIR || "/tmp/issue80-render";
const BUILT_AT = new Date("2026-08-03T00:00:00Z");

const C = {
  navy: "#17365D", teal: "#0F6B78", pale: "#EAF2F8", grid: "#D9E2F3",
  fact: "#D9EAD3", calculated: "#DDEBF7", assumption: "#FFF2CC",
  draft: "#FCE5CD", blocked: "#F4CCCC", superseded: "#E7E6E6", white: "#FFFFFF",
};
const STATUSES = ["FACT", "CALCULATED", "ASSUMPTION", "DRAFT", "BLOCKED", "SUPERSEDED"];
const sheets = [
  "00_ПАСПОРТ", "01_МЕНЮ", "02_КАЛЬКУЛЯЦИИ", "03_ТЕХКАРТЫ", "04_СЫРЬЁ_И_ЦЕНЫ",
  "05_АЛЛЕРГЕНЫ_БЕЗОПАСНОСТЬ", "06_ВОПРОСЫ_ШЕФУ", "07_СОГЛАСОВАНИЕ", "08_ПРОВЕРКИ", "09_ИСТОЧНИКИ",
];

const menuBase = [
  ["Пицца","Маргарита","1 пицца","450 г","À la carte; Бизнес-ланч; Гостиничные ужины; Доставка"],
  ["Пицца","Четыре сыра","1 пицца","480 г","À la carte; Бизнес-ланч; Гостиничные ужины; Доставка"],
  ["Пицца","Грибная с ветчиной","1 пицца","500 г","À la carte; Бизнес-ланч; Гостиничные ужины; Доставка"],
  ["Пицца","Пепперони","1 пицца","500 г","À la carte; Бизнес-ланч; Гостиничные ужины; Доставка"],
  ["Хлеб","Белая чиабатта","1 изделие","100 г","Все применимые направления КАФЕ; обязательные компоненты"],
  ["Хлеб","Томатная чиабатта","1 изделие","100 г","Все применимые направления КАФЕ"],
  ["Хлеб","Бородинский хлеб","1 буханка","350 г","Все применимые направления КАФЕ; обязательные компоненты"],
  ["Хлеб","Бриошь","1 изделие","85 г","Все применимые направления КАФЕ; бургер"],
  ["Салаты","Буррата с томатами","1 порция","300 г","À la carte; Бизнес-ланч; Гостиничные ужины; Доставка"],
  ["Салаты","Микс-салат с креветками и яблоком","1 порция","280 г","À la carte; Бизнес-ланч; Гостиничные ужины; Доставка"],
  ["Салаты","Греческий","1 порция","270 г","À la carte; Бизнес-ланч; Гостиничные ужины; Доставка"],
  ["Салаты","Винегрет","1 порция","240 г","À la carte; Бизнес-ланч; Гостиничные ужины; Доставка"],
  ["Холодные закуски","Слабосолёный лосось","1 порция","130 г","À la carte; Бизнес-ланч; Гостиничные ужины"],
  ["Холодные закуски","Сельдь с запечённым картофелем","1 порция","250 г","À la carte; Бизнес-ланч; Гостиничные ужины"],
  ["Холодные закуски","Оливки и маслины","1 порция","120 г","À la carte; Бизнес-ланч; Гостиничные ужины"],
  ["Холодные закуски","Ассорти фирменных солений","1 порция","180 г","À la carte; Бизнес-ланч; Гостиничные ужины"],
  ["Холодные закуски","Ростбиф с луком и гренкой","1 порция","180 г","À la carte; Бизнес-ланч; Гостиничные ужины"],
  ["Супы","Традиционный красный борщ","1 гостевая подача","400 г","À la carte; Бизнес-ланч"],
  ["Горячие блюда","Мурманская треска со сливочно-горчичным соусом","1 порция","300 г","À la carte; Бизнес-ланч; Гостиничные ужины; Доставка"],
  ["Горячие блюда","Креветки по-тайски","1 порция","360 г","À la carte; Бизнес-ланч; Гостиничные ужины; Доставка"],
  ["Горячие блюда","Бургер VARSHAVKA","1 бургер","350 г","À la carte; Бизнес-ланч; Гостиничные ужины; Доставка"],
  ["Горячие блюда","Миньоны из говяжьей вырезки","1 порция, 2 миньона","300 г","À la carte; Бизнес-ланч; Гостиничные ужины; Доставка"],
  ["Гарниры","Запечённый картофель","1 порция","150 г","À la carte; Бизнес-ланч; Гостиничные ужины"],
  ["Гарниры","Рис жасмин","1 порция","150 г","À la carte; Бизнес-ланч; Гостиничные ужины"],
  ["Гарниры","Горячие овощи","1 порция","150 г","À la carte; Бизнес-ланч; Гостиничные ужины"],
  ["Гостиничные завтраки","Яичница, круассан и сыр двух видов","1 закрытый комплекс","225 г + напиток 200 мл","Гостиница"],
  ["Гостиничные завтраки","Омлет, круассан и сыр двух видов","1 закрытый комплекс","265 г + напиток 200 мл","Гостиница"],
  ["Гостиничные завтраки","Овсяная каша, круассан и сыр двух видов","1 закрытый комплекс","355 г + напиток 200 мл","Гостиница"],
  ["Десерты","Черничный торт VARSHAVKA","1 торт / 12 порций","1 800 г / 150 г","À la carte; Навынос"],
  ["Десерты","Кростата с солёной карамелью","1 кростата / 10 порций","1 200 г / 120 г","À la carte; Гостиничные ужины; Навынос"],
  ["Десерты","Мадлен","партия 20 шт. / продажа 2 шт.","600 г / 60 г","À la carte; Навынос"],
];
const menu = menuBase.map((x, i) => {
  const n = i + 1, code = `VKM-${String(n).padStart(3,"0")}`;
  return [code, x[0], x[1], x[4], x[2], x[3], n >= 26 && n <= 28 ? 550 : null,
    "DRAFT", `VKC-${String(n).padStart(3,"0")}`, `VKT-${String(n).padStart(3,"0")}`,
    n >= 26 && n <= 28 ? "DRAFT" : "BLOCKED", "BLOCKED"];
});

const priceRows = [
  ["P-EGG-C0","Яйцо куриное C0","шт.",10,129.99,null,"Лента / Дивеевское","739866",new Date("2026-07-27"),"https://lenta.com/product/yajjco-kurinoe-diveevskoe-s0-rossiya-10sht-739866/","DRAFT","Нужен документ поставщика"],
  ["P-MELANGE-GROVO","Меланж пастеризованный GROVO","кг",0.9,361.50,null,"публичная карточка / GROVO","не подтверждён",new Date("2026-07-27"),"https://da-mart.ru/catalog/goods/296776/","DRAFT","Масса и цена требуют документа GROVO"],
  ["P-MILK-DS","Молоко «Деловой Стандарт Select» 3,2%","л",1,146,null,"Pragmatic","12106183",new Date("2026-07-27"),"https://www.pragmatic.ru/product/moloko-delovoy-standart-select-ultrapasterizovannoe-32-1-l","DRAFT","Масса нетто требует документа"],
  ["P-BUTTER","Масло сливочное 82,5%","кг",0.18,199.99,null,"Лента / Вкуснотеево","743324",new Date("2026-07-27"),"https://lenta.com/product/maslo-slivochnoe-vkusnoteevo-tradicionnoe-825-rossiya-180g-743324/","DRAFT","Нужен документ поставщика"],
  ["P-OATS","Овсяные хлопья длительной варки","кг",0.5,104.99,null,"Лента / Клинские","627534",new Date("2026-07-27"),"https://lenta.com/product/khlopya-ovsyanye-klinskie-gerkules-rossiya-500g-627534/","DRAFT","Публичная цена"],
  ["P-SUGAR","Сахар","кг",1,99.99,null,"Лента","717070",new Date("2026-07-27"),"https://lenta.com/product/sakhar-pesok-lenta-rossiya-1kg-717070/","DRAFT","Публичная цена"],
  ["P-SALT","Соль","кг",1,42.99,null,"Лента / Усольская","214838",new Date("2026-07-27"),"https://lenta.com/product/sol-usolskaya-pishhevaya-vyvarochnaya-jodirovannaya-rossiya-1kg-214838/","DRAFT","Публичная цена"],
  ["P-CROISSANT-80","Круассан замороженный без начинки 80 г","шт.",60,2033.28,null,"Supl.biz","26840364",new Date("2026-07-27"),"https://supl.biz/kruassan-60sht-80-g-p26840364/","DRAFT","Состав и масло не подтверждены"],
  ["P-CHEDDAR","Чеддер, порционный ломтик","кг",0.125,174.99,null,"Лента / Schonfeld","722806",new Date("2026-07-27"),"https://lenta.com/product/syr-schonfeld-cheddar-50-narezka-rossiya-125g-722806/","DRAFT","Фасовка ломтика требует проверки"],
  ["P-FONTINA","Fontina DOP / Fontal","кг",1,1800,null,"Поставщик не выбран","нет",new Date("2026-07-27"),"Решение проекта: параметр чувствительности","ASSUMPTION","Не утверждённая закупочная цена"],
  ["P-DRINK","Напиток бариста","шт.",1,60,null,"VARSHAVKA / Бар","внутренний норматив",new Date("2026-07-27"),"HOTEL_BREAKFAST_DECISION_2026-07-27.md","DRAFT","Относится только к Гостинице"],
];

const recipes = {
  "VKM-026": [
    ["P-EGG-C0","Яйцо куриное C0","шт.",2,126,null,114,"Основное блюдо"],
    ["P-BUTTER","Масло сливочное 82,5%","г",5,5,null,5,"Основное блюдо"],
    ["P-SALT","Соль","г",1,1,null,1,"Основное блюдо"],
  ],
  "VKM-027": [
    ["P-MELANGE-GROVO","Меланж пастеризованный GROVO","г",126,126,null,111,"Основное блюдо"],
    ["P-MILK-DS","Молоко «Деловой Стандарт Select» 3,2%","мл",50,50,null,44,"Основное блюдо"],
    ["P-BUTTER","Масло сливочное 82,5%","г",5,5,null,4,"Основное блюдо"],
    ["P-SALT","Соль","г",1,1,null,1,"Основное блюдо"],
  ],
  "VKM-028": [
    ["P-OATS","Овсяные хлопья длительной варки","г",45,45,null,45,"Основное блюдо"],
    ["P-MILK-DS","Молоко «Деловой Стандарт Select» 3,2%","мл",125,125,null,108,"Основное блюдо"],
    [null,"Вода питьевая","г",100,100,null,86,"Основное блюдо; стоимость относится к OPEX"],
    ["P-SUGAR","Сахар","г",5,5,null,5,"Основное блюдо"],
    ["P-BUTTER","Масло сливочное 82,5%","г",5,5,null,5,"Основное блюдо"],
    ["P-SALT","Соль","г",1,1,null,1,"Основное блюдо"],
  ],
};
const common = [
  ["P-CROISSANT-80","Круассан замороженный без начинки 80 г","шт.",1,80,null,65,"Общий компонент"],
  ["P-CHEDDAR","Чеддер, порционный ломтик","г",20,20,null,20,"Общий компонент"],
  ["P-FONTINA","Fontina DOP / Fontal","г",21,20,null,20,"Общий компонент"],
  ["P-DRINK","Напиток бариста 200 мл","шт.",1,1,null,null,"Напиток; не входит в массу пищевой части"],
];

const wb = Workbook.create();
const ws = Object.fromEntries(sheets.map(name => [name, wb.worksheets.add(name)]));
wb.comments.setSelf({ displayName: "VYACHESLAV" });

function title(sheet, endCol, text, note) {
  sheet.showGridLines = false;
  sheet.getRange(`A1:${endCol}1`).merge();
  sheet.getRange("A1").values = [[text]];
  sheet.getRange(`A1:${endCol}1`).format = {fill:C.navy,font:{bold:true,color:C.white,size:15,name:"Arial"},verticalAlignment:"center"};
  sheet.getRange(`A2:${endCol}2`).merge();
  sheet.getRange("A2").values = [[note]];
  sheet.getRange(`A2:${endCol}2`).format = {fill:C.pale,font:{color:"#1F1F1F",italic:true,name:"Arial"},wrapText:true,verticalAlignment:"center"};
  sheet.getRange("1:1").format.rowHeight = 28;
  sheet.getRange("2:2").format.rowHeight = 42;
}
function table(sheet, name, headers, rows, widths, freezeCols=1) {
  const lastCol = col(headers.length);
  sheet.getRange(`A4:${lastCol}4`).values = [headers];
  if (rows.length) sheet.getRange(`A5:${lastCol}${4+rows.length}`).values = rows;
  const t = sheet.tables.add(`A4:${lastCol}${4+rows.length}`, true, name);
  t.style = "TableStyleMedium2"; t.showFilterButton = true;
  sheet.getRange(`A4:${lastCol}4`).format = {fill:C.teal,font:{bold:true,color:C.white,name:"Arial"},wrapText:true,verticalAlignment:"center",horizontalAlignment:"center"};
  sheet.getRange(`A5:${lastCol}${4+rows.length}`).format = {font:{name:"Arial",size:9},wrapText:true,verticalAlignment:"top",borders:{preset:"inside",style:"thin",color:C.grid}};
  sheet.getRange("4:4").format.rowHeight = 54;
  for (const [letter, width] of Object.entries(widths)) sheet.getRange(`${letter}1:${letter}${4+rows.length}`).format.columnWidth = width;
  sheet.freezePanes.freezeRows(4); if (freezeCols) sheet.freezePanes.freezeColumns(freezeCols);
  return {lastCol, lastRow:4+rows.length};
}
function col(n) { let s=""; while(n){ n--; s=String.fromCharCode(65+n%26)+s; n=Math.floor(n/26); } return s; }
function statusCf(range) {
  const styles = {FACT:C.fact,CALCULATED:C.calculated,ASSUMPTION:C.assumption,DRAFT:C.draft,BLOCKED:C.blocked,SUPERSEDED:C.superseded};
  for (const [text, fill] of Object.entries(styles)) range.conditionalFormats.add("containsText",{text,format:{fill,font:{bold:true,color:"#1F1F1F"}}});
}
function validation(range, values) { range.dataValidation = {rule:{type:"list",values}}; }
function nonNegative(range) { range.dataValidation = {rule:{type:"decimal",operator:"greaterThanOrEqual",formula1:0}}; }
function validDate(range) { range.dataValidation = {rule:{type:"date",operator:"between",formula1:"DATE(2020,1,1)",formula2:"DATE(2035,12,31)"}}; }

// 00_ПАСПОРТ
title(ws["00_ПАСПОРТ"], "F", "VARSHAVKA — меню, калькуляционные и технологические карты", "DRAFT v1.0.0 для построчного согласования с шеф-поваром. Не является утверждённой рецептурной или санитарно-технологической документацией.");
const passportRows = [
  ["Версия","1.0.0","FACT","Issue #80","2026-08-03",""],
  ["Активных позиций",31,"FACT","KITCHEN_MENU_3.0.0.md","2026-07-27","VKM-001…VKM-031"],
  ["Калькуляционных карт",31,"FACT","Этот комплект",BUILT_AT,"3 детальные DRAFT; 28 BLOCKED-скелетов"],
  ["Технологических карт",31,"FACT","Этот комплект",BUILT_AT,"3 детальные DRAFT; 28 BLOCKED-скелетов"],
  ["Внутренний тариф завтрака",550,"DRAFT","S04 / решение #52",new Date("2026-07-27"),"руб. с НДС; не внешняя цена продажи"],
  ["Полное отображаемое имя листа 05","05_АЛЛЕРГЕНЫ_БЕЗОПАСНОСТЬ","FACT","Требование Issue #80",BUILT_AT,"Имя укладывается в лимит Excel 31 символ"],
  ["Архивные позиции","Яйца Бенедикт с лососем на бриоши; Круассан со слабосолёным лососем","SUPERSEDED","KITCHEN_MENU_3.0.0.md",new Date("2026-07-27"),"Не входят в активное меню"],
  ["Правило пустых значений","Пусто означает отсутствие подтверждённых данных; ноль вместо отсутствующих данных не подставляется","FACT","Правила Issue #80",BUILT_AT,""],
  ["Формульная конвенция","Стоимость строки = норма брутто × цена единицы с приведением г/мл к кг/л; себестоимость порции = сумма строк карты; food cost = себестоимость / тариф","FACT","Этот комплект",BUILT_AT,"Все межлистовые ссылки заключены в одинарные кавычки"],
];
table(ws["00_ПАСПОРТ"],"PassportTable",["Параметр","Значение","Статус","Источник","Дата","Комментарий"],passportRows,{A:28,B:66,C:16,D:34,E:14,F:48},1);
statusCf(ws["00_ПАСПОРТ"].getRange("C5:C13")); ws["00_ПАСПОРТ"].getRange("E5:E13").format.numberFormat="yyyy-mm-dd";

// 01_МЕНЮ
title(ws["01_МЕНЮ"],"L","01 — Активное меню","31 активная позиция из KITCHEN_MENU_3.0.0.md. Цена 550 — внутренний тариф завтрака DRAFT; остальные цены BLOCKED.");
table(ws["01_МЕНЮ"],"MenuTable",["Код блюда","Раздел меню","Полное наименование","Направление бизнеса","Единица продажи","Выход порции","Цена продажи / тариф, руб.","Статус позиции","Код калькуляционной карты","Код технологической карты","Статус комплектности","Согласование шеф-повара"],menu,{A:14,B:24,C:44,D:44,E:26,F:24,G:20,H:16,I:16,J:16,K:20,L:22},2);
ws["01_МЕНЮ"].getRange("G5:G35").format.numberFormat="#,##0.00"; statusCf(ws["01_МЕНЮ"].getRange("H5:H35")); statusCf(ws["01_МЕНЮ"].getRange("K5:L35")); validation(ws["01_МЕНЮ"].getRange("H5:H35"),STATUSES); validation(ws["01_МЕНЮ"].getRange("K5:L35"),STATUSES);
nonNegative(ws["01_МЕНЮ"].getRange("G5:G35"));

// 04 source before costing formulas.
title(ws["04_СЫРЬЁ_И_ЦЕНЫ"],"L","04 — Сырьё и цены","Публичные наблюдения S04 и аналитические параметры. До документов поставщиков значения DRAFT/ASSUMPTION.");
table(ws["04_СЫРЬЁ_И_ЦЕНЫ"],"PriceTable",["Код сырья/цены","Наименование сырья","Единица цены","Количество в упаковке","Цена упаковки с НДС, руб.","Цена единицы, руб.","Поставщик / источник","Артикул","Дата цены","Ссылка / основание","Статус данных","Комментарий"],priceRows,{A:22,B:38,C:14,D:18,E:22,F:18,G:30,H:18,I:14,J:54,K:18,L:42},2);
for (let r=5;r<=15;r++) ws["04_СЫРЬЁ_И_ЦЕНЫ"].getRange(`F${r}`).formulas=[[`=IFERROR(E${r}/D${r},"")`]];
ws["04_СЫРЬЁ_И_ЦЕНЫ"].getRange("D5:F15").format.numberFormat="#,##0.0000"; ws["04_СЫРЬЁ_И_ЦЕНЫ"].getRange("I5:I15").format.numberFormat="yyyy-mm-dd"; statusCf(ws["04_СЫРЬЁ_И_ЦЕНЫ"].getRange("K5:K15")); validation(ws["04_СЫРЬЁ_И_ЦЕНЫ"].getRange("K5:K15"),STATUSES);
nonNegative(ws["04_СЫРЬЁ_И_ЦЕНЫ"].getRange("D5:E15")); validDate(ws["04_СЫРЬЁ_И_ЦЕНЫ"].getRange("I5:I15"));

// 02_КАЛЬКУЛЯЦИИ
const calcRows=[];
for (let n=1;n<=31;n++) {
  const code=`VKM-${String(n).padStart(3,"0")}`, card=`VKC-${String(n).padStart(3,"0")}`;
  if (!recipes[code]) { calcRows.push([card,code,menu[n-1][2],null,null,null,null,null,null,null,null,null,null,null,null,null,"BLOCKED","Нет подтверждённой рецептуры, норм и цены"]); continue; }
  for (const item of [...recipes[code],...common]) calcRows.push([card,code,menu[n-1][2],item[0],item[1],item[2],item[3],item[4],item[5],item[6],null,null,null,null,null,null,item[0]==="P-FONTINA"?"ASSUMPTION":"DRAFT",item[7]]);
}
title(ws["02_КАЛЬКУЛЯЦИИ"],"R","02 — Калькуляционные карты","28 карт — BLOCKED-скелеты; 3 карты завтрака — DRAFT по S04. Итоговые поля формульные.");
table(ws["02_КАЛЬКУЛЯЦИИ"],"CostingTable",["Код калькуляционной карты","Код блюда","Наименование блюда","Код сырья","Наименование сырья","Ед. изм.","Норма брутто","Норма нетто","Технологические потери","Готовый выход компонента, г","Закупочная цена, руб./ед.","Стоимость закладки, руб.","Себестоимость порции, руб.","Цена продажи / тариф, руб.","Food cost","Источник цены / дата","Статус данных","Примечание"],calcRows,{A:18,B:14,C:42,D:22,E:38,F:12,G:15,H:15,I:18,J:22,K:20,L:20,M:22,N:22,O:14,P:38,Q:16,R:46},3);
const calcEnd=4+calcRows.length;
for(let r=5;r<=calcEnd;r++){
  ws["02_КАЛЬКУЛЯЦИИ"].getRange(`I${r}`).formulas=[[`=IF(OR(G${r}="",H${r}="",F${r}="шт."),"",G${r}-H${r})`]];
  ws["02_КАЛЬКУЛЯЦИИ"].getRange(`K${r}`).formulas=[[`=IF(D${r}="","",IFERROR(INDEX('04_СЫРЬЁ_И_ЦЕНЫ'!$F$5:$F$15,MATCH(D${r},'04_СЫРЬЁ_И_ЦЕНЫ'!$A$5:$A$15,0)),""))`]];
  ws["02_КАЛЬКУЛЯЦИИ"].getRange(`L${r}`).formulas=[[`=IF(OR(G${r}="",K${r}=""),"",IF(OR(F${r}="г",F${r}="мл"),G${r}/1000*K${r},G${r}*K${r}))`]];
  ws["02_КАЛЬКУЛЯЦИИ"].getRange(`M${r}`).formulas=[[`=IF(COUNTIFS($B$5:$B$${calcEnd},B${r},$D$5:$D$${calcEnd},"<>")=0,"",SUMIF($B$5:$B$${calcEnd},B${r},$L$5:$L$${calcEnd}))`]];
  ws["02_КАЛЬКУЛЯЦИИ"].getRange(`N${r}`).formulas=[[`=IFERROR(INDEX('01_МЕНЮ'!$G$5:$G$35,MATCH(B${r},'01_МЕНЮ'!$A$5:$A$35,0)),"")`]];
  ws["02_КАЛЬКУЛЯЦИИ"].getRange(`O${r}`).formulas=[[`=IF(OR(M${r}="",N${r}=""),"",M${r}/N${r})`]];
  ws["02_КАЛЬКУЛЯЦИИ"].getRange(`P${r}`).formulas=[[`=IF(D${r}="","",IFERROR(INDEX('04_СЫРЬЁ_И_ЦЕНЫ'!$G$5:$G$15,MATCH(D${r},'04_СЫРЬЁ_И_ЦЕНЫ'!$A$5:$A$15,0))&" / "&TEXT(INDEX('04_СЫРЬЁ_И_ЦЕНЫ'!$I$5:$I$15,MATCH(D${r},'04_СЫРЬЁ_И_ЦЕНЫ'!$A$5:$A$15,0)),"yyyy-mm-dd"),""))`]];
}
ws["02_КАЛЬКУЛЯЦИИ"].getRange(`G5:N${calcEnd}`).format.numberFormat="#,##0.0000"; ws["02_КАЛЬКУЛЯЦИИ"].getRange(`O5:O${calcEnd}`).format.numberFormat="0.00%"; statusCf(ws["02_КАЛЬКУЛЯЦИИ"].getRange(`Q5:Q${calcEnd}`)); validation(ws["02_КАЛЬКУЛЯЦИИ"].getRange(`Q5:Q${calcEnd}`),STATUSES);
nonNegative(ws["02_КАЛЬКУЛЯЦИИ"].getRange(`G5:H${calcEnd}`)); nonNegative(ws["02_КАЛЬКУЛЯЦИИ"].getRange(`J5:J${calcEnd}`));

// 03_ТЕХКАРТЫ
const techDetails = {
  26:["Закрытый гостиничный завтрак","Яйцо C0; масло; соль; круассан; чеддер; Fontina/Fontal; напиток","Документы поставщиков и маркировка BLOCKED","Проверка партий; взвешивание; подготовка поверхности","Яичница порционно; выпечь круассан; нарезать сыр; комплектовать; напиток передать из бара","Теппан/сковорода; печь; холодильник; весы; термощуп; таймер","Время фиксируется контрольной серией","Поверхность 150–165 °C; центр ≥72 °C; выдача ≥65 °C","225 г + напиток 200 мл","Готовность белка/желтка; без подгорания и свободного жира","Порционная выдача закрытого комплекса","BLOCKED до документа производителя и ППК","Яйцо; молоко; состав круассана BLOCKED","ТП поверхности; ККТ-проект центра; ОКТ выдачи","Подтвердить выход 120 г основного блюда; время; хранение; маркировку","DRAFT"],
  27:["Закрытый гостиничный завтрак","Меланж; молоко; масло; соль; круассан; чеддер; Fontina/Fontal; напиток","Документы поставщиков и маркировка BLOCKED","Проверка партий; смешивание; подготовка 10 форм","Смешать; разлить в формы; приготовить в пароконвектомате; выпечь круассан; нарезать сыр; комплектовать","Пароконвектомат; формы; печь; холодильник; весы; термощуп; таймер","Время фиксируется контрольной серией","Камера 150 ±5 °C, RH 20–30%; центр ≥72 °C; выдача ≥65 °C","265 г + напиток 200 мл","Однородность; без жидкости, комков и подгорания","Порционная выдача закрытого комплекса","BLOCKED до документа производителя и ППК","Яйцо; молоко; состав круассана BLOCKED","ТП камеры; ККТ-проект центра; ОКТ выдачи","Подтвердить выход 160 г; время; влажность; хранение; маркировку","DRAFT"],
  28:["Закрытый гостиничный завтрак","Овсяные хлопья; молоко; вода; сахар; масло; соль; круассан; чеддер; Fontina/Fontal; напиток","Документы поставщиков и маркировка BLOCKED","Проверка партий; взвешивание; подготовка варочной ёмкости","Сварить кашу; выдержать; выпечь круассан; нарезать сыр; порционировать и комплектовать","Кастрюля; индукция; печь; холодильник; весы; термощуп; таймер","Время фиксируется контрольной варкой","Окончание ≥90 °C с выдержкой ≥1 мин; выдача ≥65 °C","355 г + напиток 200 мл","Без комков и пригорания; хлопья готовы; нормальные вкус и запах","Порционная выдача закрытого комплекса","BLOCKED до документа производителя и ППК","Молоко; овёс и состав круассана BLOCKED по документам SKU","ОКТ окончания варки; ОКТ выдачи","Подтвердить 250 г каши; время; потери; хранение; маркировку","DRAFT"],
};
const techRows=menu.map((m,i)=>{const n=i+1,d=techDetails[n]; return [`VKT-${String(n).padStart(3,"0")}`,m[0],m[2],...(d||["BLOCKED","BLOCKED","BLOCKED","BLOCKED","BLOCKED","BLOCKED","BLOCKED","BLOCKED",m[5],"BLOCKED","BLOCKED","BLOCKED","BLOCKED","BLOCKED","Согласовать рецептуру, технологию, режимы, хранение и аллергены","BLOCKED"])];});
title(ws["03_ТЕХКАРТЫ"],"S","03 — Технологические карты","Три завтрака заполнены как DRAFT из S04 и шаблонов Issue #52; остальные 28 строк — BLOCKED.");
table(ws["03_ТЕХКАРТЫ"],"TechCardsTable",["Код техкарты","Код блюда","Наименование","Область применения","Состав сырья","Требования к сырью","Подготовительные операции","Последовательность приготовления","Оборудование","Продолжительность операций","Температурные режимы","Выход","Органолептические показатели","Способ подачи","Условия и срок хранения","Аллергены","Контрольные точки","Вопросы контрольной проработки","Статус согласования"],techRows,{A:16,B:14,C:42,D:28,E:54,F:42,G:42,H:60,I:46,J:28,K:48,L:26,M:46,N:34,O:42,P:38,Q:46,R:54,S:20},3);
statusCf(ws["03_ТЕХКАРТЫ"].getRange("S5:S35")); validation(ws["03_ТЕХКАРТЫ"].getRange("S5:S35"),STATUSES);

// 05 Allergens / safety
const nameOnlyAllergens = {2:"Молоко",9:"Молоко",10:"Ракообразные",13:"Рыба",14:"Рыба",19:"Рыба; молоко; горчица",20:"Ракообразные"};
const safeRows=menu.map((m,i)=>{const n=i+1; if(n===26)return[m[0],m[2],"Яйцо; молоко; состав круассана BLOCKED","Маркировка круассана и сыров; перекрёстные следы","Центр ≥72 °C; выдача ≥65 °C; проект ППК, испытания BLOCKED","BLOCKED: срок и условия по документам производителя","DRAFT","Нужны документы поставщиков, испытания и утверждённый анализ опасностей ППК"]; if(n===27)return[m[0],m[2],"Яйцо; молоко; состав круассана BLOCKED","Маркировка меланжа, круассана и сыров","Центр ≥72 °C; выдача ≥65 °C; проект ППК, испытания BLOCKED","BLOCKED: срок и условия по документам производителя","DRAFT","Нужны документы поставщиков, испытания и утверждённый анализ опасностей ППК"]; if(n===28)return[m[0],m[2],"Молоко; овёс и состав круассана BLOCKED по документам SKU","Маркировка овса, круассана и сыров","Окончание ≥90 °C/1 мин; выдача ≥65 °C; проект ППК, испытания BLOCKED","BLOCKED: срок и условия по документам производителя","DRAFT","Нужны документы поставщиков, испытания и утверждённый анализ опасностей ППК"]; if(nameOnlyAllergens[n])return[m[0],m[2],nameOnlyAllergens[n],"BLOCKED: состав и маркировка не получены","BLOCKED","BLOCKED","DRAFT","Аллерген следует только из наименования блюда; полный состав не подтверждён"]; return[m[0],m[2],"BLOCKED","BLOCKED","BLOCKED","BLOCKED","BLOCKED","Нет рецептуры и документов сырья"];});
title(ws["05_АЛЛЕРГЕНЫ_БЕЗОПАСНОСТЬ"],"H","05 — Аллергены и безопасность","Проектный реестр. Не заменяет утверждённую ППК, маркировку поставщиков или анализ опасностей.");
table(ws["05_АЛЛЕРГЕНЫ_БЕЗОПАСНОСТЬ"],"SafetyTable",["Код блюда","Наименование","Аллергены","Перекрёстные риски / маркировка","Температурные ограничения","Условия и срок хранения","Статус","Основание / пробел"],safeRows,{A:14,B:42,C:34,D:48,E:42,F:48,G:16,H:50},2); statusCf(ws["05_АЛЛЕРГЕНЫ_БЕЗОПАСНОСТЬ"].getRange("G5:G35")); validation(ws["05_АЛЛЕРГЕНЫ_БЕЗОПАСНОСТЬ"].getRange("G5:G35"),STATUSES);

// 06 Questions: one base question for each item + detailed breakfast gates.
const questions=menu.map((m,i)=>[`Q-${String(i+1).padStart(3,"0")}`,m[0],m[2],"Полная рецептура, нормы брутто/нетто, выход и технология",i>=25&&i<=27?m[5]:null,i>=25&&i<=27?"DRAFT":"BLOCKED","KITCHEN_MENU_3.0.0.md / S04","Провести построчное согласование и контрольную проработку","Подтвердить / Скорректировать / Отклонить","Определяет себестоимость, повторяемость технологии и безопасность",null,null,null]);
const extras=[
  ["VKM-026","Фактический выход яичницы","120 г основного блюда","DRAFT","CONTROL_TRIAL_FRIED_EGGS.md","Серия 10 порций","Подтвердить / Скорректировать","Себестоимость; порционирование",""],
  ["VKM-026","Температура центра/выдачи","≥72 °C / ≥65 °C","DRAFT","Проект ППК","Включить после анализа опасностей","Подтвердить / Скорректировать класс","Безопасность",""],
  ["VKM-026","Срок хранения и маркировка",null,"BLOCKED","Документы поставщиков отсутствуют","Получить документы","Согласовать после документов","Безопасность; закупка",""],
  ["VKM-027","Фактический выход омлета","160 г основного блюда","DRAFT","CONTROL_TRIAL_OMELET.md","Серия 10 форм","Подтвердить / Скорректировать","Себестоимость; порционирование",""],
  ["VKM-027","Камера/центр/выдача","150 ±5 °C, RH 20–30%; ≥72 °C; ≥65 °C","DRAFT","Проект ППК","Проверить серией","Подтвердить / Скорректировать","Технология; безопасность",""],
  ["VKM-027","Срок хранения и маркировка",null,"BLOCKED","Документы поставщиков отсутствуют","Получить документы","Согласовать после документов","Безопасность; закупка",""],
  ["VKM-028","Фактический выход каши","250 г","DRAFT","CONTROL_TRIAL_OATMEAL.md","Контрольная варка 10 порций","Подтвердить / Скорректировать","Себестоимость; потери",""],
  ["VKM-028","Окончание/выдача","≥90 °C ≥1 мин; ≥65 °C","DRAFT","Проект ППК","Проверить варкой","Подтвердить / Скорректировать","Безопасность",""],
  ["VKM-028","Глютен/овёс",null,"BLOCKED","Маркировка поставщика отсутствует","Получить спецификацию овса","Есть / Нет / Возможны следы","Аллергены; маркировка",""],
  ["VKM-026","Fontina или Fontal и цена","1 800 руб./кг","ASSUMPTION","S04 PRICE_REGISTER","Выбрать продукт после дегустации и КП","Fontina / Fontal / иной сыр","Себестоимость; вкус; аллерген",""],
  ["VKM-027","Fontina или Fontal и цена","1 800 руб./кг","ASSUMPTION","S04 PRICE_REGISTER","Выбрать продукт после дегустации и КП","Fontina / Fontal / иной сыр","Себестоимость; вкус; аллерген",""],
  ["VKM-028","Fontina или Fontal и цена","1 800 руб./кг","ASSUMPTION","S04 PRICE_REGISTER","Выбрать продукт после дегустации и КП","Fontina / Fontal / иной сыр","Себестоимость; вкус; аллерген",""],
];
for(const [code,param,current,status,source,proposal,variants,influence,comment] of extras){const m=menu.find(x=>x[0]===code);questions.push([`Q-${String(questions.length+1).padStart(3,"0")}`,code,m[2],param,current,status,source,proposal,variants,influence,null,null,comment]);}
title(ws["06_ВОПРОСЫ_ШЕФУ"],"M","06 — Вопросы шеф-повару","Каждая активная позиция покрыта минимум одним вопросом; завтраки дополнены вопросами по выходам, температурам, аллергенам, хранению и сыру.");
table(ws["06_ВОПРОСЫ_ШЕФУ"],"ChefQuestionsTable",["Код вопроса","Код блюда","Наименование блюда","Проверяемый параметр","Текущее значение","Статус текущего значения","Источник","Предлагаемое решение","Варианты ответа","Влияние решения","Решение шеф-повара","Дата решения","Комментарий"],questions,{A:14,B:14,C:40,D:42,E:36,F:18,G:40,H:44,I:38,J:44,K:34,L:16,M:38},3); statusCf(ws["06_ВОПРОСЫ_ШЕФУ"].getRange(`F5:F${4+questions.length}`)); validation(ws["06_ВОПРОСЫ_ШЕФУ"].getRange(`F5:F${4+questions.length}`),STATUSES); ws["06_ВОПРОСЫ_ШЕФУ"].getRange(`L5:L${4+questions.length}`).format.numberFormat="yyyy-mm-dd";
validDate(ws["06_ВОПРОСЫ_ШЕФУ"].getRange(`L5:L${4+questions.length}`));

// 07 Sign-off
const signRows=menu.map(m=>[m[0],m[2],m[8],m[9],m[10],"BLOCKED",null,null,null]);
title(ws["07_СОГЛАСОВАНИЕ"],"I","07 — Лист согласования","Решения шеф-повара не заполнены заранее. Статус меняется только после фактического решения и контрольных проработок.");
table(ws["07_СОГЛАСОВАНИЕ"],"SignoffTable",["Код блюда","Наименование","Код калькуляции","Код техкарты","Комплектность","Решение шеф-повара","Дата","Комментарий","Подпись / идентификатор"],signRows,{A:14,B:42,C:18,D:16,E:18,F:22,G:16,H:46,I:26},2); statusCf(ws["07_СОГЛАСОВАНИЕ"].getRange("E5:F35")); validation(ws["07_СОГЛАСОВАНИЕ"].getRange("F5:F35"),["BLOCKED","DRAFT","FACT"]); ws["07_СОГЛАСОВАНИЕ"].getRange("G5:G35").format.numberFormat="yyyy-mm-dd";
validDate(ws["07_СОГЛАСОВАНИЕ"].getRange("G5:G35"));

// 09 Sources
const sourceRows=[
  ["SRC-080-001","KITCHEN_MENU_3.0.0.md","2026-07-27","Действующая","FACT","31 активная позиция; 2 архивные","docs/07-operations/KITCHEN_MENU_3.0.0.md"],
  ["SRC-080-002","FINMODEL_VARSHAVKA_USALI_SCENARIO_S04_v3.0.0.xlsx","3.0.0","Действующая","FACT","PRICE_REGISTER; BREAKFAST_RECIPES; BREAKFAST_COSTING","models/scenarios/S04/FINMODEL_VARSHAVKA_USALI_SCENARIO_S04_v3.0.0.xlsx"],
  ["SRC-080-003","HOTEL_BREAKFAST_DECISION_2026-07-27.md","2026-07-27","Действующая","FACT","Тариф 550; состав выбора; предварительный COGS","docs/07-operations/HOTEL_BREAKFAST_DECISION_2026-07-27.md"],
  ["SRC-080-004","CONTROL_TRIAL_FRIED_EGGS.md","2026-07-27","Шаблон не заполнен","DRAFT","Матбаланс и контрольные критерии яичницы","docs/06-validation/issue-52/CONTROL_TRIAL_FRIED_EGGS.md"],
  ["SRC-080-005","CONTROL_TRIAL_OMELET.md","2026-07-27","Шаблон не заполнен","DRAFT","Матбаланс и контрольные критерии омлета","docs/06-validation/issue-52/CONTROL_TRIAL_OMELET.md"],
  ["SRC-080-006","CONTROL_TRIAL_OATMEAL.md","2026-07-27","Шаблон не заполнен","DRAFT","Матбаланс и контрольные критерии каши","docs/06-validation/issue-52/CONTROL_TRIAL_OATMEAL.md"],
  ["SRC-080-007","PPK_BREAKFAST_TEMPERATURE_CONTROL_DRAFT.md","2026-07-27","Проект; не ППК","DRAFT","Проектные температурные пределы","docs/06-validation/issue-52/PPK_BREAKFAST_TEMPERATURE_CONTROL_DRAFT.md"],
  ["SRC-080-008","ISSUE_52_CLOSURE_EVIDENCE_MATRIX.md","2026-07-27","Действующая","FACT","Доказательства не получены; серии не проведены","docs/06-validation/issue-52/ISSUE_52_CLOSURE_EVIDENCE_MATRIX.md"],
  ["SRC-080-009","ISSUE_REGISTER.md","2026-08-03","Действующая","FACT","V-I-103 и связанные блокеры","docs/05-data/ISSUE_REGISTER.md"],
  ["SRC-080-010","Яйца Бенедикт с лососем на бриоши",null,"Архивная позиция","SUPERSEDED","Не входит в активное меню","KITCHEN_MENU_3.0.0.md"],
  ["SRC-080-011","Круассан со слабосолёным лососем",null,"Архивная позиция","SUPERSEDED","Не входит в активное меню","KITCHEN_MENU_3.0.0.md"],
];
title(ws["09_ИСТОЧНИКИ"],"G","09 — Источники","Реестр использованных действующих источников и архивных позиций. Старые заменённые версии не использованы.");
table(ws["09_ИСТОЧНИКИ"],"SourcesTable",["Код источника","Документ / объект","Версия / дата","Актуальность","Статус","Использование / ограничение","Путь / ссылка"],sourceRows,{A:18,B:54,C:18,D:24,E:16,F:54,G:70},2); statusCf(ws["09_ИСТОЧНИКИ"].getRange("E5:E15"));

// 08 Checks (formulas after all referenced sheets exist)
const checks=[
  ["CHK.MENU.COUNT","Активных позиций меню",null,31,null,0,null,"Должно быть 31"],
  ["CHK.MENU.DUPLICATES","Дублирующихся кодов меню",null,0,null,0,null,"Устойчивый контроль несмежных дублей"],
  ["CHK.COST.DUPLICATES","Дублирующихся кодов калькуляционных карт",null,0,null,0,null,"Устойчивый контроль несмежных дублей"],
  ["CHK.TECH.COUNT","Технологических карт",null,31,null,0,null,"Одна карта на позицию"],
  ["CHK.LINK.COST","Меню без калькуляционной карты",null,0,null,0,null,"Должно быть 0"],
  ["CHK.LINK.TECH","Меню без технологической карты",null,0,null,0,null,"Должно быть 0"],
  ["CHK.DETAIL.BREAKFAST","Детальных DRAFT карт завтрака",null,3,null,0,null,"VKM-026…028"],
  ["CHK.SKELETON.BLOCKED","BLOCKED-скелетов",null,28,null,0,null,"Ожидаемо до получения рецептур"],
  ["CHK.QUESTIONS.COVER","Позиций без вопроса шефу",null,0,null,0,null,"Должно быть 0"],
  ["CHK.PRICE.DUPLICATES","Дублирующихся кодов цены",null,0,null,0,null,"Устойчивый контроль несмежных дублей"],
  ["CHK.EGG.COST","Себестоимость VKM-026",null,191.282668,null,0.001,null,"Сверка S04"],
  ["CHK.OMELET.COST","Себестоимость VKM-027",null,223.194668,null,0.001,null,"Сверка S04"],
  ["CHK.OAT.COST","Себестоимость VKM-028",null,193.483718,null,0.001,null,"Сверка S04"],
  ["CHK.ARCHIVE.EXCLUDED","Архивные позиции в активном меню",null,0,null,0,null,"Должно быть 0"],
  ["CHK.BLOCKED.ZERO_COST","BLOCKED-карты с нулевой себестоимостью",null,0,null,0,null,"Отсутствующая себестоимость должна быть пустой"],
  ["CHK.LOSS.NEGATIVE","Отрицательные технологические потери",null,0,null,0,null,"Потери не могут быть отрицательными"],
  ["CHK.LOSS.UNIT_MISMATCH","Потери при единице брутто «шт.»",null,0,null,0,null,"Штуки нельзя вычитать из граммов"],
  ["CHK.FONTINA.STATUS","Строки Fontina без статуса ASSUMPTION",null,0,null,0,null,"Предположение должно распространяться на калькуляцию"],
];
title(ws["08_ПРОВЕРКИ"],"H","08 — Структурные и расчётные проверки","Статус PASS означает корректность структуры/формул комплекта, но не утверждение рецептур, цен или безопасности.");
table(ws["08_ПРОВЕРКИ"],"ChecksTable",["Код проверки","Проверка","Факт","Ожидание","Отклонение","Допуск","Статус","Комментарий"],checks,{A:26,B:42,C:18,D:18,E:18,F:14,G:16,H:48},2);
const factFormulas=[
  "=COUNTA('01_МЕНЮ'!$A$5:$A$35)",
  `=${Array.from({length:31},(_,i)=>`--(COUNTIF('01_МЕНЮ'!$A$5:$A$35,'01_МЕНЮ'!$A$${5+i})>1)`).join("+")}`,
  `=${Array.from({length:31},(_,i)=>`--(COUNTIF('01_МЕНЮ'!$I$5:$I$35,'01_МЕНЮ'!$I$${5+i})>1)`).join("+")}`,
  "=COUNTA('03_ТЕХКАРТЫ'!$A$5:$A$35)",
  `=${Array.from({length:31},(_,i)=>`--(COUNTIF('02_КАЛЬКУЛЯЦИИ'!$A$5:$A$${calcEnd},'01_МЕНЮ'!$I$${5+i})=0)`).join("+")}`,
  `=${Array.from({length:31},(_,i)=>`--(COUNTIF('03_ТЕХКАРТЫ'!$A$5:$A$35,'01_МЕНЮ'!$J$${5+i})=0)`).join("+")}`,
  "=COUNTIFS('01_МЕНЮ'!$A$5:$A$35,\">=VKM-026\",'01_МЕНЮ'!$A$5:$A$35,\"<=VKM-028\",'01_МЕНЮ'!$K$5:$K$35,\"DRAFT\")",
  "=COUNTIF('01_МЕНЮ'!$K$5:$K$35,\"BLOCKED\")",
  `=${Array.from({length:31},(_,i)=>`--(COUNTIF('06_ВОПРОСЫ_ШЕФУ'!$B$5:$B$${4+questions.length},'01_МЕНЮ'!$A$${5+i})=0)`).join("+")}`,
  `=${Array.from({length:11},(_,i)=>`--(COUNTIF('04_СЫРЬЁ_И_ЦЕНЫ'!$A$5:$A$15,'04_СЫРЬЁ_И_ЦЕНЫ'!$A$${5+i})>1)`).join("+")}`,
  `=SUMIF('02_КАЛЬКУЛЯЦИИ'!$B$5:$B$${calcEnd},\"VKM-026\",'02_КАЛЬКУЛЯЦИИ'!$L$5:$L$${calcEnd})`,
  `=SUMIF('02_КАЛЬКУЛЯЦИИ'!$B$5:$B$${calcEnd},\"VKM-027\",'02_КАЛЬКУЛЯЦИИ'!$L$5:$L$${calcEnd})`,
  `=SUMIF('02_КАЛЬКУЛЯЦИИ'!$B$5:$B$${calcEnd},\"VKM-028\",'02_КАЛЬКУЛЯЦИИ'!$L$5:$L$${calcEnd})`,
  "=COUNTIF('01_МЕНЮ'!$C$5:$C$35,\"*Бенедикт*\")+COUNTIF('01_МЕНЮ'!$C$5:$C$35,\"*лососем*\")",
  `=${Array.from({length:calcEnd-4},(_,i)=>`--(AND('02_КАЛЬКУЛЯЦИИ'!$Q$${5+i}="BLOCKED",'02_КАЛЬКУЛЯЦИИ'!$M$${5+i}<>"",'02_КАЛЬКУЛЯЦИИ'!$M$${5+i}=0))`).join("+")}`,
  `=COUNTIF('02_КАЛЬКУЛЯЦИИ'!$I$5:$I$${calcEnd},"<0")`,
  `=${Array.from({length:calcEnd-4},(_,i)=>`--(AND('02_КАЛЬКУЛЯЦИИ'!$F$${5+i}="шт.",'02_КАЛЬКУЛЯЦИИ'!$I$${5+i}<>""))`).join("+")}`,
  `=COUNTIFS('02_КАЛЬКУЛЯЦИИ'!$D$5:$D$${calcEnd},"P-FONTINA",'02_КАЛЬКУЛЯЦИИ'!$Q$5:$Q$${calcEnd},"<>ASSUMPTION")`,
];
for(let i=0;i<checks.length;i++){const r=5+i;ws["08_ПРОВЕРКИ"].getRange(`C${r}`).formulas=[[factFormulas[i]]];ws["08_ПРОВЕРКИ"].getRange(`E${r}`).formulas=[[`=C${r}-D${r}`]];ws["08_ПРОВЕРКИ"].getRange(`G${r}`).formulas=[[`=IF(ABS(E${r})<=F${r},"PASS","FAIL")`]];}
ws["08_ПРОВЕРКИ"].getRange(`C5:F${4+checks.length}`).format.numberFormat="#,##0.0000"; statusCf(ws["08_ПРОВЕРКИ"].getRange(`G5:G${4+checks.length}`)); ws["08_ПРОВЕРКИ"].getRange(`G5:G${4+checks.length}`).conditionalFormats.add("containsText",{text:"PASS",format:{fill:C.fact,font:{bold:true,color:"#1F1F1F"}}}); ws["08_ПРОВЕРКИ"].getRange(`G5:G${4+checks.length}`).conditionalFormats.add("containsText",{text:"FAIL",format:{fill:C.blocked,font:{bold:true,color:"#9C0006"}}});

// Comments on material assumptions.
wb.comments.addThread({cell:ws["01_МЕНЮ"].getRange("G30")},"Внутренний тариф гостиничного завтрака 550 руб. с НДС; DRAFT для данного комплекта, не внешняя цена продажи.");
wb.comments.addThread({cell:ws["04_СЫРЬЁ_И_ЦЕНЫ"].getRange("E14")},"1 800 руб./кг — только параметр чувствительности S04; поставщик и закупочная цена не утверждены.");

// Render every sheet before export and save logs only under /tmp.
await fs.mkdir(RENDER_DIR,{recursive:true});
const renderLog=[];
for(const name of sheets){
  const preview=await wb.render({sheetName:name,autoCrop:"all",scale:0.7,format:"png"});
  const file=path.join(RENDER_DIR,`${String(sheets.indexOf(name)).padStart(2,"0")}_${name}.png`);
  await fs.writeFile(file,new Uint8Array(await preview.arrayBuffer()));
  renderLog.push({sheet:name,file});
}
const keyInspect=await wb.inspect({kind:"table",range:"08_ПРОВЕРКИ!A4:H22",include:"values,formulas",tableMaxRows:24,tableMaxCols:8,maxChars:16000});
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"Issue 80 final formula error scan"});
await fs.writeFile(path.join(RENDER_DIR,"verification.json"),JSON.stringify({renderLog,keyInspect:keyInspect.ndjson,formulaErrors:errors.ndjson},null,2));
await fs.mkdir(path.dirname(OUT),{recursive:true});
const xlsx=await SpreadsheetFile.exportXlsx(wb); await xlsx.save(OUT);
// artifact-tool 2.8.6 currently omits freeze-pane XML during export even though
// the documented freezePanes API is invoked above. Repair only this metadata;
// all workbook content, formulas, tables, validation and styling remain authored
// by artifact-tool.
const frozenDir=await fs.mkdtemp(path.join(os.tmpdir(),"issue80-freeze-"));
execFileSync("unzip",["-q",OUT,"-d",frozenDir]);
for(let i=1;i<=sheets.length;i++){
  const file=path.join(frozenDir,"xl","worksheets",`sheet${i}.xml`);
  let xml=await fs.readFile(file,"utf8");
  xml=xml.replace(/<x:sheetView([^>]*)\/>/,`<x:sheetView$1><x:pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/></x:sheetView>`);
  await fs.writeFile(file,xml,"utf8");
}
execFileSync("zip",["-q","-r",OUT,"."],{cwd:frozenDir});
console.log(JSON.stringify({output:OUT,sheets:sheets.length,activeMenu:31,costingCards:31,techCards:31,blockedSkeletons:28,detailedBreakfastCards:3,costingRows:calcRows.length,questions:questions.length,renderDir:RENDER_DIR,formulaErrors:errors.ndjson},null,2));
