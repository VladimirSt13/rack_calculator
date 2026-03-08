import * as React from 'react';
import { cn } from '@/lib/utils';

export interface NumberInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  suffix?: string;
}

/**
 * NumberInput - input для числових значень
 */
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, suffix, ...props }, ref) => (
    <div className={cn('flex items-center gap-2', suffix && 'w-full')}>
      <input
        type="number"
        ref={ref}
        className={cn(
          'w-full rounded-md border border-gray-300 px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
      {suffix && (
        <span className="text-sm text-muted whitespace-nowrap">{suffix}</span>
      )}
    </div>
  )
);
NumberInput.displayName = 'NumberInput';

export { NumberInput };
