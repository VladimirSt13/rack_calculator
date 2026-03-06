import React from 'react';
import { cn } from '../../lib/utils';

export interface PriceDisplayProps {
  /** Сума для відображення */
  value: number;
  /** Показувати символ валюти (за замовчуванням true) */
  withCurrency?: boolean;
  /** Символ валюти (за замовчуванням '₴') */
  currency?: string;
  /** Кількість знаків після коми (за замовчуванням 2) */
  decimals?: number;
  /** Додаткові класи */
  className?: string;
  /** Розмір тексту (за замовчуванням 'sm') */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
}

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

/**
 * PriceDisplay — компонент для відображення ціни
 * Автоматично форматує число і додає символ валюти
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  value,
  withCurrency = true,
  currency = '₴',
  decimals = 2,
  className,
  size = 'sm',
}) => {
  const formattedValue = value.toFixed(decimals);

  return (
    <span
      className={cn(
        'font-mono tabular-nums',
        sizeClasses[size],
        className
      )}
    >
      {formattedValue}
      {withCurrency && <span className='ml-0.5'>{currency}</span>}
    </span>
  );
};

export default PriceDisplay;
