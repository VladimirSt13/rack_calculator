import React from "react";
import { cn } from "@/lib/utils";

/**
 * SectionHeader - заголовок інженерної секції
 *
 * Візуальні характеристики:
 * - Uppercase label (текст у верхньому регістрі)
 * - Subtle separator (тонка лінія розділювача)
 * - Compact spacing (мінімальні відступи)
 */
export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Назва секції */
  title: string;
  /** Опис/підказка (опціонально) */
  description?: string;
  /** Індикатор обов'язковості секції */
  required?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  required,
  className,
  ...props
}) => {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      {/* Label row: title + optional indicator */}
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </h3>
      </div>

      {/* Description (if provided) */}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {/* Subtle separator */}
      <div className="h-px bg-border" />
    </div>
  );
};

/**
 * FormSection - контейнер для інженерної секції
 * Об'єднує заголовок з контентом
 *
 * Вертикальна щільність:
 * - fields: gap-2 (всередині FieldRow)
 * - section content: gap-3 (між полями секції)
 * - section gap: gap-6 (між секціями)
 *
 * Призначення для групування полів за логічними доменами розрахунку:
 * - Geometry (геометрія стелажа)
 * - Components (компоненти: опори, балки)
 * - Spans (прольоти)
 * - Load (навантаження)
 */
export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Назва секції (домен розрахунку) */
  title: string;
  /** Опис (опціонально) */
  description?: string;
  /** Чи обов'язкова секція */
  required?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  required,
  children,
  className,
  ...props
}) => {
  return (
    <section className={cn("space-y-3", className)} {...props}>
      <SectionHeader
        title={title}
        description={description}
        required={required}
      />
      <div className="space-y-5">{children}</div>
    </section>
  );
};

/**
 * FormSectionsGroup - група секцій форми
 * Автоматично застосовує gap-6 між секціями
 */
export interface FormSectionsGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FormSectionsGroup: React.FC<FormSectionsGroupProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("space-y-6", className)} {...props}>
      {children}
    </div>
  );
};
