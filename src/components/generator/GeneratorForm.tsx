import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

type GenerationStage = 'idle' | 'analyzing' | 'generating' | 'validating' | 'complete';

interface GeneratorFormProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  stage: GenerationStage;
  progress: number;
  generatedCode: string;
  handleGenerate: () => void;
  complexExample: string;
  onCopyCode: () => void;
}

const GeneratorForm = ({
  prompt,
  setPrompt,
  stage,
  progress,
  generatedCode,
  handleGenerate,
  complexExample,
  onCopyCode
}: GeneratorFormProps) => {
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

  return (
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
                onClick={onCopyCode}
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
  );
};

export default GeneratorForm;
