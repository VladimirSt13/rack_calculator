import React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Дії праворуч (кнопки, перемикачі, інструменти) */
  actions?: React.ReactNode;
}

/**
 * PageHeader - заголовок сторінки з описом та діями
 * Layout:
 * - Desktop: title + description зліва, actions справа
 * - Mobile: stacked (title, description, actions)
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
        'flex flex-col gap-4 mb-6 sm:mb-8',
        'sm:flex-row sm:items-start sm:justify-between',
        className
      )}
      {...props}
    >
      {/* Title + Description (left) */}
      <div className="space-y-1 flex-1 min-w-0">
        {typeof title === 'string' ? (
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight break-words">
            {title}
          </h1>
        ) : (
          title
        )}

        {description && (
          <p className="text-sm sm:text-base text-muted-foreground break-words">
            {description}
          </p>
        )}
      </div>

      {/* Actions (right) */}
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
};
