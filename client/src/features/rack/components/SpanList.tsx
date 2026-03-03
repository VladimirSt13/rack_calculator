import React from 'react';
import { useRackSpansStore } from '../spansStore';
import { Trash2 } from 'lucide-react';
import { Button } from '../../../shared/components';

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
      <div className="p-4 text-center text-sm text-muted-foreground">
        Немає доданих прольотів
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {spans.map((span) => (
        <div
          key={span.id}
          className="grid grid-cols-[1fr_auto_auto] gap-2 items-center p-2.5 border rounded-md bg-card"
        >
          <select
            value={span.item}
            onChange={(e) => updateSpan(span.id, { item: e.target.value })}
            className="min-w-[120px] flex-1 h-8 px-2 text-sm border border-gray-300 rounded-md bg-card hover:border-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all cursor-pointer shadow-sm"
          >
            <option value="">Виберіть проліт...</option>
            {spanOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} мм
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            value={span.quantity}
            onChange={(e) => updateSpan(span.id, { quantity: Number(e.target.value) })}
            className="w-[72px] h-8 px-2 text-center text-sm font-mono border border-gray-300 rounded-md bg-card hover:border-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all shadow-sm md:ml-auto"
          />

          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            type="button"
            onClick={() => removeSpan(span.id)}
            aria-label="Видалити проліт"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default SpanList;
