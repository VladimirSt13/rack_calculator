import React from "react";
import { Skeleton } from "./Skeleton";
import { Separator } from "./Separator";

export interface ResultsSkeletonProps {
  /** Кількість рядків для відображення (за замовчуванням 3) */
  rows?: number;
  /** Показувати заголовок (за замовчуванням true) */
  withHeader?: boolean;
  /** Показувати розділювачі (за замовчуванням true) */
  withSeparators?: boolean;
}

/**
 * ResultsSkeleton — скелетон для результатів розрахунку
 * Використовується під час завантаження даних
 */
export const ResultsSkeleton: React.FC<ResultsSkeletonProps> = ({
  rows = 3,
  withHeader = true,
  withSeparators = true,
}) => {
  return (
    <div className="space-y-6">
      {withHeader && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-full" />
        </div>
      )}

      {withSeparators && <Separator />}

      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
};

export default ResultsSkeleton;
