import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'default' | 'muted' | 'card' | 'primary' | 'secondary';
  border?: 'none' | 'top' | 'bottom' | 'y';
}

/**
 * Section - секція сторінки
 */
export const Section: React.FC<SectionProps> = ({
  children,
  padding = 'lg',
  background = 'default',
  border = 'none',
  className,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'py-4 sm:py-6',
    md: 'py-6 sm:py-8',
    lg: 'py-8 sm:py-12',
    xl: 'py-12 sm:py-16',
  };

  const backgroundClasses = {
    default: 'bg-background',
    muted: 'bg-muted',
    card: 'bg-card',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
  };

  const borderClasses = {
    none: '',
    top: 'border-t',
    bottom: 'border-b',
    y: 'border-y',
  };

  return (
    <section
      className={cn(
        paddingClasses[padding],
        backgroundClasses[background],
        borderClasses[border],
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
};
