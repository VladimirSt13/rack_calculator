import React from 'react';
import { cn } from '../../lib/utils';

export interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Page - основний контейнер для всієї сторінки
 */
export const Page: React.FC<PageProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'min-h-screen bg-background',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * PageContent - контентна частина сторінки
 */
export interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const PageContent: React.FC<PageContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex-1 py-6 sm:py-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
