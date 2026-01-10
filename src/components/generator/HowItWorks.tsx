import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: 'Откройте сайт',
      description: 'Загружаются шаблоны и история',
      icon: 'Globe',
      color: 'from-blue-500/20 to-blue-600/20',
      iconColor: 'text-blue-600'
    },
    {
      number: 2,
      title: 'Выберите способ',
      description: 'Свой запрос / Шаблон / История',
      icon: 'MousePointerClick',
      color: 'from-purple-500/20 to-purple-600/20',
      iconColor: 'text-purple-600'
    },
    {
      number: 3,
      title: 'AI генерирует код',
      description: 'DeepSeek создаёт Google Apps Script',
      icon: 'Sparkles',
      color: 'from-primary/20 to-primary/30',
      iconColor: 'text-primary'
    },
    {
      number: 4,
      title: 'Скопируйте код',
      description: 'Вставьте в Google Apps Script',
      icon: 'Copy',
      color: 'from-secondary/20 to-secondary/30',
      iconColor: 'text-secondary'
    },
    {
      number: 5,
      title: 'Настройте триггеры',
      description: 'Запустите setup* для автоматизации',
      icon: 'Settings',
      color: 'from-orange-500/20 to-orange-600/20',
      iconColor: 'text-orange-600'
    },
    {
      number: 6,
      title: 'Готово!',
      description: 'Скрипт работает автоматически',
      icon: 'CheckCircle2',
      color: 'from-green-500/20 to-green-600/20',
      iconColor: 'text-green-600'
    }
  ];

  const methods = [
    {
      title: 'Свой запрос',
      description: 'Опишите задачу на русском языке',
      icon: 'MessageSquare',
      color: 'border-primary/30 bg-primary/5',
      features: [
        'AI понимает контекст',
        'Генерация за 10 секунд',
        'Сохраняется в историю'
      ]
    },
    {
      title: 'Готовый шаблон',
      description: '12 шаблонов для OpenCart и автоматизации',
      icon: 'Library',
      color: 'border-secondary/30 bg-secondary/5',
      features: [
        'Мгновенно готов к использованию',
        'Протестирован и работает',
        'Категории: Артикулы, Склады, Cron'
      ]
    },
    {
      title: 'Из истории',
      description: 'Загрузите предыдущий скрипт одним кликом',
      icon: 'History',
      color: 'border-accent/30 bg-accent/5',
      features: [
        'Все генерации сохранены',
        'Быстрый доступ',
        'С датой создания'
      ]
    }
  ];

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Icon name="Lightbulb" size={24} className="text-primary" />
          Как это работает
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Схема шагов */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
            Процесс работы
          </h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {steps.map((step, idx) => (
              <div key={step.number} className="relative">
                <div className={`bg-gradient-to-br ${step.color} border rounded-lg p-4 hover:shadow-md transition-shadow`}>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-background/80 flex items-center justify-center relative">
                      <Icon name={step.icon as any} size={24} className={step.iconColor} />
                      <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {step.number}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm">{step.title}</h4>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {step.description}
                    </p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <Icon name="ArrowRight" size={16} className="text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Три способа */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
            Три способа создать скрипт
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {methods.map((method) => (
              <Card key={method.title} className={`${method.color} border-2`}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex flex-col space-y-3">
                    <div className="w-12 h-12 rounded-lg bg-background/80 flex items-center justify-center">
                      <Icon name={method.icon as any} size={24} className="text-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base mb-1">{method.title}</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        {method.description}
                      </p>
                      <ul className="space-y-1.5">
                        {method.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-xs">
                            <Icon name="Check" size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Архитектура */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
            Архитектура системы
          </h3>
          <div className="bg-muted/30 border rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center border-2 border-blue-500/30">
                  <Icon name="Monitor" size={28} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Frontend</p>
                  <p className="text-xs text-muted-foreground">React + Vite</p>
                </div>
              </div>

              <Icon name="ArrowRight" size={24} className="text-muted-foreground rotate-90 md:rotate-0" />

              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center border-2 border-purple-500/30">
                  <Icon name="Server" size={28} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Backend</p>
                  <p className="text-xs text-muted-foreground">Python Functions</p>
                </div>
              </div>

              <Icon name="ArrowRight" size={24} className="text-muted-foreground rotate-90 md:rotate-0" />

              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center border-2 border-orange-500/30">
                    <Icon name="Brain" size={28} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">DeepSeek AI</p>
                    <p className="text-xs text-muted-foreground">Code Generation</p>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border-2 border-green-500/30">
                    <Icon name="Database" size={28} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">PostgreSQL</p>
                    <p className="text-xs text-muted-foreground">Templates + History</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Примеры задач */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
            Что можно автоматизировать
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: 'ScanBarcode', text: 'Извлечение core ID из артикулов', color: 'text-blue-600' },
              { icon: 'GitMerge', text: 'Объединение прайсов по core ID', color: 'text-purple-600' },
              { icon: 'Warehouse', text: 'Распределение по 4 складам OpenCart', color: 'text-green-600' },
              { icon: 'Clock', text: 'Автосинхронизация каждый час', color: 'text-orange-600' },
              { icon: 'FolderSync', text: 'Импорт из Google Drive по расписанию', color: 'text-pink-600' },
              { icon: 'Mail', text: 'Email-уведомления об ошибках', color: 'text-red-600' }
            ].map((task) => (
              <div key={task.text} className="flex items-start gap-2 p-3 border rounded-lg hover:border-primary/50 transition-colors bg-background/50">
                <Icon name={task.icon as any} size={18} className={`${task.color} mt-0.5 flex-shrink-0`} />
                <span className="text-xs">{task.text}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HowItWorks;
