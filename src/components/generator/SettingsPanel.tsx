import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface Settings {
  opencartUrl: string;
  opencartApiKey: string;
  adminEmail: string;
  priceFolderId: string;
}

interface SettingsPanelProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  onCopySettings: () => void;
}

const SettingsPanel = ({
  showSettings,
  setShowSettings,
  settings,
  setSettings,
  onCopySettings
}: SettingsPanelProps) => {
  return (
    <Card className="animate-fade-in">
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
              onClick={onCopySettings}
            >
              <Icon name="Copy" size={14} className="mr-1" />
              Скопировать все настройки
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SettingsPanel;
