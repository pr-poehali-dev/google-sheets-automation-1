import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

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

interface TemplatesLibraryProps {
  templates: Template[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onUseTemplate: (template: Template) => void;
}

const TemplatesLibrary = ({
  templates,
  selectedCategory,
  setSelectedCategory,
  onUseTemplate
}: TemplatesLibraryProps) => {
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
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
                onClick={() => onUseTemplate(template)}
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
  );
};

export default TemplatesLibrary;
