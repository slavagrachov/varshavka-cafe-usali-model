import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const ROOT = process.env.S04_REPO_ROOT
  ? path.resolve(process.env.S04_REPO_ROOT)
  : path.resolve(import.meta.dirname, "../..");
const SOURCE = path.join(
  ROOT,
  "models/scenarios/S03/FINMODEL_VARSHAVKA_USALI_SCENARIO_S03_v0.1.7.xlsx",
);
const TARGET = path.join(
  ROOT,
  "models/scenarios/S04/FINMODEL_VARSHAVKA_USALI_SCENARIO_S04_v3.0.0.xlsx",
);

function setRow(sheet, row, values) {
  for (const [column, value] of Object.entries(values)) {
    sheet.getRange(`${column}${row}`).values = [[value]];
  }
}

const MONTH_COLUMNS = "DEFGHIJKLMNO".split("");

function setMonthlyFormulas(sheet, row, formulaForColumn) {
  for (const column of MONTH_COLUMNS) {
    sheet.getRange(`${column}${row}`).formulas = [[formulaForColumn(column)]];
  }
  sheet.getRange(`P${row}`).formulas = [[`=SUM(D${row}:O${row})`]];
  sheet.getRange(`Q${row}`).formulas = [[`=AVERAGE(D${row}:O${row})`]];
}

function styleSheet(sheet, lastRow, lastColumn) {
  const dark = "#17365D";
  const teal = "#0F6B78";
  sheet.showGridLines = false;
  sheet.getRange(`A1:${lastColumn}1`).merge();
  sheet.getRange(`A1:${lastColumn}1`).format = {
    fill: dark,
    font: { bold: true, color: "#FFFFFF", size: 15, name: "Arial" },
  };
  sheet.getRange(`A3:${lastColumn}3`).format = {
    fill: teal,
    font: { bold: true, color: "#FFFFFF", name: "Arial" },
    wrapText: true,
    horizontalAlignment: "center",
    verticalAlignment: "center",
    borders: { preset: "all", style: "thin", color: "#B7C9D6" },
  };
  sheet.getRange(`A4:${lastColumn}${lastRow}`).format = {
    font: { name: "Arial" },
    wrapText: true,
    verticalAlignment: "top",
    borders: { preset: "all", style: "thin", color: "#D9E2F3" },
  };
  sheet.freezePanes.freezeRows(3);
}

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(SOURCE));

// PRICE_REGISTER — public observations and analytical assumptions.
const prices = workbook.worksheets.add("PRICE_REGISTER");
prices.getRange("A1:O1").values = [[
  "S04 v3.0.0 — PRICE_REGISTER гостиничного завтрака",
]];
prices.getRange("A2:O2").merge();
prices.getRange("A2").values = [[
  "Публичные цены являются предварительными. Fontina 1 800 руб./кг — только параметр чувствительности. КП не запрашивались и не отправлялись.",
]];
prices.getRange("A3:O3").values = [[
  "Price ID", "Продукт", "Артикул", "Поставщик / источник", "Фасовка",
  "Количество в упаковке", "Единица цены", "Цена упаковки с НДС, руб.",
  "Цена единицы, руб.", "НДС", "Дата цены", "Ссылка / основание",
  "Статус", "Выбрано", "Комментарий",
]];
const priceRows = [
  ["P-EGG-C0", "Яйцо куриное C0", "739866", "Лента / Дивеевское", "10 шт.", 10, "шт.", 129.99, null, "Включён; ставка не подтверждена", "2026-07-27", "https://lenta.com/product/yajjco-kurinoe-diveevskoe-s0-rossiya-10sht-739866/", "Предварительно", 1, "Нужен документ поставщика"],
  ["P-MELANGE-GROVO", "Меланж пастеризованный GROVO", "не подтверждён", "публичная карточка / GROVO", "900 мл; заявлено 900 г", 0.9, "кг", 361.50, null, "Не подтверждён", "2026-07-27", "https://da-mart.ru/catalog/goods/296776/", "Предварительно", 1, "Масса и цена требуют документа GROVO"],
  ["P-MILK-DS", "Молоко «Деловой Стандарт Select» 3,2%", "12106183", "Pragmatic", "1 000 мл", 1, "л", 146, null, "Цена с НДС; ставка не подтверждена", "2026-07-27", "https://www.pragmatic.ru/product/moloko-delovoy-standart-select-ultrapasterizovannoe-32-1-l", "Предварительно", 1, "Масса нетто в граммах не подтверждена"],
  ["P-BUTTER", "Масло сливочное 82,5%", "743324", "Лента / Вкуснотеево", "180 г", 0.18, "кг", 199.99, null, "Включён; ставка не подтверждена", "2026-07-27", "https://lenta.com/product/maslo-slivochnoe-vkusnoteevo-tradicionnoe-825-rossiya-180g-743324/", "Предварительно", 1, "Нужен документ поставщика"],
  ["P-OATS", "Овсяные хлопья длительной варки", "627534", "Лента / Клинские", "500 г", 0.5, "кг", 104.99, null, "Включён; ставка не подтверждена", "2026-07-27", "https://lenta.com/product/khlopya-ovsyanye-klinskie-gerkules-rossiya-500g-627534/", "Предварительно", 1, ""],
  ["P-SUGAR", "Сахар", "717070", "Лента", "1 кг", 1, "кг", 99.99, null, "Включён; ставка не подтверждена", "2026-07-27", "https://lenta.com/product/sakhar-pesok-lenta-rossiya-1kg-717070/", "Предварительно", 1, ""],
  ["P-SALT", "Соль", "214838", "Лента / Усольская", "1 кг", 1, "кг", 42.99, null, "Включён; ставка не подтверждена", "2026-07-27", "https://lenta.com/product/sol-usolskaya-pishhevaya-vyvarochnaya-jodirovannaya-rossiya-1kg-214838/", "Предварительно", 1, ""],
  ["P-CROISSANT-80", "Круассан замороженный без начинки 80 г", "26840364", "Supl.biz / поставщик карточки", "60 × 80 г", 60, "шт.", 2033.28, null, "В карточке указано «с НДС»", "2026-07-27", "https://supl.biz/kruassan-60sht-80-g-p26840364/", "Предварительно", 1, "Состав и сливочное масло не подтверждены"],
  ["P-CHEDDAR", "Чеддер, порционный ломтик", "722806", "Лента / Schonfeld", "125 г", 0.125, "кг", 174.99, null, "Включён; ставка не подтверждена", "2026-07-27", "https://lenta.com/product/syr-schonfeld-cheddar-50-narezka-rossiya-125g-722806/", "Предварительно", 1, "Фактическая фасовка по 20 г требует проверки"],
  ["P-FONTINA", "Fontina DOP / Fontal", "нет", "поставщик не выбран", "аналитическая единица 1 кг", 1, "кг", 1800, null, "Не определён", "2026-07-27", "Решение пользователя: параметр чувствительности", "Только чувствительность", 1, "Не утверждённая закупочная цена"],
  ["P-DRINK", "Напиток бариста", "внутренний норматив", "VARSHAVKA / Бар", "1 напиток", 1, "шт.", 60, null, "Внутренний COGS", "2026-07-27", "Утверждённое решение проекта", "Подтверждено", 1, "Относится только к Гостинице"],
  ["ALT-CROISSANT-GROSS", "Круассан Bridor 80 г", "EP-708/2975", "GrossFood", "1 шт.", 1, "шт.", 84.20, null, "Не подтверждён", "2026-07-27", "https://grossfood.ru/", "Альтернатива", 0, "В составе указана смесь маргарина и масла"],
  ["ALT-CROISSANT-TORTIKA", "Круассан #2426 80 г", "П-2426", "Tortika", "1 шт.", 1, "шт.", 157.50, null, "Не подтверждён", "2026-07-27", "https://tortika.net/kruassan-2426-klassicheskij-zamorozhennyj-dlya-vypekaniya-100-g", "Альтернатива", 0, "Публично заявлено сливочное масло"],
];
prices.getRange(`A4:O${3 + priceRows.length}`).values = priceRows;
for (let row = 4; row <= 3 + priceRows.length; row += 1) {
  prices.getRange(`I${row}`).formulas = [[`=H${row}/F${row}`]];
}
styleSheet(prices, 3 + priceRows.length, "O");
prices.getRange("F4:I16").format.numberFormat = "#,##0.0000";
prices.getRange("N4:N16").format.numberFormat = "0";
for (const [column, width] of Object.entries({
  A: 22, B: 32, C: 18, D: 26, E: 20, F: 16, G: 14, H: 18, I: 18,
  J: 24, K: 14, L: 46, M: 20, N: 10, O: 36,
})) prices.getRange(`${column}1:${column}16`).format.columnWidth = width;

// BREAKFAST_RECIPES — gross input, net/semi-finished/output transitions.
const recipes = workbook.worksheets.add("BREAKFAST_RECIPES");
recipes.getRange("A1:K1").values = [[
  "S04 v3.0.0 — BREAKFAST_RECIPES: нормы на один комплекс",
]];
recipes.getRange("A2:K2").merge();
recipes.getRange("A2").values = [[
  "Общие компоненты (круассан и два сыра) прибавляются к основному блюду один раз.",
]];
recipes.getRange("A3:K3").values = [[
  "Recipe ID", "Вариант", "Компонент", "Продукт", "Price ID",
  "Брутто", "Ед.", "Нетто", "Полуфабрикат", "Готовый выход, г", "Примечание",
]];
const recipeRows = [
  ["R-EGG-01", "Яичница", "Основное блюдо", "Яйцо C0", "P-EGG-C0", 2, "шт.", 126, "содержимое яйца", 114, "140 г брутто; две целые штуки"],
  ["R-EGG-02", "Яичница", "Основное блюдо", "Масло сливочное", "P-BUTTER", 5, "г", 5, "в блюдо", 5, ""],
  ["R-EGG-03", "Яичница", "Основное блюдо", "Соль", "P-SALT", 1, "г", 1, "в блюдо", 1, ""],
  ["R-OML-01", "Омлет", "Основное блюдо", "Меланж", "P-MELANGE-GROVO", 126, "г", 126, "смесь омлета", 111, ""],
  ["R-OML-02", "Омлет", "Основное блюдо", "Молоко", "P-MILK-DS", 50, "мл", 50, "смесь омлета", 44, "Стоимость по литрам; масса нетто требует КП"],
  ["R-OML-03", "Омлет", "Основное блюдо", "Масло сливочное", "P-BUTTER", 5, "г", 5, "смесь омлета", 4, ""],
  ["R-OML-04", "Омлет", "Основное блюдо", "Соль", "P-SALT", 1, "г", 1, "смесь омлета", 1, ""],
  ["R-OAT-01", "Овсяная каша", "Основное блюдо", "Овсяные хлопья", "P-OATS", 45, "г", 45, "каша", 45, ""],
  ["R-OAT-02", "Овсяная каша", "Основное блюдо", "Молоко", "P-MILK-DS", 125, "мл", 125, "каша", 108, "Аналитическое распределение выхода; стоимость по брутто 125 мл"],
  ["R-OAT-03", "Овсяная каша", "Основное блюдо", "Вода", "нет", 100, "г", 100, "каша", 86, "Аналитическое распределение выхода; коммунальный ресурс, стоимость 0"],
  ["R-OAT-04", "Овсяная каша", "Основное блюдо", "Сахар", "P-SUGAR", 5, "г", 5, "каша", 5, "Аналитическое распределение готового выхода"],
  ["R-OAT-05", "Овсяная каша", "Основное блюдо", "Масло сливочное", "P-BUTTER", 5, "г", 5, "каша", 5, "Аналитическое распределение готового выхода"],
  ["R-OAT-06", "Овсяная каша", "Основное блюдо", "Соль", "P-SALT", 1, "г", 1, "каша", 1, ""],
  ["R-COM-01", "Все варианты", "Общий компонент", "Круассан 80 г", "P-CROISSANT-80", 1, "шт.", 80, "выпеченный круассан", 65, "Одна целая заготовка"],
  ["R-COM-02", "Все варианты", "Общий компонент", "Чеддер", "P-CHEDDAR", 20, "г", 20, "ломтик", 20, "Один ломтик"],
  ["R-COM-03", "Все варианты", "Общий компонент", "Fontina/Fontal", "P-FONTINA", 21, "г", 20, "ломтик", 20, "Цена 1 800 руб./кг — чувствительность"],
];
recipes.getRange(`A4:K${3 + recipeRows.length}`).values = recipeRows;
styleSheet(recipes, 3 + recipeRows.length, "K");
recipes.getRange("F4:J19").format.numberFormat = "#,##0.000";
for (const [column, width] of Object.entries({
  A: 16, B: 22, C: 20, D: 28, E: 22, F: 12, G: 10, H: 12, I: 24, J: 18, K: 38,
})) recipes.getRange(`${column}1:${column}19`).format.columnWidth = width;

// BREAKFAST_COSTING — formula-only totals from the registers above.
const costing = workbook.worksheets.add("BREAKFAST_COSTING");
costing.getRange("A1:J1").values = [[
  "S04 v3.0.0 — BREAKFAST_COSTING: прозрачная калькуляция",
]];
costing.getRange("A2:J2").merge();
costing.getRange("A2").values = [[
  "Итоги рассчитываются формулами из норм брутто и PRICE_REGISTER; ручной ввод итоговой себестоимости не используется.",
]];
costing.getRange("A3:J3").values = [[
  "Вариант", "Компонент", "Продукт", "Норма брутто", "Ед.", "Цена единицы",
  "Стоимость, руб.", "Статус", "Источник нормы", "Price ID",
]];
const lines = [
  ["Яичница", "Основное блюдо", "Яйцо C0", "шт.", "='PRICE_REGISTER'!I4", "=D4*F4", "Предварительно", "P-EGG-C0"],
  ["Яичница", "Основное блюдо", "Масло сливочное", "г", "='PRICE_REGISTER'!I7", "=D5/1000*F5", "Предварительно", "P-BUTTER"],
  ["Яичница", "Основное блюдо", "Соль", "г", "='PRICE_REGISTER'!I10", "=D6/1000*F6", "Предварительно", "P-SALT"],
  ["Омлет", "Основное блюдо", "Меланж", "г", "='PRICE_REGISTER'!I5", "=D7/1000*F7", "Предварительно", "P-MELANGE-GROVO"],
  ["Омлет", "Основное блюдо", "Молоко", "мл", "='PRICE_REGISTER'!I6", "=D8/1000*F8", "Предварительно", "P-MILK-DS"],
  ["Омлет", "Основное блюдо", "Масло сливочное", "г", "='PRICE_REGISTER'!I7", "=D9/1000*F9", "Предварительно", "P-BUTTER"],
  ["Омлет", "Основное блюдо", "Соль", "г", "='PRICE_REGISTER'!I10", "=D10/1000*F10", "Предварительно", "P-SALT"],
  ["Овсяная каша", "Основное блюдо", "Овсяные хлопья", "г", "='PRICE_REGISTER'!I8", "=D11/1000*F11", "Предварительно", "P-OATS"],
  ["Овсяная каша", "Основное блюдо", "Молоко", "мл", "='PRICE_REGISTER'!I6", "=D12/1000*F12", "Предварительно", "P-MILK-DS"],
  ["Овсяная каша", "Основное блюдо", "Вода", "г", 0, "=0", "Подтверждено", "нет"],
  ["Овсяная каша", "Основное блюдо", "Сахар", "г", "='PRICE_REGISTER'!I9", "=D14/1000*F14", "Предварительно", "P-SUGAR"],
  ["Овсяная каша", "Основное блюдо", "Масло сливочное", "г", "='PRICE_REGISTER'!I7", "=D15/1000*F15", "Предварительно", "P-BUTTER"],
  ["Овсяная каша", "Основное блюдо", "Соль", "г", "='PRICE_REGISTER'!I10", "=D16/1000*F16", "Предварительно", "P-SALT"],
  ["Все варианты", "Общий компонент", "Круассан 80 г", "шт.", "='PRICE_REGISTER'!I11", "=D17*F17", "Предварительно", "P-CROISSANT-80"],
  ["Все варианты", "Общий компонент", "Чеддер", "г", "='PRICE_REGISTER'!I12", "=D18/1000*F18", "Предварительно", "P-CHEDDAR"],
  ["Все варианты", "Общий компонент", "Fontina/Fontal", "г", "='PRICE_REGISTER'!I13", "=D19/1000*F19", "Чувствительность", "P-FONTINA"],
];
for (let index = 0; index < lines.length; index += 1) {
  const row = 4 + index;
  const [variant, component, product, unit, unitPrice, cost, status, priceId] = lines[index];
  setRow(costing, row, {
    A: variant,
    B: component,
    C: product,
    E: unit,
    H: status,
    I: `BREAKFAST_RECIPES!F${row}`,
    J: priceId,
  });
  costing.getRange(`D${row}`).formulas = [[`='BREAKFAST_RECIPES'!F${row}`]];
  if (typeof unitPrice === "string" && unitPrice.startsWith("=")) costing.getRange(`F${row}`).formulas = [[unitPrice]];
  else setRow(costing, row, { F: unitPrice });
  costing.getRange(`G${row}`).formulas = [[cost]];
}
costing.getRange("A22:J22").values = [[
  "Вариант", "Доля", "Основное блюдо", "Общие компоненты", "Кухня",
  "Напиток", "Полная себестоимость", "Тариф с НДС", "Food cost", "Статус",
]];
costing.getRange("A23:A25").values = [["Яичница"], ["Омлет"], ["Овсяная каша"]];
costing.getRange("B23:B25").values = [[0.375], [0.375], [0.25]];
costing.getRange("C23:C25").formulas = [["=SUM(G4:G6)"], ["=SUM(G7:G10)"], ["=SUM(G11:G16)"]];
costing.getRange("D23:D25").formulas = [["=SUM($G$17:$G$19)"], ["=SUM($G$17:$G$19)"], ["=SUM($G$17:$G$19)"]];
costing.getRange("E23:E25").formulas = [["=C23+D23"], ["=C24+D24"], ["=C25+D25"]];
costing.getRange("F23:F25").formulas = [["='PRICE_REGISTER'!I14"], ["='PRICE_REGISTER'!I14"], ["='PRICE_REGISTER'!I14"]];
costing.getRange("G23:G25").formulas = [["=E23+F23"], ["=E24+F24"], ["=E25+F25"]];
costing.getRange("H23:H25").values = [[550], [550], [550]];
costing.getRange("I23:I25").formulas = [["=G23/H23"], ["=G24/H24"], ["=G25/H25"]];
costing.getRange("J23:J25").values = [["Предварительно"], ["Предварительно"], ["Предварительно"]];
costing.getRange("A27:J27").values = [[
  "Средневзвешенно", null, null, null, null, null, null, null, null, "Предварительно",
]];
costing.getRange("B27").formulas = [["=SUM(B23:B25)"]];
costing.getRange("E27").formulas = [["=SUMPRODUCT(B23:B25,E23:E25)"]];
costing.getRange("F27").formulas = [["=SUMPRODUCT(B23:B25,F23:F25)"]];
costing.getRange("G27").formulas = [["=E27+F27"]];
costing.getRange("H27").values = [[550]];
costing.getRange("I27").formulas = [["=G27/H27"]];
costing.getRange("A29:J29").values = [[
  "Годовая выручка", "Годовой COGS", "Прямой результат", "Завтраков",
  "Предварительный COGS до", "Отклонение COGS", "Результат проекта до",
  "Результат проекта после", "Отклонение результата", "Статус",
]];
costing.getRange("A30").formulas = [["=550*D30"]];
costing.getRange("B30").formulas = [["=G27*D30"]];
costing.getRange("C30").formulas = [["=A30-B30"]];
costing.getRange("D30").values = [[7300]];
costing.getRange("E30").values = [[1410989.625]];
costing.getRange("F30").formulas = [["=B30-E30"]];
costing.getRange("G30").values = [[1032905.171268474]];
costing.getRange("H30").formulas = [["='00_РЕЗЮМЕ'!B19"]];
costing.getRange("I30").formulas = [["=H30-G30"]];
costing.getRange("J30").values = [["Чувствительность до КП"]];
styleSheet(costing, 30, "J");
for (const header of ["A22:J22", "A29:J29"]) {
  costing.getRange(header).format = {
    fill: "#0F6B78",
    font: { bold: true, color: "#FFFFFF", name: "Arial" },
    wrapText: true,
    horizontalAlignment: "center",
    borders: { preset: "all", style: "thin", color: "#B7C9D6" },
  };
}
costing.getRange("D4:G19").format.numberFormat = "#,##0.0000";
costing.getRange("B23:B27").format.numberFormat = "0.00%";
costing.getRange("C23:H27").format.numberFormat = "#,##0.00";
costing.getRange("I23:I27").format.numberFormat = "0.00%";
costing.getRange("A30:I30").format.numberFormat = "#,##0.00";
for (const [column, width] of Object.entries({
  A: 24, B: 22, C: 28, D: 16, E: 10, F: 18, G: 18, H: 20, I: 24, J: 22,
})) costing.getRange(`${column}1:${column}30`).format.columnWidth = width;

// Link the financial model to the formula-based costing.
const inputs = workbook.worksheets.getItem("01_ВВОД");
inputs.getRange("A137").values = [["S04 v3.0.0 — ГОСТИНИЧНЫЙ ЗАВТРАК: 3 АКТИВНЫХ ВАРИАНТА"]];
inputs.getRange("D141").formulas = [["=BREAKFAST_COSTING!$E$27"]];
inputs.getRange("D142").formulas = [["=BREAKFAST_COSTING!$G$27"]];
inputs.getRange("D143").formulas = [["=BREAKFAST_COSTING!$I$27"]];
inputs.getRange("D147:D149").formulas = [
  ["=BREAKFAST_COSTING!$G$23"],
  ["=BREAKFAST_COSTING!$G$24"],
  ["=BREAKFAST_COSTING!$G$25"],
];
inputs.getRange("G141:G143").values = [
  ["Формула из PRICE_REGISTER и BREAKFAST_RECIPES"],
  ["Кухня + напиток бариста"],
  ["Предварительно до КП и документов поставщиков"],
];
inputs.getRange("G147:G149").values = [
  ["Кухня 131,282668 + напиток 60"],
  ["Кухня 163,194668 + напиток 60"],
  ["Кухня 133,483718 + напиток 60"],
];
inputs.getRange("A1:A159").format.columnWidth = 34;
inputs.getRange("B1:B159").format.columnWidth = 24;
inputs.getRange("C1:C159").format.columnWidth = 42;
inputs.getRange("G1:G159").format.columnWidth = 54;

const summary = workbook.worksheets.getItem("00_РЕЗЮМЕ");
summary.getRange("A1").values = [["VARSHAVKA v3.0.0 — Сценарий S04"]];
summary.getRange("A2").values = [[
  "Новый сценарий производственно-экономической модели: 31 активная позиция Кухни и прозрачная калькуляция гостиничного завтрака.",
]];
summary.getRange("H5").values = [["S04 v3.0.0"]];
summary.getRange("F20").formulas = [["=BREAKFAST_COSTING!$I$27"]];

const breakfast = workbook.worksheets.getItem("15_ЗАВТРАК_v0.1.7");
breakfast.getRange("A1").values = [["S04 v3.0.0 — гостиничный завтрак и 31 активная позиция"]];
breakfast.getRange("A2").values = [[
  "Калькуляция перенесена в PRICE_REGISTER, BREAKFAST_RECIPES и BREAKFAST_COSTING. КП поставщикам не отправлялись.",
]];
breakfast.getRange("D5:D7").formulas = [
  ["=BREAKFAST_COSTING!$E$23"],
  ["=BREAKFAST_COSTING!$E$24"],
  ["=BREAKFAST_COSTING!$E$25"],
];

const checks = workbook.worksheets.getItem("08_ПРОВЕРКИ");
checks.getRange("A27").values = [[
  "S04 v3.0.0: 31 активная позиция; прозрачная калькуляция трёх гостиничных завтраков.",
]];
checks.getRange("C43").formulas = [["=BREAKFAST_COSTING!$G$27"]];
checks.getRange("C44").formulas = [["=BREAKFAST_COSTING!$I$27"]];
checks.getRange("D43").formulas = [["='01_ВВОД'!$D$142"]];
checks.getRange("D44").formulas = [["='01_ВВОД'!$D$143"]];
checks.getRange("D46").formulas = [[
  "=ABS('01_ВВОД'!$D$156-22)+ABS('01_ВВОД'!$D$157-21)+ABS('01_ВВОД'!$D$158-20)+ABS('03_ДОХОДЫ'!$P$22-7300)+ABS('04_СЕБЕСТОИМОСТЬ'!$P$15-'03_ДОХОДЫ'!$P$22*'01_ВВОД'!$D$142)",
]];
checks.getRange("G46").values = [[
  "20 оплачиваемых обслуживаний; выпуск 22/21; финансовый COGS только для 7 300 оплаченных завтраков",
]];
checks.getRange("A46:G46").copyTo(checks.getRange("A47:G47"), "all");
setRow(checks, 47, {
  A: "CHK.BREAKFAST.NORMS",
  B: "Нормы калькуляции равны BREAKFAST_RECIPES",
  C: 0,
  G: "D4:D19 связаны формулами с BREAKFAST_RECIPES!F4:F19",
});
const normTerms = Array.from(
  { length: 16 },
  (_, index) => {
    const row = index + 4;
    return `ABS('BREAKFAST_COSTING'!D${row}-'BREAKFAST_RECIPES'!F${row})`;
  },
);
checks.getRange("D47").formulas = [[`=${normTerms.join("+")}`]];
checks.getRange("E47").formulas = [["=D47-C47"]];
checks.getRange("F47").formulas = [['=IF(ABS(E47)<0.0001,"OK","ОШИБКА")']];
checks.getRange("A46:G46").copyTo(checks.getRange("A48:G48"), "all");
setRow(checks, 48, {
  A: "CHK.BREAKFAST.OATMEAL_250",
  B: "Сумма аналитических выходов овсяной каши равна 250 г",
  C: 0,
  G: "BREAKFAST_RECIPES!J11:J16 = 45 + 108 + 86 + 5 + 5 + 1 = 250 г; брутто F11:F16 не изменяется",
});
checks.getRange("D48").formulas = [["=ABS(SUM('BREAKFAST_RECIPES'!J11:J16)-250)"]];
checks.getRange("E48").formulas = [["=D48-C48"]];
checks.getRange("F48").formulas = [['=IF(ABS(E48)<0.0001,"OK","ОШИБКА")']];
checks.getRange("A48:G48").format.rowHeight = 44;
checks.getRange("A48:G48").format.wrapText = true;
checks.getRange("A1:A48").format.columnWidth = 32;
checks.getRange("B1:B48").format.columnWidth = 46;
checks.getRange("G1:G48").format.columnWidth = 72;

// P&L memo block for the whole Hotel direction.
const pnl = workbook.worksheets.getItem("07_PNL_НАЛОГИ");
pnl.getRange("A43:Q43").copyTo(pnl.getRange("A48:Q48"), "all");
for (let row = 49; row <= 57; row += 1) {
  pnl.getRange("A44:Q44").copyTo(pnl.getRange(`A${row}:Q${row}`), "all");
}
pnl.getRange("A48").values = [[
  "МЕМО-КОНТУР ГОСТИНИЦА — ЗАВТРАКИ И УЖИНЫ УЧТЕНЫ В ИТОГАХ КАФЕ",
]];
setRow(pnl, 49, { A: "PNL.HOTEL.BREAKFAST.REV", B: "Кафе — Гостиница", C: "Выручка завтраков" });
setRow(pnl, 50, { A: "PNL.HOTEL.BREAKFAST.COGS", B: "Кафе — Гостиница", C: "Прямой COGS завтраков" });
setRow(pnl, 51, { A: "PNL.HOTEL.BREAKFAST.CONTRIB", B: "Кафе — Гостиница", C: "Прямой результат завтраков" });
setRow(pnl, 52, { A: "PNL.HOTEL.DINNER.REV", B: "Кафе — Гостиница", C: "Выручка ужинов" });
setRow(pnl, 53, { A: "PNL.HOTEL.DINNER.COGS", B: "Кафе — Гостиница", C: "Прямой COGS ужинов" });
setRow(pnl, 54, { A: "PNL.HOTEL.DINNER.CONTRIB", B: "Кафе — Гостиница", C: "Прямой результат ужинов" });
setRow(pnl, 55, { A: "PNL.HOTEL.TOTAL.REV", B: "Кафе — Гостиница", C: "Итого выручка направления" });
setRow(pnl, 56, { A: "PNL.HOTEL.TOTAL.COGS", B: "Кафе — Гостиница", C: "Итого прямой COGS направления" });
setRow(pnl, 57, { A: "PNL.HOTEL.TOTAL.CONTRIB", B: "Кафе — Гостиница", C: "Итого прямой результат направления" });
setMonthlyFormulas(pnl, 49, (column) => `='03_ДОХОДЫ'!${column}24`);
setMonthlyFormulas(pnl, 50, (column) => `='04_СЕБЕСТОИМОСТЬ'!${column}15`);
setMonthlyFormulas(pnl, 51, (column) => `=${column}49-${column}50`);
setMonthlyFormulas(pnl, 52, (column) => `='03_ДОХОДЫ'!${column}41`);
setMonthlyFormulas(pnl, 53, (column) => `='04_СЕБЕСТОИМОСТЬ'!${column}42`);
setMonthlyFormulas(pnl, 54, (column) => `=${column}52-${column}53`);
setMonthlyFormulas(pnl, 55, (column) => `=${column}49+${column}52`);
setMonthlyFormulas(pnl, 56, (column) => `=${column}50+${column}53`);
setMonthlyFormulas(pnl, 57, (column) => `=${column}55-${column}56`);
pnl.getRange("A1:A57").format.columnWidth = 32;
pnl.getRange("B1:B57").format.columnWidth = 24;
pnl.getRange("C1:C57").format.columnWidth = 42;

await fs.mkdir(path.dirname(TARGET), { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(TARGET);
console.log(JSON.stringify({ source: SOURCE, target: TARGET, sheets: 19 }));
