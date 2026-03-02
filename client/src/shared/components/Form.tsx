import React from 'react';
import { cn } from '../../lib/utils';

export const FormField = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} {...props} />
  )
);
FormField.displayName = 'FormField';

export const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...props}
    />
  )
);
FormLabel.displayName = 'FormLabel';

export const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(className)} {...props} />
  )
);
FormControl.displayName = 'FormControl';

export const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {children}
    </p>
  )
);
FormMessage.displayName = 'FormMessage';

export const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);
FormDescription.displayName = 'FormDescription';

export default FormField;
