import React from 'react';
import { cn } from '@/lib/utils';

/**
 * FieldRow - ергономічний рядок поля для інженерних калькуляторів
 * 
 * Grid: [label: 140px] [input: 1fr] [unit: auto]
 * Vertical density: compact (h-8, gap-2)
 */
export interface FieldRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Мітка поля */
  label: React.ReactNode;
  /** ID для зв'язку з input */
  htmlFor?: string;
  /** Одиниця виміру */
  unit?: string;
  /** Діти (input, select, value) */
  children: React.ReactNode;
  /** Ширина лейбла (за замовчуванням 140px) */
  labelWidth?: string;
  /** Чи обов'язкове поле */
  required?: boolean;
}

export const FieldRow: React.FC<FieldRowProps> = ({
  label,
  htmlFor,
  unit,
  children,
  labelWidth = '140px',
  required,
  className,
}) => {
  return (
    <div
      className={cn(
        'grid items-center',
        'grid-cols-[140px_1fr_auto]',
        'gap-2',
        'h-8',
        className
      )}
      style={{
        gridTemplateColumns: `${labelWidth} 1fr auto`,
      }}
    >
      {/* Label (fixed width) */}
      <label
        htmlFor={htmlFor}
        className={cn(
          'text-sm font-medium',
          'truncate',
          required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
        )}
      >
        {label}
      </label>

      {/* Input/Value (flexible) */}
      <div className="min-w-0">
        {children}
      </div>

      {/* Unit (auto) */}
      {unit && (
        <span className="text-sm text-muted-foreground whitespace-nowrap pl-2">
          {unit}
        </span>
      )}
    </div>
  );
};

/**
 * FieldRowInput - input для використання в FieldRow
 */
export interface FieldRowInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Чи монospace шрифт (для числових значень) */
  mono?: boolean;
  /** Ширина для числових інпутів (у символах) */
  charWidth?: number;
}

export const FieldRowInput = React.forwardRef<
  HTMLInputElement,
  FieldRowInputProps
>(({ mono = true, charWidth, className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full h-8 px-2',
        'text-sm',
        mono && 'font-mono',
        'border border-input',
        'rounded-md',
        'bg-background',
        'hover:border-muted-foreground/50',
        'focus:border-primary focus:ring-2 focus:ring-primary/10',
        'focus:outline-none',
        'transition-colors',
        charWidth && mono && 'w-auto',
        className
      )}
      style={charWidth && mono ? { width: `${charWidth}ch` } : undefined}
      {...props}
    />
  );
});

FieldRowInput.displayName = 'FieldRowInput';

/**
 * FieldRowSelect - select для використання в FieldRow
 */
export interface FieldRowSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Placeholder (перший option) */
  placeholder?: string;
}

export const FieldRowSelect = React.forwardRef<
  HTMLSelectElement,
  FieldRowSelectProps
>(({ className, placeholder, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full h-8 px-2 pr-8',
        'text-sm',
        'border border-input',
        'rounded-md',
        'bg-background',
        'hover:border-muted-foreground/50',
        'focus:border-primary focus:ring-2 focus:ring-primary/10',
        'focus:outline-none',
        'transition-colors',
        'cursor-pointer',
        'appearance-none',
        'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")]',
        'bg-no-repeat',
        'bg-right',
        'bg-[length:16px_16px]',
        'bg-[right_8px_center]',
        className
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
});

FieldRowSelect.displayName = 'FieldRowSelect';

/**
 * FieldRowValue - текстове значення для відображення (не input)
 */
export interface FieldRowValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Чи монospace шрифт */
  mono?: boolean;
}

export const FieldRowValue: React.FC<FieldRowValueProps> = ({
  mono = true,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'text-sm',
        mono && 'font-mono',
        'px-2 py-1',
        className
      )}
      {...props}
    />
  );
};

/**
 * FieldRowGroup - група полів без додаткових відступів
 * Для щільного розташування пов'язаних полів
 */
export interface FieldRowGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FieldRowGroup: React.FC<FieldRowGroupProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('space-y-2', className)}
      {...props}
    >
      {children}
    </div>
  );
};
