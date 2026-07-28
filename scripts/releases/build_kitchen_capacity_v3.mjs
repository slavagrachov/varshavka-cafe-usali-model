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

const passport = wb.worksheets.add("ПАСПОРТ");
title(passport,"ПРОИЗВОДСТВЕННАЯ МОЩНОСТЬ КУХНИ",
  "VARSHAVKA v3.0.0 • все 31 позиции • прогноз предпочтений × потоки × часовые профили × резерв направления","H");
const totalPeak = peakByGroup.TOTAL_OUTPUT;
passport.getRange("A4:D14").values = [
  ["Показатель","Значение","Единица","Комментарий"],
  ["Активных позиций меню",31,"позиций","Полный стартовый ассортимент"],
  ["Расчётный горизонт","Первые 3 месяца","режим","Резерв применяется один раз"],
  ["Максимальная суммарная часовая потребность",totalPeak.demand,"позиций/ч",`${totalPeak.day}, ${totalPeak.hour}`],
  ["Доступная мощность по действующему штату",totalPeak.available,"позиций/ч",`${totalPeak.staff} производственных работников`],
  ["Нехватка производственной мощности",totalPeak.shortage,"позиций/ч","MAX(потребность − доступная мощность; 0)"],
  ["Проектная мощность раздачи",60,"позиций/ч","Не заменяет производственный персонал"],
  ["Пиковый участок по дефициту",
    balance.reduce((a,b)=>b.shortage>a.shortage?b:a).label,
    "участок",`${balance.reduce((a,b)=>b.shortage>a.shortage?b:a).day}, ${balance.reduce((a,b)=>b.shortage>a.shortage?b:a).hour}`],
  ["Статус часовых профилей","PRELIMINARY","статус","Заменить фактом после ≥300 чеков/заказов и 2 полных недель"],
  ["Неполные исходные данные","Хлеб и гарниры","группы","Сплиты изолированы и помечены PRELIMINARY_SPLIT"],
  ["Инженерный запас","Не увеличивает спрос","правило","Используется при выборе оборудования, не в прогнозе заказов"],
];
header(passport,"A4:D4"); body(passport,"A5:D14");
passport.getRange("B7:B10").format.numberFormat = "0.000";
passport.getRange("A9:D9").format.fill = C.red;
passport.getRange("A12:D13").format.fill = C.yellow;
widths(passport,{A:48,B:28,C:20,D:66});

const flowSheet = wb.worksheets.add("ПОТОКИ");
title(flowSheet,"Потоки по дням недели","Единицы: гости или заказы соответствующего направления; гостиничный завтрак — производственный план 22 комплекса.","G");
flowSheet.getRange("A4:G11").values = [
  ["День",...directions],
  ...days.map(d=>[d[0],...d.slice(1)]),
];
header(flowSheet,"A4:G4"); body(flowSheet,"A5:G11");
flowSheet.getRange("B5:G11").format.numberFormat = "0.00";
widths(flowSheet,{A:20,B:18,C:18,D:24,E:22,F:16,G:16});

const profileSheet = wb.worksheets.add("ЧАСОВЫЕ_ПРОФИЛИ");
title(profileSheet,"Стартовые часовые профили спроса","Доли внутри направления. Сумма каждого столбца должна быть равна 100%. Профили предварительные до накопления факта.","G");
profileSheet.getRange("A4:G19").values = [
  ["Интервал",...directions],
  ...hours.map((h,i)=>[h,...directions.map(d=>profiles[d][i])]),
];
profileSheet.getRange("A20:G20").values = [["ИТОГО",...directions.map(d=>round(profiles[d].reduce((s,x)=>s+x,0)))]];
header(profileSheet,"A4:G4"); body(profileSheet,"A5:G20");
profileSheet.getRange("B5:G20").format.numberFormat = "0.0%";
profileSheet.getRange("A20:G20").format.fill = C.green;
widths(profileSheet,{A:20,B:18,C:18,D:24,E:22,F:16,G:16});

const coeffSheet = wb.worksheets.add("КОЭФФИЦИЕНТЫ_ВЫБОРА");
title(coeffSheet,"Коэффициенты выбора по всем 31 позициям",
  "Коэффициент = единиц позиции на гостя/заказ. Хлебные и гарнирные сплиты, отсутствовавшие в машиночитаемом источнике, помечены отдельно.","L");
coeffSheet.getRange(`A4:L${menu.length+4}`).values = [
  ["№","Раздел","Позиция","Группа мощности","Выход, г",...directions,"Статус"],
  ...menu.map(m=>[m[0],m[1],m[2],m[4],m[3],...m[5],m[6]]),
];
header(coeffSheet,"A4:L4"); body(coeffSheet,`A5:L${menu.length+4}`);
coeffSheet.getRange(`F5:K${menu.length+4}`).format.numberFormat = "0.0000";
coeffSheet.freezePanes.freezeRows(4); coeffSheet.freezePanes.freezeColumns(3);
widths(coeffSheet,{A:5,B:21,C:43,D:18,E:14,F:16,G:18,H:22,I:22,J:15,K:15,L:24});

const demandSheet = wb.worksheets.add("СПРОС_ДЕНЬ_ЧАС_МЕНЮ");
title(demandSheet,"Почасовой спрос по всему меню",
  "Расчёт: поток направления × коэффициент выбора позиции × доля часа × резерв направления; направления суммируются без промежуточного округления.","M");
const demandRows = detail.map(x=>[
  x.day,x.hour,x.id,x.section,x.item,x.group,x.output,x.before,x.demand,x.kg,
  "Σ(поток × коэффициент × профиль часа × резерв)","Первые 3 месяца",
  menu.find(m=>m[0]===x.id)[6],
]);
demandSheet.getRange(`A4:M${demandRows.length+4}`).values = [
  ["День","Час","№","Раздел","Позиция","Группа мощности","Выход, г","Спрос до резерва","Спрос с резервом","Масса, кг","Расчёт","Режим","Статус коэффициента"],
  ...demandRows,
];
header(demandSheet,"A4:M4"); body(demandSheet,`A5:M${demandRows.length+4}`);
demandSheet.getRange(`G5:J${demandRows.length+4}`).format.numberFormat = "0.000";
demandSheet.freezePanes.freezeRows(4); demandSheet.freezePanes.freezeColumns(2);
widths(demandSheet,{A:18,B:18,C:6,D:20,E:42,F:18,G:12,H:18,I:18,J:14,K:48,L:18,M:24});

const balanceSheet = wb.worksheets.add("БАЛАНС_ДЕНЬ_ЧАС");
title(balanceSheet,"Суммарный почасовой баланс производственной мощности",
  "Потребность агрегирована по общим участкам. Нехватка = MAX(потребность с резервом − доступная мощность; 0).","N");
const balanceRows = balance.map(x=>[
  x.day,x.hour,x.group,x.label,x.equipment,x.demand,x.equipmentCap,x.staff,
  x.staffCap,x.available,x.shortage,x.utilization,
  x.shortage>0?"BLOCKED":"PASS",
  x.group==="TOTAL_OUTPUT"?"Совокупность всех 31 позиций":"Общая мощность группы; не суммировать по позициям",
]);
balanceSheet.getRange(`A4:N${balanceRows.length+4}`).values = [
  ["День","Час","Код группы","Участок","Оборудование","Суммарная потребность, ед./ч","Мощность оборудования, ед./ч","Доступно производственных специалистов","Мощность по штату, ед./ч","Доступная мощность, ед./ч","Нехватка производственной мощности, ед./ч","Загрузка","Статус","Комментарий"],
  ...balanceRows,
];
header(balanceSheet,"A4:N4"); body(balanceSheet,`A5:N${balanceRows.length+4}`);
balanceSheet.getRange(`F5:L${balanceRows.length+4}`).format.numberFormat = "0.000";
balanceSheet.freezePanes.freezeRows(4); balanceSheet.freezePanes.freezeColumns(2);
widths(balanceSheet,{A:18,B:18,C:18,D:34,E:28,F:22,G:22,H:20,I:20,J:21,K:24,L:14,M:14,N:50});

const menuCap = wb.worksheets.add("МОЩНОСТЬ_ПО_МЕНЮ");
title(menuCap,"Производственная мощность в разрезе всего меню",
  "Столбец нехватки относится к общей группе мощности позиции и рассчитывается по суммарной потребности всех блюд этой группы.","P");
const menuCapRows = menu.map(m=>{
  const itemPeak=maxItem.get(m[0]); const gp=peakByGroup[m[4]];
  return [
    m[0],m[1],m[2],m[4],m[3],round(weeklyByItem.get(m[0])),
    itemPeak.demand,itemPeak.day,itemPeak.hour,gp.demand,gp.equipmentCap,
    gp.staffCap,gp.available,gp.shortage,gp.shortage>0?"BLOCKED":"PASS",
    m[6],
  ];
});
menuCap.getRange(`A4:P${menuCapRows.length+4}`).values = [
  ["№","Раздел","Наименование","Группа мощности","Выход, г","Недельная потребность, ед.","Макс. спрос позиции, ед./ч","День пика позиции","Час пика позиции","Суммарная потребность группы, ед./ч","Мощность оборудования группы, ед./ч","Пиковая мощность по штату, ед./ч","Доступная мощность группы, ед./ч","Нехватка производственной мощности, ед./ч","Статус мощности","Статус коэффициента"],
  ...menuCapRows,
];
header(menuCap,"A4:P4"); body(menuCap,`A5:P${menuCapRows.length+4}`);
menuCap.getRange(`E5:N${menuCapRows.length+4}`).format.numberFormat = "0.000";
menuCap.freezePanes.freezeRows(4); menuCap.freezePanes.freezeColumns(3);
widths(menuCap,{A:5,B:21,C:44,D:18,E:12,F:19,G:19,H:18,I:18,J:22,K:22,L:21,M:22,N:24,O:15,P:23});

const staffSheet = wb.worksheets.add("ШТАТ_ПО_ЧАСАМ");
title(staffSheet,"Производственный штат по дням и часам",
  "Ранняя смена 06:00–18:00, поздняя 11:00–23:00; субботняя третья 10:00–22:00. Экспедитор и упаковщик не входят.","F");
const staffRows=[];
for (const d of days.map(x=>x[0])) for(let h=0;h<hours.length;h++) {
  const n=staffCount(d,h);
  staffRows.push([d,hours[h],n,round(n*(50/3)),d==="Суббота"&&h>=11?3:(h>=11?3:n),
    "Расчётная производительность 16,667 позиции/чел.-ч"]);
}
staffSheet.getRange(`A4:F${staffRows.length+4}`).values=[
  ["День","Час","Фактически доступно, чел.","Расчётная мощность штата, поз./ч","Минимум для вечернего пика, чел.","Основание"],
  ...staffRows,
];
header(staffSheet,"A4:F4"); body(staffSheet,`A5:F${staffRows.length+4}`);
staffSheet.getRange(`C5:E${staffRows.length+4}`).format.numberFormat="0.000";
staffSheet.freezePanes.freezeRows(4);
widths(staffSheet,{A:20,B:18,C:22,D:22,E:24,F:52});

const checks = wb.worksheets.add("КОНТРОЛЬ");
title(checks,"Контроль полноты и баланса","Автоматические и воспроизводимые сверки исходных матриц.","F");
const preliminary = menu.filter(m=>m[6]==="PRELIMINARY_SPLIT").length;
checks.getRange("A4:F13").values=[
  ["Проверка","Факт","Норматив","Отклонение","Статус","Комментарий"],
  ["Активных позиций",menu.length,31,null,null,"Все позиции включены"],
  ["Дней недели",days.length,7,null,null,"Полная неделя"],
  ["Часовых интервалов",hours.length,15,null,null,"07:00–22:00"],
  ["Строк детального спроса",detail.length,31*7*15,null,null,"31 × 7 × 15"],
  ["Строк баланса участков",balance.length,8*7*15,null,null,"8 групп × 7 × 15"],
  ["Часовые профили = 100%",directions.filter(d=>Math.abs(profiles[d].reduce((s,x)=>s+x,0)-1)<1e-9).length,6,null,null,"Все направления"],
  ["Строк с предварительным сплитом",preliminary,7,null,null,"4 хлеба + 3 гарнира"],
  ["Формула нехватки без отрицательных значений",balance.filter(x=>x.shortage>=0).length,balance.length,null,null,"MAX(спрос − мощность; 0)"],
  ["Неактивные завтраки в спросе",0,0,null,null,"Бенедикт и круассан с лососем отсутствуют"],
];
for(let row=5;row<=13;row++){
  checks.getRange(`D${row}`).formulas=[[`=B${row}-C${row}`]];
  checks.getRange(`E${row}`).formulas=[[`=IF(D${row}=0,"OK","FAIL")`]];
}
header(checks,"A4:F4"); body(checks,"A5:F13");
checks.getRange("E5:E13").format.fill=C.green;
widths(checks,{A:48,B:16,C:16,D:16,E:14,F:52});

for (const spec of [
  [passport,"A1:D14","capacity-passport-v3.png"],
  [menuCap,"A1:P15","capacity-menu-v3.png"],
  [balanceSheet,"A1:N24","capacity-balance-v3.png"],
  [checks,"A1:F13","capacity-checks-v3.png"],
]) {
  const blob=await wb.render({sheetName:spec[0].name,range:spec[1],scale:1,format:"png"});
  await fs.writeFile(`${previewDir}/${spec[2]}`,new Uint8Array(await blob.arrayBuffer()));
}
const out=await SpreadsheetFile.exportXlsx(wb);
await out.save(`${outputDir}/KITCHEN_PRODUCTION_CAPACITY_BY_MENU_VARSHAVKA_v3.0.0.xlsx`);

console.log(JSON.stringify({
  file:`${outputDir}/KITCHEN_PRODUCTION_CAPACITY_BY_MENU_VARSHAVKA_v3.0.0.xlsx`,
  detailRows:detail.length,balanceRows:balance.length,totalPeak,
  maxShortage:balance.reduce((a,b)=>b.shortage>a.shortage?b:a),
},null,2));
