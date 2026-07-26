import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const ROOT = process.env.S03_REPO_ROOT
  ? path.resolve(process.env.S03_REPO_ROOT)
  : path.resolve(import.meta.dirname, "../..");
const SOURCE = path.join(
  ROOT,
  "models/scenarios/S03/FINMODEL_VARSHAVKA_USALI_SCENARIO_S03_v0.1.5.xlsx",
);
const TARGET = path.join(
  ROOT,
  "models/scenarios/S03/FINMODEL_VARSHAVKA_USALI_SCENARIO_S03_v0.1.6.xlsx",
);

const MONTH_COLUMNS = [
  "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
];
const DAYS = Array.from({ length: 365 }, (_, index) => index + 5);

function setRow(sheet, row, values) {
  for (const [column, value] of Object.entries(values)) {
    sheet.getRange(`${column}${row}`).values = [[value]];
  }
}

function setMonthlyFormulas(sheet, row, factory) {
  const formulas = MONTH_COLUMNS.map((column) => factory(column));
  sheet.getRange(`D${row}:O${row}`).formulas = [formulas];
}

function finishMonthlyRow(sheet, row, totalFormula, unit) {
  sheet.getRange(`P${row}`).formulas = [[totalFormula]];
  sheet.getRange(`Q${row}`).formulas = [[`=P${row}/12`]];
  sheet.getRange(`R${row}`).values = [[unit]];
}

const input = await FileBlob.load(SOURCE);
const workbook = await SpreadsheetFile.importXlsx(input);

// 01_ВВОД — canonical approved channel inputs.
const inputs = workbook.worksheets.getItem("01_ВВОД");
inputs.getRange("A117:G117").copyTo(inputs.getRange("A126:G126"), "all");
inputs.getRange("A120:G123").copyTo(inputs.getRange("A127:G130"), "all");
inputs.getRange("A117:G117").copyTo(inputs.getRange("A132:G132"), "all");
inputs.getRange("A120:G123").copyTo(inputs.getRange("A133:G136"), "all");

setRow(inputs, 45, {
  A: "HOTEL_BREAKFAST_CHECK",
  B: "Гостиница — завтраки",
  C: "Средний чек завтрака",
});
setRow(inputs, 46, {
  A: "HOTEL_BREAKFAST_ORDERS",
  B: "Гостиница — завтраки",
  C: "Завтраков каждый календарный день",
  G: "20 подтверждённых обслуживаний ежедневно",
});
setRow(inputs, 47, {
  A: "HOTEL_BREAKFAST_COGS",
  B: "Гостиница — завтраки",
  C: "Food cost завтрака",
});
setRow(inputs, 48, {
  A: "HOTEL_BREAKFAST_PACK",
  B: "Гостиница — завтраки",
  C: "Упаковка / расходники завтрака",
});
setRow(inputs, 49, {
  A: "HOTEL_BREAKFAST_CASHLESS",
  B: "Гостиница — завтраки",
  C: "Доля безналичной оплаты завтрака",
});
setRow(inputs, 57, {
  D: 0,
  F: "Подтверждено",
  G: "100% наличной оплаты через ККТ; эквайринг отсутствует",
});
setRow(inputs, 116, {
  F: "Контрольный бюджет",
  G: "15 000 руб./мес. — неподтверждённый лимит; фактическая себестоимость определяется по Issue #41",
});
setRow(inputs, 117, {
  A: "СЦЕНАРИЙ S03 v0.1.6 — КАНАЛЫ VARSHAVKA 3.0.0",
});
setRow(inputs, 120, {
  A: "HOTEL_DINNER_ORDERS",
  B: "Гостиница — ужины",
  C: "Ужинов каждый календарный день",
  D: 10,
  E: "ужинов/день",
  F: "Подтверждено",
  G: "10 гостевых обслуживаний ужина ежедневно",
});
setRow(inputs, 121, {
  A: "HOTEL_DINNER_CHECK",
  B: "Гостиница — ужины",
  C: "Средний чек ужина",
  D: 1000,
  E: "руб./ужин",
  F: "Подтверждено",
  G: "Утверждённый средний чек гостиничного ужина",
});
setRow(inputs, 122, {
  A: "HOTEL_DINNER_COGS",
  B: "Гостиница — ужины",
  C: "Food cost ужина — как a-la carte",
  E: "% выручки",
  F: "Расчёт",
  G: "Связан с ALA_COGS",
});
inputs.getRange("D122").formulas = [["='01_ВВОД'!$D$24"]];
setRow(inputs, 123, {
  A: "HOTEL_DINNER_PACK",
  B: "Гостиница — ужины",
  C: "Упаковка / расходники ужина",
  D: 0,
  E: "руб./ужин",
  F: "Требует уточнения",
  G: "Пока 0; уточнить по порядку обслуживания Гостиницы",
});
setRow(inputs, 124, {
  A: "HOTEL_DINNER_CASHLESS",
  B: "Гостиница — ужины",
  C: "Доля безналичной оплаты ужина",
  D: 1,
  E: "%",
  F: "Допущение",
  G: "До уточнения — 100%",
});

setRow(inputs, 126, {
  A: "НАПРАВЛЕНИЕ КОФЕ&ЧАЙ — ТОЛЬКО НАПИТОК БАРИСТА",
});
setRow(inputs, 127, {
  A: "COFFEE_TEA_GUEST_SHARE",
  B: "КОФЕ&ЧАЙ",
  C: "Доля от гостей а-ля карт, Бизнес-ланча и Гостиницы",
  D: 0.5,
  E: "%",
  F: "Подтверждено",
  G: "Округление количества гостей вниз ежедневно; Доставка и Навынос не включаются",
});
setRow(inputs, 128, {
  A: "COFFEE_TEA_CHECK",
  B: "КОФЕ&ЧАЙ",
  C: "Средний чек напитка бариста",
  D: 300,
  E: "руб./напиток",
  F: "Подтверждено",
  G: "Одна единица напитка бариста на гостя",
});
setRow(inputs, 129, {
  A: "COFFEE_TEA_UNIT_COGS",
  B: "КОФЕ&ЧАЙ",
  C: "Прямая себестоимость напитка",
  D: 60,
  E: "руб./напиток",
  F: "Подтверждено",
  G: "Полностью относится к напитку бариста; продукция Кухни = 0",
});
setRow(inputs, 130, {
  A: "COFFEE_TEA_CASHLESS",
  B: "КОФЕ&ЧАЙ",
  C: "Доля безналичной оплаты",
  D: 1,
  E: "%",
  F: "Допущение",
  G: "До решения Issue #51 — 100%",
});

setRow(inputs, 132, {
  A: "ПРОИЗВОДСТВЕННАЯ ПРОГРАММА ПИТАНИЯ СОТРУДНИКОВ",
});
setRow(inputs, 133, {
  A: "STAFF_MEALS_WEEKLY_QTY",
  B: "Питание сотрудников",
  C: "Комплексов в неделю",
  D: 84,
  E: "комплексов/нед.",
  F: "Подтверждено",
  G: "48 комплексов А + 36 комплексов Б; резерв не применяется",
});
setRow(inputs, 134, {
  A: "STAFF_MEALS_ANNUAL_QTY",
  B: "Питание сотрудников",
  C: "Комплексов за 52 недели",
  E: "комплексов/год",
  F: "Расчёт",
  G: "84 × 52; календарные месяцы рассчитываются дневной программой на следующем этапе",
});
inputs.getRange("D134").formulas = [["='01_ВВОД'!$D$133*52"]];
setRow(inputs, 135, {
  A: "STAFF_MEALS_FOOD_WEEK",
  B: "Питание сотрудников",
  C: "Пищевая продукция в неделю",
  D: 54.6,
  E: "кг/нед.",
  F: "Подтверждено",
  G: "84 комплекса × 650 г",
});
setRow(inputs, 136, {
  A: "STAFF_MEALS_DRINK_WEEK",
  B: "Питание сотрудников",
  C: "Напитки в неделю",
  D: 16.8,
  E: "л/нед.",
  F: "Подтверждено",
  G: "84 комплекса × 200 мл; кофе бариста не входит",
});

// 02_КАЛЕНДАРЬ — direct hotel split and Coffee&Tea demand.
const calendar = workbook.worksheets.getItem("02_КАЛЕНДАРЬ");
calendar.getRange("U4:U369").copyTo(calendar.getRange("V4:V369"), "all");
calendar.getRange("U4:U369").copyTo(calendar.getRange("W4:W369"), "all");
calendar.getRange("A2").values = [[
  "Банкетный день: а-ля карт 20% до 17:00; остальные направления работают обычно. " +
  "Гостиница: 20 завтраков и 10 ужинов ежедневно. КОФЕ&ЧАЙ: 50% базы гостей, округление вниз.",
]];
calendar.getRange("U4").values = [["Ужины гостиницы"]];
calendar.getRange("V4").values = [["Гости КОФЕ&ЧАЙ"]];
calendar.getRange("W4").values = [["Потенциальные гости КОФЕ&ЧАЙ"]];
calendar.getRange("U5:U369").formulas = DAYS.map((row) => [
  "='01_ВВОД'!$D$120",
]);
calendar.getRange("V5:V369").formulas = DAYS.map((row) => [
  `=ROUNDDOWN(SUM(M${row},N${row},R${row},U${row})*'01_ВВОД'!$D$127,0)`,
]);
calendar.getRange("W5:W369").formulas = DAYS.map((row) => [
  `=ROUNDDOWN(SUM(L${row},N${row},R${row},U${row})*'01_ВВОД'!$D$127,0)`,
]);
calendar.getRange("V4:W369").format.columnWidth = 18;

// 03_ДОХОДЫ — breakfast/dinner split and Coffee&Tea as its own channel.
const revenue = workbook.worksheets.getItem("03_ДОХОДЫ");
revenue.getRange("A32:R32").copyTo(revenue.getRange("A43:R43"), "all");
revenue.getRange("A39:R41").copyTo(revenue.getRange("A44:R46"), "all");
setRow(revenue, 22, {
  A: "REV.HOTEL.BREAKFAST.QTY",
  B: "Кафе — Гостиница: завтраки",
  C: "Завтраки гостиницы",
});
setRow(revenue, 23, {
  A: "REV.HOTEL.BREAKFAST.CHECK",
  B: "Кафе — Гостиница: завтраки",
  C: "Средний чек завтрака",
});
setRow(revenue, 24, {
  A: "REV.HOTEL.BREAKFAST",
  B: "Кафе — Гостиница: завтраки",
  C: "Доходы гостиничных завтраков",
});
setRow(revenue, 39, {
  A: "REV.HOTEL.DINNER.QTY",
  B: "Кафе — Гостиница: ужины",
  C: "Ужины гостиницы",
});
setRow(revenue, 40, {
  A: "REV.HOTEL.DINNER.CHECK",
  B: "Кафе — Гостиница: ужины",
});
setRow(revenue, 41, {
  A: "REV.HOTEL.DINNER",
  B: "Кафе — Гостиница: ужины",
});
setRow(revenue, 43, {
  A: "НАПРАВЛЕНИЕ КОФЕ&ЧАЙ — ТОЛЬКО НАПИТОК БАРИСТА",
});
setRow(revenue, 44, {
  A: "REV.COFFEE_TEA.QTY",
  B: "Кафе — КОФЕ&ЧАЙ",
  C: "Напитки бариста",
});
setMonthlyFormulas(
  revenue,
  44,
  (column) =>
    `=SUMIF('02_КАЛЕНДАРЬ'!$B$5:$B$369,${column}$3,'02_КАЛЕНДАРЬ'!$V$5:$V$369)`,
);
finishMonthlyRow(revenue, 44, "=SUM(D44:O44)", "напитков");
setRow(revenue, 45, {
  A: "REV.COFFEE_TEA.CHECK",
  B: "Кафе — КОФЕ&ЧАЙ",
  C: "Средний чек напитка",
});
setMonthlyFormulas(revenue, 45, () => "='01_ВВОД'!$D$128");
revenue.getRange("P45").formulas = [["=AVERAGE(D45:O45)"]];
revenue.getRange("Q45").formulas = [["=P45"]];
revenue.getRange("R45").values = [["руб./напиток"]];
setRow(revenue, 46, {
  A: "REV.COFFEE_TEA",
  B: "Кафе — КОФЕ&ЧАЙ",
  C: "Доходы КОФЕ&ЧАЙ",
});
setMonthlyFormulas(revenue, 46, (column) => `=${column}44*${column}45`);
finishMonthlyRow(revenue, 46, "=SUM(D46:O46)", "руб.");

setMonthlyFormulas(
  revenue,
  26,
  (column) =>
    `=SUM(${column}8,${column}12,${column}16,${column}20,${column}24,${column}41,${column}46)`,
);
setMonthlyFormulas(
  revenue,
  29,
  (column) =>
    `=SUMIF('02_КАЛЕНДАРЬ'!$B$5:$B$369,${column}$3,'02_КАЛЕНДАРЬ'!$L$5:$L$369)*'01_ВВОД'!$D$18` +
    `+SUMIF('02_КАЛЕНДАРЬ'!$B$5:$B$369,${column}$3,'02_КАЛЕНДАРЬ'!$K$5:$K$369)*'01_ВВОД'!$D$26*'01_ВВОД'!$D$28` +
    `+SUMIF('02_КАЛЕНДАРЬ'!$B$5:$B$369,${column}$3,'02_КАЛЕНДАРЬ'!$O$5:$O$369)*'01_ВВОД'!$D$31` +
    `+COUNTIF('02_КАЛЕНДАРЬ'!$B$5:$B$369,${column}$3)*'01_ВВОД'!$D$40*'01_ВВОД'!$D$39` +
    `+${column}24+${column}41` +
    `+SUMIF('02_КАЛЕНДАРЬ'!$B$5:$B$369,${column}$3,'02_КАЛЕНДАРЬ'!$W$5:$W$369)*'01_ВВОД'!$D$128`,
);

// 04_СЕБЕСТОИМОСТЬ — Coffee&Tea direct cost belongs to barista drink.
const cogs = workbook.worksheets.getItem("04_СЕБЕСТОИМОСТЬ");
cogs.getRange("A41:R42").copyTo(cogs.getRange("A44:R45"), "all");
setRow(cogs, 14, {
  A: "COGS.HOTEL.BREAKFAST.REV",
  B: "Гостиница — завтраки",
});
setRow(cogs, 15, {
  A: "COGS.HOTEL.BREAKFAST",
  B: "Гостиница — завтраки",
  C: "Food cost завтраков",
});
setRow(cogs, 41, {
  A: "COGS.HOTEL.DINNER.REV",
  B: "Гостиница — ужины",
});
setRow(cogs, 42, {
  A: "COGS.HOTEL.DINNER",
  B: "Гостиница — ужины",
});
setRow(cogs, 44, {
  A: "COGS.COFFEE_TEA.REV",
  B: "КОФЕ&ЧАЙ",
  C: "Доходы напитков бариста",
});
setMonthlyFormulas(cogs, 44, (column) => `='03_ДОХОДЫ'!${column}46`);
finishMonthlyRow(cogs, 44, "=SUM(D44:O44)", "руб.");
setRow(cogs, 45, {
  A: "COGS.COFFEE_TEA",
  B: "КОФЕ&ЧАЙ",
  C: "Прямая себестоимость напитков",
});
setMonthlyFormulas(
  cogs,
  45,
  (column) => `='03_ДОХОДЫ'!${column}44*'01_ВВОД'!$D$129`,
);
finishMonthlyRow(cogs, 45, "=SUM(D45:O45)", "руб.");
setMonthlyFormulas(
  cogs,
  16,
  (column) =>
    `=SUM(${column}7,${column}9,${column}11,${column}13,${column}15,${column}42,${column}45)`,
);
setMonthlyFormulas(
  cogs,
  27,
  (column) =>
    `='03_ДОХОДЫ'!${column}8*'01_ВВОД'!$D$25*'01_ВВОД'!$D$14` +
    `+'03_ДОХОДЫ'!${column}12*'01_ВВОД'!$D$30*'01_ВВОД'!$D$14` +
    `+'03_ДОХОДЫ'!${column}16*'01_ВВОД'!$D$38*'01_ВВОД'!$D$14` +
    `+'03_ДОХОДЫ'!${column}20*'01_ВВОД'!$D$44*'01_ВВОД'!$D$14` +
    `+'03_ДОХОДЫ'!${column}24*'01_ВВОД'!$D$49*'01_ВВОД'!$D$14` +
    `+'03_ДОХОДЫ'!${column}41*'01_ВВОД'!$D$124*'01_ВВОД'!$D$14` +
    `+'03_ДОХОДЫ'!${column}46*'01_ВВОД'!$D$130*'01_ВВОД'!$D$14`,
);

// 07_PNL_НАЛОГИ — separate memo contour without double-counting Cafe totals.
const pnl = workbook.worksheets.getItem("07_PNL_НАЛОГИ");
pnl.getRange("A24:R24").copyTo(pnl.getRange("A43:R43"), "all");
pnl.getRange("A21:R23").copyTo(pnl.getRange("A44:R46"), "all");
setRow(pnl, 21, { B: "Кафе — Гостиница: ужины" });
setRow(pnl, 22, { B: "Кафе — Гостиница: ужины" });
setRow(pnl, 23, { B: "Кафе — Гостиница: ужины" });
setRow(pnl, 43, {
  A: "МЕМО-КОНТУР КОФЕ&ЧАЙ — УЧТЁН В ИТОГАХ КАФЕ",
});
setRow(pnl, 44, {
  A: "PNL.COFFEE_TEA.REV",
  B: "Кафе — КОФЕ&ЧАЙ",
  C: "Доходы напитков бариста",
});
setMonthlyFormulas(pnl, 44, (column) => `='03_ДОХОДЫ'!${column}46`);
finishMonthlyRow(pnl, 44, "=SUM(D44:O44)", "руб.");
setRow(pnl, 45, {
  A: "PNL.COFFEE_TEA.COGS",
  B: "Кафе — КОФЕ&ЧАЙ",
  C: "Прямая себестоимость напитков",
});
setMonthlyFormulas(pnl, 45, (column) => `='04_СЕБЕСТОИМОСТЬ'!${column}45`);
finishMonthlyRow(pnl, 45, "=SUM(D45:O45)", "руб.");
setRow(pnl, 46, {
  A: "PNL.COFFEE_TEA.CONTRIB",
  B: "Кафе — КОФЕ&ЧАЙ",
  C: "Маржинальный результат до эквайринга и ФОТ",
});
setMonthlyFormulas(pnl, 46, (column) => `=${column}44-${column}45`);
finishMonthlyRow(pnl, 46, "=SUM(D46:O46)", "руб.");

// 00_РЕЗЮМЕ — updated version and channel outputs.
const summary = workbook.worksheets.getItem("00_РЕЗЮМЕ");
summary.getRange("A1").values = [["VARSHAVKA — Сценарий S03 v0.1.6"]];
summary.getRange("A2").values = [[
  "VARSHAVKA 3.0.0: 20 гостиничных завтраков и 10 ужинов ежедневно; " +
  "КОФЕ&ЧАЙ — отдельный напиток бариста; БАНКЕТЫ — 100% наличными.",
]];
summary.getRange("H5").values = [["S03 v0.1.6"]];
summary.getRange("E18").values = [["Гостиничных обслуживаний за год"]];
summary.getRange("F18").formulas = [["='03_ДОХОДЫ'!P22+'03_ДОХОДЫ'!P39"]];
summary.getRange("E19").values = [["Напитков КОФЕ&ЧАЙ за год"]];
summary.getRange("F19").formulas = [["='03_ДОХОДЫ'!P44"]];
summary.getRange("A34:M34").copyTo(summary.getRange("A35:M35"), "all");
summary.getRange("A35").values = [["6"]];
summary.getRange("B35").values = [[
  "Питание сотрудников: 84 комплекса в неделю; 15 000 руб./мес. остаются контрольным бюджетом до Issue #41.",
]];

// 08_ПРОВЕРКИ — explicit decision checks.
const checks = workbook.worksheets.getItem("08_ПРОВЕРКИ");
for (let row = 32; row <= 37; row += 1) {
  checks.getRange("A28:G28").copyTo(checks.getRange(`A${row}:G${row}`), "all");
}
setRow(checks, 11, {
  A: "CHK.HOTEL.BREAKFAST",
  B: "Гостиничные завтраки за год",
  C: 7300,
  G: "20 завтраков × 365 дней",
});
checks.getRange("D11").formulas = [["='03_ДОХОДЫ'!P22"]];
checks.getRange("E11").formulas = [["=D11-C11"]];
checks.getRange("F11").formulas = [['=IF(E11=0,"OK","ОШИБКА")']];
setRow(checks, 23, {
  A: "CHK.HOTEL.DINNER",
  B: "Гостиничные ужины за год",
  C: 3650,
  G: "10 ужинов × 365 дней",
});
checks.getRange("D23").formulas = [["='03_ДОХОДЫ'!P39"]];
checks.getRange("E23").formulas = [["=D23-C23"]];
checks.getRange("F23").formulas = [['=IF(E23=0,"OK","ОШИБКА")']];
setRow(checks, 27, {
  A: "S03 v0.1.6: гостиничные завтраки и ужины разделены; КОФЕ&ЧАЙ выделен; БАНКЕТЫ — 100% наличными.",
});

const newChecks = [
  {
    row: 32,
    code: "CHK.BANQ.CASH",
    label: "Доля безналичной оплаты БАНКЕТОВ",
    expected: 0,
    formula: "='01_ВВОД'!$D$57",
    note: "100% наличными через ККТ",
  },
  {
    row: 33,
    code: "CHK.HOTEL.TOTAL",
    label: "Гостиничные обслуживания за год",
    expected: 10950,
    formula: "='03_ДОХОДЫ'!P22+'03_ДОХОДЫ'!P39",
    note: "7 300 завтраков + 3 650 ужинов",
  },
  {
    row: 34,
    code: "CHK.COFFEE.QTY",
    label: "Связь спроса КОФЕ&ЧАЙ с календарём",
    expected: 0,
    formula: "=ABS('03_ДОХОДЫ'!P44-SUM('02_КАЛЕНДАРЬ'!$V$5:$V$369))",
    note: "50% базы с ежедневным округлением вниз",
  },
  {
    row: 35,
    code: "CHK.COFFEE.COGS",
    label: "Прямая себестоимость напитка",
    expected: 60,
    formula: "='01_ВВОД'!$D$129",
    note: "Продукция Кухни в КОФЕ&ЧАЙ отсутствует",
  },
  {
    row: 36,
    code: "CHK.LUNCH.CHECK",
    label: "Средний чек Бизнес-ланча",
    expected: 750,
    formula: "='01_ВВОД'!$D$28",
    note: "1 000 руб. × (1 − 25%)",
  },
  {
    row: 37,
    code: "CHK.STAFF.MEALS",
    label: "Комплексы питания сотрудников за 52 недели",
    expected: 4368,
    formula: "='01_ВВОД'!$D$134",
    note: "84 комплекса в неделю; без резерва",
  },
];
for (const item of newChecks) {
  setRow(checks, item.row, {
    A: item.code,
    B: item.label,
    C: item.expected,
    G: item.note,
  });
  checks.getRange(`D${item.row}`).formulas = [[item.formula]];
  checks.getRange(`E${item.row}`).formulas = [[`=D${item.row}-C${item.row}`]];
  checks.getRange(`F${item.row}`).formulas = [[
    `=IF(ABS(E${item.row})<0.01,"OK","ОШИБКА")`,
  ]];
}

// 13_ИЗМЕНЕНИЯ_v0.1.6 — visible audit trail.
const audit = workbook.worksheets.add("13_ИЗМЕНЕНИЯ_v0.1.6");
audit.showGridLines = false;
audit.getRange("A1:H1").merge();
audit.getRange("A2:H2").merge();
audit.getRange("A1").values = [["VARSHAVKA — проект решения S03 v0.1.6"]];
audit.getRange("A2").values = [[
  "Синхронизация финансовой модели с утверждённой операционной моделью VARSHAVKA 3.0.0 | Issues #36 и #52",
]];
audit.getRange("A4:H4").values = [[
  "Issue",
  "Контур",
  "Изменение",
  "До",
  "После",
  "Статус данных",
  "Проверка",
  "Следующий контроль",
]];
audit.getRange("A5:H11").values = [
  ["#36/#52", "Гостиница", "Разделение завтраков и ужинов", "20 единых заказов + 50% ratio", "20 завтраков + 10 ужинов ежедневно", "Утверждено", "CHK.HOTEL.TOTAL", "Цена специальных завтраков — #40"],
  ["#36/#52", "КОФЕ&ЧАЙ", "Отдельный канал напитка бариста", "Не выделен", "50% базы гостей; чек 300; COGS 60", "Утверждено", "CHK.COFFEE.QTY / COGS", "Платёжный профиль — #51"],
  ["#36", "БАНКЕТЫ", "Оплата", "BANQ_CASHLESS = 1", "BANQ_CASHLESS = 0", "Утверждено", "CHK.BANQ.CASH", "ККТ и кассовая дисциплина — #51"],
  ["#36", "Бизнес-ланч", "Устранение конфликта 650/750", "Статус «Конфликт»", "Расчётный чек 750 руб.", "Утверждено", "CHK.LUNCH.CHECK", "Проверка ценами — #40"],
  ["#36", "Питание сотрудников", "Объём производственной программы", "Только 15 000 руб./мес.", "84 комплекса/нед.; 4 368/52 недели", "Объём утверждён; стоимость открыта", "CHK.STAFF.MEALS", "Технологические карты и стоимость — #41"],
  ["#36", "ADR", "Статус ADR-0002", "APPROVED", "SUPERSEDED by ADR-0004 и решения 26.07.2026", "Утверждено", "Документальный контроль", "Нет"],
  ["#36", "Релиз", "Версия книги", "S03 v0.1.5", "S03 v0.1.6", "Проект решения", "08_ПРОВЕРКИ", "PR и выпуск релиза"],
];
audit.getRange("A13:H13").values = [[
  "Код контроля",
  "Ожидается",
  "Факт",
  "Отклонение",
  "Статус",
  "Источник",
  "Issue",
  "Комментарий",
]];
const auditChecks = [
  ["БАНКЕТЫ cashless", 0, "='01_ВВОД'!$D$57", "=C14-B14", '=IF(ABS(D14)<0.01,"OK","ОШИБКА")', "Решение пользователя 26.07.2026", "#36", "Эквайринг БАНКЕТОВ отсутствует"],
  ["Завтраки/год", 7300, "='03_ДОХОДЫ'!P22", "=C15-B15", '=IF(ABS(D15)<0.01,"OK","ОШИБКА")', "20 × 365", "#52", "Закрытое меню Гостиницы"],
  ["Ужины/год", 3650, "='03_ДОХОДЫ'!P39", "=C16-B16", '=IF(ABS(D16)<0.01,"OK","ОШИБКА")', "10 × 365", "#52", "Супы на ужине отсутствуют"],
  ["Чек Бизнес-ланча", 750, "='01_ВВОД'!$D$28", "=C17-B17", '=IF(ABS(D17)<0.01,"OK","ОШИБКА")', "1 000 × 75%", "#36", "Проверить итоговую корзину ценами"],
  ["Питание сотрудников/год", 4368, "='01_ВВОД'!$D$134", "=C18-B18", '=IF(ABS(D18)<0.01,"OK","ОШИБКА")', "84 × 52", "#36/#41", "Себестоимость ещё не подтверждена"],
];
for (let index = 0; index < auditChecks.length; index += 1) {
  const row = 14 + index;
  const [label, expected, actual, delta, status, source, issue, comment] =
    auditChecks[index];
  audit.getRange(`A${row}:B${row}`).values = [[label, expected]];
  audit.getRange(`C${row}:E${row}`).formulas = [[actual, delta, status]];
  audit.getRange(`F${row}:H${row}`).values = [[source, issue, comment]];
}

const dark = "#17365D";
const teal = "#0F6B78";
const light = "#D9EAF7";
audit.getRange("A1:H1").format = {
  fill: dark,
  font: { bold: true, color: "#FFFFFF", size: 16 },
};
audit.getRange("A2:H2").format = {
  fill: light,
  font: { italic: true, color: "#17365D" },
  wrapText: true,
};
for (const header of ["A4:H4", "A13:H13"]) {
  audit.getRange(header).format = {
    fill: teal,
    font: { bold: true, color: "#FFFFFF" },
    wrapText: true,
    horizontalAlignment: "center",
    verticalAlignment: "center",
    borders: { preset: "all", style: "thin", color: "#B7C9D6" },
  };
}
audit.getRange("A5:H11").format = {
  wrapText: true,
  verticalAlignment: "top",
  borders: { preset: "all", style: "thin", color: "#D9E2F3" },
};
audit.getRange("A14:H18").format = {
  wrapText: true,
  verticalAlignment: "top",
  borders: { preset: "all", style: "thin", color: "#D9E2F3" },
};
audit.getRange("B14:D18").format.numberFormat = "#,##0.00;[Red](#,##0.00);-";
audit.getRange("A1:H18").format.font.name = "Arial";
for (const [column, width] of Object.entries({
  A: 18, B: 18, C: 42, D: 25, E: 32, F: 22, G: 24, H: 34,
})) {
  audit.getRange(`${column}1:${column}18`).format.columnWidth = width;
}
audit.freezePanes.freezeRows(4);

// 14_ПРОГРАММА_КУХНИ — approved operational production benchmarks.
const kitchen = workbook.worksheets.add("14_ПРОГРАММА_КУХНИ");
kitchen.showGridLines = false;
kitchen.getRange("A1:J1").merge();
kitchen.getRange("A2:J2").merge();
kitchen.getRange("A1").values = [[
  "VARSHAVKA 3.0.0 — производственная программа Кухни",
]];
kitchen.getRange("A2").values = [[
  "Утверждённые операционные ориентиры; не заменяют расчёт сырья и себестоимости до закрытия технологических и закупочных данных.",
]];
kitchen.getRange("A4:J4").values = [[
  "Режим",
  "Пн, кг",
  "Вт, кг",
  "Ср, кг",
  "Чт, кг",
  "Пт, кг",
  "Сб, кг",
  "Вс, кг",
  "Неделя, кг",
  "Условные единицы",
]];
kitchen.getRange("A5:H6").values = [
  ["Первые 3 месяца", 90.730, 88.330, 88.930, 87.730, 99.400, 109.525, 96.855],
  ["После 3 месяцев", 87.385, 85.025, 85.585, 84.425, 96.025, 105.540, 94.090],
];
kitchen.getRange("I5:I6").formulas = [["=SUM(B5:H5)"], ["=SUM(B6:H6)"]];
kitchen.getRange("J5:J6").values = [[2533], [2444]];

kitchen.getRange("A8:F8").values = [[
  "Показатель",
  "Первые 3 месяца",
  "После 3 месяцев",
  "Единица",
  "Статус",
  "Комментарий",
]];
kitchen.getRange("A9:F15").values = [
  ["Гостиничные завтраки", 154, 147, "комплексов/нед.", "Утверждено", "Резерв Гостиницы применяется один раз"],
  ["Питание сотрудников", 84, 84, "комплексов/нед.", "Утверждено", "48 А + 36 Б; резерв отсутствует"],
  ["Пищевая часть питания сотрудников", 54.6, 54.6, "кг/нед.", "Утверждено", "650 г на комплекс"],
  ["Напитки питания сотрудников", 16.8, 16.8, "л/нед.", "Утверждено", "200 мл на комплекс; не кофе бариста"],
  ["Максимальный обычный день", 109.525, 105.540, "кг/день", "Утверждено", "Суббота"],
  ["Максимальный банкетный день", 104.630, 101.430, "кг/день", "Утверждено", "Пятница; включает 27,55 кг физического выпуска банкета"],
  ["Контрольный банкет", 27.550, 27.550, "кг/мероприятие", "Утверждено", "21 комплект + готовый избыток хлеба и кростаты"],
];

kitchen.getRange("A17:H17").values = [[
  "Контур",
  "Механизм расчёта",
  "Резерв",
  "Округление",
  "Включено в финансы",
  "Открытая зависимость",
  "Issue",
  "Критерий закрытия",
]];
kitchen.getRange("A18:H23").values = [
  ["Продажи КАФЕ", "Спрос позиции × резерв направления; затем сумма каналов", "Один раз", "Вверх до целой порции/изделия", "Выручка и укрупнённый COGS", "Полная спецификация 33 позиций", "#36", "Пересчёт новой версии S03"],
  ["КОФЕ&ЧАЙ", "1 напиток бариста на гостя; Кухня = 0", "Кухни нет", "Гости вниз ежедневно", "Да, отдельный канал КАФЕ", "Платёжный профиль", "#52/#51", "Проверка количества, выручки и COGS"],
  ["Гостиница", "20 завтраков + 10 ужинов ежедневно", "Раздельно", "По правилам гостиничного направления", "Да", "Цены специальных завтраков", "#52/#40", "Разделение потоков и контроль итогов"],
  ["Питание сотрудников", "Фактический график смен", "Нет", "Физические лица", "15 000 руб. — только контрольный бюджет", "Техкарты и фактическая себестоимость", "#41", "Утверждённые карты и калькуляция"],
  ["БАНКЕТЫ", "20 оплаченных гостей; выпуск на 21 комплект", "5%, уже включён", "До целого комплекта", "База S03; 100% cash", "Контрольный банкет и экономика", "#46/#47", "Испытание и подтверждённый food cost"],
  ["Учебные партии", "65 партий / 176,30 кг", "Нет", "По утверждённым партиям", "Центр инвестиций первые 3 месяца", "Календарь фактических испытаний", "#45", "Протоколы контрольных серий"],
];

for (const header of ["A4:J4", "A8:F8", "A17:H17"]) {
  kitchen.getRange(header).format = {
    fill: teal,
    font: { bold: true, color: "#FFFFFF" },
    wrapText: true,
    horizontalAlignment: "center",
    verticalAlignment: "center",
    borders: { preset: "all", style: "thin", color: "#B7C9D6" },
  };
}
kitchen.getRange("A1:J1").format = {
  fill: dark,
  font: { bold: true, color: "#FFFFFF", size: 16 },
};
kitchen.getRange("A2:J2").format = {
  fill: light,
  font: { italic: true, color: "#17365D" },
  wrapText: true,
};
for (const body of ["A5:J6", "A9:F15", "A18:H23"]) {
  kitchen.getRange(body).format = {
    wrapText: true,
    verticalAlignment: "top",
    borders: { preset: "all", style: "thin", color: "#D9E2F3" },
  };
}
kitchen.getRange("B5:I6").format.numberFormat = "#,##0.000;[Red](#,##0.000);-";
kitchen.getRange("B9:C15").format.numberFormat = "#,##0.000;[Red](#,##0.000);-";
kitchen.getRange("A1:J23").format.font.name = "Arial";
for (const [column, width] of Object.entries({
  A: 27, B: 18, C: 18, D: 18, E: 20, F: 22, G: 18, H: 34, I: 18, J: 18,
})) {
  kitchen.getRange(`${column}1:${column}23`).format.columnWidth = width;
}
kitchen.freezePanes.freezeRows(4);

await fs.mkdir(path.dirname(TARGET), { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(TARGET);

console.log(JSON.stringify({ source: SOURCE, target: TARGET }));
