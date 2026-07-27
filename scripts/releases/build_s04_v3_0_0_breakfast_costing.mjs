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
inputs.getRange("C11:G11").values = [[
  "Предельное число мест, требующее подтверждения планировкой",
  26,
  "мест",
  "Требует подтверждения",
  "V-I-040: подтвердить планировкой и эвакуационными требованиями; расчётная база остаётся 20 мест",
]];
inputs.getRange("C15:G15").values = [[
  "Ставка НДС — блокирующий налоговый input",
  0,
  "%",
  "Блокирующий input",
  "V-I-054: временно 0%; расчёты выполняются в ценах с НДС до отдельного налогового решения",
]];
inputs.getRange("C24:G24").values = [[
  "Плановый food cost À la carte до рецептурного расчёта",
  0.3,
  "% выручки",
  "Предварительный норматив",
  "V-I-053: заменить расчётом сырья брутто по 31 активной позиции",
]];
inputs.getRange("C29:G29").values = [[
  "Предварительный food cost Бизнес-ланча",
  null,
  "% выручки",
  "Предварительный расчёт",
  "Прокси от планового food cost À la carte и скидки; заменить рецептурным расчётом по V-I-053",
]];
inputs.getRange("D29").formulas = [["='01_ВВОД'!$D$24/(1-'01_ВВОД'!$D$27)"]];
inputs.getRange("C35:G35").values = [[
  "Плановый food cost Доставки до рецептурного расчёта",
  0.3,
  "% выручки",
  "Предварительный норматив",
  "V-I-053: заменить рецептурной себестоимостью доставочного ассортимента после испытаний",
]];
inputs.getRange("C42:G42").values = [[
  "Временный прокси food cost Навыноса",
  null,
  "% выручки",
  "Предварительный прокси",
  "V-I-027/V-I-053: текущая формула не является рецептурной себестоимостью хлеба и десертов",
]];
inputs.getRange("D42").formulas = [["='01_ВВОД'!$D$24/(1-'01_ВВОД'!$D$41)"]];
inputs.getRange("F49:G49").values = [[
  "Требует документа",
  "Нулевой эквайринг следует из внутреннего тарифа; подтвердить договорным порядком расчётов с Гостиницей",
]];
inputs.getRange("C55:G55").values = [[
  "Предельный food cost БАНКЕТОВ до фактической калькуляции",
  0.4,
  "% выручки",
  "Предварительный норматив",
  "V-I-053: лимит 40%; заменить фактической себестоимостью стандартного банкета после контрольной проработки",
]];
inputs.getRange("F101:G102").values = [
  ["Требует расчёта", "Нулевое значение временно; получить договор/тариф и включить фактический расход"],
  ["Требует расчёта", "Нулевое значение временно; определить текстиль, периодичность и тариф стирки"],
];
inputs.getRange("F88:G90").values = [
  ["Требует основания", "Нулевое значение требует подтверждения гарантией или договором обслуживания"],
  ["Требует основания", "Нулевое значение требует подтверждения договором аренды кассового оборудования"],
  ["Требует основания", "Нулевое значение требует подтверждения договором поставщика кофемашины"],
];
inputs.getRange("F107:G107").values = [[
  "Требует расчёта",
  "Нулевое значение временно; определить формат юридического сопровождения и тариф",
]];
inputs.getRange("A117").values = [[
  "S04 v3.0.0 — НАСЛЕДОВАННЫЕ ОПЕРАЦИОННЫЕ ПРАВИЛА S02/S03",
]];
inputs.getRange("B118:B119").values = [["Операционные правила"], ["Операционные правила"]];
inputs.getRange("F119:G119").values = [[
  "Операционное правило",
  "Граница 17:00 применяется в расписании банкетного дня; дневная P&L не содержит почасового расчёта",
]];
inputs.getRange("C122:G122").values = [[
  "Предварительный food cost гостиничного ужина",
  null,
  "% выручки",
  "Предварительный расчёт",
  "Прокси от À la carte; заменить рецептурным расчётом по V-I-053",
]];
inputs.getRange("D122").formulas = [["='01_ВВОД'!$D$24"]];
inputs.getRange("D6").formulas = [["=DATE(YEAR(D5)+1,MONTH(D5),DAY(D5))-1"]];
inputs.getRange("D5:D6").format.numberFormat = "dd.mm.yyyy";
inputs.getRange("D50").format.numberFormat = "dd.mm.yyyy";
inputs.getRange("D47").formulas = [["='01_ВВОД'!$D$143"]];
inputs.getRange("G47").values = [[
  "Канонический food cost завтрака; формула от полной прямой себестоимости и тарифа",
]];
inputs.getRange("D133").formulas = [["=SUM(D169:D175)"]];
inputs.getRange("D134").formulas = [[
  "=COUNTIF('02_КАЛЕНДАРЬ'!$D$5:$D$369,1)*D169+COUNTIF('02_КАЛЕНДАРЬ'!$D$5:$D$369,2)*D170+COUNTIF('02_КАЛЕНДАРЬ'!$D$5:$D$369,3)*D171+COUNTIF('02_КАЛЕНДАРЬ'!$D$5:$D$369,4)*D172+COUNTIF('02_КАЛЕНДАРЬ'!$D$5:$D$369,5)*D173+COUNTIF('02_КАЛЕНДАРЬ'!$D$5:$D$369,6)*D174+COUNTIF('02_КАЛЕНДАРЬ'!$D$5:$D$369,7)*D175",
]];
inputs.getRange("G134").values = [[
  "Сумма календарных дневных программ; не укрупнённое 84 × 52",
]];
inputs.getRange("D135").formulas = [["=D133*0.65"]];
inputs.getRange("D136").formulas = [["=D133*0.2"]];
inputs.getRange("D138").formulas = [["=COUNTIF(D144:D146,\">0\")"]];
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
inputs.getRange("F141:F143").values = [
  ["Предварительно"],
  ["Предварительный расчёт"],
  ["Предварительный расчёт"],
];
inputs.getRange("G147:G149").values = [
  ["Кухня 131,282668 + напиток 60"],
  ["Кухня 163,194668 + напиток 60"],
  ["Кухня 133,483718 + напиток 60"],
];
inputs.getRange("D153").formulas = [["=65-(33-D152)"]];
inputs.getRange("D154").formulas = [["=656-(33-D152)*10"]];
inputs.getRange("D155").formulas = [["=176.3-3-2"]];
inputs.getRange("D164").formulas = [["=(8*D160+8*D161+6*D162)/1000"]];
inputs.getRange("D165").formulas = [["=(8*D160+8*D161+5*D162)/1000"]];
inputs.getRange("D166").formulas = [["=(8*D160+7*D161+5*D162)/1000"]];
inputs.getRange("D167").formulas = [["=(7*D160+8*D161+5*D162)/1000"]];
inputs.getRange("A168:G168").values = [[
  "S04 v3.0.0 — ДНЕВНАЯ ПРОГРАММА ПИТАНИЯ СОТРУДНИКОВ",
  null, null, null, null, null, null,
]];
inputs.getRange("A168:G168").format = {
  fill: "#17365D",
  font: { bold: true, color: "#FFFFFF", name: "Arial" },
};
const staffMealDayRows = [
  [169, "STAFF_MEALS_MON", "Понедельник", 12],
  [170, "STAFF_MEALS_TUE", "Вторник", 12],
  [171, "STAFF_MEALS_WED", "Среда", 11],
  [172, "STAFF_MEALS_THU", "Четверг", 11],
  [173, "STAFF_MEALS_FRI", "Пятница", 13],
  [174, "STAFF_MEALS_SAT", "Суббота", 14],
  [175, "STAFF_MEALS_SUN", "Воскресенье", 11],
];
for (const [row, code, day, quantity] of staffMealDayRows) {
  setRow(inputs, row, {
    A: code,
    B: "Питание сотрудников",
    C: `Комплексов — ${day}`,
    D: quantity,
    E: "комплексов/день",
    F: "Подтверждено",
    G: "Утверждённая базовая недельная программа; резерв не применяется",
  });
  inputs.getRange(`A${row}:G${row}`).format = {
    font: { name: "Arial" },
    wrapText: true,
    verticalAlignment: "top",
    borders: { preset: "all", style: "thin", color: "#D9E2F3" },
  };
}
inputs.getRange("A1:A175").format.columnWidth = 34;
inputs.getRange("B1:B175").format.columnWidth = 24;
inputs.getRange("C1:C175").format.columnWidth = 42;
inputs.getRange("G1:G175").format.columnWidth = 64;

// Calendar dates are governed by START_DATE/END_DATE; banquet dates remain
// explicit day-level inputs and are reconciled to the approved annual targets.
const calendar = workbook.worksheets.getItem("02_КАЛЕНДАРЬ");
calendar.getRange("A1").formulas = [[
  '="Календарь операционной модели: "&RIGHT("0"&DAY(\'01_ВВОД\'!$D$5),2)&"."&RIGHT("0"&MONTH(\'01_ВВОД\'!$D$5),2)&"."&YEAR(\'01_ВВОД\'!$D$5)&"–"&RIGHT("0"&DAY(\'01_ВВОД\'!$D$6),2)&"."&RIGHT("0"&MONTH(\'01_ВВОД\'!$D$6),2)&"."&YEAR(\'01_ВВОД\'!$D$6)',
]];
calendar.getRange("A5").formulas = [["='01_ВВОД'!$D$5"]];
for (let row = 5; row <= 369; row += 1) {
  if (row > 5) calendar.getRange(`A${row}`).formulas = [[`=A${row - 1}+1`]];
  calendar.getRange(`B${row}`).formulas = [[
    `=12*(YEAR(A${row})-YEAR($A$5))+MONTH(A${row})-MONTH($A$5)+1`,
  ]];
  calendar.getRange(`C${row}`).formulas = [[
    `=CHOOSE(MONTH(A${row}),"Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек")&"-"&RIGHT(YEAR(A${row}),2)`,
  ]];
  calendar.getRange(`D${row}`).formulas = [[`=WEEKDAY(A${row},2)`]];
  calendar.getRange(`E${row}`).formulas = [[
    `=CHOOSE(D${row},"Пн","Вт","Ср","Чт","Пт","Сб","Вс")`,
  ]];
}
calendar.getRange("A5:A369").format.numberFormat = "dd.mm.yyyy";

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
checks.getRange("A20").values = [["S03 — Бизнес-ланч"]];
checks.getRange("A27").values = [[
  "S04 v3.0.0: 31 активная позиция; прозрачная калькуляция трёх гостиничных завтраков.",
]];
checks.getRange("C43").formulas = [["=BREAKFAST_COSTING!$G$27"]];
checks.getRange("C44").formulas = [["=BREAKFAST_COSTING!$I$27"]];
checks.getRange("D43").formulas = [["='01_ВВОД'!$D$142"]];
checks.getRange("D44").formulas = [["='01_ВВОД'!$D$143"]];
checks.getRange("B37").values = [["Комплексы питания сотрудников за операционный год"]];
checks.getRange("C37").formulas = [[
  "=COUNTIF('02_КАЛЕНДАРЬ'!$D$5:$D$369,1)*'01_ВВОД'!$D$169+COUNTIF('02_КАЛЕНДАРЬ'!$D$5:$D$369,2)*'01_ВВОД'!$D$170+COUNTIF('02_КАЛЕНДАРЬ'!$D$5:$D$369,3)*'01_ВВОД'!$D$171+COUNTIF('02_КАЛЕНДАРЬ'!$D$5:$D$369,4)*'01_ВВОД'!$D$172+COUNTIF('02_КАЛЕНДАРЬ'!$D$5:$D$369,5)*'01_ВВОД'!$D$173+COUNTIF('02_КАЛЕНДАРЬ'!$D$5:$D$369,6)*'01_ВВОД'!$D$174+COUNTIF('02_КАЛЕНДАРЬ'!$D$5:$D$369,7)*'01_ВВОД'!$D$175",
]];
checks.getRange("G37").values = [[
  "Независимый календарный пересчёт дневной программы; без производственного резерва",
]];
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
const structuralChecks = [
  {
    row: 49,
    code: "CHK.CALENDAR.HORIZON",
    label: "Календарь связан с START_DATE и END_DATE",
    formula: "=ABS('02_КАЛЕНДАРЬ'!A5-'01_ВВОД'!D5)+ABS('02_КАЛЕНДАРЬ'!A369-'01_ВВОД'!D6)+ABS(COUNT('02_КАЛЕНДАРЬ'!A5:A369)-('01_ВВОД'!D6-'01_ВВОД'!D5+1))",
    note: "365 последовательных дат; начало и окончание управляются 01_ВВОД",
  },
  {
    row: 50,
    code: "CHK.BANQUET.COUNT",
    label: "Количество и дата начала банкетов",
    formula: "=ABS(SUM('02_КАЛЕНДАРЬ'!H5:H369)-'01_ВВОД'!D52)+COUNTIFS('02_КАЛЕНДАРЬ'!A5:A369,\"<\"&'01_ВВОД'!D50,'02_КАЛЕНДАРЬ'!H5:H369,1)",
    note: "60 событий; до BANQ_START банкетов нет",
  },
  {
    row: 51,
    code: "CHK.BANQUET.MONTHLY",
    label: "Шесть банкетов в месяц с ноября по август",
    formula: `=${Array.from(
      { length: 10 },
      (_, index) => `ABS(COUNTIFS('02_КАЛЕНДАРЬ'!B$5:B$369,${index + 3},'02_КАЛЕНДАРЬ'!H$5:H$369,1)-'01_ВВОД'!D51)`,
    ).join("+")}`,
    note: "Месяцы 3–12 операционного года сверяются с BANQ_PER_MONTH",
  },
  {
    row: 52,
    code: "CHK.BANQUET.MIX",
    label: "Распределение банкетов по группам дней",
    formula: "=ABS(COUNTIF('02_КАЛЕНДАРЬ'!I5:I369,\"Пт–Вс\")/SUM('02_КАЛЕНДАРЬ'!H5:H369)-'01_ВВОД'!D58)+ABS(COUNTIF('02_КАЛЕНДАРЬ'!I5:I369,\"Пн–Чт\")/SUM('02_КАЛЕНДАРЬ'!H5:H369)-'01_ВВОД'!D59)",
    note: "42 события Пт–Вс и 18 событий Пн–Чт",
  },
  {
    row: 53,
    code: "CHK.STAFF.CALENDAR",
    label: "Годовое питание сотрудников из дневной программы",
    formula: "=ABS('01_ВВОД'!D134-(COUNTIF('02_КАЛЕНДАРЬ'!D5:D369,1)*'01_ВВОД'!D169+COUNTIF('02_КАЛЕНДАРЬ'!D5:D369,2)*'01_ВВОД'!D170+COUNTIF('02_КАЛЕНДАРЬ'!D5:D369,3)*'01_ВВОД'!D171+COUNTIF('02_КАЛЕНДАРЬ'!D5:D369,4)*'01_ВВОД'!D172+COUNTIF('02_КАЛЕНДАРЬ'!D5:D369,5)*'01_ВВОД'!D173+COUNTIF('02_КАЛЕНДАРЬ'!D5:D369,6)*'01_ВВОД'!D174+COUNTIF('02_КАЛЕНДАРЬ'!D5:D369,7)*'01_ВВОД'!D175))",
    note: "Месячные и годовые количества формируются календарным суммированием",
  },
  {
    row: 54,
    code: "CHK.COGS.PROXY_STATUS",
    label: "Укрупнённые COGS не обозначены как фактические",
    formula: "=COUNTIF('01_ВВОД'!F24,\"Подтверждено\")+COUNTIF('01_ВВОД'!F29,\"Подтверждено\")+COUNTIF('01_ВВОД'!F35,\"Подтверждено\")+COUNTIF('01_ВВОД'!F42,\"Подтверждено\")+COUNTIF('01_ВВОД'!F55,\"Подтверждено\")+COUNTIF('01_ВВОД'!F122,\"Подтверждено\")",
    note: "V-I-053 остаётся BLOCKED до рецептурного расчёта 31 позиции",
  },
  {
    row: 55,
    code: "CHK.BREAKFAST.FC_ALIAS",
    label: "Единый food cost гостиничного завтрака",
    formula: "=ABS('01_ВВОД'!D47-'01_ВВОД'!D143)",
    note: "HOTEL_BREAKFAST_COGS и HOTEL_BREAKFAST_RECIPE_FC синхронизированы",
  },
  {
    row: 56,
    code: "CHK.OPEN_INPUTS.VISIBLE",
    label: "Блокирующие inputs отображены явно",
    formula: "=ABS(COUNTIF('01_ВВОД'!F11,\"Требует подтверждения\")+COUNTIF('01_ВВОД'!F15,\"Блокирующий input\")-2)",
    note: "Открыты V-I-040 по 26 местам и V-I-054 по НДС; значения не выданы за утверждённые",
  },
];
for (const item of structuralChecks) {
  checks.getRange("A46:G46").copyTo(checks.getRange(`A${item.row}:G${item.row}`), "all");
  setRow(checks, item.row, {
    A: item.code,
    B: item.label,
    C: 0,
    G: item.note,
  });
  checks.getRange(`D${item.row}`).formulas = [[item.formula]];
  checks.getRange(`E${item.row}`).formulas = [[`=D${item.row}-C${item.row}`]];
  checks.getRange(`F${item.row}`).formulas = [[
    `=IF(ABS(E${item.row})<0.0001,"OK","ОШИБКА")`,
  ]];
  checks.getRange(`A${item.row}:G${item.row}`).format.rowHeight = 44;
  checks.getRange(`A${item.row}:G${item.row}`).format.wrapText = true;
}
checks.getRange("A1:A56").format.columnWidth = 32;
checks.getRange("B1:B56").format.columnWidth = 46;
checks.getRange("G1:G56").format.columnWidth = 72;

// Replace static summary rows with direct links to canonical inputs.
const kitchenProgram = workbook.worksheets.getItem("14_ПРОГРАММА_КУХНИ");
kitchenProgram.getRange("A2").values = [[
  "S04 v3.0.0: 31 активная позиция; производственные показатели связаны с каноническими inputs. Закупочные цены и часть выходов остаются предварительными.",
]];
kitchenProgram.getRange("B9:C9").formulas = [
  ["='01_ВВОД'!$D$156*7", "='01_ВВОД'!$D$157*7"],
];
kitchenProgram.getRange("B10:C10").formulas = [
  ["='01_ВВОД'!$D$133", "='01_ВВОД'!$D$133"],
];
kitchenProgram.getRange("B11:C11").formulas = [
  ["='01_ВВОД'!$D$135", "='01_ВВОД'!$D$135"],
];
kitchenProgram.getRange("B12:C12").formulas = [
  ["='01_ВВОД'!$D$136", "='01_ВВОД'!$D$136"],
];
kitchenProgram.getRange("B23").formulas = [["='01_ВВОД'!$D$153&\" партии / \"&TEXT('01_ВВОД'!$D$155,\"0.00\")&\" кг\""]];

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
