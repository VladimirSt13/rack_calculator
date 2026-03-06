import React from 'react';
import { cn } from '../../lib/utils';

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}

/**
 * Sidebar - бічна панель з адаптивністю
 */
export const Sidebar: React.FC<SidebarProps> = ({
  children,
  collapsible = false,
  collapsed = false,
  onToggle,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'w-full lg:w-80 lg:flex-shrink-0 space-y-4',
        collapsible && collapsed && 'hidden lg:block',
        className
      )}
      role="region"
      aria-label="Панель фільтрів"
      {...props}
    >
      {children}

      {collapsible && (
        <button
          onClick={onToggle}
          className="lg:hidden w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? 'Показати фільтри' : 'Сховати фільтри'}
        </button>
      )}
    </div>
  );
};

/**
 * SidebarSection - секція сайдбара
 */
export interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'space-y-4',
        className
      )}
      {...props}
    >
      {title && (
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
