import React from "react";
import { Button, type ButtonProps } from "./Button";
import { cn } from "@/lib/utils";

export interface TextButtonProps extends Omit<ButtonProps, "size"> {
  /** Іконка зліва */
  leftIcon?: React.ComponentType<{
    width?: number | string;
    height?: number | string;
    className?: string;
  }>;
  /** Іконка справа */
  rightIcon?: React.ComponentType<{
    width?: number | string;
    height?: number | string;
    className?: string;
  }>;
  /** Розмір іконки (за замовчуванням 18px) */
  iconSize?: number;
  /** Текст кнопки */
  children: React.ReactNode;
}

/**
 * TextButton — кнопка з текстом та опціональними іконками
 * Використовується для основних дій з текстовими мітками
 */
export const TextButton: React.FC<TextButtonProps> = ({
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  iconSize = 18,
  children,
  className,
  ...props
}) => {
  return (
    <Button type="button" className={cn("gap-2", className)} {...props}>
      {LeftIcon && <LeftIcon width={iconSize} height={iconSize} />}
      {children}
      {RightIcon && <RightIcon width={iconSize} height={iconSize} />}
    </Button>
  );
};

export default TextButton;
