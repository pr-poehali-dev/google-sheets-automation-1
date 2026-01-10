-- Добавляем специализированные шаблоны для работы с артикулами OpenCart и складскими остатками

INSERT INTO t_p86342549_google_sheets_automa.templates (title, description, category, code, icon, tags, usage_count) VALUES
(
  'Извлечение core ID из разных форматов артикулов',
  'Извлекает числовой core ID из артикулов разных форматов (АРТ-12345-RU, SKU_12345_V2, WB/12345/2024) для последующего объединения',
  'OpenCart / Артикулы',
  'function extractCoreID() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Регулярные выражения для разных форматов
  const patterns = {
    "1C": /АРТ-(\d{5})-RU/,      // АРТ-12345-RU
    "SAP": /SKU_(\d{5})_V\d/,    // SKU_12345_V2
    "WB": /WB\/(\d{5})\/\d{4}/   // WB/12345/2024
  };
  
  // Добавляем заголовок в столбец Core ID
  sheet.getRange(1, 2).setValue("Core ID");
  
  for (let i = 1; i < data.length; i++) {
    const article = String(data[i][0]);
    let coreID = null;
    
    // Пробуем все паттерны
    for (const [source, pattern] of Object.entries(patterns)) {
      const match = article.match(pattern);
      if (match && match[1]) {
        coreID = match[1];
        break;
      }
    }
    
    // Записываем core ID или "ERROR"
    sheet.getRange(i + 1, 2).setValue(coreID || "ERROR");
  }
  
  SpreadsheetApp.getUi().alert("Core ID извлечены из " + (data.length - 1) + " артикулов!");
}',
  'ScanBarcode',
  ARRAY['артикулы', 'core-id', 'парсинг', 'opencart']::text[],
  0
),
(
  'Объединение прайсов по core ID с 4 складами OpenCart',
  'Группирует товары из 3 прайс-листов по core ID и распределяет остатки по 4 опциям товара (складам) OpenCart',
  'OpenCart / Склады',
  'function mergePriceListsWithWarehouses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Листы поставщиков (замените на ваши названия)
  const supplier1 = ss.getSheetByName("Поставщик1").getDataRange().getValues();
  const supplier2 = ss.getSheetByName("Поставщик2").getDataRange().getValues();
  const supplier3 = ss.getSheetByName("Поставщик3").getDataRange().getValues();
  
  // Создаем/очищаем результирующий лист
  let result = ss.getSheetByName("Сводная") || ss.insertSheet("Сводная");
  result.clear();
  
  // Заголовки
  result.appendRow([
    "Core ID", "Название", 
    "Цена П1", "Цена П2", "Цена П3", "Мин. цена",
    "Склад 1 (Опция 1)", "Склад 2 (Опция 2)", "Склад 3 (Опция 3)", "Склад 4 (доп.)", 
    "Общий остаток"
  ]);
  
  // Собираем данные в Map по core ID
  const products = new Map();
  
  // Функция извлечения core ID
  function getCoreID(article) {
    const patterns = [
      /АРТ-(\d{5})-RU/,
      /SKU_(\d{5})_V\d/,
      /WB\/(\d{5})\/\d{4}/
    ];
    
    for (const pattern of patterns) {
      const match = String(article).match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  }
  
  // Обработка поставщика 1 → Склад 1 (Опция 1)
  for (let i = 1; i < supplier1.length; i++) {
    const coreID = getCoreID(supplier1[i][0]);
    if (!coreID) continue;
    
    if (!products.has(coreID)) {
      products.set(coreID, {
        name: supplier1[i][1] || "",
        prices: [null, null, null],
        stocks: [0, 0, 0, 0]
      });
    }
    
    const p = products.get(coreID);
    p.prices[0] = parseFloat(supplier1[i][2]) || 0;
    p.stocks[0] = parseInt(supplier1[i][3]) || 0;
  }
  
  // Обработка поставщика 2 → Склад 2 (Опция 2)
  for (let i = 1; i < supplier2.length; i++) {
    const coreID = getCoreID(supplier2[i][0]);
    if (!coreID) continue;
    
    if (!products.has(coreID)) {
      products.set(coreID, {
        name: supplier2[i][1] || "",
        prices: [null, null, null],
        stocks: [0, 0, 0, 0]
      });
    }
    
    const p = products.get(coreID);
    p.prices[1] = parseFloat(supplier2[i][2]) || 0;
    p.stocks[1] = parseInt(supplier2[i][3]) || 0;
  }
  
  // Обработка поставщика 3 → Склад 3 (Опция 3)
  for (let i = 1; i < supplier3.length; i++) {
    const coreID = getCoreID(supplier3[i][0]);
    if (!coreID) continue;
    
    if (!products.has(coreID)) {
      products.set(coreID, {
        name: supplier3[i][1] || "",
        prices: [null, null, null],
        stocks: [0, 0, 0, 0]
      });
    }
    
    const p = products.get(coreID);
    p.prices[2] = parseFloat(supplier3[i][2]) || 0;
    p.stocks[2] = parseInt(supplier3[i][3]) || 0;
  }
  
  // Записываем результаты
  const sortedProducts = Array.from(products.entries()).sort((a, b) => {
    const minA = Math.min(...a[1].prices.filter(p => p > 0));
    const minB = Math.min(...b[1].prices.filter(p => p > 0));
    return minA - minB;
  });
  
  for (const [coreID, data] of sortedProducts) {
    const minPrice = Math.min(...data.prices.filter(p => p > 0)) || 0;
    const totalStock = data.stocks.reduce((sum, s) => sum + s, 0);
    
    result.appendRow([
      coreID,
      data.name,
      data.prices[0] || "-",
      data.prices[1] || "-",
      data.prices[2] || "-",
      minPrice,
      data.stocks[0],
      data.stocks[1],
      data.stocks[2],
      data.stocks[3],
      totalStock
    ]);
  }
  
  SpreadsheetApp.getUi().alert("Обработано товаров: " + products.size);
}',
  'Warehouse',
  ARRAY['прайсы', 'склады', 'объединение', 'opencart', 'опции товара']::text[],
  0
),
(
  'Экспорт для импорта в OpenCart (CSV с опциями)',
  'Создает CSV файл готовый для импорта в OpenCart с 4 опциями товара как складами',
  'OpenCart / Экспорт',
  'function exportToOpenCartCSV() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Создаем новый лист для экспорта
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let exportSheet = ss.getSheetByName("OpenCart_Export") || ss.insertSheet("OpenCart_Export");
  exportSheet.clear();
  
  // Заголовки OpenCart с опциями
  exportSheet.appendRow([
    "product_id",
    "model",
    "sku",
    "name",
    "price",
    "quantity",
    "option1_name",
    "option1_value",
    "option1_quantity",
    "option2_name",
    "option2_value",
    "option2_quantity",
    "option3_name",
    "option3_value",
    "option3_quantity",
    "option4_name",
    "option4_value",
    "option4_quantity",
    "status"
  ]);
  
  // Пропускаем заголовок исходного листа
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const coreID = row[0];
    const name = row[1];
    const minPrice = row[5];
    const stock1 = parseInt(row[6]) || 0;
    const stock2 = parseInt(row[7]) || 0;
    const stock3 = parseInt(row[8]) || 0;
    const stock4 = parseInt(row[9]) || 0;
    const totalStock = parseInt(row[10]) || 0;
    
    exportSheet.appendRow([
      coreID,                    // product_id
      coreID,                    // model
      coreID,                    // sku
      name,                      // name
      minPrice,                  // price
      totalStock,                // quantity (общий)
      "Склад",                   // option1_name
      "Склад 1",                 // option1_value
      stock1,                    // option1_quantity
      "Склад",                   // option2_name
      "Склад 2",                 // option2_value
      stock2,                    // option2_quantity
      "Склад",                   // option3_name
      "Склад 3",                 // option3_value
      stock3,                    // option3_quantity
      "Склад",                   // option4_name
      "Склад 4 (доп)",           // option4_value
      stock4,                    // option4_quantity
      totalStock > 0 ? 1 : 0     // status (вкл/выкл)
    ]);
  }
  
  SpreadsheetApp.getUi().alert(
    "Экспорт готов!\\n\\n" +
    "Лист: OpenCart_Export\\n" +
    "Товаров: " + (data.length - 1) + "\\n\\n" +
    "Скачайте как CSV: Файл → Скачать → CSV"
  );
}',
  'Download',
  ARRAY['экспорт', 'csv', 'opencart', 'опции товара']::text[],
  0
),
(
  'Валидация core ID перед объединением',
  'Проверяет корректность извлеченных core ID и показывает проблемные строки',
  'OpenCart / Артикулы',
  'function validateCoreIDs() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  const errors = [];
  const duplicates = {};
  const valid = [];
  
  for (let i = 1; i < data.length; i++) {
    const article = String(data[i][0]);
    const coreID = data[i][1]; // Предполагается, что core ID уже извлечен
    
    // Проверка 1: core ID извлечен
    if (!coreID || coreID === "ERROR") {
      errors.push({
        row: i + 1,
        article: article,
        error: "Core ID не извлечен"
      });
      continue;
    }
    
    // Проверка 2: core ID это 5-значное число
    if (!/^\d{5}$/.test(String(coreID))) {
      errors.push({
        row: i + 1,
        article: article,
        error: "Core ID не является 5-значным числом: " + coreID
      });
      continue;
    }
    
    // Проверка 3: дубликаты core ID
    if (duplicates[coreID]) {
      duplicates[coreID].push(i + 1);
    } else {
      duplicates[coreID] = [i + 1];
    }
    
    valid.push(coreID);
  }
  
  // Формируем отчет
  let report = "=== ОТЧЕТ ВАЛИДАЦИИ ===\\n\\n";
  
  report += "✅ Валидных записей: " + valid.length + "\\n";
  report += "❌ Ошибок: " + errors.length + "\\n\\n";
  
  if (errors.length > 0) {
    report += "ПРОБЛЕМНЫЕ СТРОКИ:\\n";
    errors.slice(0, 20).forEach(e => {
      report += "Строка " + e.row + ": " + e.article + " → " + e.error + "\\n";
    });
    
    if (errors.length > 20) {
      report += "... и еще " + (errors.length - 20) + " ошибок\\n";
    }
  }
  
  // Проверка дубликатов
  const dupsFound = Object.entries(duplicates).filter(([id, rows]) => rows.length > 1);
  if (dupsFound.length > 0) {
    report += "\\n⚠️ ДУБЛИКАТЫ CORE ID:\\n";
    dupsFound.slice(0, 10).forEach(([id, rows]) => {
      report += "Core ID " + id + " встречается в строках: " + rows.join(", ") + "\\n";
    });
  }
  
  Logger.log(report);
  SpreadsheetApp.getUi().alert(report);
}',
  'ShieldAlert',
  ARRAY['валидация', 'проверка', 'артикулы', 'дубликаты']::text[],
  0
),
(
  'Обновление остатков OpenCart из Google Sheets',
  'Обновляет остатки по складам (опциям) в OpenCart через API на основе данных из Google Sheets',
  'OpenCart / API Integration',
  'function updateOpenCartStockViaAPI() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // НАСТРОЙКИ - замените на ваши данные
  const OPENCART_API_URL = "https://your-shop.com/index.php?route=api/product/update";
  const API_KEY = "YOUR_API_KEY_HERE";
  
  let updated = 0;
  let errors = 0;
  
  for (let i = 1; i < data.length; i++) {
    const coreID = data[i][0];
    const stock1 = parseInt(data[i][6]) || 0;
    const stock2 = parseInt(data[i][7]) || 0;
    const stock3 = parseInt(data[i][8]) || 0;
    const stock4 = parseInt(data[i][9]) || 0;
    
    // Формируем payload для OpenCart API
    const payload = {
      product_id: coreID,
      options: [
        { option_id: 1, quantity: stock1 }, // Опция 1 = Склад 1
        { option_id: 2, quantity: stock2 }, // Опция 2 = Склад 2
        { option_id: 3, quantity: stock3 }, // Опция 3 = Склад 3
        { option_id: 4, quantity: stock4 }  // Опция 4 = Склад 4
      ]
    };
    
    try {
      const response = UrlFetchApp.fetch(OPENCART_API_URL, {
        method: "post",
        contentType: "application/json",
        headers: {
          "Authorization": "Bearer " + API_KEY
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      
      const result = JSON.parse(response.getContentText());
      
      if (response.getResponseCode() === 200 && result.success) {
        updated++;
      } else {
        errors++;
        Logger.log("Ошибка для товара " + coreID + ": " + result.error);
      }
      
      // Задержка чтобы не перегрузить API
      Utilities.sleep(200);
      
    } catch (e) {
      errors++;
      Logger.log("Исключение для товара " + coreID + ": " + e.message);
    }
  }
  
  SpreadsheetApp.getUi().alert(
    "Обновление завершено\\n\\n" +
    "✅ Обновлено: " + updated + "\\n" +
    "❌ Ошибок: " + errors
  );
}',
  'RefreshCw',
  ARRAY['api', 'интеграция', 'opencart', 'обновление', 'остатки']::text[],
  0
);