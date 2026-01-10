INSERT INTO t_p86342549_google_sheets_automa.templates (title, description, category, code, icon, tags, usage_count) VALUES
(
  'Автосинхронизация остатков OpenCart (Cron)',
  'Настраивает триггер по расписанию для автоматического обновления остатков в OpenCart каждый час из Google Sheets',
  'OpenCart / Автоматизация',
  'function setupAutoSync() {
  ScriptApp.newTrigger("autoSyncStocksToOpenCart")
    .timeBased()
    .everyHours(1)
    .create();
  
  SpreadsheetApp.getUi().alert("Автосинхронизация настроена! Остатки обновляются каждый час.");
}

function autoSyncStocksToOpenCart() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Сводная");
  
  if (!sheet) {
    Logger.log("Лист Сводная не найден!");
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  const OPENCART_API_URL = "https://your-shop.com/index.php?route=api/product/update";
  const API_KEY = PropertiesService.getScriptProperties().getProperty("OPENCART_API_KEY");
  
  if (!API_KEY) {
    Logger.log("API ключ не настроен! Установите в свойствах скрипта: OPENCART_API_KEY");
    return;
  }
  
  let updated = 0;
  let errors = 0;
  const startTime = new Date();
  
  for (let i = 1; i < data.length; i++) {
    const coreID = data[i][0];
    const stock1 = parseInt(data[i][6]) || 0;
    const stock2 = parseInt(data[i][7]) || 0;
    const stock3 = parseInt(data[i][8]) || 0;
    const stock4 = parseInt(data[i][9]) || 0;
    
    if (!coreID || coreID === "ERROR") continue;
    
    const payload = {
      product_id: coreID,
      options: [
        { option_id: 1, quantity: stock1 },
        { option_id: 2, quantity: stock2 },
        { option_id: 3, quantity: stock3 },
        { option_id: 4, quantity: stock4 }
      ],
      status: (stock1 + stock2 + stock3 + stock4) > 0 ? 1 : 0
    };
    
    try {
      const response = UrlFetchApp.fetch(OPENCART_API_URL, {
        method: "post",
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + API_KEY },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      
      const result = JSON.parse(response.getContentText());
      
      if (response.getResponseCode() === 200 && result.success) {
        updated++;
      } else {
        errors++;
      }
      
      Utilities.sleep(200);
      
    } catch (e) {
      errors++;
      Logger.log("Ошибка товар " + coreID + ": " + e.message);
    }
  }
  
  const duration = Math.round((new Date() - startTime) / 1000);
  
  let logSheet = ss.getSheetByName("Sync_Log");
  if (!logSheet) {
    logSheet = ss.insertSheet("Sync_Log");
    logSheet.appendRow(["Timestamp", "Обновлено", "Ошибок", "Длительность"]);
  }
  
  logSheet.appendRow([startTime, updated, errors, duration + " сек"]);
  Logger.log("Синхронизация: обновлено " + updated + ", ошибок " + errors);
}

function testSyncNow() {
  autoSyncStocksToOpenCart();
  SpreadsheetApp.getUi().alert("Синхронизация выполнена! Проверьте лист Sync_Log");
}',
  'Clock',
  ARRAY['cron', 'триггер', 'автоматизация', 'синхронизация', 'opencart']::text[],
  0
),
(
  'Автоимпорт прайсов из Google Drive по расписанию',
  'Автоматически загружает прайс-листы из папки Google Drive каждый день в 6:00 утра',
  'OpenCart / Автоматизация',
  'function setupPriceListAutoImport() {
  ScriptApp.newTrigger("autoImportPriceLists")
    .timeBased()
    .atHour(6)
    .everyDays(1)
    .create();
  
  SpreadsheetApp.getUi().alert("Автоимпорт настроен! Прайсы загружаются каждый день в 6:00");
}

function autoImportPriceLists() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const FOLDER_ID = PropertiesService.getScriptProperties().getProperty("PRICE_FOLDER_ID");
  
  if (!FOLDER_ID) {
    Logger.log("ID папки не настроен! Установите в свойствах скрипта: PRICE_FOLDER_ID");
    return;
  }
  
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
  
  const fileMapping = {
    "Поставщик1": "Поставщик1",
    "Поставщик2": "Поставщик2", 
    "Поставщик3": "Поставщик3"
  };
  
  const imported = [];
  
  while (files.hasNext()) {
    const file = files.next();
    const fileName = file.getName();
    
    let targetSheetName = null;
    for (const pattern in fileMapping) {
      if (fileName.indexOf(pattern) !== -1) {
        targetSheetName = fileMapping[pattern];
        break;
      }
    }
    
    if (!targetSheetName) continue;
    
    try {
      const sourceSheet = SpreadsheetApp.open(file).getSheets()[0];
      const data = sourceSheet.getDataRange().getValues();
      
      let targetSheet = ss.getSheetByName(targetSheetName);
      if (!targetSheet) {
        targetSheet = ss.insertSheet(targetSheetName);
      }
      
      targetSheet.clear();
      
      if (data.length > 0) {
        targetSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
        imported.push(fileName);
      }
      
      Utilities.sleep(500);
      
    } catch (e) {
      Logger.log("Ошибка импорта " + fileName + ": " + e.message);
    }
  }
  
  let logSheet = ss.getSheetByName("Import_Log");
  if (!logSheet) {
    logSheet = ss.insertSheet("Import_Log");
    logSheet.appendRow(["Timestamp", "Файлов", "Список"]);
  }
  
  logSheet.appendRow([new Date(), imported.length, imported.join(", ")]);
  Logger.log("Импортировано: " + imported.length);
}

function testImportNow() {
  autoImportPriceLists();
  SpreadsheetApp.getUi().alert("Импорт выполнен! Проверьте лист Import_Log");
}',
  'FolderSync',
  ARRAY['cron', 'триггер', 'автоимпорт', 'google drive', 'прайсы']::text[],
  0
);