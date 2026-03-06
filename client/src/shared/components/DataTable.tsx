import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DataTableProps {
  columns: {
    header: string;
    key?: string;
    className?: string;
    render?: (row: any, index: number) => React.ReactNode;
  }[];
  data: any[];
  className?: string;
}

/**
 * DataTable - універсальна таблиця даних
 */
const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  className,
}) => {
  return (
    <div className={cn('table-wrapper', className)}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={col.className}>
                  {col.render
                    ? col.render(row, rowIndex)
                    : col.key
                    ? row[col.key]
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { DataTable };
