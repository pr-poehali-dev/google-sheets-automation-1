import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

type GenerationStage = 'idle' | 'analyzing' | 'generating' | 'validating' | 'complete';

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [stage, setStage] = useState<GenerationStage>('idle');
  const [progress, setProgress] = useState(0);
  const [generatedCode, setGeneratedCode] = useState('');

  const exampleScripts = [
    {
      title: 'Унификация артикулов',
      description: 'Приведение артикулов из разных форматов к единому стандарту',
      icon: 'Boxes',
    },
    {
      title: 'Сопоставление прайсов',
      description: 'Объединение данных из нескольких источников по ключевым полям',
      icon: 'GitMerge',
    },
    {
      title: 'Расчёт остатков',
      description: 'Автоматический подсчёт доступных позиций по всем файлам',
      icon: 'Calculator',
    },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setStage('analyzing');
    setProgress(20);

    await new Promise(resolve => setTimeout(resolve, 1500));
    setStage('generating');
    setProgress(50);

    await new Promise(resolve => setTimeout(resolve, 2000));
    setStage('validating');
    setProgress(80);

    const mockCode = `function unifyPriceLists() {
  const folder = DriveApp.getFolderById('YOUR_FOLDER_ID');
  const files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
  
  const masterSheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Сводный прайс') || 
    SpreadsheetApp.getActiveSpreadsheet().insertSheet('Сводный прайс');
  
  masterSheet.clear();
  masterSheet.appendRow(['Артикул', 'Название', 'Цена', 'Остаток', 'Источник']);
  
  const unifiedData = [];
  
  while (files.hasNext()) {
    const file = files.next();
    const sheet = SpreadsheetApp.open(file).getSheets()[0];
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const unifiedArticle = normalizeArticle(row[0]);
      
      unifiedData.push([
        unifiedArticle,
        row[1],
        parseFloat(row[2]) || 0,
        parseInt(row[3]) || 0,
        file.getName()
      ]);
    }
  }
  
  if (unifiedData.length > 0) {
    masterSheet.getRange(2, 1, unifiedData.length, 5).setValues(unifiedData);
  }
  
  Logger.log('Обработано позиций: ' + unifiedData.length);
}

function normalizeArticle(article) {
  return String(article)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim();
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Автоматизация')
    .addItem('Унифицировать прайсы', 'unifyPriceLists')
    .addToUi();
}`;

    setGeneratedCode(mockCode);

    await new Promise(resolve => setTimeout(resolve, 1500));
    setStage('complete');
    setProgress(100);
  };

  const getStageInfo = () => {
    switch (stage) {
      case 'analyzing':
        return { text: 'Анализ запроса...', icon: 'Brain', color: 'text-primary' };
      case 'generating':
        return { text: 'Генерация скрипта...', icon: 'Code2', color: 'text-primary' };
      case 'validating':
        return { text: 'Проверка агентом...', icon: 'Shield', color: 'text-secondary' };
      case 'complete':
        return { text: 'Готово!', icon: 'CheckCircle2', color: 'text-secondary' };
      default:
        return { text: 'Ожидание', icon: 'Sparkles', color: 'text-muted-foreground' };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Icon name="Sparkles" size={32} className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI Генератор Google Apps Script
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Опишите задачу на человеческом языке — получите готовый скрипт для автоматизации работы с прайс-листами
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {exampleScripts.map((item, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon name={item.icon as any} size={24} />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="MessageSquare" size={20} />
                Описание задачи
              </CardTitle>
              <CardDescription>
                Подробно опишите, что должен делать скрипт
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Например: Мне нужен скрипт, который каждое утро проверяет папку 'Прайсы поставщиков' на Google Drive, находит все Excel файлы, извлекает колонки 'Артикул', 'Наименование', 'Цена' и 'Количество', приводит артикулы к единому формату (убирает дефисы и пробелы), объединяет данные в один файл и экспортирует в формате CSV..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[200px] font-mono text-sm resize-none"
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name={stageInfo.icon as any} size={18} className={`${stageInfo.color} ${stage !== 'idle' && stage !== 'complete' ? 'animate-pulse-slow' : ''}`} />
                    <span className="text-sm font-medium">{stageInfo.text}</span>
                  </div>
                  {stage !== 'idle' && stage !== 'complete' && (
                    <Badge variant="secondary" className="animate-pulse-slow">
                      Обработка...
                    </Badge>
                  )}
                  {stage === 'complete' && (
                    <Badge className="bg-secondary text-secondary-foreground">
                      <Icon name="CheckCircle2" size={14} className="mr-1" />
                      Успешно
                    </Badge>
                  )}
                </div>

                {stage !== 'idle' && <Progress value={progress} className="h-2" />}

                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || (stage !== 'idle' && stage !== 'complete')}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  <Icon name="Zap" size={20} className="mr-2" />
                  {stage === 'idle' || stage === 'complete' ? 'Сгенерировать скрипт' : 'Генерация...'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Code2" size={20} />
                Результат
              </CardTitle>
              <CardDescription>
                Готовый Google Apps Script код
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="code" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="code">
                    <Icon name="FileCode" size={16} className="mr-2" />
                    Код
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Icon name="Settings" size={16} className="mr-2" />
                    Настройки
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="code" className="mt-4">
                  {generatedCode ? (
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 z-10"
                        onClick={() => navigator.clipboard.writeText(generatedCode)}
                      >
                        <Icon name="Copy" size={16} className="mr-2" />
                        Копировать
                      </Button>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono h-[400px] overflow-y-auto border">
                        <code>{generatedCode}</code>
                      </pre>
                    </div>
                  ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground border rounded-lg bg-muted/30">
                      <Icon name="FileCode" size={48} className="mb-4 opacity-50" />
                      <p className="text-sm">Сгенерированный код появится здесь</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="mt-4">
                  <div className="space-y-4 h-[400px] overflow-y-auto">
                    <div className="p-4 border rounded-lg space-y-2 bg-card">
                      <div className="flex items-center gap-2">
                        <Icon name="FolderOpen" size={18} className="text-primary" />
                        <h4 className="font-semibold text-sm">Папка с прайсами</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ID папки Google Drive: <code className="bg-muted px-2 py-1 rounded">YOUR_FOLDER_ID</code>
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg space-y-2 bg-card">
                      <div className="flex items-center gap-2">
                        <Icon name="Clock" size={18} className="text-secondary" />
                        <h4 className="font-semibold text-sm">Расписание запуска</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ежедневно в 08:00 (триггер в Google Apps Script)
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg space-y-2 bg-card">
                      <div className="flex items-center gap-2">
                        <Icon name="FileSpreadsheet" size={18} className="text-accent" />
                        <h4 className="font-semibold text-sm">Формат экспорта</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Сводный лист в Google Sheets → CSV для импорта в CMS
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg space-y-2 bg-card">
                      <div className="flex items-center gap-2">
                        <Icon name="ShieldCheck" size={18} className="text-secondary" />
                        <h4 className="font-semibold text-sm">Проверка точности</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Код проверен валидирующим агентом на корректность логики
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="Brain" size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Primary Agent</h4>
                  <p className="text-xs text-muted-foreground">
                    Анализирует запрос и создаёт оптимальный Google Apps Script
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="Shield" size={20} className="text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Validator Agent</h4>
                  <p className="text-xs text-muted-foreground">
                    Проверяет точность кода и соответствие требованиям
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="Zap" size={20} className="text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Автоматизация</h4>
                  <p className="text-xs text-muted-foreground">
                    Ежедневная обработка и экспорт данных без участия человека
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
