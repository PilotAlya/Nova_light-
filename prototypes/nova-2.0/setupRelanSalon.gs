/**
 * Как получить НАСТОЯЩУЮ Google Таблицу с флажками (не Excel):
 *
 * 1. https://sheets.google.com → Создать → Пустая таблица.
 *    Назови: «РЭЛАН — салон».
 * 2. Расширения → Apps Script.
 *    Удали код в editor по умолчанию, вставь ЭТОТ файл целиком.
 * 3. Сохранить. Нажми Выполнить → функцию setupRelanSalon.
 *    Разреши доступ (свой аккаунт).
 * 4. Вернись на таблицу, обнови страницу. Меню «Nova» появится само.
 *
 * Я (Cursor) не могу нажать «создать» на твоём Диске — только ты.
 */

function setupRelanSalon() {
  const ss = SpreadsheetApp.getActive();
  ss.rename("РЭЛАН — салон");

  const names = [
    "Главная",
    "Кальк_веб",
    "Материалы_Лки",
    "Заказы",
    "Фурнитура",
    "Продажи",
    "Касса",
    "Задачи",
    "Поставщики",
    "Заявки_Рондо",
    "Заявки_Партнер",
    "Заявки_Васильево",
    "Цены_Лки",
    "Грузчики",
    "Шпаргалки",
  ];

  names.forEach((name) => {
    if (!ss.getSheetByName(name)) ss.insertSheet(name);
  });

  const leftover = ss.getSheets().filter((sh) => names.indexOf(sh.getName()) === -1);
  leftover.forEach((sh) => {
    if (ss.getSheets().length > 1) ss.deleteSheet(sh);
  });

  names.forEach((name, i) => ss.getSheetByName(name).setIndex(i + 1));

  fillSuppliers_(ss);
  fillMaterials_(ss);
  fillPrices_(ss);
  fillWebCalc_(ss);
  fillOrders_(ss);
  fillFittings_(ss);
  fillSales_(ss);
  fillCash_(ss);
  fillTasks_(ss);
  fillLoaders_(ss);
  fillCheats_(ss);
  fillRequests_(ss);
  fillHome_(ss);

  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert(
    "Готово. Открой лист «Кальк_веб»: там флажки. ИТОГО в ячейке B1.",
  );
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Nova")
    .addItem("Пересобрать таблицу (осторожно: перезапишет листы)", "setupRelanSalon")
    .addItem("Кальк_веб: добавить деталь", "addWebPart")
    .addItem("Кальк_веб: выключить все детали", "clearWebParts")
    .addItem("Кальк_веб: итог → Заказы", "webToOrders")
    .addToUi();
}

function fillSuppliers_(ss) {
  const sh = ss.getSheetByName("Поставщики");
  sh.clear();
  sh.getRange("A1:A4").setValues([["Поставщик"], ["Рондо / Ладья"], ["Партнер"], ["Васильево / Ортус"]]);
}

function fillMaterials_(ss) {
  const sh = ss.getSheetByName("Материалы_Лки");
  sh.clear();
  sh.getRange("A1:F7").setValues([
    ["Название", "Длина листа мм", "Ширина листа мм", "Толщина", "Цена листа", "Поставщик"],
    ["ЛДСП 16 мм Дуб Сонома", 2750, 1830, 16, 2450, "Партнер"],
    ["ЛДСП 16 мм Белый", 2750, 1830, 16, 2200, "Партнер"],
    ["ЛДСП 16 мм Серый Графит", 2800, 2070, 16, 2950, "Рондо / Ладья"],
    ["ЛДСП 16 мм Дуб Вотан", 2750, 1830, 16, 2600, "Рондо / Ладья"],
    ["ЛДСП 16 мм Венге", 2750, 1830, 16, 2400, "Васильево / Ортус"],
    ["ДВП 3.2 мм", 2750, 1700, 3.2, 950, "Васильево / Ортус"],
  ]);
}

function fillPrices_(ss) {
  const sh = ss.getSheetByName("Цены_Лки");
  sh.clear();
  sh.getRange("A1:C8").setValues([
    ["Параметр", "Значение", "Комментарий"],
    ["ЛДСП, ₽ за м²", 1400, "тетрадь 19_08"],
    ["ДВП, ₽ за м²", 400, ""],
    ["Кромка, ₽ за пог.м", 250, ""],
    ["Запас ДВП", 1.1, ""],
    ["Отверстие под петлю, ₽", 50, ""],
    ["Доставка, ₽", 200, "0 если без доставки"],
    ["Лист ЛДСП, м²", 5.796, "2800×2070"],
  ]);
}

function fillWebCalc_(ss) {
  const sh = ss.getSheetByName("Кальк_веб");
  sh.clear();
  sh.getRange("A1:E1").setValues([
    ["ИТОГО, ₽", "", "Листов", "", "Ставь флажок. Материал — как на листе Материалы_Лки."],
  ]);
  sh.getRange("B1").setFormula("=IF(J17=\"\";\"\";J17+L17+N17)");
  sh.getRange("D1").setFormula("=H17");

  sh.getRange("A2:H2").setValues([
    ["Материал", "ЛДСП 16 мм Дуб Сонома", "Цена листа", "", "Распил ₽/пог.м", 35, "Кромка ₽/пог.м", 45],
  ]);
  sh.getRange("D2").setFormula("=IFERROR(VLOOKUP(B2;Материалы_Лки!A:E;5;FALSE);0)");
  sh.getRange("B2").setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInRange(ss.getSheetByName("Материалы_Лки").getRange("A2:A7"), true).build(),
  );

  sh.getRange("A3:F3").setValues([["Клиент", "", "Телефон", "", "КПД раскроя", 0.85]]);

  sh.getRange("A5:L5").setValues([
    [
      "Вкл",
      "Деталь",
      "Длина мм",
      "Ширина мм",
      "Шт",
      "Кромка длин.1",
      "Кромка длин.2",
      "Кромка шир.1",
      "Кромка шир.2",
      "м²",
      "кромка пог.м",
      "пил пог.м",
    ],
  ]);

  const presets = [
    [true, "Боковина вертикальная", 2000, 580, 2, true, false, true, true],
    [true, "Дно / Крыша", 768, 580, 2, true, false, false, false],
    [true, "Полка вкладная", 768, 550, 3, true, false, false, false],
    [false, "Стойка / перегородка", 2000, 400, 1, true, false, false, false],
    [false, "Фасад", 700, 400, 2, true, true, true, true],
  ];
  for (let i = 0; i < 10; i++) {
    const r = 6 + i;
    const row = presets[i] || [false, "", "", "", "", false, false, false, false];
    sh.getRange(r, 1, r, 9).setValues([row]);
    sh.getRange(r, 10).setFormula(
      `=IF(A${r};ОКРУГЛ(C${r}*D${r}*E${r}/1000000;3);"")`,
    );
    sh.getRange(r, 11).setFormula(
      `=IF(A${r};ОКРУГЛ((ЕСЛИ(F${r};C${r};0)+ЕСЛИ(G${r};C${r};0)+ЕСЛИ(H${r};D${r};0)+ЕСЛИ(I${r};D${r};0))*E${r}/1000;3);"")`,
    );
    sh.getRange(r, 12).setFormula(
      `=IF(A${r};ОКРУГЛ((C${r}+D${r})*2*E${r}/1000;3);"")`,
    );
  }
  sh.getRange("A6:A15").insertCheckboxes();
  sh.getRange("F6:I15").insertCheckboxes();

  sh.getRange("A17:N17").setValues([
    ["м² деталей", "", "кромка м", "", "пил м", "", "листы", "", "ЛДСП ₽", "", "кромка ₽", "", "распил ₽", ""],
  ]);
  sh.getRange("B17").setFormula("=СУММ(J6:J15)");
  sh.getRange("D17").setFormula("=СУММ(K6:K15)");
  sh.getRange("F17").setFormula("=СУММ(L6:L15)");
  sh.getRange("H17").setFormula(
    "=IF(B17=0;\"\";ОКРУГЛВВЕРХ(B17/(ЕСЛИОШИБКА(ВПР(B2;Материалы_Лки!A:C;2;ЛОЖЬ);2750)*ЕСЛИОШИБКА(ВПР(B2;Материалы_Лки!A:C;3;ЛОЖЬ);1830)/1000000*F3);0))",
  );
  sh.getRange("J17").setFormula("=ОКРУГЛ(H17*D2;0)");
  sh.getRange("L17").setFormula("=ОКРУГЛ(D17*H2;0)");
  sh.getRange("N17").setFormula("=ОКРУГЛ(F17*F2*0,55;0)");

  sh.setFrozenRows(5);
  sh.getRange("A1:D1").setFontWeight("bold").setFontSize(14);
}

function fillOrders_(ss) {
  const sh = ss.getSheetByName("Заказы");
  sh.clear();
  sh.getRange("A1:M1").setValues([
    [
      "№ заказа",
      "Дата",
      "Клиент",
      "Телефон",
      "Размер",
      "Материал",
      "Кромка",
      "Цена",
      "Предоплата",
      "К доплате",
      "Статус",
      "Срок",
      "Примечание",
    ],
  ]);
  for (let r = 2; r <= 30; r++) {
    sh.getRange(r, 1).setFormula(`="Л/"&TEXT(ROW()-1;"000")&"/26"`);
    sh.getRange(r, 10).setFormula(`=IF(H${r}="";"";H${r}-I${r})`);
    sh.getRange(r, 12).setFormula(`=IF(B${r}="";"";B${r}+7)`);
  }
  sh.getRange("K2:K30").setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["Новый", "В распиле", "Готов к выдаче", "Выдан", "Отменён"], true)
      .build(),
  );
}

function fillFittings_(ss) {
  const sh = ss.getSheetByName("Фурнитура");
  sh.clear();
  sh.getRange("A1:P1").setValues([
    [
      "Код (Инфо)",
      "Название",
      "Поставщик",
      "Остаток факт",
      "Мин",
      "Остаток в программе",
      "Последний привоз",
      "Заказать сейчас",
      "Категория",
      "Закуп",
      "Продажа",
      "Ед",
      "Штрихкод",
      "Полка",
      "Статус",
      "Недобор до мин",
    ],
  ]);
  for (let r = 2; r <= 80; r++) {
    sh.getRange(r, 15).setFormula(
      `=IF(A${r}="";"";IF(D${r}=0;"Нет в наличии";IF(D${r}<E${r};"Заканчивается";"В наличии")))`,
    );
    sh.getRange(r, 16).setFormula(`=IF(A${r}="";"";MAX(0;E${r}-D${r}))`);
  }
  sh.getRange("C2:C80").setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInRange(ss.getSheetByName("Поставщики").getRange("A2:A4"), true)
      .build(),
  );
}

function fillSales_(ss) {
  const sh = ss.getSheetByName("Продажи");
  sh.clear();
  sh.getRange("A1:I1").setValues([
    ["Дата", "Время", "Код (Инфо)", "Название", "Кол-во", "Цена", "Сумма (авто)", "Оплата", "Комментарий"],
  ]);
  for (let r = 2; r <= 40; r++) {
    sh.getRange(r, 7).setFormula(`=IF(OR(E${r}="";F${r}="");"";ОКРУГЛ(E${r}*F${r};0))`);
  }
  sh.getRange("A42").setValue("Итого сегодня");
  sh.getRange("G42").setFormula("=SUMIF(A:A;TODAY();G:G)");
  sh.getRange("H2:H40").setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["Наличные", "Карта", "Перевод", "Безнал (р/с)"], true)
      .build(),
  );
}

function fillCash_(ss) {
  const sh = ss.getSheetByName("Касса");
  sh.clear();
  sh.getRange("A1:L1").setValues([
    [
      "Дата",
      "Наличка на начало",
      "Приход нал",
      "Приход эквайринг (сверка)",
      "Расход прочее",
      "Описание расхода",
      "Наличка факт",
      "Наличка в программе",
      "Сходится?",
      "Чеки бухгалтеру",
      "Комментарий",
      "Должно быть в ящике",
    ],
  ]);
  sh.getRange("A2").setValue(new Date());
  sh.getRange("L2").setFormula("=B2+C2-E2");
}

function fillTasks_(ss) {
  const sh = ss.getSheetByName("Задачи");
  sh.clear();
  const rows = [
    ["Категория", "№", "Действие", "Готово", "Комментарий"],
    ["Утро", 1, "Инфопредприятие → кассир", false, ""],
    ["Утро", 2, "Сверить наличку с «должно быть» на Кассе", false, ""],
    ["Утро", 3, "Чеки = сумма в программе", false, ""],
    ["День", 4, "Продажи писать на лист Продажи", false, ""],
    ["День", 5, "Распил — Кальк_веб, потом Заказы", false, ""],
    ["Закрытие", 6, "Эквайринг АВТО → Д/Р", false, ""],
    ["Закрытие", 7, "Поступление в кассу АВТО → Д/Р", false, ""],
    ["Закрытие", 8, "Чеки бухгалтеру", false, ""],
    ["Закрытие", 9, "Остаток программы и Фурнитура", false, ""],
  ];
  sh.getRange(1, 1, rows.length, 5).setValues(rows);
  sh.getRange("D2:D10").insertCheckboxes();
}

function fillLoaders_(ss) {
  const sh = ss.getSheetByName("Грузчики");
  sh.clear();
  sh.getRange("A1:G1").setValues([
    ["Дата", "Заказ / что привезли", "Сумма", "Грузчик", "Подпись", "Откуда деньги", "Комментарий"],
  ]);
}

function fillCheats_(ss) {
  const sh = ss.getSheetByName("Шпаргалки");
  sh.clear();
  sh.getRange("A1:C8").setValues([
    ["Раздел", "Заголовок", "Текст"],
    ["О компании", "РЭЛАН", "Салон в Лысве. Фурнитура + ЛДСП под заказ."],
    ["Шпаргалка", "Вопросы при заказе", "Кромка: левая / правая / обе / нет. Цвет ЛДСП. Срок 7 / 3 / 1."],
    ["Шпаргалка", "Оплата картой", "Инфо → эквайринг → Физ-лицо П1 основание Л/.../26 без НДС → чек."],
    ["Шпаргалка", "Оплата наличными", "Инфо → Поступление в кассу → Физ-лицо Л/.../26."],
    ["Шпаргалка", "Счёт", "Инфо → Счёт → Л/.../26 → услуги → ЛДСП 02107."],
    ["Шпаргалка", "Заказ готов", "Позвонить клиенту. Статус на листе Заказы: Готов к выдаче."],
    ["Шпаргалка", "Фурнитура", "Пиши только Фурнитуру. Заявки собираются сами."],
  ]);
}

function fillRequests_(ss) {
  const queries = [
    ["Заявки_Рондо", "Рондо / Ладья"],
    ["Заявки_Партнер", "Партнер"],
    ["Заявки_Васильево", "Васильево / Ортус"],
  ];
  queries.forEach(([name, supplier]) => {
    const sh = ss.getSheetByName(name);
    sh.clear();
    sh.getRange("A1").setFormula(
      `=QUERY(Фурнитура!A:H;"select A,B,F,G where C = '${supplier}' and H > 0";1)`,
    );
  });
}

function fillHome_(ss) {
  const sh = ss.getSheetByName("Главная");
  sh.clear();
  sh.getRange("A1").setValue("РЭЛАН — салон");
  sh.getRange("A1").setFontSize(18).setFontWeight("bold");
  sh.getRange("A3:G3").setValues([
    ["Сегодня выручка, ₽", "", "Мало товара", "", "Заказов в работе", "", "Задач не сделано"],
  ]);
  sh.getRange("A4").setFormula("=ОКРУГЛ(SUMIF(Продажи!A:A;TODAY();Продажи!G:G);0)");
  sh.getRange("C4").setFormula(
    '=COUNTIF(Фурнитура!O:O;"Заканчивается")+COUNTIF(Фурнитура!O:O;"Нет в наличии")',
  );
  sh.getRange("E4").setFormula('=COUNTIF(Заказы!K:K;"Новый")+COUNTIF(Заказы!K:K;"В распиле")');
  sh.getRange("G4").setFormula("=COUNTIF(Задачи!D:D;FALSE)");
  sh.getRange("A6").setValue("Вкладки внизу: Кальк_веб (флажки), Заказы, Фурнитура, Продажи, Касса.");
}

function addWebPart() {
  const sh = SpreadsheetApp.getActive().getSheetByName("Кальк_веб");
  for (let r = 6; r <= 15; r++) {
    if (!sh.getRange(r, 1).getValue() && !sh.getRange(r, 2).getValue()) {
      sh.getRange(r, 1).setValue(true);
      sh.getRange(r, 2).setValue("Деталь");
      sh.getRange(r, 3).setValue(700);
      sh.getRange(r, 4).setValue(400);
      sh.getRange(r, 5).setValue(1);
      sh.getRange(r, 6, r, 9).setValues([[true, false, false, false]]);
      return;
    }
  }
  SpreadsheetApp.getUi().alert("Нет свободной строки.");
}

function clearWebParts() {
  SpreadsheetApp.getActive().getSheetByName("Кальк_веб").getRange("A6:A15").uncheck();
}

function webToOrders() {
  const ss = SpreadsheetApp.getActive();
  const calc = ss.getSheetByName("Кальк_веб");
  const orders = ss.getSheetByName("Заказы");
  const total = calc.getRange("B1").getValue();
  const client = calc.getRange("B3").getValue() || "Клиент";
  const phone = calc.getRange("D3").getValue() || "";
  const material = calc.getRange("B2").getValue();
  let row = 2;
  while (orders.getRange(row, 3).getValue()) row++;
  orders.getRange(row, 2).setValue(new Date());
  orders.getRange(row, 3).setValue(client);
  orders.getRange(row, 4).setValue(phone);
  orders.getRange(row, 6).setValue(material);
  orders.getRange(row, 8).setValue(total);
  orders.getRange(row, 11).setValue("Новый");
}
