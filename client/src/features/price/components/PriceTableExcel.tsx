import React, { useState, useMemo, useRef, useCallback } from "react";
import { Filter, ChevronRight, ChevronDown } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
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

const ColumnResizer = ({
  column,
  width,
  onResize,
}: {
  column: string;
  width: number;
  onResize: (column: string, width: number) => void;
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const diff = e.clientX - startX.current;
      onResize(column, Math.max(50, startWidth.current + diff));
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, column, onResize]);

  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/30 z-50"
      onMouseDown={handleMouseDown}
    />
  );
};

const CATEGORY_ORDER = [
  "supports",
  "spans",
  "vertical_supports",
  "diagonal_brace",
  "isolator",
];

interface TableItem {
  category: string;
  code: string;
  name: string;
  price: number;
  weight?: number | null;
  description?: string;
  type?: "edge" | "intermediate" | "parent" | "default";
  subCode?: string;
  isParent?: boolean;
  isHeader?: boolean;
}

export interface PriceTableProps {
  priceData: PriceData;
  onUpdate: (category: string, code: string, updates: any) => void;
}

export const PriceTable: React.FC<PriceTableProps> = ({
  priceData,
  onUpdate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedCategories] = useState<Record<string, boolean>>({
    supports: true,
    spans: true,
    vertical_supports: true,
    diagonal_brace: true,
    isolator: true,
  });
  const [columnWidths, setColumnWidths] = useState({
    number: 50,
    code: 100,
    name: 300,
    category: 150,
    price: 120,
    weight: 100,
    description: 400,
  });
  const [editingCell, setEditingCell] = useState<{
    category: string;
    code: string;
    field: string;
  } | null>(null);
  const editingRefs = useRef<Record<string, HTMLDivElement>>({});

  const handleSaveEdit = useCallback(
    (
      category: string,
      code: string,
      field: string,
      value: string,
      subKey?: string,
      oldCode?: string,
    ) => {
      const updates: Record<string, unknown> = {};
      switch (field) {
        case "code":
          updates.code = value;
          break;
        case "name":
          if (subKey) updates[subKey] = { name: value };
          else updates.name = value;
          break;
        case "price":
          // eslint-disable-next-line no-case-declarations
          const p = parseFloat(value) || 0;
          if (subKey) updates[subKey] = { price: p };
          else updates.price = p;
          break;
        case "weight":
          // eslint-disable-next-line no-case-declarations
          const w = parseFloat(value) || null;
          if (subKey) updates[subKey] = { weight: w };
          else updates.weight = w;
          break;
        case "description":
          if (subKey) updates[subKey] = { description: value };
          else updates.description = value;
          break;
      }
      onUpdate(category, oldCode && oldCode !== code ? oldCode : code, updates);
      setEditingCell(null);
    },
    [onUpdate],
  );

  const handleResize = useCallback((column: string, newWidth: number) => {
    setColumnWidths((prev) => ({ ...prev, [column]: Math.max(50, newWidth) }));
  }, []);

  const allItems = useMemo(() => {
    const items: TableItem[] = [];
    CATEGORY_ORDER.forEach((category) => {
      const categoryItems = priceData[category as keyof PriceData];
      if (!categoryItems) return;
      items.push({
        category,
        code: "",
        name: CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES],
        price: 0,
        isHeader: true,
      });
      Object.entries(categoryItems).forEach(([code, item]) => {
        const anyItem = item as any;
        if (category === "supports" && anyItem.edge && anyItem.intermediate) {
          items.push({
            category,
            code: `${code}-parent`,
            name: anyItem.name || code,
            price: 0,
            weight: null,
            description: "",
            type: "parent",
            subCode: code,
            isParent: true,
          });
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
        } else {
          items.push({
            category,
            code: (anyItem as any).code || code,
            name: (anyItem as any).name || code,
            price: (anyItem as any).price || 0,
            weight: (anyItem as any).weight,
            description: (anyItem as any).description,
            type: "default",
          });
        }
      });
      items.push({ category, code: "", name: "", price: 0, isHeader: false });
    });
    return items;
  }, [priceData]);

  const filteredItems = useMemo(() => {
    const result: TableItem[] = [];
    allItems.forEach((item) => {
      if (item.isHeader || item.name === "") {
        result.push(item);
        return;
      }
      if (selectedCategory !== "all" && item.category !== selectedCategory)
        return;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !item.code.toLowerCase().includes(q) &&
          !item.name.toLowerCase().includes(q) &&
          !item.description?.toLowerCase().includes(q)
        )
          return;
      }
      if (!expandedCategories[item.category]) return;
      result.push(item);
    });
    return result;
  }, [allItems, selectedCategory, searchQuery]);

  const getItemNumber = useCallback(
    (index: number) => {
      let n = 0;
      for (let i = 0; i < index; i++)
        if (!filteredItems[i].isHeader && filteredItems[i].name !== "") n++;
      return n;
    },
    [filteredItems],
  );

  const headerClass =
    "relative bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wide";
  const cellBorder = "border-r border-gray-200 dark:border-gray-700 py-2 px-4";
  const editClass =
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 rounded px-2 py-1 min-h-[24px] cursor-pointer hover:bg-white dark:hover:bg-gray-700 bg-transparent";

  return (
    <Card className="border-0 shadow-sm dark:bg-gray-900 dark:border-gray-700">
      <CardHeader className="border-b bg-white dark:bg-gray-900 dark:border-gray-700 py-3">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Прайс-лист
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex items-center gap-4 mb-4 p-4 border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <Input
            type="text"
            placeholder="Пошук..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm h-9 text-sm dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex h-9 items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Всі категорії</option>
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_NAMES[c as keyof typeof CATEGORY_NAMES]}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-md border border-gray-300 dark:border-gray-700 overflow-auto max-h-[700px] bg-white dark:bg-gray-900">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-20 border-b border-gray-300 dark:border-gray-700">
              <TableRow>
                {[
                  { key: "№", width: 70 },
                  { key: "Код", width: 100 },
                  { key: "Назва", width: 300 },
                  { key: "Категорія", width: 150 },
                  { key: "Ціна (грн)", right: true, width: 120 },
                  { key: "Вага (кг)", right: true, width: 100 },
                  { key: "Опис", width: 400 },
                ].map((h, i) => {
                  const colKey = [
                    "number",
                    "code",
                    "name",
                    "category",
                    "price",
                    "weight",
                    "description",
                  ][i];
                  return (
                    <TableHead
                      key={h.key}
                      className={`${headerClass} ${h.right ? "text-right" : ""}`}
                      style={{ width: h.width }}
                    >
                      {h.key}
                      <ColumnResizer
                        column={colKey}
                        width={
                          columnWidths[colKey as keyof typeof columnWidths]
                        }
                        onResize={handleResize}
                      />
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-gray-500 dark:text-gray-400"
                  >
                    <Filter className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-base font-medium">Нічого не знайдено</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item, index) => {
                  if (item.isHeader) {
                    const isExpanded = expandedCategories[item.category];
                    return (
                      <TableRow
                        key={`${item.category}-header`}
                        className="cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <TableCell
                          colSpan={7}
                          className="font-semibold text-gray-800 dark:text-gray-100 py-3 px-4"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            {item.name}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }
                  if (item.name === "")
                    return (
                      <TableRow
                        key={`${item.category}-spacer`}
                        className="bg-gray-50 dark:bg-gray-800"
                      >
                        <TableCell colSpan={7} className="py-1"></TableCell>
                      </TableRow>
                    );

                  const itemNumber = getItemNumber(index);
                  const isEditingCode =
                    editingCell?.category === item.category &&
                    editingCell?.code === item.code &&
                    editingCell?.field === "code";
                  const isEditingName =
                    editingCell?.category === item.category &&
                    editingCell?.code === item.code &&
                    editingCell?.field === "name";
                  const isEditingPrice =
                    editingCell?.category === item.category &&
                    editingCell?.code === item.code &&
                    editingCell?.field === "price";
                  const isEditingWeight =
                    editingCell?.category === item.category &&
                    editingCell?.code === item.code &&
                    editingCell?.field === "weight";
                  const isEditingDescription =
                    editingCell?.category === item.category &&
                    editingCell?.code === item.code &&
                    editingCell?.field === "description";

                  if (item.isParent) {
                    return (
                      <TableRow
                        key={`${item.category}-${item.code}`}
                        className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <TableCell
                          className={`font-medium text-xs text-gray-500 dark:text-gray-400 ${cellBorder} bg-gray-50 dark:bg-gray-800`}
                        >
                          {itemNumber}
                        </TableCell>
                        <TableCell
                          className={`font-mono text-xs text-gray-500 dark:text-gray-400 ${cellBorder} bg-gray-50 dark:bg-gray-800`}
                        >
                          {item.subCode}
                        </TableCell>
                        <TableCell className={cellBorder}>
                          <div
                            ref={(el) => {
                              if (el)
                                editingRefs.current[
                                  `${item.category}-${item.code}-name`
                                ] = el;
                            }}
                            contentEditable={isEditingName}
                            suppressContentEditableWarning
                            className={`${editClass} font-semibold text-gray-900 dark:text-gray-100`}
                            onBlur={(e) => {
                              if (isEditingName)
                                handleSaveEdit(
                                  item.category,
                                  item.code,
                                  "name",
                                  e.currentTarget.textContent || "",
                                  undefined,
                                  item.subCode,
                                );
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                (e.target as HTMLDivElement).blur();
                              }
                            }}
                            onClick={() => {
                              if (!isEditingName)
                                setEditingCell({
                                  category: item.category,
                                  code: item.code,
                                  field: "name",
                                });
                            }}
                          >
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell className={cellBorder}>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                            {
                              CATEGORY_NAMES[
                                item.category as keyof typeof CATEGORY_NAMES
                              ]
                            }
                          </span>
                        </TableCell>
                        <TableCell
                          className={`text-right text-gray-400 dark:text-gray-500 ${cellBorder} bg-gray-50 dark:bg-gray-800`}
                        >
                          —
                        </TableCell>
                        <TableCell
                          className={`text-right text-gray-400 dark:text-gray-500 ${cellBorder} bg-gray-50 dark:bg-gray-800`}
                        >
                          —
                        </TableCell>
                        <TableCell className="text-gray-400 dark:text-gray-500 py-2 px-4 bg-gray-50 dark:bg-gray-800">
                          —
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return (
                    <TableRow
                      key={`${item.category}-${item.code}`}
                      className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <TableCell
                        className={`font-medium text-xs text-gray-500 dark:text-gray-400 ${cellBorder} bg-gray-50 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-gray-700`}
                      >
                        {itemNumber}
                      </TableCell>
                      <TableCell className={cellBorder}>
                        <div
                          ref={(el) => {
                            if (el)
                              editingRefs.current[
                                `${item.category}-${item.code}-code`
                              ] = el;
                          }}
                          contentEditable={isEditingCode}
                          suppressContentEditableWarning
                          className={`${editClass} font-mono text-gray-900 dark:text-gray-100`}
                          onBlur={(e) => {
                            if (isEditingCode)
                              handleSaveEdit(
                                item.category,
                                item.code,
                                "code",
                                e.currentTarget.textContent || "",
                                item.type !== "default" ? item.type : undefined,
                                item.subCode,
                              );
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              (e.target as HTMLDivElement).blur();
                            }
                          }}
                          onClick={() => {
                            if (!isEditingCode)
                              setEditingCell({
                                category: item.category,
                                code: item.code,
                                field: "code",
                              });
                          }}
                        >
                          {item.code}
                        </div>
                      </TableCell>
                      <TableCell className={cellBorder}>
                        <div
                          ref={(el) => {
                            if (el)
                              editingRefs.current[
                                `${item.category}-${item.code}-name`
                              ] = el;
                          }}
                          contentEditable={isEditingName}
                          suppressContentEditableWarning
                          className={`${editClass} text-gray-900 dark:text-gray-100`}
                          onBlur={(e) => {
                            if (isEditingName)
                              handleSaveEdit(
                                item.category,
                                item.code,
                                "name",
                                e.currentTarget.textContent || "",
                                item.type !== "default" ? item.type : undefined,
                                item.subCode,
                              );
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              (e.target as HTMLDivElement).blur();
                            }
                          }}
                          onClick={() => {
                            if (!isEditingName)
                              setEditingCell({
                                category: item.category,
                                code: item.code,
                                field: "name",
                              });
                          }}
                        >
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell className={cellBorder}>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {
                            CATEGORY_NAMES[
                              item.category as keyof typeof CATEGORY_NAMES
                            ]
                          }
                        </span>
                      </TableCell>
                      <TableCell className={`text-right ${cellBorder}`}>
                        <div
                          ref={(el) => {
                            if (el)
                              editingRefs.current[
                                `${item.category}-${item.code}-price`
                              ] = el;
                          }}
                          contentEditable={isEditingPrice}
                          suppressContentEditableWarning
                          className={`${editClass} inline-block text-right font-medium text-gray-900 dark:text-gray-100`}
                          onBlur={(e) => {
                            if (isEditingPrice)
                              handleSaveEdit(
                                item.category,
                                item.code,
                                "price",
                                e.currentTarget.textContent || "",
                                item.type !== "default" ? item.type : undefined,
                                item.subCode,
                              );
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              (e.target as HTMLDivElement).blur();
                            }
                          }}
                          onClick={() => {
                            if (!isEditingPrice)
                              setEditingCell({
                                category: item.category,
                                code: item.code,
                                field: "price",
                              });
                          }}
                        >
                          {item.price.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className={`text-right ${cellBorder}`}>
                        <div
                          ref={(el) => {
                            if (el)
                              editingRefs.current[
                                `${item.category}-${item.code}-weight`
                              ] = el;
                          }}
                          contentEditable={isEditingWeight}
                          suppressContentEditableWarning
                          className={`${editClass} inline-block text-right text-gray-600 dark:text-gray-300`}
                          onBlur={(e) => {
                            if (isEditingWeight)
                              handleSaveEdit(
                                item.category,
                                item.code,
                                "weight",
                                e.currentTarget.textContent || "",
                                item.type !== "default" ? item.type : undefined,
                                item.subCode,
                              );
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              (e.target as HTMLDivElement).blur();
                            }
                          }}
                          onClick={() => {
                            if (!isEditingWeight)
                              setEditingCell({
                                category: item.category,
                                code: item.code,
                                field: "weight",
                              });
                          }}
                        >
                          {item.weight ? item.weight.toFixed(2) : "—"}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <div
                          ref={(el) => {
                            if (el)
                              editingRefs.current[
                                `${item.category}-${item.code}-description`
                              ] = el;
                          }}
                          contentEditable={isEditingDescription}
                          suppressContentEditableWarning
                          className={`${editClass} text-sm text-gray-600 dark:text-gray-300 truncate max-w-full`}
                          onBlur={(e) => {
                            if (isEditingDescription)
                              handleSaveEdit(
                                item.category,
                                item.code,
                                "description",
                                e.currentTarget.textContent || "",
                                item.type !== "default" ? item.type : undefined,
                                item.subCode,
                              );
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              (e.target as HTMLDivElement).blur();
                            }
                          }}
                          onClick={() => {
                            if (!isEditingDescription)
                              setEditingCell({
                                category: item.category,
                                code: item.code,
                                field: "description",
                              });
                          }}
                        >
                          {item.description || "—"}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 px-4">
          Показано{" "}
          {filteredItems.filter((i) => !i.isHeader && i.name !== "").length}{" "}
          позицій
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceTable;
