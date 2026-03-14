import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Save,
  X,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Select } from "@/shared/components/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/Table";
import { CATEGORY_NAMES } from "@/core/constants/priceCategories";
import type { PriceData } from "@/features/price/priceApi";

/**
 * Категорії прайсу для фільтру та відображення
 */
const CATEGORY_ORDER = [
  "supports",
  "spans",
  "vertical_supports",
  "diagonal_brace",
  "isolator",
];

/**
 * Тип для елемента таблиці
 */
interface TableItem {
  category: string;
  code: string;
  name: string;
  price: number;
  weight?: number | null;
  description?: string;
  type?: "edge" | "intermediate" | "default" | "parent";
  subCode?: string; // Для опор: edge/intermediate
  isHeader?: boolean; // Для заголовків категорій
  isParent?: boolean; // Позначка, що це батьківський елемент
}

export interface PriceTableProps {
  priceData: PriceData;
  onUpdate: (category: string, code: string, updates: any) => void;
}

/**
 * PriceTable - таблиця прайсу з простою структурою
 */
export const PriceTable: React.FC<PriceTableProps> = ({
  priceData,
  onUpdate,
}) => {
  // Стани
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingCell, setEditingCell] = useState<{
    category: string;
    code: string;
    field: string;
    subKey?: string;
    oldCode?: string; // Для збереження старого коду при зміні code
    subCode?: string; // Для опор
    type?: "parent" | "edge" | "intermediate" | "default"; // Для типу елемента
  } | null>(null);
  const [editedValue, setEditedValue] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    supports: true,
    spans: true,
    vertical_supports: true,
    diagonal_brace: true,
    isolator: true,
  });

  // Розпарсити дані в простий список по категоріях
  const allItems = useMemo(() => {
    const items: TableItem[] = [];

    CATEGORY_ORDER.forEach((category) => {
      const categoryItems = priceData[category as keyof PriceData];
      if (!categoryItems) return;

      // Додаємо заголовок категорії
      items.push({
        category,
        code: "",
        name: CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES],
        price: 0,
        isHeader: true,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let itemNumber = 1;

      Object.entries(categoryItems).forEach(([code, item]) => {
        const anyItem = item as any;

        // Для опор - з вкладеною структурою (edge/intermediate)
        if (category === "supports" && anyItem.edge && anyItem.intermediate) {
          // Додаємо рядок із загальною назвою опори
          items.push({
            category,
            code: `${code}-parent`,
            name: anyItem.name || "Бокові частини 1 рядна",
            price: 0,
            weight: null,
            description: "",
            type: "parent",
            subCode: code,
            isParent: true, // Позначка, що це батьківський елемент
          });
          itemNumber++;

          // Крайня опора
          items.push({
            category,
            code: `${code}-edge`,
            name: anyItem.edge?.name || "Опора крайня",
            price: anyItem.edge?.price || 0,
            weight: anyItem.edge?.weight,
            description: anyItem.edge?.description || "",
            type: "edge",
            subCode: code,
          });
          itemNumber++;

          // Проміжна опора
          items.push({
            category,
            code: `${code}-intermediate`,
            name: anyItem.intermediate?.name || "Проміжна опора",
            price: anyItem.intermediate?.price || 0,
            weight: anyItem.intermediate?.weight,
            description: anyItem.intermediate?.description || "",
            type: "intermediate",
            subCode: code,
          });
          itemNumber += 2;
        } else {
          // Звичайний елемент (балки, верт. опори, ізолятори)
          const simpleItem = anyItem;
          items.push({
            category,
            code: simpleItem.code || code,
            name: simpleItem.name || code,
            price: simpleItem.price || 0,
            weight: simpleItem.weight,
            description: simpleItem.description,
            type: "default",
          });
          itemNumber++;
        }
      });

      // Пустий рядок між категоріями
      items.push({
        category,
        code: "",
        name: "",
        price: 0,
        isHeader: false,
      });
    });

    return items;
  }, [priceData]);

  // Фільтрація
  const filteredItems = useMemo(() => {
    const result: TableItem[] = [];

    allItems.forEach((item) => {
      // Заголовки категорій завжди додаємо
      if (item.isHeader) {
        result.push(item);
        return;
      }

      // Пусті рядки між категоріями пропускаємо
      if (item.name === "") {
        return;
      }

      // Фільтр по категорії
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return;
      }

      // Перевіряємо, чи розгорнута категорія
      if (!expandedCategories[item.category]) {
        return;
      }

      // Пошук по коду або назві
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          item.code.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query)
        ) {
          result.push(item);
        }
        return;
      }

      result.push(item);
    });

    return result;
  }, [allItems, selectedCategory, searchQuery, expandedCategories]);

  // Збереження змін
  const handleSaveEdit = () => {
    if (editingCell) {
      const updates: Record<string, unknown> = {};

      // Обробка різних типів полів
      switch (editingCell.field) {
        case "code":
          updates.code = editedValue;
          // Якщо це опора з subCode, оновлюємо код батьківського елемента
          if ("subCode" in editingCell && editingCell.subCode) {
            updates.subCode = editedValue;
          }
          break;
        case "name":
          // Для батьківського елемента опори оновлюємо загальну назву
          if ("type" in editingCell && editingCell.type === "parent") {
            updates.name = editedValue;
          }
          // Для опор передаємо оновлення в edge/intermediate
          else if (editingCell.subKey) {
            updates[editingCell.subKey] = { name: editedValue };
          } else {
            updates.name = editedValue;
          }
          break;
        case "price":
          // eslint-disable-next-line no-case-declarations
          const priceValue = parseFloat(editedValue) || 0;
          // Для вкладених структур (edge/intermediate)
          if (editingCell.subKey) {
            updates[editingCell.subKey] = { price: priceValue };
          } else {
            updates.price = priceValue;
          }
          break;
        case "weight":
          // eslint-disable-next-line no-case-declarations
          const weightValue = parseFloat(editedValue) || null;
          // Для вкладених структур (edge/intermediate)
          if (editingCell.subKey) {
            updates[editingCell.subKey] = { weight: weightValue };
          } else {
            updates.weight = weightValue;
          }
          break;
        case "description":
          // Для опор передаємо оновлення в edge/intermediate
          if (editingCell.subKey) {
            updates[editingCell.subKey] = { description: editedValue };
          } else {
            updates.description = editedValue;
          }
          break;
      }

      // Викликаємо onUpdate з правильними параметрами
      if (editingCell.oldCode && editingCell.oldCode !== editingCell.code) {
        // Якщо код змінився, передаємо старий код
        onUpdate(editingCell.category, editingCell.oldCode, updates);
      } else {
        onUpdate(editingCell.category, editingCell.code, updates);
      }

      setEditingCell(null);
    }
  };

  // Скасування редагування
  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditedValue("");
  };

  // Натискання Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  // Підрахунок номерів для відображення
  const getItemNumber = (index: number) => {
    let number = 0;
    for (let i = 0; i < index; i++) {
      if (!filteredItems[i].isHeader && filteredItems[i].name !== "") {
        number++;
      }
    }
    return number;
  };

  // Розгорнути/згорнути категорію
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Розгорнути всі категорії
  const expandAll = () => {
    setExpandedCategories({
      supports: true,
      spans: true,
      vertical_supports: true,
      diagonal_brace: true,
      isolator: true,
    });
  };

  // Згорнути всі категорії
  const collapseAll = () => {
    setExpandedCategories({
      supports: false,
      spans: false,
      vertical_supports: false,
      diagonal_brace: false,
      isolator: false,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Прайс-лист</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Розгорнути всі
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Згорнути всі
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Фільтри */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Пошук за кодом або назвою..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-48">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Всі категорії</option>
              {CATEGORY_ORDER.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_NAMES[cat as keyof typeof CATEGORY_NAMES]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Таблиця */}
        <div className="rounded-md border max-h-[600px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-16">№</TableHead>
                <TableHead className="w-24">Код</TableHead>
                <TableHead>Назва</TableHead>
                <TableHead className="w-32">Категорія</TableHead>
                <TableHead className="text-right w-32">Ціна</TableHead>
                <TableHead className="text-right w-24">Вага</TableHead>
                <TableHead className="w-64">Опис</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Нічого не знайдено
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item, index) => {
                  // Заголовок категорії
                  if (item.isHeader) {
                    const isExpanded = expandedCategories[item.category];
                    return (
                      <TableRow
                        key={`${item.category}-header`}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleCategory(item.category)}
                      >
                        <TableCell
                          colSpan={8}
                          className="bg-muted font-bold text-base py-3"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                            {item.name}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  // Пустий рядок
                  if (item.name === "") {
                    return (
                      <TableRow key={`${item.category}-spacer`}>
                        <TableCell colSpan={8} className="py-2"></TableCell>
                      </TableRow>
                    );
                  }

                  // Батьківський рядок опори (загальна назва)
                  if (item.isParent) {
                    const isEditing =
                      editingCell?.category === item.category &&
                      editingCell?.code === item.code;
                    const editingField = editingCell?.field;
                    const itemNumber = getItemNumber(index);

                    return (
                      <TableRow
                        key={`${item.category}-${item.code}`}
                        className="bg-muted/30"
                      >
                        <TableCell className="font-medium">
                          {itemNumber}
                        </TableCell>

                        {/* Код */}
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {item.subCode}
                        </TableCell>

                        {/* Загальна назва */}
                        <TableCell>
                          {isEditing && editingField === "name" ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={editedValue}
                                onChange={(e) => setEditedValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="h-8 w-full font-semibold"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleSaveEdit}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <span
                              className="cursor-pointer hover:bg-muted px-2 py-1 rounded block font-semibold"
                              onClick={() => {
                                setEditingCell({
                                  category: item.category,
                                  code: item.code,
                                  field: "name",
                                  oldCode: item.subCode,
                                });
                                setEditedValue(item.name);
                              }}
                            >
                              {item.name}
                            </span>
                          )}
                        </TableCell>

                        {/* Категорія */}
                        <TableCell>
                          <span className="text-xs px-2 py-1 bg-muted rounded">
                            {CATEGORY_NAMES[
                              item.category as keyof typeof CATEGORY_NAMES
                            ] || item.category}
                          </span>
                        </TableCell>

                        {/* Ціна - пусто */}
                        <TableCell className="text-right text-muted-foreground">
                          —
                        </TableCell>

                        {/* Вага - пусто */}
                        <TableCell className="text-right text-muted-foreground">
                          —
                        </TableCell>

                        {/* Опис - пусто */}
                        <TableCell className="text-muted-foreground">
                          —
                        </TableCell>

                        {/* Кнопка */}
                        <TableCell></TableCell>
                      </TableRow>
                    );
                  }

                  // Звичайний рядок
                  const itemNumber = getItemNumber(index);
                  const isEditing =
                    editingCell?.category === item.category &&
                    editingCell?.code === item.code;
                  const editingField = editingCell?.field;

                  return (
                    <TableRow key={`${item.category}-${item.code}`}>
                      <TableCell className="font-medium">
                        {itemNumber}
                      </TableCell>

                      {/* Код */}
                      <TableCell className="font-mono text-xs">
                        {isEditing && editingField === "code" ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={editedValue}
                              onChange={(e) => setEditedValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="h-8 w-24"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveEdit}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-muted px-2 py-1 rounded"
                            onClick={() => {
                              setEditingCell({
                                category: item.category,
                                code: item.code,
                                field: "code",
                                oldCode: item.code,
                              });
                              setEditedValue(item.code);
                            }}
                          >
                            {item.code}
                          </span>
                        )}
                      </TableCell>

                      {/* Назва */}
                      <TableCell>
                        {isEditing && editingField === "name" ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={editedValue}
                              onChange={(e) => setEditedValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="h-8 w-full"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveEdit}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-muted px-2 py-1 rounded block"
                            onClick={() => {
                              setEditingCell({
                                category: item.category,
                                code: item.code,
                                field: "name",
                              });
                              setEditedValue(item.name);
                            }}
                          >
                            {item.name}
                          </span>
                        )}
                      </TableCell>

                      {/* Категорія */}
                      <TableCell>
                        <span className="text-xs px-2 py-1 bg-muted rounded">
                          {CATEGORY_NAMES[
                            item.category as keyof typeof CATEGORY_NAMES
                          ] || item.category}
                        </span>
                      </TableCell>

                      {/* Ціна */}
                      <TableCell className="text-right">
                        {isEditing && editingField === "price" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              value={editedValue}
                              onChange={(e) => setEditedValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="h-8 w-24 text-right"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveEdit}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-muted px-2 py-1 rounded block text-right"
                            onClick={() => {
                              setEditingCell({
                                category: item.category,
                                code: item.code,
                                field: "price",
                                subKey:
                                  item.type !== "default"
                                    ? item.type
                                    : undefined,
                              });
                              setEditedValue(String(item.price));
                            }}
                          >
                            {item.price.toFixed(2)} ₴
                          </span>
                        )}
                      </TableCell>

                      {/* Вага */}
                      <TableCell className="text-right">
                        {isEditing && editingField === "weight" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              value={editedValue}
                              onChange={(e) => setEditedValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="h-8 w-20 text-right"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveEdit}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-muted px-2 py-1 rounded block text-right"
                            onClick={() => {
                              setEditingCell({
                                category: item.category,
                                code: item.code,
                                field: "weight",
                                subKey:
                                  item.type !== "default"
                                    ? item.type
                                    : undefined,
                              });
                              setEditedValue(item.weight?.toString() || "");
                            }}
                          >
                            {item.weight ? `${item.weight.toFixed(2)} кг` : "—"}
                          </span>
                        )}
                      </TableCell>

                      {/* Опис */}
                      <TableCell>
                        {isEditing && editingField === "description" ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={editedValue}
                              onChange={(e) => setEditedValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="h-8 w-full"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveEdit}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-muted px-2 py-1 rounded block text-sm text-muted-foreground truncate max-w-xs"
                            onClick={() => {
                              setEditingCell({
                                category: item.category,
                                code: item.code,
                                field: "description",
                              });
                              setEditedValue(item.description || "");
                            }}
                          >
                            {item.description || "—"}
                          </span>
                        )}
                      </TableCell>

                      {/* Кнопка видалення */}
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            // Видалення позиції
                            console.log("Delete:", item.category, item.code);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Підсумок */}
        <div className="mt-4 text-sm text-muted-foreground">
          Показано {filteredItems.length} позицій
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceTable;
