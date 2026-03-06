import * as React from 'react';
import { Button } from './Button';
import { Alert } from './Alert';
import { cn } from '@/lib/utils';

export interface CalculationControlsProps {
  isLoading: boolean;
  error?: string | null;
  submitText?: string;
  loadingText?: string;
  onSubmit: () => void;
  className?: string;
}

/**
 * CalculationControls - кнопка розрахунку з обробкою станів
 */
const CalculationControls: React.FC<CalculationControlsProps> = ({
  isLoading,
  error,
  submitText = 'Розрахувати',
  loadingText = 'Розрахунок...',
  onSubmit,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <Button
        variant="default"
        className="w-full"
        onClick={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="mr-2">⏳</span>
            {loadingText}
          </>
        ) : (
          submitText
        )}
      </Button>

      {error && (
        <Alert variant="destructive">
          <p className="text-sm">{error}</p>
        </Alert>
      )}
    </div>
  );
};

export { CalculationControls };
