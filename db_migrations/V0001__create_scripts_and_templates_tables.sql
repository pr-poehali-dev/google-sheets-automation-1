CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    code TEXT NOT NULL,
    icon VARCHAR(50) DEFAULT 'FileCode',
    tags TEXT[] DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generated_scripts (
    id SERIAL PRIMARY KEY,
    prompt TEXT NOT NULL,
    generated_code TEXT NOT NULL,
    template_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_generated_scripts_created_at ON generated_scripts(created_at DESC);

INSERT INTO templates (title, description, category, code, icon, tags) VALUES
('Унификация артикулов', 'Приводит артикулы товаров к единому формату, убирая спецсимволы и пробелы', 'Обработка данных', 'function normalizeArticles() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const article = String(data[i][0])
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .trim();
    sheet.getRange(i + 1, 1).setValue(article);
  }
  
  SpreadsheetApp.getUi().alert("Артикулы унифицированы!");
}', 'Boxes', ARRAY['артикулы', 'нормализация', 'форматирование']),

('Объединение прайсов', 'Собирает данные из нескольких файлов Google Sheets в один сводный прайс-лист', 'Импорт/Экспорт', 'function mergePriceLists() {
  const folder = DriveApp.getFolderById("YOUR_FOLDER_ID");
  const files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
  
  const master = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("Сводный") || 
    SpreadsheetApp.getActiveSpreadsheet().insertSheet("Сводный");
  
  master.clear();
  master.appendRow(["Артикул", "Название", "Цена", "Остаток", "Источник"]);
  
  while (files.hasNext()) {
    const file = files.next();
    const sheet = SpreadsheetApp.open(file).getSheets()[0];
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      master.appendRow([row[0], row[1], row[2], row[3], file.getName()]);
    }
  }
  
  Logger.log("Прайсы объединены!");
}', 'GitMerge', ARRAY['объединение', 'импорт', 'прайсы']),

('Расчёт остатков', 'Подсчитывает суммарные остатки по артикулам из нескольких источников', 'Аналитика', 'function calculateTotalStock() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const stockMap = {};
  
  for (let i = 1; i < data.length; i++) {
    const article = data[i][0];
    const stock = parseInt(data[i][3]) || 0;
    
    if (stockMap[article]) {
      stockMap[article] += stock;
    } else {
      stockMap[article] = stock;
    }
  }
  
  const resultSheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("Остатки") || 
    SpreadsheetApp.getActiveSpreadsheet().insertSheet("Остатки");
  
  resultSheet.clear();
  resultSheet.appendRow(["Артикул", "Суммарный остаток"]);
  
  for (const [article, total] of Object.entries(stockMap)) {
    resultSheet.appendRow([article, total]);
  }
  
  Logger.log("Остатки подсчитаны!");
}', 'Calculator', ARRAY['остатки', 'подсчет', 'аналитика']),

('Отправка email уведомлений', 'Отправляет email с данными из таблицы указанным получателям', 'Уведомления', 'function sendEmailNotifications() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  const recipient = "example@email.com";
  const subject = "Обновление прайса";
  
  let body = "Добрый день!\\n\\nНовые данные в прайсе:\\n\\n";
  
  for (let i = 1; i < data.length; i++) {
    body += data[i].join(" | ") + "\\n";
  }
  
  MailApp.sendEmail(recipient, subject, body);
  
  Logger.log("Email отправлен!");
}', 'Mail', ARRAY['email', 'уведомления', 'отправка']),

('Фильтрация по условию', 'Создаёт новый лист с данными, соответствующими заданному условию', 'Обработка данных', 'function filterByCondition() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  const filtered = data.filter((row, index) => {
    if (index === 0) return true;
    const price = parseFloat(row[2]);
    return price > 1000;
  });
  
  const newSheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("Отфильтровано") || 
    SpreadsheetApp.getActiveSpreadsheet().insertSheet("Отфильтровано");
  
  newSheet.clear();
  newSheet.getRange(1, 1, filtered.length, filtered[0].length).setValues(filtered);
  
  Logger.log("Данные отфильтрованы!");
}', 'Filter', ARRAY['фильтрация', 'условия', 'выборка']);
