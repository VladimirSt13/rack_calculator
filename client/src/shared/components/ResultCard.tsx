import * as React from "react";
import { cn } from "@/lib/utils";

export interface ResultCardProps {
  title: string;
  emptyMessage?: string;
  isEmpty?: boolean;
  className?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * ResultCard - картка з результатами
 */
const ResultCard: React.FC<ResultCardProps> = ({
  title,
  emptyMessage = "Немає даних",
  isEmpty = false,
  className,
  children,
  footer,
}) => {
  return (
    <div className={cn("card", className)}>
      <div className="card-header">
        <h2 className="card-title">{title}</h2>
      </div>
      <div className="card-content">
        {isEmpty ? <p className="text-muted">{emptyMessage}</p> : children}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export { ResultCard };
