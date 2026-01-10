import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type GenerationStage = 'idle' | 'analyzing' | 'generating' | 'validating' | 'complete';

interface Template {
  id: number;
  title: string;
  description: string;
  category: string;
  code: string;
  icon: string;
  tags: string[];
  usage_count: number;
}

interface HistoryItem {
  id: number;
  prompt: string;
  code: string;
  created_at: string;
}

const API_BASE = {
  generate: 'https://functions.poehali.dev/beb032ce-3b1e-4c30-975d-a3e3e39e9fac',
  templates: 'https://functions.poehali.dev/17f118e4-ea79-4c9e-b2a6-afa753c62ae0',
  history: 'https://functions.poehali.dev/c6000118-ac7b-4ff7-87d1-26b15e30b082'
};

const Index = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [stage, setStage] = useState<GenerationStage>('idle');
  const [progress, setProgress] = useState(0);
  const [generatedCode, setGeneratedCode] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    opencartUrl: '',
    opencartApiKey: '',
    adminEmail: '',
    priceFolderId: ''
  });

  const complexExample = `У меня 3 прайс-листа от разных поставщиков с разными форматами артикулов:

**Поставщик 1 (1С:Предприятие):**
- Формат: "АРТ-12345-RU"
- Пример: АРТ-54821-RU, АРТ-99102-RU, АРТ-03344-RU

**Поставщик 2 (SAP):**
- Формат: "SKU_12345_V2"
- Пример: SKU_54821_V2, SKU_99102_V1, SKU_03344_V2

**Поставщик 3 (Wildberries):**
- Формат: "WB/12345/2024"
- Пример: WB/54821/2024, WB/99102/2023, WB/03344/2024

**Задача:**
Нужен скрипт, который:
1. Извлекает ТОЛЬКО цифровую часть артикула (core ID) из всех 3 форматов
2. Группирует товары с одинаковым core ID (54821 = 54821 = 54821)
3. Создаёт сводную таблицу со столбцами:
   - Core ID
   - Название товара (из первого найденного источника)
   - Цена Поставщик 1
   - Цена Поставщик 2  
   - Цена Поставщик 3
   - Минимальная цена
   - Остаток Поставщик 1
   - Остаток Поставщик 2
   - Остаток Поставщик 3
   - Общий остаток
4. Игнорирует артикулы, которые не соответствуют ни одному формату
5. Сортирует по минимальной цене

Файлы в Google Drive в папке "Прайсы синхронизация", листы называются "Поставщик1", "Поставщик2", "Поставщик3".`;

  useEffect(() => {
    loadTemplates();
    loadHistory();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch(API_BASE.templates);
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch(API_BASE.history);
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setStage('analyzing');
    setProgress(20);

    await new Promise(resolve => setTimeout(resolve, 800));
    setStage('generating');
    setProgress(50);

    try {
      const response = await fetch(API_BASE.generate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка генерации');
      }

      setProgress(80);
      setStage('validating');
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      setGeneratedCode(data.code);
      setStage('complete');
      setProgress(100);
      
      toast({
        title: '✅ Скрипт сгенерирован!',
        description: 'Код готов к использованию',
      });

      await loadHistory();

    } catch (error: any) {
      setStage('idle');
      setProgress(0);
      
      toast({
        title: '❌ Ошибка генерации',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const useTemplate = (template: Template) => {
    setPrompt(`Используй шаблон "${template.title}": ${template.description}`);
    setGeneratedCode(template.code);
    toast({
      title: '📋 Шаблон применён',
      description: template.title,
    });
  };

  const loadFromHistory = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setGeneratedCode(item.code);
    setStage('complete');
    toast({
      title: '🕒 Загружено из истории',
      description: new Date(item.created_at).toLocaleDateString('ru-RU'),
    });
  };

  const getStageInfo = () => {
    switch (stage) {
      case 'analyzing':
        return { text: 'Анализ запроса...', icon: 'Brain', color: 'text-primary' };
      case 'generating':
        return { text: 'AI генерирует код...', icon: 'Sparkles', color: 'text-primary' };
      case 'validating':
        return { text: 'Проверка синтаксиса...', icon: 'Shield', color: 'text-secondary' };
      case 'complete':
        return { text: 'Готово!', icon: 'CheckCircle2', color: 'text-secondary' };
      default:
        return { text: 'Ожидание', icon: 'Code2', color: 'text-muted-foreground' };
    }
  };

  const stageInfo = getStageInfo();
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-3 animate-fade-in">
            <Icon name="Sparkles" size={28} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            AI Google Apps Script Generator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Опишите задачу → получите готовый скрипт для автоматизации
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="MessageSquare" size={20} />
                Создать скрипт
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(complexExample)}
                  className="text-xs"
                >
                  <Icon name="Sparkles" size={14} className="mr-1" />
                  Сложный пример
                </Button>
                {prompt && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPrompt('')}
                    className="text-xs"
                  >
                    <Icon name="X" size={14} className="mr-1" />
                    Очистить
                  </Button>
                )}
              </div>
              <Textarea
                placeholder="Например: Найти все ячейки с пустыми ценами и подсветить их красным цветом, затем отправить уведомление на email..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[140px] font-mono text-sm resize-none"
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon 
                      name={stageInfo.icon as any} 
                      size={16} 
                      className={`${stageInfo.color} ${stage !== 'idle' && stage !== 'complete' ? 'animate-pulse-slow' : ''}`} 
                    />
                    <span className="text-sm font-medium">{stageInfo.text}</span>
                  </div>
                  {stage === 'complete' && (
                    <Badge className="bg-secondary text-secondary-foreground">
                      <Icon name="CheckCircle2" size={12} className="mr-1" />
                      Успешно
                    </Badge>
                  )}
                </div>

                {stage !== 'idle' && <Progress value={progress} className="h-1.5" />}

                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || (stage !== 'idle' && stage !== 'complete')}
                  className="w-full h-11 font-semibold"
                  size="lg"
                >
                  <Icon name="Zap" size={18} className="mr-2" />
                  {stage === 'idle' || stage === 'complete' ? 'Сгенерировать с AI' : 'Генерация...'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="Code2" size={20} />
                Результат
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedCode ? (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10 h-8"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode);
                      toast({ title: '📋 Скопировано!' });
                    }}
                  >
                    <Icon name="Copy" size={14} className="mr-1" />
                    Копировать
                  </Button>
                  <ScrollArea className="h-[280px] w-full">
                    <pre className="bg-muted p-4 rounded-lg text-xs font-mono border">
                      <code>{generatedCode}</code>
                    </pre>
                  </ScrollArea>
                </div>
              ) : (
                <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground border rounded-lg bg-muted/30">
                  <Icon name="FileCode" size={40} className="mb-3 opacity-50" />
                  <p className="text-sm">Код появится здесь</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid lg:grid-cols-2 gap-4">
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="Library" size={20} />
                  Библиотека шаблонов
                </CardTitle>
                <Badge variant="secondary">{filteredTemplates.length}</Badge>
              </div>
              <div className="flex gap-2 flex-wrap mt-2">
                {categories.map(cat => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === 'all' ? 'Все' : cat}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[320px]">
                <div className="space-y-3">
                  {filteredTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className="p-3 hover:border-primary/50 cursor-pointer transition-all hover:shadow-md"
                      onClick={() => useTemplate(template)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name={template.icon as any} size={20} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm">{template.title}</h4>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              <Icon name="MousePointerClick" size={10} className="mr-1" />
                              {template.usage_count}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {template.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="History" size={20} />
                  История генераций
                </CardTitle>
                <Badge variant="secondary">{history.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[320px]">
                {history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map((item, idx) => (
                      <div key={item.id}>
                        <Card 
                          className="p-3 hover:border-secondary/50 cursor-pointer transition-all hover:shadow-md"
                          onClick={() => loadFromHistory(item)}
                        >
                          <div className="flex items-start gap-2">
                            <Icon name="Clock" size={16} className="text-secondary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-2 mb-1">
                                {item.prompt}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleString('ru-RU', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </Card>
                        {idx < history.length - 1 && <Separator className="my-2" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground">
                    <Icon name="Inbox" size={40} className="mb-3 opacity-50" />
                    <p className="text-sm">История пуста</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Сгенерированные скрипты появятся здесь
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="Settings" size={20} />
                Настройки интеграций
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Icon name={showSettings ? "ChevronUp" : "ChevronDown"} size={16} />
              </Button>
            </div>
            <CardDescription>
              Настройте параметры для автоматизации: API ключи OpenCart, email уведомления, папка прайсов
            </CardDescription>
          </CardHeader>
          {showSettings && (
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Icon name="Store" size={14} />
                    OpenCart API URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://your-shop.com/index.php?route=api/product/update"
                    value={settings.opencartUrl}
                    onChange={(e) => setSettings({...settings, opencartUrl: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md text-sm font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL для обновления товаров через OpenCart API
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Icon name="Key" size={14} />
                    OpenCart API Key
                  </label>
                  <input
                    type="password"
                    placeholder="Ваш API ключ OpenCart"
                    value={settings.opencartApiKey}
                    onChange={(e) => setSettings({...settings, opencartApiKey: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md text-sm font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Сохраните в Google Apps Script: Свойства проекта → OPENCART_API_KEY
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Icon name="Mail" size={14} />
                    Email администратора
                  </label>
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Для получения уведомлений об ошибках синхронизации
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Icon name="FolderOpen" size={14} />
                    ID папки с прайсами (Google Drive)
                  </label>
                  <input
                    type="text"
                    placeholder="1a2B3c4D5e6F7g8H9i0J"
                    value={settings.priceFolderId}
                    onChange={(e) => setSettings({...settings, priceFolderId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md text-sm font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    ID папки из URL: drive.google.com/drive/folders/<strong>ID_ЗДЕСЬ</strong>
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={16} className="text-primary mt-0.5" />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Как использовать настройки:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Скопируйте сгенерированный скрипт в Google Apps Script</li>
                      <li>Откройте: <strong>Файл → Свойства проекта → Свойства скрипта</strong></li>
                      <li>Добавьте параметры (пример: OPENCART_API_KEY = ваш_ключ)</li>
                      <li>Запустите функцию setup* для настройки триггеров</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const text = `OPENCART_API_KEY = ${settings.opencartApiKey}\nOPENCART_API_URL = ${settings.opencartUrl}\nADMIN_EMAIL = ${settings.adminEmail}\nPRICE_FOLDER_ID = ${settings.priceFolderId}`;
                    navigator.clipboard.writeText(text);
                    toast({ title: '📋 Настройки скопированы!', description: 'Вставьте в свойства скрипта' });
                  }}
                >
                  <Icon name="Copy" size={14} className="mr-1" />
                  Скопировать все настройки
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="mt-6 grid md:grid-cols-3 gap-3 animate-fade-in">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="Brain" size={18} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">OpenAI GPT-4</h4>
                  <p className="text-xs text-muted-foreground">
                    Генерация умного кода с учётом контекста
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="Database" size={18} className="text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">База знаний</h4>
                  <p className="text-xs text-muted-foreground">
                    Шаблоны и история всех генераций
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="Zap" size={18} className="text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Мгновенно</h4>
                  <p className="text-xs text-muted-foreground">
                    От идеи до готового скрипта за 10 сек
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