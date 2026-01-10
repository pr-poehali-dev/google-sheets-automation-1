import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import GeneratorForm from '@/components/generator/GeneratorForm';
import TemplatesLibrary from '@/components/generator/TemplatesLibrary';
import GenerationHistory from '@/components/generator/GenerationHistory';
import SettingsPanel from '@/components/generator/SettingsPanel';
import HowItWorks from '@/components/generator/HowItWorks';

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({ title: '📋 Скопировано!' });
  };

  const handleCopySettings = () => {
    const text = `OPENCART_API_KEY = ${settings.opencartApiKey}\nOPENCART_API_URL = ${settings.opencartUrl}\nADMIN_EMAIL = ${settings.adminEmail}\nPRICE_FOLDER_ID = ${settings.priceFolderId}`;
    navigator.clipboard.writeText(text);
    toast({ title: '📋 Настройки скопированы!', description: 'Вставьте в свойства скрипта' });
  };

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

        <GeneratorForm
          prompt={prompt}
          setPrompt={setPrompt}
          stage={stage}
          progress={progress}
          generatedCode={generatedCode}
          handleGenerate={handleGenerate}
          complexExample={complexExample}
          onCopyCode={handleCopyCode}
        />

        <div className="mt-6 grid lg:grid-cols-2 gap-4">
          <TemplatesLibrary
            templates={templates}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onUseTemplate={useTemplate}
          />

          <GenerationHistory
            history={history}
            onLoadFromHistory={loadFromHistory}
          />
        </div>

        <div className="mt-6">
          <SettingsPanel
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            settings={settings}
            setSettings={setSettings}
            onCopySettings={handleCopySettings}
          />
        </div>

        <div className="mt-6">
          <HowItWorks />
        </div>

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
                  <h4 className="font-semibold text-sm mb-1">Мгновенная генерация</h4>
                  <p className="text-xs text-muted-foreground">
                    От запроса до готового кода за 10 секунд
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