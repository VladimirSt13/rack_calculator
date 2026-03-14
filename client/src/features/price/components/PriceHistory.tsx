import React, { useState, useMemo } from "react";
import {
  History,
  Eye,
  RotateCcw,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/Table";
import type { PriceVersion } from "@/features/price/priceApi";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Пагінація
  const paginatedVersions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return versions.slice(startIndex, startIndex + itemsPerPage);
  }, [versions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(versions.length / itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Форматування дати
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
            Історія змін прайсу
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
              {paginatedVersions.map((version, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index;
                const isCurrent = globalIndex === 0;
                return (
                  <TableRow key={version.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          #{versions.length - globalIndex}
                        </span>
                        {isCurrent && (
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
                        {!isCurrent && (
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
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Пагінація */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Показано</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>з {versions.length} записів</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Назад
            </Button>
            <span className="text-sm text-muted-foreground">
              Сторінка {currentPage} з {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Вперед
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceHistory;
