import React from 'react';
import { cn } from '@/lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Grid - адаптивна сітка
 */
export const Grid: React.FC<GridProps> = ({
  columns = 1,
  gap = 'md',
  children,
  className,
  ...props
}) => {
  const getColumnsClass = () => {
    if (typeof columns === 'number') {
      return `grid-cols-${columns}`;
    }
    
    const classes: string[] = [];
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    
    return classes.join(' ');
  };

  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-10',
  };

  return (
    <div
      className={cn(
        'grid',
        getColumnsClass(),
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * GridItem - елемент сітки
 */
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: number | { sm?: number; md?: number; lg?: number; xl?: number };
}

export const GridItem: React.FC<GridItemProps> = ({
  span = 1,
  children,
  className,
  ...props
}) => {
  const getSpanClass = () => {
    if (typeof span === 'number') {
      return `col-span-${span}`;
    }
    
    const classes: string[] = [];
    if (span.sm) classes.push(`sm:col-span-${span.sm}`);
    if (span.md) classes.push(`md:col-span-${span.md}`);
    if (span.lg) classes.push(`lg:col-span-${span.lg}`);
    if (span.xl) classes.push(`xl:col-span-${span.xl}`);
    
    return classes.join(' ');
  };

  return (
    <div
      className={cn(getSpanClass(), className)}
      {...props}
    >
      {children}
    </div>
  );
};
