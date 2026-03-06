import React from 'react';
import { cn } from '@/lib/utils';

export interface MainContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

/**
 * MainContent - основний контент з адаптивною сіткою
 */
export const MainContent: React.FC<MainContentProps> = ({
  as: Component = 'div',
  children,
  className,
  ...props
}) => {
  return (
    <Component
      className={cn(
        'flex-1 min-w-0 space-y-6',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * ContentGrid - сітка для контенту
 */
export interface ContentGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
}

export const ContentGrid: React.FC<ContentGridProps> = ({
  columns = 1,
  gap = 'lg',
  children,
  className,
  ...props
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 lg:grid-cols-3',
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
