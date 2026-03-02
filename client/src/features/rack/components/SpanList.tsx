import React from 'react';
import { useRackSpansStore } from '../spansStore';
import { Trash2 } from 'lucide-react';

interface SpanListProps {
  spanOptions: string[];
}

/**
 * SpanList - список прольотів з можливістю редагування
 */
const SpanList: React.FC<SpanListProps> = ({ spanOptions }) => {
  const { spans, updateSpan, removeSpan } = useRackSpansStore();

  if (spans.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Немає доданих прольотів
      </div>
    );
  }

  return (
    <div className="spans-list flex flex-col gap-2">
      {spans.map((span, index) => (
        <div
          key={span.id}
          className="span-row grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center p-3 border rounded-md bg-card"
        >
          <span className="text-sm font-medium text-muted-foreground">
            #{index + 1}
          </span>

          <select
            className="span-select flex-1 p-2 rounded-md border border-input bg-background text-sm"
            value={span.item}
            onChange={(e) => updateSpan(span.id, { item: e.target.value })}
          >
            <option value="">Виберіть проліт...</option>
            {spanOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} мм
              </option>
            ))}
          </select>

          <input
            className="span-quantity w-20 p-2 text-center rounded-md border border-input bg-background text-sm"
            type="number"
            min={1}
            value={span.quantity}
            onChange={(e) => updateSpan(span.id, { quantity: Number(e.target.value) })}
          />

          <button
            className="span-remove inline-flex items-center justify-center p-2 rounded-md border-none bg-transparent text-destructive cursor-pointer transition-fast hover:bg-destructive/10"
            type="button"
            onClick={() => removeSpan(span.id)}
            aria-label="Видалити проліт"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default SpanList;
