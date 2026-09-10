/**
 * Вставь в Google Таблицу: Расширения → Apps Script → вставь этот файл → Сохранить.
 * Обнови страницу таблицы: меню «Nova» сверху.
 * Это замена кнопок веб-калькулятора.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Nova")
    .addItem("Кальк_веб: добавить деталь", "addWebPart")
    .addItem("Кальк_веб: выключить все детали", "clearWebParts")
    .addItem("Кальк_веб: итог → новая строка Заказы", "webToOrders")
    .addToUi();
}

function addWebPart() {
  const sh = SpreadsheetApp.getActive().getSheetByName("Кальк_веб");
  const last = 15;
  for (let r = 6; r <= last; r++) {
    const name = sh.getRange(r, 2).getValue();
    const on = sh.getRange(r, 1).getValue();
    if (!on && !name) {
      sh.getRange(r, 1).setValue(1);
      sh.getRange(r, 2).setValue("Деталь");
      sh.getRange(r, 3).setValue(700);
      sh.getRange(r, 4).setValue(400);
      sh.getRange(r, 5).setValue(1);
      sh.getRange(r, 6, r, 9).setValues([[1, 0, 0, 0]]);
      sh.getRange(r, 1).activate();
      return;
    }
  }
  SpreadsheetApp.getUi().alert("Нет свободной строки (макс. 10 деталей). Очисти лишние.");
}

function clearWebParts() {
  const sh = SpreadsheetApp.getActive().getSheetByName("Кальк_веб");
  sh.getRange("A6:A15").setValue(0);
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
  orders.getRange(row, 3).activate();
}
