import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  TextButton,
  IconButton,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Input,
  PriceDisplay,
} from "@/shared/components";
import { Trash2, Eye, X } from "lucide-react";

/**
 * Базовий елемент комплекту стелажів
 */
export interface BaseSetItem {
  setId: number;
  name: string;
  quantity: number;
  prices?: Array<{ type: string; value: number }>;
}

/**
 * Конфігурація ціни для відображення
 */
export interface PriceConfig {
  /** Тип ціни для пошуку в масиві prices */
  type:
    | "нульова"
    | "zero"
    | "без_ізоляторів"
    | "no_isolators"
    | "базова"
    | "base";
  /** Label для відображення в таблиці */
  label: string;
  /** Чи показувати цю ціну в основному стовпці */
  isPrimary?: boolean;
  /** Чи показувати в підсумках */
  showInSummary?: boolean;
  /** Клас для тексту в підсумках */
  summaryClass?: string;
}

/**
 * Пропси для кастомізації рядка таблиці
 */
export interface RowRenderProps<T extends BaseSetItem> {
  rack: T;
  quantity: number;
  primaryPrice: number;
  lineTotal: number;
}

/**
 * Пропси для кастомізації підсумків
 */
export interface SummaryRenderProps {
  /** Функція для отримання ціни по типу */
  getPriceByType: (type: string) => number;
  /** Загальна сума по основній ціні */
  totalPrimary: number;
}

/**
 * Пропси SetCard
 */
export interface SetCardProps<T extends BaseSetItem> {
  /** Заголовок картки */
  title?: string;
  /** Список елементів комплекту */
  racks: T[];
  /** Видалити елемент */
  removeRack: (setId: number) => void;
  /** Оновити кількість */
  updateRackQuantity: (setId: number, quantity: number) => void;
  /** Очистити весь комплект */
  clear: () => void;
  /** Конфігурація цін */
  priceConfig: PriceConfig[];
  /** Функція для отримання первинної ціни (для відображення в стовпці) */
  getPrimaryPrice: (rack: T) => number;
  /** Компонент модального вікна */
  modalComponent?: React.ReactNode;
  /** Кастомний рендер додаткових колонок (опціонально) */
  renderExtraColumns?: (props: RowRenderProps<T>) => React.ReactNode;
  /** Кастомний рендер підсумків (опціонально) */
  renderSummary?: (props: SummaryRenderProps) => React.ReactNode;
  /** Текст для пустого стану */
  emptyStateText?: string;
}

/**
 * SetCard - універсальна картка комплекту стелажів
 * Використовується для Battery та Rack
 */
export function SetCard<T extends BaseSetItem>({
  title = "Комплект стелажів",
  racks,
  removeRack,
  updateRackQuantity,
  clear,
  priceConfig,
  getPrimaryPrice,
  modalComponent,
  renderExtraColumns,
  renderSummary,
  emptyStateText = "Додайте стелажі до комплекту натиснувши кнопку «+» у таблиці варіантів",
}: SetCardProps<T>) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Функція для отримання ціни по типу
  const getPriceByType = (rack: T, type: string): number => {
    const priceItem = rack.prices?.find((p) => p.type === type);
    return priceItem?.value || 0;
  };

  // Отримуємо первинну ціну для рядка
  const getRowPrimaryPrice = (rack: T): number => {
    return getPrimaryPrice(rack);
  };

  // Підсумок по первинній ціні
  const totalPrimary = racks.reduce((sum, rack) => {
    const price = getRowPrimaryPrice(rack);
    return sum + price * (rack.quantity || 1);
  }, 0);

  // Знаходимо конфігурацію первинної ціни
  const primaryPriceConfig = priceConfig.find((config) => config.isPrimary);

  if (racks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{emptyStateText}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="max-w-[200px]">Назва</TableHead>
                  <TableHead>Кількість</TableHead>
                  <TableHead>
                    Вартість ({primaryPriceConfig?.label || "ціна"})
                  </TableHead>
                  <TableHead>Загалом</TableHead>
                  {renderExtraColumns && <TableHead>Деталі</TableHead>}
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {racks.map((rack) => {
                  const primaryPrice = getRowPrimaryPrice(rack);
                  const quantity = rack.quantity || 1;
                  const lineTotal = primaryPrice * quantity;

                  return (
                    <TableRow key={rack.setId}>
                      <TableCell className="max-w-[200px]">
                        <div className="text-sm font-medium">{rack.name}</div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          value={rack.quantity}
                          onChange={(e) =>
                            updateRackQuantity(
                              rack.setId,
                              Number(e.target.value),
                            )
                          }
                          className="w-16 text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <PriceDisplay value={primaryPrice} />
                      </TableCell>
                      <TableCell className="font-medium">
                        <PriceDisplay value={lineTotal} />
                      </TableCell>
                      {renderExtraColumns && (
                        <TableCell>
                          {renderExtraColumns({
                            rack,
                            quantity,
                            primaryPrice,
                            lineTotal,
                          })}
                        </TableCell>
                      )}
                      <TableCell>
                        <IconButton
                          icon={Trash2}
                          variant="icon"
                          onClick={() => removeRack(rack.setId)}
                          aria-label="Видалити"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Підсумки */}
          {renderSummary ? (
            renderSummary({
              getPriceByType: (type) =>
                racks.reduce(
                  (sum, rack) => sum + getPriceByType(rack, type),
                  0,
                ),
              totalPrimary,
            })
          ) : (
            <div className="mt-4 pt-4 border-t-2">
              <div className="flex justify-between text-2xl font-bold">
                <span>{primaryPriceConfig?.label || "Загалом"}:</span>
                <PriceDisplay
                  value={totalPrimary}
                  size="2xl"
                  className="font-bold text-primary"
                />
              </div>
            </div>
          )}

          <CardFooter className="px-0 pb-0 flex gap-2">
            <TextButton
              variant="outline"
              className="flex-1"
              leftIcon={Eye}
              onClick={() => setIsModalOpen(true)}
            >
              Переглянути комплект
            </TextButton>
            <TextButton
              variant="outline"
              onClick={clear}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              leftIcon={X}
            >
              Очистити комплект
            </TextButton>
          </CardFooter>
        </CardContent>
      </Card>

      {/* Модалка - рендериться тільки коли відкрита */}
      {isModalOpen &&
        React.cloneElement(modalComponent as React.ReactElement, {
          isOpen: isModalOpen,
          onClose: () => setIsModalOpen(false),
        })}
    </>
  );
}

export default SetCard;
