import React from 'react';
import { cn } from '@/lib/utils';

/**
 * BatteryPageLayout - Layout для сторінки підбору акумулятора
 */
export interface BatteryPageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const BatteryPageLayout: React.FC<BatteryPageLayoutProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('min-h-screen bg-gradient-to-b from-background to-secondary', className)}>
      {children}
    </div>
  );
};

/**
 * BatteryPageHeader - Заголовок сторінки
 */
export interface BatteryPageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export const BatteryPageHeader: React.FC<BatteryPageHeaderProps> = ({
  title,
  description,
  className,
}) => {
  return (
    <div className={cn('mb-8 pb-6 border-b', className)}>
      <h2 className="text-3xl font-bold mb-2 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-base text-muted-foreground leading-relaxed m-0">
          {description}
        </p>
      )}
    </div>
  );
};

/**
 * BatteryPageTwoCols - Двохколоночний layout
 */
export interface BatteryPageTwoColsProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const BatteryPageTwoCols: React.FC<BatteryPageTwoColsProps> = ({
  sidebar,
  children,
  className,
}) => {
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-8 items-start', className)}>
      {/* Sidebar */}
      <div className="sticky top-6">
        {sidebar}
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col gap-6 min-w-0">
        {children}
      </div>
    </div>
  );
};

/**
 * BatterySidebar - Сайдбар з формою
 */
export interface BatterySidebarProps {
  children: React.ReactNode;
  className?: string;
}

export const BatterySidebar: React.FC<BatterySidebarProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn('sticky top-6', className)}
      role="region"
      aria-label="Панель вводу"
    >
      <div className="w-full lg:w-[320px] space-y-4">
        {children}
      </div>
    </div>
  );
};

/**
 * BatteryMainContent - Основний контент
 */
export interface BatteryMainContentProps {
  children: React.ReactNode;
  className?: string;
}

export const BatteryMainContent: React.FC<BatteryMainContentProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-6 min-w-0', className)}>
      {children}
    </div>
  );
};
