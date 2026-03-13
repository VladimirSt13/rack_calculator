import React from 'react';
import { History, Eye, RotateCcw, Calendar, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/Table';
import type { PriceVersion } from '@/features/price/priceApi';

export interface PriceHistoryProps {
  versions: PriceVersion[];
  isLoading: boolean;
  onRestore: (versionId: number) => void;
  onViewDetails: (versionId: number) => void;
}

/**
 * PriceHistory - компонент для відображення історії змін прайсу
 */
export const PriceHistory: React.FC<PriceHistoryProps> = ({
  versions,
  isLoading,
  onRestore,
  onViewDetails,
}) => {
  // Форматування дати
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Історія змін
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Історія змін
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Історія змін відсутня
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Історія змін прайсу
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Версія</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Користувач</TableHead>
                <TableHead className="text-right">Кількість позицій</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version, index) => (
                <TableRow key={version.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">#{versions.length - index}</span>
                      {index === 0 && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                          Поточна
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(version.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {version.created_by}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono">{version.items_count}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(version.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Перегляд
                      </Button>
                      {index !== 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRestore(version.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Відновити
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceHistory;
