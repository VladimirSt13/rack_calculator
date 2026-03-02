import React from 'react';
import { cn } from '../../lib/utils';

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * PageHeader - заголовок сторінки з описом та діями
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8',
        className
      )}
      {...props}
    >
      <div className="space-y-1 flex-1">
        {typeof title === 'string' ? (
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {title}
          </h1>
        ) : (
          title
        )}
        
        {description && (
          <p className="text-sm sm:text-base text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

/**
 * SectionHeader - заголовок секції
 */
export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'mb-4 sm:mb-6 space-y-1',
        className
      )}
      {...props}
    >
      {typeof title === 'string' ? (
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
          {title}
        </h2>
      ) : (
        title
      )}
      
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};
