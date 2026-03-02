import React from 'react';
import { cn } from '../../lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/**
 * Button компонент з Tailwind CSS
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary',
      outline: 'border border-input bg-background hover:bg-accent focus:ring-accent',
      ghost: 'hover:bg-accent focus:ring-accent',
      link: 'text-primary underline-offset-4 hover:underline focus:ring-primary',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-11 px-8 text-base',
      icon: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
