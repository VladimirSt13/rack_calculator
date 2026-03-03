import React, { memo, useCallback, ChangeEvent } from 'react';
import { cn } from '../../lib/utils';
import { FieldRow } from './FieldRow';

/**
 * Спільний хук для обробки числових полів
 */
function useNumberInput(
  onChange: (value: number) => void
) {
  return useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    if (!isNaN(num)) {
      onChange(num);
    }
  }, [onChange]);
}

/**
 * Спільні стилі для input полів
 */
const inputBaseStyles = cn(
  'h-10 px-3 text-sm font-mono',
  'border border-input rounded-md bg-background',
  'hover:border-muted-foreground/50',
  'focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none',
  'transition-colors',
  'disabled:opacity-50 disabled:cursor-not-allowed'
);

const inputErrorStyles = 'border-destructive focus:border-destructive focus:ring-destructive/10';

/**
 * NumberField - поле для числових значень з одиницею виміру
 *
 * Повторюваний патерн:
 * [Label] [Input (number)] [Unit]
 */
export interface NumberFieldProps {
  label: string;
  id: string;
  value: number | string;
  onChange: (value: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  placeholder?: string;
  required?: boolean;
  inputWidth?: string | number;
  className?: string;
  disabled?: boolean;
  error?: string;
  description?: string;
}

export const NumberField: React.FC<NumberFieldProps> = memo(({
  label,
  id,
  value,
  onChange,
  unit,
  min,
  max,
  placeholder,
  required,
  inputWidth = '9ch',
  className,
  disabled = false,
  error,
  description,
}) => {
  const handleChange = useNumberInput(onChange);

  return (
    <FieldRow label={label} htmlFor={id} required={required}>
      <div className='flex items-center gap-2'>
        <input
          id={id}
          type='number'
          min={min}
          max={max}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : description ? `${id}-description` : undefined}
          className={cn(
            inputBaseStyles,
            error && inputErrorStyles,
            className,
          )}
          style={{ width: inputWidth }}
        />
        {unit && (
          <span className='text-xs text-muted-foreground whitespace-nowrap' aria-hidden='true'>{unit}</span>
        )}
      </div>
      {description && !error && (
        <span id={`${id}-description`} className='text-xs text-muted-foreground mt-1 block'>
          {description}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className='text-xs text-destructive mt-1 block' role='alert'>
          {error}
        </span>
      )}
    </FieldRow>
  );
});

NumberField.displayName = 'NumberField';

/**
 * SelectField - поле для select з опціями
 *
 * Повторюваний патерн:
 * [Label] [Select]
 */
export interface SelectFieldProps {
  label: string;
  id: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  description?: string;
}

export const SelectField: React.FC<SelectFieldProps> = memo(({
  label,
  id,
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled = false,
  className,
  error,
  description,
}) => {
  const handleChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <FieldRow label={label} htmlFor={id} required={required}>
      <select
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : description ? `${id}-description` : undefined}
        className={cn(
          'h-10 px-3 pr-10 text-sm',
          'border border-input rounded-md bg-background',
          'hover:border-muted-foreground/50',
          'focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none',
          'transition-colors cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'appearance-none',
          "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
          'bg-no-repeat bg-right bg-[length:16px_16px] bg-[right_8px_center]',
          error && inputErrorStyles,
          className,
        )}
      >
        {placeholder && <option value=''>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {description && !error && (
        <span id={`${id}-description`} className='text-xs text-muted-foreground mt-1 block'>
          {description}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className='text-xs text-destructive mt-1 block' role='alert'>
          {error}
        </span>
      )}
    </FieldRow>
  );
});

SelectField.displayName = 'SelectField';

/**
 * LengthWithGapField - поле для довжини з допуском (Δ)
 *
 * Повторюваний патерн:
 * [Label] [Input] + [Δ Input] [Unit]
 */
export interface LengthWithGapFieldProps {
  label: string;
  id: string;
  value: number | string;
  onChange: (value: number) => void;
  gapValue: number | string;
  onGapChange: (value: number) => void;
  unit: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  gapError?: string;
}

export const LengthWithGapField: React.FC<LengthWithGapFieldProps> = memo(({
  label,
  id,
  value,
  onChange,
  gapValue,
  onGapChange,
  unit,
  placeholder,
  required,
  error,
  gapError,
}) => {
  const gapId = `${id}-gap`;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    if (!isNaN(num)) {
      onChange(num);
    }
  }, [onChange]);

  const handleGapChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    if (!isNaN(num)) {
      onGapChange(num);
    }
  }, [onGapChange]);

  return (
    <FieldRow label={label} htmlFor={id} required={required}>
      <div className='flex items-baseline gap-2'>
        <input
          id={id}
          type='number'
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'h-10 px-3 text-sm font-mono',
            'border border-input rounded-md bg-background',
            'hover:border-muted-foreground/50',
            'focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none',
            'transition-colors',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/10',
          )}
          style={{ width: '9ch' }}
        />
        <span className='text-muted-foreground text-sm pb-1' aria-hidden='true'>+</span>
        <div className='flex items-center gap-1'>
          <span className='text-xs font-bold text-muted-foreground leading-none' aria-hidden='true'>Δ</span>
          <input
            id={gapId}
            type='number'
            placeholder='0'
            value={gapValue}
            onChange={handleGapChange}
            aria-invalid={!!gapError}
            aria-describedby={gapError ? `${gapId}-error` : undefined}
            className={cn(
              'h-10 px-3 text-center text-sm font-mono',
              'border border-input rounded-md bg-background',
              'hover:border-muted-foreground/50',
              'focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none',
              'transition-colors',
              gapError && 'border-destructive focus:border-destructive focus:ring-destructive/10',
            )}
            style={{ width: '9ch' }}
          />
        </div>
        <span className='text-xs text-muted-foreground whitespace-nowrap pb-1' aria-hidden='true'>{unit}</span>
      </div>
      {(error || gapError) && (
        <div className='space-y-1 mt-1'>
          {error && (
            <span id={`${id}-error`} className='text-xs text-destructive block' role='alert'>
              {error}
            </span>
          )}
          {gapError && (
            <span id={`${gapId}-error`} className='text-xs text-destructive block' role='alert'>
              {gapError}
            </span>
          )}
        </div>
      )}
    </FieldRow>
  );
});

LengthWithGapField.displayName = 'LengthWithGapField';

/**
 * TextField - універсальне текстове поле
 *
 * Повторюваний патерн:
 * [Label] [Input (text)]
 */
export interface TextFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  description?: string;
  autoComplete?: string;
}

export const TextField: React.FC<TextFieldProps> = memo(({
  label,
  id,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  disabled = false,
  className,
  error,
  description,
  autoComplete,
}) => {
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <FieldRow label={label} htmlFor={id} required={required}>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : description ? `${id}-description` : undefined}
        className={cn(
          inputBaseStyles,
          'w-full',
          error && inputErrorStyles,
          className,
        )}
      />
      {description && !error && (
        <span id={`${id}-description`} className='text-xs text-muted-foreground mt-1 block'>
          {description}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className='text-xs text-destructive mt-1 block' role='alert'>
          {error}
        </span>
      )}
    </FieldRow>
  );
});

TextField.displayName = 'TextField';
