import React from "react";
import { CircleDashed } from "lucide-react";
import { Card, CardContent } from "./Card";

export interface EmptyStateProps {
  /** Повідомлення для відображення */
  message?: string;
  /** Іконка (за замовчуванням CircleDashed) */
  icon?: React.ComponentType<{ className?: string }>;
  /** Додаткові класи */
  className?: string;
}

/**
 * EmptyState — компонент порожнього стану
 * Використовується коли немає даних для відображення
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'Заповніть форму та натисніть "Розрахувати" для отримання результатів',
  icon: Icon = CircleDashed,
  className,
}) => {
  return (
    <Card className={className}>
      <CardContent className="flex items-center justify-center py-16 pt-16">
        <div className="text-center space-y-3">
          <Icon className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
