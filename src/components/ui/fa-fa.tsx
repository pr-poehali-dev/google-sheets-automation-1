import React from 'react';
import { LucideProps } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

/**
 * fa-fa - Пакет иконок в стиле Font Awesome на базе Lucide
 * Содержит все иконки, используемые в проекте AI Google Apps Script Generator
 */

export type IconName =
  | 'History'
  | 'Clock'
  | 'Inbox'
  | 'MessageSquare'
  | 'Sparkles'
  | 'X'
  | 'CheckCircle2'
  | 'Zap'
  | 'Code2'
  | 'Copy'
  | 'FileCode'
  | 'Settings'
  | 'ChevronUp'
  | 'ChevronDown'
  | 'Store'
  | 'Key'
  | 'Mail'
  | 'FolderOpen'
  | 'Info'
  | 'Lightbulb'
  | 'Globe'
  | 'MousePointerClick'
  | 'Library'
  | 'Check'
  | 'Monitor'
  | 'ArrowRight'
  | 'Server'
  | 'Brain'
  | 'Database'
  | 'ShoppingCart'
  | 'FileSpreadsheet'
  | 'Package'
  | 'TrendingUp'
  | 'AlertCircle'
  | 'Shield';

interface FaFaProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
  fallback?: IconName;
}

/**
 * FaFa - Универсальный компонент иконки
 * 
 * @example
 * <FaFa name="Brain" size={24} className="text-primary" />
 * <FaFa name="Sparkles" size={16} fallback="AlertCircle" />
 */
const FaFa: React.FC<FaFaProps> = ({ name, fallback = 'AlertCircle', ...props }) => {
  const IconComponent = (LucideIcons as Record<string, React.FC<LucideProps>>)[name];

  if (!IconComponent) {
    const FallbackIcon = (LucideIcons as Record<string, React.FC<LucideProps>>)[fallback];
    
    if (!FallbackIcon) {
      return <span className="text-xs text-gray-400">[icon]</span>;
    }

    return <FallbackIcon {...props} />;
  }

  return <IconComponent {...props} />;
};

// Экспорт всех иконок как отдельных компонентов для прямого использования
export const HistoryIcon: React.FC<LucideProps> = (props) => <FaFa name="History" {...props} />;
export const ClockIcon: React.FC<LucideProps> = (props) => <FaFa name="Clock" {...props} />;
export const InboxIcon: React.FC<LucideProps> = (props) => <FaFa name="Inbox" {...props} />;
export const MessageSquareIcon: React.FC<LucideProps> = (props) => <FaFa name="MessageSquare" {...props} />;
export const SparklesIcon: React.FC<LucideProps> = (props) => <FaFa name="Sparkles" {...props} />;
export const XIcon: React.FC<LucideProps> = (props) => <FaFa name="X" {...props} />;
export const CheckCircle2Icon: React.FC<LucideProps> = (props) => <FaFa name="CheckCircle2" {...props} />;
export const ZapIcon: React.FC<LucideProps> = (props) => <FaFa name="Zap" {...props} />;
export const Code2Icon: React.FC<LucideProps> = (props) => <FaFa name="Code2" {...props} />;
export const CopyIcon: React.FC<LucideProps> = (props) => <FaFa name="Copy" {...props} />;
export const FileCodeIcon: React.FC<LucideProps> = (props) => <FaFa name="FileCode" {...props} />;
export const SettingsIcon: React.FC<LucideProps> = (props) => <FaFa name="Settings" {...props} />;
export const ChevronUpIcon: React.FC<LucideProps> = (props) => <FaFa name="ChevronUp" {...props} />;
export const ChevronDownIcon: React.FC<LucideProps> = (props) => <FaFa name="ChevronDown" {...props} />;
export const StoreIcon: React.FC<LucideProps> = (props) => <FaFa name="Store" {...props} />;
export const KeyIcon: React.FC<LucideProps> = (props) => <FaFa name="Key" {...props} />;
export const MailIcon: React.FC<LucideProps> = (props) => <FaFa name="Mail" {...props} />;
export const FolderOpenIcon: React.FC<LucideProps> = (props) => <FaFa name="FolderOpen" {...props} />;
export const InfoIcon: React.FC<LucideProps> = (props) => <FaFa name="Info" {...props} />;
export const LightbulbIcon: React.FC<LucideProps> = (props) => <FaFa name="Lightbulb" {...props} />;
export const GlobeIcon: React.FC<LucideProps> = (props) => <FaFa name="Globe" {...props} />;
export const MousePointerClickIcon: React.FC<LucideProps> = (props) => <FaFa name="MousePointerClick" {...props} />;
export const LibraryIcon: React.FC<LucideProps> = (props) => <FaFa name="Library" {...props} />;
export const CheckIcon: React.FC<LucideProps> = (props) => <FaFa name="Check" {...props} />;
export const MonitorIcon: React.FC<LucideProps> = (props) => <FaFa name="Monitor" {...props} />;
export const ArrowRightIcon: React.FC<LucideProps> = (props) => <FaFa name="ArrowRight" {...props} />;
export const ServerIcon: React.FC<LucideProps> = (props) => <FaFa name="Server" {...props} />;
export const BrainIcon: React.FC<LucideProps> = (props) => <FaFa name="Brain" {...props} />;
export const DatabaseIcon: React.FC<LucideProps> = (props) => <FaFa name="Database" {...props} />;
export const ShoppingCartIcon: React.FC<LucideProps> = (props) => <FaFa name="ShoppingCart" {...props} />;
export const FileSpreadsheetIcon: React.FC<LucideProps> = (props) => <FaFa name="FileSpreadsheet" {...props} />;
export const PackageIcon: React.FC<LucideProps> = (props) => <FaFa name="Package" {...props} />;
export const TrendingUpIcon: React.FC<LucideProps> = (props) => <FaFa name="TrendingUp" {...props} />;
export const AlertCircleIcon: React.FC<LucideProps> = (props) => <FaFa name="AlertCircle" {...props} />;
export const ShieldIcon: React.FC<LucideProps> = (props) => <FaFa name="Shield" {...props} />;

export default FaFa;
