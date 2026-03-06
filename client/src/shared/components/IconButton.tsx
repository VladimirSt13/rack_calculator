import React from 'react';
import { Button, type ButtonProps } from './Button';
import { cn } from '../../lib/utils';

export interface IconButtonProps extends Omit<ButtonProps, 'size' | 'className'> {
  /** Іконка для відображення */
  icon: React.ComponentType<{ width?: number | string; height?: number | string; className?: string }>;
  /** Розмір іконки (за замовчуванням 18px) */
  iconSize?: number;
  /** Варіант кнопки (за замовчуванням icon) */
  variant?: 'icon' | 'icon-outline';
  /** Додаткові класи */
  className?: string;
}

/**
 * IconButton - кнопка тільки з іконкою
 * Автоматично центрує іконку і задає правильний розмір
 * Використовує спеціальні варіанти 'icon' та 'icon-outline' без зсуву
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  iconSize = 18,
  variant = 'icon',
  className,
  ...props
}) => {
  return (
    <Button type='button' variant={variant} size='icon' className={cn('shrink-0 p-0', className)} {...props}>
      <Icon width={iconSize} height={iconSize} />
    </Button>
  );
};

export default IconButton;
