import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = process.argv[2];
const previewDir = process.argv[3];
const mode = process.argv[4] ?? "overview";

if (!inputPath || !previewDir) {
  throw new Error("Usage: node varshavka_tableware_model.mjs <input.xlsx> <preview-dir>");
}

await fs.mkdir(previewDir, { recursive: true });
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));

if (mode === "help-hyperlink") {
  console.log(workbook.help("fx.HYPERLINK", {
    include: "index,examples,notes",
    maxChars: 3000,
  }).ndjson);
  process.exit(0);
}

if (mode === "build") {
  const outputPath = process.argv[5];
  if (!outputPath) {
    throw new Error("Build mode requires an output path as the fifth argument.");
  }

  const repoBase = "https://github.com/slavagrachov/varshavka-cafe-usali-model/blob/main";
  const sourceHall = `${repoBase}/sources/tableware/2026-07-25_complexbar_hall_tableware.eml`;
  const sourceBar = `${repoBase}/sources/tableware/2026-07-25_complexbar_bar_glassware.eml`;
  const sourceRegister = `${repoBase}/sources/tableware/2026-07-25_complexbar_tableware_register.csv`;

  const items = [
    ["Зал", "Фарфор", "03011857", "Тарелка «Кунстверк» мелкая без борта, D=260 мм", "Тарелки", 60, 620, 2.0, 0.03, "Совместное", "https://complexbar.ru/product/tarelka-melkaya-bez-borta-kunstwerk-03011857/"],
    ["Зал", "Фарфор", "03011456", "Тарелка «Кунстверк» мелкая без борта, D=230 мм", "Тарелки", 60, 412, 2.0, 0.03, "Совместное", "https://complexbar.ru/product/tarelka-melkaya-bez-borta-kunstwerk-03011456/"],
    ["Зал", "Фарфор", "03010413", "Тарелка «Кунстверк» мелкая без борта, D=175 мм", "Тарелки", 60, 182, 2.0, 0.03, "Совместное", "https://complexbar.ru/product/tarelka-melkaya-bez-borta-kunstwerk-03010413/"],
    ["Зал", "Фарфор", "03010981", "Тарелка глубокая «Кунстверк», 400 мл", "Тарелки", 60, 483, 2.0, 0.03, "Совместное", "https://complexbar.ru/product/tarelka-glubokaya-kunstwerk-03010981/"],
    ["Зал", "Фарфор", "03140689", "Чайная пара «Кунстверк», 200 мл", "Чайные пары", 60, 298, 1.5, 0.03, "Совместное", "https://complexbar.ru/product/para-chaynaya-kunstwerk-03140689/"],
    ["Зал", "Фарфор", "03150420", "Чайник заварочный «Кунстверк», 0,8 л", "Чайники", 30, 475, 0.5, 0.03, "Совместное", "https://complexbar.ru/product/chaynik-kunstwerk-03150420/"],
    ["Зал", "Фарфор", "03040142", "Соусник «Кунстверк», 100 мл", "Соусники", 24, 82, 0.5, 0.03, "Совместное", "https://complexbar.ru/product/sousnik-kunstwerk-03040142/"],
    ["Зал", "Фарфор", "03173703", "Набор для специй «Кунстверк» на подставке", "Настольные наборы", 15, 557, 0.35, 0.03, "Совместное", "https://complexbar.ru/product/nabor-d-speciy-3-predm-na-podstavke-kunstwerk-03173703/"],
    ["Зал", "Фарфор", "03172334", "Салфетница «Кунстверк»", "Настольные наборы", 20, 314, 0.35, 0.03, "Совместное", "https://complexbar.ru/product/salfetnica-kunstwerk-03172334/"],
    ["Зал", "Фарфор", "03130448", "Кофейная пара «Кунстверк», 70 мл", "Кофейные пары", 60, 190, 1.0, 0.03, "Совместное", "https://complexbar.ru/product/para-kofeynaya-kunstwerk-03130448/"],
    ["Зал", "Фарфор", "03130278", "Кофейная пара «Кунстверк», 150 мл", "Кофейные пары", 60, 271, 1.0, 0.03, "Совместное", "https://complexbar.ru/product/para-kofeynaya-kunstwerk-03130278/"],
    ["Зал", "Фарфор", "03171983", "Сахарница «Кунстверк» с крышкой, 250 мл", "Настольные наборы", 12, 304, 0.35, 0.03, "Совместное", "https://complexbar.ru/product/saharnica-s-kryshkoy-kunstwerk-03171983/"],
    ["Зал", "Нержавеющая сталь", "03112213", "Вилка столовая «Оптима»", "Столовые приборы", 72, 50, 2.0, 0.01, "Совместное", "https://complexbar.ru/product/vilka-stolovaya-kunstwerk-03112213/"],
    ["Зал", "Нержавеющая сталь", "03111782", "Ложка чайная «Аркада Бэйсик»", "Столовые приборы", 72, 123, 2.0, 0.01, "Совместное", "https://complexbar.ru/product/lozhka-chaynaya-kunstwerk-03111782/"],
    ["Зал", "Нержавеющая сталь", "03114123", "Нож столовый «Дистрикт Сильвер Мэтт»", "Столовые приборы", 72, 331, 2.0, 0.01, "Совместное", "https://complexbar.ru/product/nozh-stolovyy-kunstwerk-03114123/"],
    ["Зал", "Нержавеющая сталь", "03110167", "Ложка столовая «Адажио»", "Столовые приборы", 72, 504, 2.0, 0.01, "Совместное", "https://complexbar.ru/product/lozhka-stolovaya-eternum-03110167/"],
    ["Бар", "Стекло", "01011643", "Бокал для вина «Дистинкшн», 380 мл", "Барное стекло", 72, 473, 2.0, 0.04, "Совместное", "https://complexbar.ru/product/bokal-dlya-vina-chef-and-sommelier-01011643/"],
    ["Бар", "Стекло", "01060610", "Шампанское-блюдце «Каберне», 300 мл", "Барное стекло", 72, 593, 2.0, 0.04, "Совместное", "https://complexbar.ru/product/shampan-blyudce-chef-and-sommelier-01060610/"],
    ["Бар", "Стекло", "01071637", "Рюмка «Ресто», 60 мл", "Барное стекло", 72, 88, 2.0, 0.04, "Совместное", "https://complexbar.ru/product/ryumka-pasabahce-01071637/"],
    ["Бар", "Стекло", "01020542", "Олд фэшн «Кортина», 400 мл", "Барное стекло", 60, 378, 2.0, 0.04, "Совместное", "https://complexbar.ru/product/old-feshn-bormioli-rocco-01020542/"],
    ["Бар", "Стекло", "01011610", "Хайбол «Аморф», 400 мл", "Барное стекло", 72, 164, 2.0, 0.04, "Совместное", "https://complexbar.ru/product/haybol-pasabahce-01011610/"],
  ];

  const titleStyle = {
    fill: "#17365D",
    font: { bold: true, color: "#FFFFFF", size: 15, name: "Carlito" },
    verticalAlignment: "center",
  };
  const sectionStyle = {
    fill: "#1F4E78",
    font: { bold: true, color: "#FFFFFF", size: 11, name: "Carlito" },
    verticalAlignment: "center",
  };
  const headerStyle = {
    fill: "#1F4E78",
    font: { bold: true, color: "#FFFFFF", size: 10, name: "Carlito" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
  };
  const bodyStyle = {
    font: { size: 10, name: "Carlito" },
    verticalAlignment: "center",
    wrapText: true,
  };
  const totalStyle = {
    fill: "#D9EAD3",
    font: { bold: true, color: "#006100", size: 10, name: "Carlito" },
    verticalAlignment: "center",
  };

  const tableware = workbook.worksheets.add("11_ПОСУДА");
  const investments = workbook.worksheets.add("12_ЦЕНТР_ИНВЕСТИЦИЙ");

  tableware.getRange("A1:S1").merge();
  tableware.getRange("A1").values = [["VARSHAVKA — комплект посуды, достаточность и резерв на бой"]];
  tableware.getRange("A1:S1").format = titleStyle;
  tableware.getRange("A1:S1").format.rowHeight = 28;
  tableware.getRange("A2:S2").merge();
  tableware.getRange("A2").values = [[
    "Расчёт выполнен по максимальной вместимости 26 мест, фактическому прогнозу гостей сценария S03 и ежемесячному резерву на бой/поломку. Экспертная оценка Андрея Никитина: комплект минимально достаточен на 3–6 месяцев при возможности дозаказа.",
  ]];
  tableware.getRange("A2:S2").format = {
    fill: "#D9EAF7",
    font: { italic: true, color: "#595959", size: 10, name: "Carlito" },
    wrapText: true,
    verticalAlignment: "center",
  };
  tableware.getRange("A2:S2").format.rowHeight = 42;

  for (const range of ["A4:B4", "D4:E4", "G4:H4", "J4:L4", "N4:O4", "A5:B5", "D5:E5", "G5:H5", "J5:L5", "N5:O5", "A6:B6", "D6:E6", "G6:H6", "J6:L6", "N6:O6"]) {
    tableware.getRange(range).merge();
    tableware.getRange(range).format = { fill: "#D9EAF7", font: { bold: true, color: "#1F1F1F", size: 10, name: "Carlito" }, wrapText: true, verticalAlignment: "center" };
  }
  for (const range of ["P4:S4", "P5:S5", "P6:S6"]) {
    tableware.getRange(range).merge();
    tableware.getRange(range).format = bodyStyle;
  }
  tableware.getRange("A4:P6").values = [
    ["Прогноз гостей зала / год", null, null, "Расчётных мест", null, null, "Максимум мест", null, null, "Пиковый прогноз гостей / день", null, null, null, "Экспертная оценка", null, "3–6 месяцев"],
    ["Первоначальный заказ, руб.", null, null, "Резерв пополнения / мес., руб.", null, null, "Резерв пополнения / год, руб.", null, null, "Позиции с риском к 6 мес.", null, null, null, "Итог", null, null],
    ["Горизонт контроля, мес.", null, 6, "Исходная подборка — зал", null, "Открыть", "Исходная подборка — бар", null, "Открыть", "Единый реестр", null, null, "Открыть", "Ответственный центр", null, "Центр инвестиций VARSHAVKA"],
  ];
  tableware.getRange("A4:S6").format.rowHeight = 34;
  tableware.getRange("C4").formulas = [[
    "=SUM('02_КАЛЕНДАРЬ'!$M$5:$M$369,'02_КАЛЕНДАРЬ'!$N$5:$N$369,'02_КАЛЕНДАРЬ'!$R$5:$R$369,'02_КАЛЕНДАРЬ'!$U$5:$U$369)+SUM('02_КАЛЕНДАРЬ'!$S$5:$S$369)*'01_ВВОД'!$D$53",
  ]];
  tableware.getRange("F4").formulas = [["='01_ВВОД'!$D$10"]];
  tableware.getRange("I4").formulas = [["='01_ВВОД'!$D$11"]];
  tableware.getRange("M4").formulas = [[
    "=MAX('01_ВВОД'!$D$20+'01_ВВОД'!$D$26+'01_ВВОД'!$D$46+'01_ВВОД'!$D$46*'01_ВВОД'!$D$120,'01_ВВОД'!$D$21+'01_ВВОД'!$D$46+'01_ВВОД'!$D$46*'01_ВВОД'!$D$120,'01_ВВОД'!$D$22+'01_ВВОД'!$D$46+'01_ВВОД'!$D$46*'01_ВВОД'!$D$120,'01_ВВОД'!$D$19+'01_ВВОД'!$D$26+'01_ВВОД'!$D$46+'01_ВВОД'!$D$46*'01_ВВОД'!$D$120)",
  ]];
  tableware.getRange("C5").formulas = [["=SUM(I9:I29)"]];
  tableware.getRange("F5").formulas = [["=SUMPRODUCT(I9:I29,M9:M29)"]];
  tableware.getRange("I5").formulas = [["=F5*12"]];
  tableware.getRange("M5").formulas = [['=COUNTIF(Q9:Q29,"Нужен дозаказ")']];
  tableware.getRange("P5").formulas = [['=IF(COUNTIF(L9:L29,"Дефицит")=0,"Достаточно на старте; нужен плановый дозаказ","Есть дефицит на старте")']];
  tableware.getRange("C4:C6").format.numberFormat = "#,##0;[Red](#,##0);-";
  tableware.getRange("F4:F5").format.numberFormat = "#,##0;[Red](#,##0);-";
  tableware.getRange("I4:I5").format.numberFormat = "#,##0;[Red](#,##0);-";
  tableware.getRange("M4:M5").format.numberFormat = "#,##0;[Red](#,##0);-";
  tableware.getRange("F6").format = { font: { color: "#0563C1", underline: true, size: 10, name: "Carlito" } };
  tableware.getRange("I6").format = { font: { color: "#0563C1", underline: true, size: 10, name: "Carlito" } };
  tableware.getRange("M6").format = { font: { color: "#0563C1", underline: true, size: 10, name: "Carlito" } };

  const headers = [["№", "Подборка", "Материал", "Артикул", "Товар", "Категория", "Кол-во", "Цена, руб.", "Сумма, руб.", "Пар к макс. местам", "Нужно на старте", "Статус старта", "Бой/поломка в мес.", "Остаток через 6 мес.", "Норма через 6 мес.", "Запас / дефицит", "Статус через 6 мес.", "Использование", "Карточка товара"]];
  tableware.getRange("A8:S8").values = headers;
  tableware.getRange("A8:S8").format = headerStyle;
  tableware.getRange("A8:S8").format.rowHeight = 36;

  const rows = items.map((item, index) => {
    const [selection, material, sku, name, category, quantity, unitPrice, par, breakage, use, productUrl] = item;
    return [
      index + 1,
      selection,
      material,
      sku,
      name,
      category,
      quantity,
      unitPrice,
      null,
      par,
      null,
      null,
      breakage,
      null,
      null,
      null,
      null,
      use,
      null,
    ];
  });
  tableware.getRange("A9:S29").values = rows;
  tableware.getRange("A9:S29").format = bodyStyle;
  for (let row = 9; row <= 29; row += 1) {
    tableware.getRange(`I${row}`).formulas = [[`=G${row}*H${row}`]];
    tableware.getRange(`K${row}`).formulas = [[`=ROUNDUP('01_ВВОД'!$D$11*J${row},0)`]];
    tableware.getRange(`L${row}`).formulas = [[`=IF(G${row}>=K${row},"Достаточно","Дефицит")`]];
    tableware.getRange(`N${row}`).formulas = [[`=ROUND(G${row}*(1-M${row})^$C$6,1)`]];
    tableware.getRange(`O${row}`).formulas = [[`=K${row}`]];
    tableware.getRange(`P${row}`).formulas = [[`=N${row}-O${row}`]];
    tableware.getRange(`Q${row}`).formulas = [[`=IF(P${row}>=0,"Достаточно","Нужен дозаказ")`]];
    tableware.getRange(`S${row}`).values = [["Открыть"]];
  }
  tableware.getRange("A30:S30").values = [["ИТОГО", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]];
  tableware.getRange("G30").formulas = [["=SUM(G9:G29)"]];
  tableware.getRange("I30").formulas = [["=SUM(I9:I29)"]];
  tableware.getRange("N30").formulas = [["=SUM(N9:N29)"]];
  tableware.getRange("P30").formulas = [["=SUM(P9:P29)"]];
  tableware.getRange("Q30").formulas = [['=COUNTIF(Q9:Q29,"Нужен дозаказ")&" поз. требуют дозаказа"']];
  tableware.getRange("A30:S30").format = totalStyle;
  tableware.getRange("G9:G30").format.numberFormat = "#,##0";
  tableware.getRange("H9:I30").format.numberFormat = "#,##0;[Red](#,##0);-";
  tableware.getRange("J9:J29").format.numberFormat = "0.00";
  tableware.getRange("K9:K29").format.numberFormat = "#,##0";
  tableware.getRange("M9:M29").format.numberFormat = "0.0%";
  tableware.getRange("N9:P30").format.numberFormat = "#,##0.0;[Red](#,##0.0);-";
  tableware.getRange("S9:S29").format = { font: { color: "#0563C1", underline: true, size: 10, name: "Carlito" }, verticalAlignment: "center" };

  tableware.getRange("A32:S32").merge();
  tableware.getRange("A32").values = [["МЕТОДИКА ОЦЕНКИ"]];
  tableware.getRange("A32:S32").format = sectionStyle;
  tableware.getRange("A33:S36").values = [
    ["1", "Стартовая потребность рассчитана от 26 максимальных мест: 2,0 комплекта на место для основных тарелок, приборов и стекла; 1,0–1,5 для чашек; 0,35–0,5 для настольных принадлежностей.", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ["2", "Прогноз гостей учитывает а-ля карт, бизнес-ланч, завтраки/ужины гостиницы и участников банкетов. Пиковый день определяется по действующим входным параметрам; физический одновременный спрос ограничен 26 местами, а оборот обеспечивается мойкой между волнами обслуживания.", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ["3", "Рабочие нормы ежемесячной убыли: фарфор 3%, стекло 4%, столовые приборы 1% от стоимости имеющегося комплекта. Это управленческие допущения до накопления фактической статистики боя и поломок.", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ["4", "Вывод: стартовый комплект достаточен. Без дозаказа часть позиций приблизится к минимальному пар-уровню к шестому месяцу; при ежемесячном резерве и оперативном пополнении комплект соответствует экспертной оценке 3–6 месяцев.", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ];
  for (let row = 33; row <= 36; row += 1) {
    tableware.getRange(`B${row}:S${row}`).merge();
    tableware.getRange(`A${row}:S${row}`).format = bodyStyle;
    tableware.getRange(`A${row}:S${row}`).format.rowHeight = 34;
  }

  const widths = {
    A: 5, B: 10, C: 17, D: 12, E: 42, F: 18, G: 10, H: 12, I: 14,
    J: 13, K: 13, L: 14, M: 14, N: 15, O: 14, P: 14, Q: 18, R: 14, S: 14,
  };
  for (const [column, width] of Object.entries(widths)) {
    tableware.getRange(`${column}:${column}`).format.columnWidth = width;
  }

  investments.getRange("A1:H1").merge();
  investments.getRange("A1").values = [["VARSHAVKA — центр инвестиций: посуда и барное стекло"]];
  investments.getRange("A1:H1").format = titleStyle;
  investments.getRange("A1:H1").format.rowHeight = 28;
  investments.getRange("A2:H2").merge();
  investments.getRange("A2").values = [["Первоначальная закупка относится к центру инвестиций VARSHAVKA. Эксплуатационный резерв на бой и поломку относится на F&B Departmental Expenses и включён в P&L кафе."]];
  investments.getRange("A2:H2").format = { fill: "#D9EAF7", font: { italic: true, color: "#595959", size: 10, name: "Carlito" }, wrapText: true };
  investments.getRange("A2:H2").format.rowHeight = 34;
  investments.getRange("A4:H4").values = [["Код", "Статья", "Назначение", "Сумма, руб.", "Период", "Финансирование", "Использование", "Источник"]];
  investments.getRange("A4:H4").format = headerStyle;
  investments.getRange("A5:H9").values = [
    ["INV.TABLEWARE.HALL", "Посуда и приборы зала", "Первоначальная закупка", 254437, "До открытия", "Центр инвестиций VARSHAVKA", "КАФЕ / БАНКЕТЫ", null],
    ["INV.TABLEWARE.BAR", "Барное стекло", "Первоначальная закупка", 117576, "До открытия", "Центр инвестиций VARSHAVKA", "КАФЕ / БАНКЕТЫ", null],
    ["INV.TABLEWARE.INITIAL", "ИТОГО первоначальная закупка", "Капитальные вложения / запуск", null, "До открытия", "Центр инвестиций VARSHAVKA", "Совместное", "Реестр посуды"],
    ["INV.TABLEWARE.RESERVE.6M", "Резерв пополнения на 6 месяцев", "Бой и поломка", null, "6 месяцев", "Оборотный капитал", "Совместное", "Расчёт 11_ПОСУДА"],
    ["INV.TABLEWARE.FUNDING.6M", "ПОТРЕБНОСТЬ В ФИНАНСИРОВАНИИ НА 6 МЕСЯЦЕВ", "Первоначальная закупка + резерв", null, "6 месяцев", "Центр инвестиций VARSHAVKA", "Совместное", "Расчёт модели"],
  ];
  investments.getRange("H5").values = [["EML — зал"]];
  investments.getRange("H6").values = [["EML — бар"]];
  investments.getRange("D7").formulas = [["=SUM(D5:D6)"]];
  investments.getRange("D8").formulas = [["='11_ПОСУДА'!$F$5*'11_ПОСУДА'!$C$6"]];
  investments.getRange("D9").formulas = [["=D7+D8"]];
  investments.getRange("H7").values = [["CSV — реестр"]];
  investments.getRange("H5:H7").format = { font: { color: "#0563C1", underline: true, size: 10, name: "Carlito" }, verticalAlignment: "center" };
  investments.getRange("A5:H9").format = bodyStyle;
  investments.getRange("D5:D9").format.numberFormat = "#,##0;[Red](#,##0);-";
  investments.getRange("A7:H7").format = totalStyle;
  investments.getRange("A9:H9").format = totalStyle;
  investments.getRange("A11:H11").merge();
  investments.getRange("A11").values = [["УПРАВЛЕНЧЕСКИЙ УЧЁТ"]];
  investments.getRange("A11:H11").format = sectionStyle;
  investments.getRange("A12:H15").values = [
    ["1", "Первоначальная закупка не уменьшает операционную прибыль: она отражена в центре инвестиций.", null, null, null, null, null, null],
    ["2", "Ежемесячный резерв на бой и поломку уменьшает операционную прибыль кафе через строку OPEX.SMALLWARE.", null, null, null, null, null, null],
    ["3", "Фактический бой рекомендуется регистрировать по артикулу и ежемесячно заменять модельную норму фактом.", null, null, null, null, null, null],
    ["4", "Экспертная оценка 3–6 месяцев принимается при условии доступности оперативного дозаказа у поставщика.", null, null, null, null, null, null],
  ];
  for (let row = 12; row <= 15; row += 1) {
    investments.getRange(`B${row}:H${row}`).merge();
    investments.getRange(`A${row}:H${row}`).format = bodyStyle;
    investments.getRange(`A${row}:H${row}`).format.rowHeight = 30;
  }
  const investmentWidths = { A: 24, B: 38, C: 29, D: 16, E: 14, F: 28, G: 18, H: 18 };
  for (const [column, width] of Object.entries(investmentWidths)) {
    investments.getRange(`${column}:${column}`).format.columnWidth = width;
  }

  const opex = workbook.worksheets.getItem("06_OPEX_USALI");
  opex.getRange("C10").values = [["Малоценка, инвентарь и резерв на бой посуды"]];
  opex.getRange("R10").values = [["ежемесячно; 10 000 руб. малоценка + расчётный резерв 11_ПОСУДА"]];
  for (const column of "DEFGHIJKLMNO") {
    opex.getRange(`${column}10`).formulas = [[`='01_ВВОД'!$D$94+'11_ПОСУДА'!$F$5`]];
  }

  const summary = workbook.worksheets.getItem("00_РЕЗЮМЕ");
  summary.getRange("A1").values = [["VARSHAVKA — Сценарий S03 v0.1.5"]];
  summary.getRange("G5").values = [["Версия модели"]];
  summary.getRange("H5").values = [["S03 v0.1.5"]];
  summary.getRange("G5").format = { font: { color: "#008000", size: 11, name: "Carlito" }, wrapText: true };
  summary.getRange("H5").format = { font: { color: "#008000", size: 11, name: "Carlito" }, wrapText: true };
  summary.getRange("A34").values = [["5"]];
  summary.getRange("B34").values = [["Комплект посуды достаточен на старте; для сохранения пар-уровня на горизонте 3–6 месяцев предусмотрен ежемесячный резерв на бой и оперативный дозаказ."]];
  summary.getRange("A36:F36").merge();
  summary.getRange("A36").values = [["ИНВЕСТИЦИИ В ПОСУДУ"]];
  summary.getRange("A36:F36").format = sectionStyle;
  summary.getRange("A37:F39").values = [
    ["Первоначальная закупка, руб.", null, null, "Позиций в заказе", null, null],
    ["Резерв пополнения / мес., руб.", null, null, "Риск дозаказа к 6 мес.", null, null],
    ["Потребность на первые 6 мес., руб.", null, null, "Статус", null, null],
  ];
  summary.getRange("B37").formulas = [["='12_ЦЕНТР_ИНВЕСТИЦИЙ'!$D$7"]];
  summary.getRange("E37").formulas = [["=COUNTA('11_ПОСУДА'!$D$9:$D$29)"]];
  summary.getRange("B38").formulas = [["='11_ПОСУДА'!$F$5"]];
  summary.getRange("E38").formulas = [["='11_ПОСУДА'!$M$5"]];
  summary.getRange("B39").formulas = [["='12_ЦЕНТР_ИНВЕСТИЦИЙ'!$D$9"]];
  summary.getRange("E39").formulas = [["='11_ПОСУДА'!$P$5"]];
  summary.getRange("A37:F39").format = bodyStyle;
  summary.getRange("B37:B39").format.numberFormat = "#,##0;[Red](#,##0);-";
  summary.getRange("E37:E38").format.numberFormat = "#,##0";

  const checks = workbook.worksheets.getItem("08_ПРОВЕРКИ");
  checks.getRange("A28:G31").values = [
    ["CHK.TABLEWARE.TOTAL", "Первоначальная закупка посуды", 372013, null, null, null, "Сумма двух подборок Комплекс-Бар"],
    ["CHK.TABLEWARE.START", "Дефицит позиций на старте", 0, null, null, null, "Консервативный пар по максимуму 26 мест"],
    ["CHK.TABLEWARE.OPEX", "Годовой резерв на бой связан с OPEX", 0, null, null, null, "OPEX.SMALLWARE минус базовая малоценка"],
    ["CHK.TABLEWARE.FUNDING", "Потребность на 6 месяцев связана", 0, null, null, null, "Первоначальная закупка + 6 месяцев резерва"],
  ];
  checks.getRange("D28").formulas = [["='11_ПОСУДА'!$I$30"]];
  checks.getRange("E28").formulas = [["=D28-C28"]];
  checks.getRange("F28").formulas = [['=IF(ABS(E28)<0.01,"OK","ОШИБКА")']];
  checks.getRange("D29").formulas = [['=COUNTIF(\'11_ПОСУДА\'!$L$9:$L$29,"Дефицит")']];
  checks.getRange("E29").formulas = [["=D29-C29"]];
  checks.getRange("F29").formulas = [['=IF(E29=0,"OK","ОШИБКА")']];
  checks.getRange("D30").formulas = [["='06_OPEX_USALI'!$P$10-'01_ВВОД'!$D$94*12-'11_ПОСУДА'!$I$5"]];
  checks.getRange("E30").formulas = [["=D30-C30"]];
  checks.getRange("F30").formulas = [['=IF(ABS(E30)<0.01,"OK","ОШИБКА")']];
  checks.getRange("D31").formulas = [["='12_ЦЕНТР_ИНВЕСТИЦИЙ'!$D$9-'12_ЦЕНТР_ИНВЕСТИЦИЙ'!$D$7-'12_ЦЕНТР_ИНВЕСТИЦИЙ'!$D$8"]];
  checks.getRange("E31").formulas = [["=D31-C31"]];
  checks.getRange("F31").formulas = [['=IF(ABS(E31)<0.01,"OK","ОШИБКА")']];
  checks.getRange("A28:G31").format = bodyStyle;
  checks.getRange("C28:E31").format.numberFormat = "#,##0.00;[Red](#,##0.00);-";

  const formulaErrors = await workbook.inspect({
    kind: "match",
    searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
    options: { useRegex: true, maxResults: 300 },
    summary: "final formula error scan",
  });
  console.log("FORMULA_ERROR_SCAN");
  console.log(formulaErrors.ndjson);

  const keyChecks = await workbook.inspect({
    kind: "table",
    sheetId: "08_ПРОВЕРКИ",
    range: "A28:G31",
    include: "values,formulas",
    tableMaxRows: 10,
    tableMaxCols: 10,
  });
  console.log("TABLEWARE_CHECKS");
  console.log(keyChecks.ndjson);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const output = await SpreadsheetFile.exportXlsx(workbook);
  await output.save(outputPath);

  await fs.mkdir(previewDir, { recursive: true });
  const sheets = [];
  for (let index = 0; ; index += 1) {
    try {
      const sheet = workbook.worksheets.getItemAt(index);
      sheets.push(sheet.name);
    } catch {
      break;
    }
  }
  for (const sheetName of sheets) {
    const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 0.8, format: "png" });
    const safeName = sheetName.replaceAll(/[^A-Za-z0-9_-]+/g, "_");
    await fs.writeFile(
      path.join(previewDir, `${String(sheets.indexOf(sheetName) + 1).padStart(2, "0")}_${safeName}.png`),
      new Uint8Array(await preview.arrayBuffer()),
    );
  }
  console.log(JSON.stringify({ outputPath, sheets, previewDir }));
  process.exit(0);
}

if (mode === "targets") {
  const requestedSheet = process.argv[5];
  const requestedRange = process.argv[6];
  const targets = requestedSheet && requestedRange
    ? [[requestedSheet, requestedRange]]
    : [
        ["00_РЕЗЮМЕ", "A1:M40"],
        ["01_ВВОД", "A108:G130"],
        ["06_OPEX_USALI", "A1:R80"],
        ["07_PNL_НАЛОГИ", "A1:R60"],
        ["08_ПРОВЕРКИ", "A1:G45"],
      ];
  for (const [sheetId, range] of targets) {
    const result = await workbook.inspect({
      kind: "table,formula,computedStyle",
      sheetId,
      range,
      include: "values,formulas",
      maxChars: 18000,
      tableMaxRows: 90,
      tableMaxCols: 20,
      tableMaxCellChars: 160,
      options: { maxResults: 500 },
    });
    console.log(`TARGET ${sheetId}!${range}`);
    console.log(result.ndjson);
  }
  process.exit(0);
}

const overview = await workbook.inspect({
  kind: "workbook,sheet,table,drawing",
  maxChars: 20000,
  tableMaxRows: 8,
  tableMaxCols: 10,
  tableMaxCellChars: 120,
});
console.log("WORKBOOK_OVERVIEW");
console.log(overview.ndjson);

const sheets = [];
for (let index = 0; ; index += 1) {
  try {
    const sheet = workbook.worksheets.getItemAt(index);
    sheets.push(sheet.name);
  } catch {
    break;
  }
}

for (const sheetName of sheets) {
  const preview = await workbook.render({
    sheetName,
    autoCrop: "all",
    scale: 0.8,
    format: "png",
  });
  const safeName = sheetName.replaceAll(/[^A-Za-z0-9_-]+/g, "_");
  await fs.writeFile(
    path.join(previewDir, `${String(sheets.indexOf(sheetName) + 1).padStart(2, "0")}_${safeName}.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}

console.log(JSON.stringify({ sheets, previewDir }));
