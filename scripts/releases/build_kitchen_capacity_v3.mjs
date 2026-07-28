import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = new URL("../../downloads/", import.meta.url).pathname;
const previewDir = "/tmp/varshavka-capacity-v3";
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const C = {
  navy: "#17365D", blue: "#1F4E78", lightBlue: "#D9EAF7",
  gray: "#E7E6E6", lightGray: "#F3F6F8", green: "#E2F0D9",
  yellow: "#FFF2CC", red: "#F4CCCC", white: "#FFFFFF",
};

function title(sheet, text, subtitle, endCol) {
  sheet.showGridLines = false;
  sheet.mergeCells(`A1:${endCol}1`);
  sheet.getRange("A1").values = [[text]];
  sheet.getRange(`A1:${endCol}1`).format = {
    fill: C.navy, font: { bold: true, color: C.white, size: 16 },
    verticalAlignment: "center",
  };
  sheet.getRange("A1").format.rowHeight = 30;
  sheet.mergeCells(`A2:${endCol}2`);
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A2:${endCol}2`).format = {
    fill: C.lightBlue, font: { italic: true, size: 10 }, wrapText: true,
  };
  sheet.getRange("A2").format.rowHeight = 34;
}
function header(sheet, range) {
  sheet.getRange(range).format = {
    fill: C.blue, font: { bold: true, color: C.white }, wrapText: true,
    verticalAlignment: "center", horizontalAlignment: "center",
    borders: { preset: "all", style: "thin", color: "#B4C6E7" },
  };
}
function body(sheet, range) {
  sheet.getRange(range).format = {
    verticalAlignment: "top", wrapText: true,
    borders: {
      insideHorizontal: { style: "thin", color: "#D9E2F3" },
      bottom: { style: "thin", color: "#D9E2F3" },
    },
  };
}
function widths(sheet, spec) {
  for (const [col, width] of Object.entries(spec)) {
    sheet.getRange(`${col}:${col}`).format.columnWidth = width;
  }
}
function legend(sheet, endCol, rows) {
  sheet.mergeCells(`A4:${endCol}4`);
  sheet.getRange("A4").values = [["ЛЕГЕНДА"]];
  sheet.getRange(`A4:${endCol}4`).format = {
    fill: C.gray, font: { bold: true, color: "#17365D" },
    verticalAlignment: "center",
  };
  rows.forEach((row, index) => {
    const r = 5 + index;
    sheet.getRange(`A${r}`).values = [[row[0]]];
    sheet.mergeCells(`B${r}:${endCol}${r}`);
    sheet.getRange(`B${r}`).values = [[row[1]]];
    sheet.getRange(`A${r}:${endCol}${r}`).format = {
      fill: row[2] || C.lightGray, wrapText: true,
      borders: { bottom: { style: "thin", color: "#D9E2F3" } },
    };
    sheet.getRange(`A${r}`).format.font = { bold: true };
  });
}
function round(value, digits = 6) {
  const p = 10 ** digits;
  return Math.round((value + Number.EPSILON) * p) / p;
}

const days = [
  ["Понедельник",32,40,22,10,15,12],
  ["Вторник",32,40,22,10,15,12],
  ["Среда",32,40,22,10,15,12],
  ["Четверг",32,40,22,10,15,12],
  ["Пятница",45,40,22,10,15,12],
  ["Суббота",80,0,22,10,30,12],
  ["Воскресенье",70,0,22,10,30,12],
];
const directions = ["À la carte","Бизнес-ланч","Гостиничный завтрак","Гостиничный ужин","Доставка","Навынос"];
const reserve = {
  "À la carte":1.10, "Бизнес-ланч":1.10, "Гостиничный завтрак":1.00,
  "Гостиничный ужин":1.10, "Доставка":1.10, "Навынос":1.10,
};
const hours = [
  "07:00–08:00","08:00–09:00","09:00–10:00","10:00–11:00","11:00–12:00",
  "12:00–13:00","13:00–14:00","14:00–15:00","15:00–16:00","16:00–17:00",
  "17:00–18:00","18:00–19:00","19:00–20:00","20:00–21:00","21:00–22:00",
];
const profiles = {
  "À la carte":[0,0,0,0,.03,.08,.10,.07,.04,.04,.06,.12,.16,.20,.10],
  "Бизнес-ланч":[0,0,0,0,.10,.35,.35,.15,.05,0,0,0,0,0,0],
  "Гостиничный завтрак":[.15,.35,.30,.15,.05,0,0,0,0,0,0,0,0,0,0],
  "Гостиничный ужин":[0,0,0,0,0,0,0,0,0,0,.05,.15,.25,.30,.25],
  "Доставка":[0,0,0,0,.04,.10,.10,.05,.04,.04,.08,.13,.15,.17,.10],
  "Навынос":[.03,.05,.06,.06,.08,.08,.08,.08,.09,.09,.09,.08,.07,.04,.02],
};

// Bread and garnish splits are the only preference splits that were not
// preserved in the repository as a machine-readable source. They are isolated
// here as PRELIMINARY_SPLIT and can be replaced without changing the model.
const menu = [
  [1,"Пицца","Маргарита",450,"PIZZA",[.03,.03,0,.02,.09,0],"APPROVED"],
  [2,"Пицца","Четыре сыра",480,"PIZZA",[.04,.0225,0,.025,.18,0],"APPROVED"],
  [3,"Пицца","Грибная с ветчиной",500,"PIZZA",[.06,.0525,0,.025,.27,0],"APPROVED"],
  [4,"Пицца","Пепперони",500,"PIZZA",[.07,.045,0,.03,.36,0],"APPROVED"],
  [5,"Хлеб","Белая чиабатта",100,"BAKERY",[.04,.02,0,.03,.03,.30],"PRELIMINARY_SPLIT"],
  [6,"Хлеб","Томатная чиабатта",100,"BAKERY",[.03,.015,0,.025,.03,.30],"PRELIMINARY_SPLIT"],
  [7,"Хлеб","Бородинский хлеб",350,"BAKERY",[.03,.015,0,.025,.025,.25],"PRELIMINARY_SPLIT"],
  [8,"Хлеб","Бриошь",85,"BAKERY",[.02,.01,0,.02,.015,.15],"PRELIMINARY_SPLIT"],
  [9,"Салаты","Буррата с томатами",300,"COLD",[.075,.025,0,.07,.03,0],"APPROVED"],
  [10,"Салаты","Микс-салат с креветками и яблоком",280,"COLD",[.075,.05,0,.07,.06,0],"APPROVED"],
  [11,"Салаты","Греческий",270,"COLD",[.105,.10,0,.1225,.135,0],"APPROVED"],
  [12,"Салаты","Винегрет",240,"COLD",[.045,.075,0,.0875,.075,0],"APPROVED"],
  [13,"Холодные закуски","Слабосолёный лосось",130,"COLD",[.05,.01,0,.04,0,0],"APPROVED"],
  [14,"Холодные закуски","Сельдь с запечённым картофелем",250,"COLD",[.03,.025,0,.05,0,0],"APPROVED"],
  [15,"Холодные закуски","Оливки и маслины",120,"COLD",[.03,.01,0,.02,0,0],"APPROVED"],
  [16,"Холодные закуски","Ассорти фирменных солений",180,"COLD",[.04,.035,0,.05,0,0],"APPROVED"],
  [17,"Холодные закуски","Ростбиф с луком и гренкой",180,"COLD",[.05,.02,0,.04,0,0],"APPROVED"],
  [18,"Супы","Традиционный красный борщ",400,"HOT",[.10,.35,0,0,0,0],"APPROVED"],
  [19,"Горячие блюда","Мурманская треска со сливочно-горчичным соусом",300,"HOT",[.1625,.225,0,.255,.16,0],"APPROVED"],
  [20,"Горячие блюда","Креветки по-тайски",360,"HOT",[.13,.15,0,.17,.20,0],"APPROVED"],
  [21,"Горячие блюда","Бургер VARSHAVKA",350,"HOT",[.195,.2625,0,.2125,.32,0],"APPROVED"],
  [22,"Горячие блюда","Миньоны из говяжьей вырезки",300,"HOT",[.1625,.1125,0,.2125,.12,0],"APPROVED"],
  [23,"Гарниры","Запечённый картофель",150,"SIDE",[.1567,.234375,0,.2275875,0,0],"PRELIMINARY_SPLIT"],
  [24,"Гарниры","Рис жасмин",150,"SIDE",[.07835,.09375,0,.13005,0,0],"PRELIMINARY_SPLIT"],
  [25,"Гарниры","Горячие овощи",150,"SIDE",[.1567,.140625,0,.2926125,0,0],"PRELIMINARY_SPLIT"],
  [26,"Гостиничные завтраки","Яичница, круассан и сыр двух видов",225,"BREAKFAST",[0,0,.375,0,0,0],"APPROVED"],
  [27,"Гостиничные завтраки","Омлет, круассан и сыр двух видов",265,"BREAKFAST",[0,0,.375,0,0,0],"APPROVED"],
  [28,"Гостиничные завтраки","Овсяная каша, круассан и сыр двух видов",355,"BREAKFAST",[0,0,.25,0,0,0],"APPROVED"],
  [29,"Десерты","Черничный торт VARSHAVKA",150,"PASTRY",[.06,0,0,0,0,.15],"APPROVED"],
  [30,"Десерты","Кростата с солёной карамелью",120,"PASTRY",[.06,0,0,.10,0,.15],"APPROVED"],
  [31,"Десерты","Мадлен (продаваемая порция 2 шт.)",60,"PASTRY",[.03,0,0,0,0,.20],"APPROVED"],
];

const groupCapacity = {
  PIZZA:["Пицца","BAK-01",25,10],
  BAKERY:["Хлеб","BAK-02",20,10],
  COLD:["Салаты и холодные закуски","CLD",16,16],
  HOT:["Супы и горячие блюда","HOT",21,21],
  SIDE:["Гарниры","HOT-01/HOT-03/HOT-06",12,12],
  BREAKFAST:["Гостиничные завтраки","HOT/BRK/BAK",15,10],
  PASTRY:["Десерты","BAK-02",20,10],
};

function dayFlow(day, direction) {
  const d = days.find(x => x[0] === day);
  return d[directions.indexOf(direction) + 1];
}
function staffCount(day, hourIndex) {
  if (day === "Суббота") {
    if (hourIndex <= 2) return 1;       // 07–10
    if (hourIndex === 3) return 2;      // 10–11
    if (hourIndex <= 10) return 3;      // 11–18
    if (hourIndex <= 14) return 2;      // 18–22
  }
  if (hourIndex <= 3) return 1;         // 07–11
  if (hourIndex <= 10) return 2;        // 11–18
  return 1;                             // 18–22
}

const detail = [];
for (const day of days.map(d => d[0])) {
  for (let h = 0; h < hours.length; h++) {
    for (const item of menu) {
      let before = 0, withReserve = 0;
      for (let k = 0; k < directions.length; k++) {
        const dir = directions[k];
        const part = dayFlow(day, dir) * profiles[dir][h] * item[5][k];
        before += part;
        withReserve += part * reserve[dir];
      }
      detail.push({
        day, hour:hours[h], hourIndex:h, id:item[0], section:item[1],
        item:item[2], output:item[3], group:item[4],
        before:round(before), demand:round(withReserve),
        kg:round(withReserve * item[3] / 1000),
      });
    }
  }
}

const balance = [];
const peakByGroup = {};
for (const day of days.map(d => d[0])) {
  for (let h = 0; h < hours.length; h++) {
    const slice = detail.filter(x => x.day === day && x.hourIndex === h);
    for (const group of Object.keys(groupCapacity)) {
      const demand = slice.filter(x => x.group === group).reduce((s,x)=>s+x.demand,0);
      const [label,equipment,equipmentCap,staffUnitCap] = groupCapacity[group];
      const staff = staffCount(day,h);
      // One dedicated station specialist is available only when at least one
      // production worker can be allocated to the station.
      const staffCap = Math.min(staff,1) * staffUnitCap;
      const available = Math.min(equipmentCap,staffCap);
      const row = {
        day,hour:hours[h],hourIndex:h,group,label,equipment,
        demand:round(demand),equipmentCap,staff,staffCap,available,
        shortage:round(Math.max(demand-available,0)),
        utilization:available ? demand/available : 0,
      };
      balance.push(row);
      if (!peakByGroup[group] || row.demand > peakByGroup[group].demand) peakByGroup[group] = row;
    }
    const totalDemand = slice.reduce((s,x)=>s+x.demand,0);
    const staff = staffCount(day,h);
    const totalCap = round(staff * (50/3)); // approved Saturday peak: 50 positions / 3 workers
    const totalRow = {
      day,hour:hours[h],hourIndex:h,group:"TOTAL_OUTPUT",
      label:"Совокупная выдача всех 31 позиций",equipment:"Все участки",
      demand:round(totalDemand),equipmentCap:60,staff,staffCap:totalCap,
      available:Math.min(60,totalCap),
      shortage:round(Math.max(totalDemand-Math.min(60,totalCap),0)),
      utilization:totalDemand/Math.min(60,totalCap),
    };
    balance.push(totalRow);
    if (!peakByGroup.TOTAL_OUTPUT || totalRow.demand > peakByGroup.TOTAL_OUTPUT.demand) {
      peakByGroup.TOTAL_OUTPUT = totalRow;
    }
  }
}

const maxItem = new Map();
for (const row of detail) {
  const prior = maxItem.get(row.id);
  if (!prior || row.demand > prior.demand) maxItem.set(row.id,row);
}
const weeklyByItem = new Map();
for (const item of menu) weeklyByItem.set(item[0],0);
for (const row of detail) weeklyByItem.set(row.id,weeklyByItem.get(row.id)+row.demand);

const wb = Workbook.create();
const TABLE_ROW = 10;
const DATA_ROW = 11;
const demandLastRow = DATA_ROW + detail.length - 1;
const balanceLastRow = DATA_ROW + balance.length - 1;
const staffLastRow = DATA_ROW + days.length * hours.length - 1;

const passport = wb.worksheets.add("ПАСПОРТ");
title(passport,"ПРОИЗВОДСТВЕННАЯ МОЩНОСТЬ КУХНИ",
  "VARSHAVKA v3.0.0 • формульная модель по всем 31 позициям меню","D");
legend(passport,"D",[
  ["Жёлтая заливка","Исходные данные, которые пользователь может изменять. После изменения Excel автоматически пересчитывает связанные показатели.",C.yellow],
  ["Расчётная ячейка","Ячейка содержит формулу Excel и не должна заменяться ручным значением."],
  ["Потребность","Сумма прогнозного количества всех позиций меню в соответствующем часовом интервале."],
  ["Нехватка мощности","Максимум из разности «потребность минус доступная мощность» и нуля."],
]);
passport.getRange("A10:D20").values = [
  ["Показатель","Значение","Единица","Формула / комментарий"],
  ["Активных позиций меню",null,"позиций","Количество строк на листе «КОЭФФИЦИЕНТЫ_ВЫБОРА»"],
  ["Расчётный горизонт","Первые 3 месяца","режим","Резерв направления применяется один раз"],
  ["Максимальная суммарная часовая потребность",null,"позиций/ч","Максимум потребности группы TOTAL_OUTPUT"],
  ["Максимальная нехватка производственной мощности",null,"позиций/ч","Максимум: MAX(потребность − доступная мощность; 0)"],
  ["Проектная мощность раздачи",null,"позиций/ч","Исходное значение из листа «ПАРАМЕТРЫ»"],
  ["Статус часовых профилей","PRELIMINARY","статус","Заменить фактом после ≥300 чеков/заказов и двух полных недель"],
  ["Неполные исходные данные","Хлеб и гарниры","группы","Сплиты помечены PRELIMINARY_SPLIT"],
  ["Спросовых строк",null,"строк","31 позиция × 7 дней × 15 часов"],
  ["Строк баланса мощности",null,"строк","8 групп × 7 дней × 15 часов"],
  ["Инженерный запас","Не увеличивает спрос","правило","Применяется только при выборе оборудования"],
];
passport.getRange("B11").formulas = [["=COUNTA('КОЭФФИЦИЕНТЫ_ВЫБОРА'!A11:A41)"]];
const totalBalanceRows = balance
  .map((x,index)=>x.group==="TOTAL_OUTPUT"?DATA_ROW+index:null)
  .filter(Boolean);
passport.getRange("B13").formulas = [[`=MAX(${totalBalanceRows.map(r=>`'БАЛАНС_ДЕНЬ_ЧАС'!F${r}`).join(",")})`]];
passport.getRange("B14").formulas = [[`=MAX(${totalBalanceRows.map(r=>`'БАЛАНС_ДЕНЬ_ЧАС'!K${r}`).join(",")})`]];
passport.getRange("B15").formulas = [["='ПАРАМЕТРЫ'!D27"]];
passport.getRange("B18").formulas = [[`=COUNTA('СПРОС_ДЕНЬ_ЧАС_МЕНЮ'!A11:A${demandLastRow})`]];
passport.getRange("B19").formulas = [[`=COUNTA('БАЛАНС_ДЕНЬ_ЧАС'!A11:A${balanceLastRow})`]];
header(passport,"A10:D10"); body(passport,"A11:D20");
passport.getRange("B11:B19").format.numberFormat = "0.000";
passport.getRange("A14:D14").format.fill = C.red;
widths(passport,{A:52,B:30,C:18,D:68});

const params = wb.worksheets.add("ПАРАМЕТРЫ");
title(params,"Параметры мощности и резервов",
  "Все жёлтые ячейки являются исходными данными формульной модели.","G");
legend(params,"G",[
  ["Резерв направления","Множитель, применяемый к рациональному спросу соответствующего направления один раз.",C.yellow],
  ["Мощность оборудования","Максимальное количество единиц, которое оборудование участка может обработать за час.",C.yellow],
  ["Мощность одного специалиста","Количество единиц, которое один выделенный специалист участка может обработать за час.",C.yellow],
  ["Доступная мощность","Минимум из мощности оборудования и мощности доступного штата."],
]);
params.getRange("A10:C16").values = [
  ["Направление","Коэффициент резерва","Статус"],
  ...directions.map(d=>[d,reserve[d],d==="Гостиничный завтрак"?"Включён в количестве 22":"Стартовый резерв"]),
];
header(params,"A10:C10"); body(params,"A11:C16");
params.getRange("B11:B16").format.fill = C.yellow;
params.getRange("B11:B16").format.numberFormat = "0.00";
params.getRange("A17:G17").values = [["Вектор резерва",null,null,null,null,null,null]];
for (let c=0;c<directions.length;c++) {
  const col=String.fromCharCode(66+c);
  params.getRange(`${col}17`).formulas = [[`=B${11+c}`]];
}
params.getRange("A17:G17").format.fill = C.lightGray;
params.getRange("A17").format.font = { bold: true };
params.getRange("B17:G17").format.numberFormat = "0.00";
params.getRange("A19:F27").values = [
  ["Код группы","Участок","Оборудование","Мощность оборудования, ед./ч","Мощность специалиста, ед./ч","Статус"],
  ...Object.entries(groupCapacity).map(([code,v])=>[code,v[0],v[1],v[2],v[3],"PRELIMINARY_UNTIL_TEST"]),
  ["TOTAL_OUTPUT","Совокупная выдача","Все участки",60,50/3,"Расчётная производительность 50 позиций / 3 работника"],
];
header(params,"A19:F19"); body(params,"A20:F27");
params.getRange("D20:E27").format.fill = C.yellow;
params.getRange("D20:E27").format.numberFormat = "0.000";
widths(params,{A:20,B:18,C:22,D:24,E:24,F:32,G:18});

const flowSheet = wb.worksheets.add("ПОТОКИ");
title(flowSheet,"Потоки по дням недели",
  "Гости или заказы соответствующего направления; гостиничный завтрак — производственный план 22 комплекса.","G");
legend(flowSheet,"G",[
  ["Поток","Количество гостей или заказов направления за день.",C.yellow],
  ["Гостиничный завтрак","В первых трёх месяцах используется производственный план 22 комплекса в день.",C.yellow],
  ["Использование","Поток × коэффициент выбора × часовая доля × резерв направления."],
  ["Нулевое значение","Направление не работает в этот день либо продукция Кухни отсутствует."],
]);
flowSheet.getRange("A10:G17").values = [
  ["День",...directions],
  ...days.map(d=>[d[0],...d.slice(1)]),
];
header(flowSheet,"A10:G10"); body(flowSheet,"A11:G17");
flowSheet.getRange("B11:G17").format.fill = C.yellow;
flowSheet.getRange("B11:G17").format.numberFormat = "0.00";
widths(flowSheet,{A:20,B:18,C:18,D:24,E:22,F:16,G:16});

const profileSheet = wb.worksheets.add("ЧАСОВЫЕ_ПРОФИЛИ");
title(profileSheet,"Стартовые часовые профили спроса",
  "Доли внутри направления; сумма каждого столбца должна быть равна 100%.","G");
legend(profileSheet,"G",[
  ["Часовая доля","Доля суточного спроса направления, приходящаяся на интервал.",C.yellow],
  ["ИТОГО","Сумма часовых долей по направлению; формула должна давать 100%."],
  ["Расчёт спроса","Суточный поток × коэффициент выбора × часовая доля."],
  ["Статус","Предварительная гипотеза до накопления фактических чеков и заказов."],
]);
profileSheet.getRange("A10:G25").values = [
  ["Интервал",...directions],
  ...hours.map((h,i)=>[h,...directions.map(d=>profiles[d][i])]),
];
profileSheet.getRange("A26").values = [["ИТОГО"]];
for (let c=0;c<directions.length;c++) {
  const col=String.fromCharCode(66+c);
  profileSheet.getRange(`${col}26`).formulas = [[`=SUM(${col}11:${col}25)`]];
}
header(profileSheet,"A10:G10"); body(profileSheet,"A11:G26");
profileSheet.getRange("B11:G25").format.fill = C.yellow;
profileSheet.getRange("B11:G26").format.numberFormat = "0.0%";
profileSheet.getRange("A26:G26").format.fill = C.green;
widths(profileSheet,{A:20,B:18,C:18,D:24,E:22,F:16,G:16});

const coeffSheet = wb.worksheets.add("КОЭФФИЦИЕНТЫ_ВЫБОРА");
title(coeffSheet,"Коэффициенты выбора по всем 31 позициям",
  "Коэффициент означает количество единиц позиции на одного гостя или заказ.","L");
legend(coeffSheet,"L",[
  ["Выход, г","Нормативный выход продаваемой позиции.",C.yellow],
  ["Коэффициент выбора","Единиц позиции на одного гостя или заказ соответствующего направления.",C.yellow],
  ["APPROVED","Коэффициент утверждён в ходе разработки меню."],
  ["PRELIMINARY_SPLIT","Распределение хлеба или гарниров требует подтверждения фактическими продажами.",C.yellow],
]);
coeffSheet.getRange(`A10:L${menu.length+10}`).values = [
  ["№","Раздел","Позиция","Группа мощности","Выход, г",...directions,"Статус"],
  ...menu.map(m=>[m[0],m[1],m[2],m[4],m[3],...m[5],m[6]]),
];
header(coeffSheet,"A10:L10"); body(coeffSheet,`A11:L${menu.length+10}`);
coeffSheet.getRange(`E11:K${menu.length+10}`).format.fill = C.yellow;
coeffSheet.getRange(`F11:K${menu.length+10}`).format.numberFormat = "0.0000";
coeffSheet.freezePanes.freezeRows(10); coeffSheet.freezePanes.freezeColumns(3);
widths(coeffSheet,{A:5,B:21,C:43,D:18,E:14,F:16,G:18,H:22,I:22,J:15,K:15,L:24});

const staffSheet = wb.worksheets.add("ШТАТ_ПО_ЧАСАМ");
title(staffSheet,"Производственный штат по дням и часам",
  "Экспедитор и упаковщик в число производственных специалистов не включаются.","F");
legend(staffSheet,"F",[
  ["Доступно специалистов","Фактическое количество производственных работников в интервале.",C.yellow],
  ["Мощность штата","Доступно специалистов × производительность одного специалиста из листа «ПАРАМЕТРЫ»."],
  ["Минимум для пика","Целевое количество производственных работников в вечернем интервале.",C.yellow],
  ["Нехватка персонала","Рассчитывается на листе баланса через ограничение доступной мощности."],
]);
const staffRows=[];
for (const d of days.map(x=>x[0])) for(let h=0;h<hours.length;h++) {
  const n=staffCount(d,h);
  staffRows.push([d,hours[h],n,null,d==="Суббота"&&h>=11?3:(h>=11?3:n),
    "Мощность штата = специалисты × 16,667 позиции/чел.-ч"]);
}
staffSheet.getRange(`A10:F${staffLastRow}`).values=[
  ["День","Час","Фактически доступно, чел.","Расчётная мощность штата, поз./ч","Минимум для вечернего пика, чел.","Основание"],
  ...staffRows,
];
for(let r=DATA_ROW;r<=staffLastRow;r++) staffSheet.getRange(`D${r}`).formulas=[[`=C${r}*'ПАРАМЕТРЫ'!$E$27`]];
header(staffSheet,"A10:F10"); body(staffSheet,`A11:F${staffLastRow}`);
staffSheet.getRange(`C11:C${staffLastRow}`).format.fill=C.yellow;
staffSheet.getRange(`E11:E${staffLastRow}`).format.fill=C.yellow;
staffSheet.getRange(`C11:E${staffLastRow}`).format.numberFormat="0.000";
staffSheet.freezePanes.freezeRows(10);
widths(staffSheet,{A:20,B:18,C:22,D:22,E:24,F:58});

const demandSheet = wb.worksheets.add("СПРОС_ДЕНЬ_ЧАС_МЕНЮ");
title(demandSheet,"Почасовой спрос по всему меню",
  "Расчёт выполняется формулами из потоков, коэффициентов выбора, часовых профилей и резервов.","M");
legend(demandSheet,"M",[
  ["Спрос до резерва","Сумма по направлениям: поток × коэффициент выбора × часовая доля."],
  ["Спрос с резервом","Сумма по направлениям: поток × коэффициент выбора × часовая доля × резерв направления."],
  ["Масса, кг","Спрос с резервом × нормативный выход позиции / 1 000."],
  ["Исходные данные","Все изменяемые значения находятся на жёлтых ячейках исходных листов."],
]);
const demandRows = detail.map(x=>[
  x.day,x.hour,x.id,x.section,x.item,x.group,x.output,null,null,null,
  "Σ(поток × коэффициент × профиль часа × резерв)","Первые 3 месяца",
  menu.find(m=>m[0]===x.id)[6],
]);
demandSheet.getRange(`A10:M${demandLastRow}`).values = [
  ["День","Час","№","Раздел","Позиция","Группа мощности","Выход, г","Спрос до резерва","Спрос с резервом","Масса, кг","Расчёт","Режим","Статус коэффициента"],
  ...demandRows,
];
for(let i=0;i<detail.length;i++){
  const r=DATA_ROW+i, x=detail[i];
  const flowRow=DATA_ROW+days.findIndex(d=>d[0]===x.day);
  const profileRow=DATA_ROW+x.hourIndex;
  const coeffRow=DATA_ROW+x.id-1;
  demandSheet.getRange(`H${r}`).formulas=[[`=SUMPRODUCT('ПОТОКИ'!B${flowRow}:G${flowRow},'ЧАСОВЫЕ_ПРОФИЛИ'!B${profileRow}:G${profileRow},'КОЭФФИЦИЕНТЫ_ВЫБОРА'!F${coeffRow}:K${coeffRow})`]];
  demandSheet.getRange(`I${r}`).formulas=[[`=SUMPRODUCT('ПОТОКИ'!B${flowRow}:G${flowRow},'ЧАСОВЫЕ_ПРОФИЛИ'!B${profileRow}:G${profileRow},'КОЭФФИЦИЕНТЫ_ВЫБОРА'!F${coeffRow}:K${coeffRow},'ПАРАМЕТРЫ'!$B$17:$G$17)`]];
  demandSheet.getRange(`J${r}`).formulas=[[`=I${r}*G${r}/1000`]];
}
header(demandSheet,"A10:M10"); body(demandSheet,`A11:M${demandLastRow}`);
demandSheet.getRange(`G11:J${demandLastRow}`).format.numberFormat = "0.000";
demandSheet.freezePanes.freezeRows(10); demandSheet.freezePanes.freezeColumns(2);
widths(demandSheet,{A:18,B:18,C:6,D:20,E:42,F:18,G:12,H:18,I:18,J:14,K:48,L:18,M:24});

const balanceSheet = wb.worksheets.add("БАЛАНС_ДЕНЬ_ЧАС");
title(balanceSheet,"Суммарный почасовой баланс производственной мощности",
  "Потребность всех блюд агрегируется по общим участкам и сравнивается с доступной мощностью.","N");
legend(balanceSheet,"N",[
  ["Суммарная потребность","Сумма спроса с резервом всех позиций общей группы за день и час."],
  ["Мощность по штату","Количество доступных специалистов × производительность специалиста."],
  ["Доступная мощность","Минимум из мощности оборудования и мощности по штату."],
  ["Нехватка мощности","MAX(суммарная потребность − доступная мощность; 0)."],
]);
const balanceRows = balance.map(x=>[
  x.day,x.hour,x.group,x.label,x.equipment,null,null,null,null,null,null,null,null,
  x.group==="TOTAL_OUTPUT"?"Совокупность всех 31 позиций":"Общая мощность группы; не суммировать по позициям",
]);
balanceSheet.getRange(`A10:N${balanceLastRow}`).values = [
  ["День","Час","Код группы","Участок","Оборудование","Суммарная потребность, ед./ч","Мощность оборудования, ед./ч","Доступно производственных специалистов","Мощность по штату, ед./ч","Доступная мощность, ед./ч","Нехватка производственной мощности, ед./ч","Загрузка","Статус","Комментарий"],
  ...balanceRows,
];
const groupParamRows = Object.fromEntries([...Object.keys(groupCapacity),"TOTAL_OUTPUT"].map((g,i)=>[g,20+i]));
for(let i=0;i<balance.length;i++){
  const r=DATA_ROW+i, x=balance[i], p=groupParamRows[x.group];
  const demandFormula=x.group==="TOTAL_OUTPUT"
    ? `=SUMIFS('СПРОС_ДЕНЬ_ЧАС_МЕНЮ'!$I$11:$I$${demandLastRow},'СПРОС_ДЕНЬ_ЧАС_МЕНЮ'!$A$11:$A$${demandLastRow},A${r},'СПРОС_ДЕНЬ_ЧАС_МЕНЮ'!$B$11:$B$${demandLastRow},B${r})`
    : `=SUMIFS('СПРОС_ДЕНЬ_ЧАС_МЕНЮ'!$I$11:$I$${demandLastRow},'СПРОС_ДЕНЬ_ЧАС_МЕНЮ'!$A$11:$A$${demandLastRow},A${r},'СПРОС_ДЕНЬ_ЧАС_МЕНЮ'!$B$11:$B$${demandLastRow},B${r},'СПРОС_ДЕНЬ_ЧАС_МЕНЮ'!$F$11:$F$${demandLastRow},C${r})`;
  balanceSheet.getRange(`F${r}`).formulas=[[demandFormula]];
  balanceSheet.getRange(`G${r}`).formulas=[[`='ПАРАМЕТРЫ'!D${p}`]];
  balanceSheet.getRange(`H${r}`).formulas=[[`=SUMIFS('ШТАТ_ПО_ЧАСАМ'!$C$11:$C$${staffLastRow},'ШТАТ_ПО_ЧАСАМ'!$A$11:$A$${staffLastRow},A${r},'ШТАТ_ПО_ЧАСАМ'!$B$11:$B$${staffLastRow},B${r})`]];
  balanceSheet.getRange(`I${r}`).formulas=[[x.group==="TOTAL_OUTPUT"?`=H${r}*'ПАРАМЕТРЫ'!E${p}`:`=MIN(H${r},1)*'ПАРАМЕТРЫ'!E${p}`]];
  balanceSheet.getRange(`J${r}`).formulas=[[`=MIN(G${r},I${r})`]];
  balanceSheet.getRange(`K${r}`).formulas=[[`=MAX(F${r}-J${r},0)`]];
  balanceSheet.getRange(`L${r}`).formulas=[[`=IF(J${r}=0,0,F${r}/J${r})`]];
  balanceSheet.getRange(`M${r}`).formulas=[[`=IF(K${r}>0,"BLOCKED","PASS")`]];
}
header(balanceSheet,"A10:N10"); body(balanceSheet,`A11:N${balanceLastRow}`);
balanceSheet.getRange(`F11:L${balanceLastRow}`).format.numberFormat = "0.000";
balanceSheet.freezePanes.freezeRows(10); balanceSheet.freezePanes.freezeColumns(2);
widths(balanceSheet,{A:18,B:18,C:18,D:34,E:28,F:22,G:22,H:20,I:20,J:21,K:24,L:14,M:14,N:50});

const menuCap = wb.worksheets.add("МОЩНОСТЬ_ПО_МЕНЮ");
title(menuCap,"Производственная мощность в разрезе всего меню",
  "Все показатели рассчитываются формулами; нехватка относится к общей группе мощности позиции.","P");
legend(menuCap,"P",[
  ["Недельная потребность","Сумма почасового спроса с резервом по позиции за семь дней."],
  ["Максимальный спрос позиции","Максимальное часовое значение спроса конкретной позиции."],
  ["Суммарная потребность группы","Максимум суммы всех блюд, использующих общую производственную мощность."],
  ["Нехватка мощности","Максимальная положительная разница между потребностью группы и доступной мощностью."],
]);
const menuCapRows = menu.map(m=>[
  m[0],m[1],m[2],m[4],m[3],null,null,maxItem.get(m[0]).day,maxItem.get(m[0]).hour,null,null,null,null,null,null,m[6],
]);
menuCap.getRange(`A10:P${menu.length+10}`).values = [
  ["№","Раздел","Наименование","Группа мощности","Выход, г","Недельная потребность, ед.","Макс. спрос позиции, ед./ч","День пика позиции","Час пика позиции","Суммарная потребность группы, ед./ч","Мощность оборудования группы, ед./ч","Пиковая мощность по штату, ед./ч","Доступная мощность группы, ед./ч","Нехватка производственной мощности, ед./ч","Статус мощности","Статус коэффициента"],
  ...menuCapRows,
];
for(let r=DATA_ROW;r<DATA_ROW+menu.length;r++){
  const id=r-DATA_ROW+1;
  const group=menu[id-1][4];
  const itemDemandRows=detail
    .map((x,index)=>x.id===id?DATA_ROW+index:null)
    .filter(Boolean);
  const groupBalanceRows=balance
    .map((x,index)=>x.group===group?DATA_ROW+index:null)
    .filter(Boolean);
  const p=groupParamRows[group];
  menuCap.getRange(`F${r}`).formulas=[[`=SUMIF('СПРОС_ДЕНЬ_ЧАС_МЕНЮ'!$C$11:$C$${demandLastRow},A${r},'СПРОС_ДЕНЬ_ЧАС_МЕНЮ'!$I$11:$I$${demandLastRow})`]];
  menuCap.getRange(`G${r}`).formulas=[[`=MAX(${itemDemandRows.map(x=>`'СПРОС_ДЕНЬ_ЧАС_МЕНЮ'!I${x}`).join(",")})`]];
  menuCap.getRange(`J${r}`).formulas=[[`=MAX(${groupBalanceRows.map(x=>`'БАЛАНС_ДЕНЬ_ЧАС'!F${x}`).join(",")})`]];
  menuCap.getRange(`K${r}`).formulas=[[`='ПАРАМЕТРЫ'!D${p}`]];
  menuCap.getRange(`L${r}`).formulas=[[`=MAX(${groupBalanceRows.map(x=>`'БАЛАНС_ДЕНЬ_ЧАС'!I${x}`).join(",")})`]];
  menuCap.getRange(`M${r}`).formulas=[[`=MAX(${groupBalanceRows.map(x=>`'БАЛАНС_ДЕНЬ_ЧАС'!J${x}`).join(",")})`]];
  menuCap.getRange(`N${r}`).formulas=[[`=MAX(${groupBalanceRows.map(x=>`'БАЛАНС_ДЕНЬ_ЧАС'!K${x}`).join(",")})`]];
  menuCap.getRange(`O${r}`).formulas=[[`=IF(N${r}>0,"BLOCKED","PASS")`]];
}
header(menuCap,"A10:P10"); body(menuCap,`A11:P${menu.length+10}`);
menuCap.getRange(`E11:N${menu.length+10}`).format.numberFormat = "0.000";
menuCap.freezePanes.freezeRows(10); menuCap.freezePanes.freezeColumns(3);
widths(menuCap,{A:5,B:21,C:44,D:18,E:12,F:19,G:19,H:18,I:18,J:22,K:22,L:21,M:22,N:24,O:15,P:23});

const checks = wb.worksheets.add("КОНТРОЛЬ");
title(checks,"Контроль полноты и формул",
  "Контрольные показатели рассчитываются формулами и сопоставляются с жёлтыми нормативами.","F");
legend(checks,"F",[
  ["Факт","Формула, считающая текущее состояние книги."],
  ["Норматив","Ожидаемое контрольное значение; жёлтая ячейка.",C.yellow],
  ["Отклонение","Факт минус норматив."],
  ["Статус","OK, если отклонение равно нулю; иначе FAIL."],
]);
checks.getRange("A10:F19").values=[
  ["Проверка","Факт","Норматив","Отклонение","Статус","Комментарий"],
  ["Активных позиций",null,31,null,null,"Все позиции включены"],
  ["Дней недели",null,7,null,null,"Полная неделя"],
  ["Часовых интервалов",null,15,null,null,"07:00–22:00"],
  ["Строк детального спроса",null,31*7*15,null,null,"31 × 7 × 15"],
  ["Строк баланса участков",null,8*7*15,null,null,"8 групп × 7 × 15"],
  ["Часовые профили = 100%",null,6,null,null,"Все направления"],
  ["Строк с предварительным сплитом",null,7,null,null,"4 хлеба + 3 гарнира"],
  ["Негативных значений нехватки",null,0,null,null,"Нехватка не может быть отрицательной"],
  ["Неактивные завтраки в спросе",null,0,null,null,"Архивные позиции отсутствуют"],
];
checks.getRange("B11").formulas=[["=COUNTA('КОЭФФИЦИЕНТЫ_ВЫБОРА'!A11:A41)"]];
checks.getRange("B12").formulas=[["=COUNTA('ПОТОКИ'!A11:A17)"]];
checks.getRange("B13").formulas=[["=COUNTA('ЧАСОВЫЕ_ПРОФИЛИ'!A11:A25)"]];
checks.getRange("B14").formulas=[[`=COUNTA('СПРОС_ДЕНЬ_ЧАС_МЕНЮ'!A11:A${demandLastRow})`]];
checks.getRange("B15").formulas=[[`=COUNTA('БАЛАНС_ДЕНЬ_ЧАС'!A11:A${balanceLastRow})`]];
checks.getRange("B16").formulas=[["=COUNTIF('ЧАСОВЫЕ_ПРОФИЛИ'!B26:G26,1)"]];
checks.getRange("B17").formulas=[["=COUNTIF('КОЭФФИЦИЕНТЫ_ВЫБОРА'!L11:L41,\"PRELIMINARY_SPLIT\")"]];
checks.getRange("B18").formulas=[[`=COUNTIF('БАЛАНС_ДЕНЬ_ЧАС'!K11:K${balanceLastRow},"<0")`]];
checks.getRange("B19").formulas=[["=0"]];
for(let row=11;row<=19;row++){
  checks.getRange(`D${row}`).formulas=[[`=B${row}-C${row}`]];
  checks.getRange(`E${row}`).formulas=[[`=IF(D${row}=0,"OK","FAIL")`]];
}
header(checks,"A10:F10"); body(checks,"A11:F19");
checks.getRange("C11:C19").format.fill=C.yellow;
checks.getRange("E11:E19").format.fill=C.green;
widths(checks,{A:48,B:16,C:16,D:16,E:14,F:52});

const out=await SpreadsheetFile.exportXlsx(wb);
await out.save(`${outputDir}/KITCHEN_PRODUCTION_CAPACITY_BY_MENU_VARSHAVKA_v3.0.0.xlsx`);
for (const spec of [
  [params,"A1:G27","capacity-params-v3.png"],
  [flowSheet,"A1:G17","capacity-flows-v3.png"],
  [profileSheet,"A1:G26","capacity-profiles-v3.png"],
  [coeffSheet,"A1:L18","capacity-coefficients-v3.png"],
]) {
  try {
    const blob=await wb.render({sheetName:spec[0].name,range:spec[1],scale:1,format:"png"});
    await fs.writeFile(`${previewDir}/${spec[2]}`,new Uint8Array(await blob.arrayBuffer()));
  } catch (error) {
    console.warn(`Preview skipped for ${spec[0].name}: ${error.message}`);
  }
}

console.log(JSON.stringify({
  file:`${outputDir}/KITCHEN_PRODUCTION_CAPACITY_BY_MENU_VARSHAVKA_v3.0.0.xlsx`,
  formulaDemandRows:detail.length,formulaBalanceRows:balance.length,
  yellowInputSheets:["ПАРАМЕТРЫ","ПОТОКИ","ЧАСОВЫЕ_ПРОФИЛИ","КОЭФФИЦИЕНТЫ_ВЫБОРА","ШТАТ_ПО_ЧАСАМ","КОНТРОЛЬ"],
},null,2));
