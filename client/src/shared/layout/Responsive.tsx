import React from 'react';
import { cn } from '@/lib/utils';

export interface ResponsiveProps extends React.HTMLAttributes<HTMLDivElement> {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  showOnMobile?: boolean;
  showOnTablet?: boolean;
  showOnDesktop?: boolean;
}

/**
 * Responsive - компонент для адаптивного відображення
 */
export const Responsive: React.FC<ResponsiveProps> = ({
  hideOnMobile = false,
  hideOnTablet = false,
  hideOnDesktop = false,
  showOnMobile = false,
  showOnTablet = false,
  showOnDesktop = false,
  children,
  className,
  ...props
}) => {
  const classes: string[] = [];

  // Hide utilities
  if (hideOnMobile) classes.push('hidden sm:block');
  if (hideOnTablet) classes.push('block sm:hidden lg:block');
  if (hideOnDesktop) classes.push('block lg:hidden');

  // Show utilities
  if (showOnMobile) classes.push('block sm:hidden');
  if (showOnTablet) classes.push('hidden sm:block lg:hidden');
  if (showOnDesktop) classes.push('hidden lg:block');

  return (
    <div
      className={cn(classes.join(' '), className)}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * MobileOnly - показувати тільки на мобільних
 */
export const MobileOnly: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('block sm:hidden', className)}>
      {children}
    </div>
  );
};

/**
 * TabletOnly - показувати тільки на планшетах
 */
export const TabletOnly: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('hidden sm:block lg:hidden', className)}>
      {children}
    </div>
  );
};

/**
 * DesktopOnly - показувати тільки на десктопах
 */
export const DesktopOnly: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('hidden lg:block', className)}>
      {children}
    </div>
  );
};
