import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface HistoryItem {
  id: number;
  prompt: string;
  code: string;
  created_at: string;
}

interface GenerationHistoryProps {
  history: HistoryItem[];
  onLoadFromHistory: (item: HistoryItem) => void;
}

const GenerationHistory = ({
  history,
  onLoadFromHistory
}: GenerationHistoryProps) => {
  return (
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
                    onClick={() => onLoadFromHistory(item)}
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
  );
};

export default GenerationHistory;
