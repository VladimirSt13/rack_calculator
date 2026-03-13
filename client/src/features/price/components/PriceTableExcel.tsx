import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Search, Filter, ChevronRight, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/Table';
import { CATEGORY_NAMES } from '@/core/constants/priceCategories';
import type { PriceData } from '@/features/price/priceApi';

/**
 * Компонент для зміни ширини стовпчика
 */
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
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const diff = e.clientX - startX.current;
      const newWidth = startWidth.current + diff;
      onResize(column, Math.max(50, newWidth));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, column, onResize]);

  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 transition-colors z-50"
      onMouseDown={handleMouseDown}
    />
  );
};

/**
 * Категорії прайсу для фільтру та відображення
 */
const CATEGORY_ORDER = ['supports', 'spans', 'vertical_supports', 'diagonal_brace', 'isolator'];

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
  type?: 'edge' | 'intermediate' | 'parent' | 'default';
  subCode?: string;
  isParent?: boolean;
  isHeader?: boolean;
}

export interface PriceTableProps {
  priceData: PriceData;
  onUpdate: (category: string, code: string, updates: any) => void;
}

/**
 * PriceTable - таблиця прайсу в стилі Excel
 */
export const PriceTable: React.FC<PriceTableProps> = ({
  priceData,
  onUpdate,
}) => {
  // Стани
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    supports: true,
    spans: true,
    vertical_supports: true,
    diagonal_brace: true,
    isolator: true,
  });

  // Ширина стовпчиків
  const [columnWidths, setColumnWidths] = useState({
    number: 50,
    code: 100,
    name: 300,
    category: 150,
    price: 120,
    weight: 100,
    description: 400,
  });

  // Редагування
  const [editingCell, setEditingCell] = useState<{ category: string; code: string; field: string } | null>(null);
  const editingRefs = useRef<Record<string, HTMLDivElement>>({});

  // Розпарсити дані в простий список по категоріях
  const allItems = useMemo(() => {
    const items: TableItem[] = [];

    CATEGORY_ORDER.forEach(category => {
      const categoryItems = priceData[category as keyof PriceData];
      if (!categoryItems) return;

      // Додаємо заголовок категорії
      items.push({
        category,
        code: '',
        name: CATEGORY_NAMES[category],
        price: 0,
        isHeader: true,
      });

      let itemNumber = 1;

      Object.entries(categoryItems).forEach(([code, item]) => {
        const anyItem = item as any;
        
        // Для опор - з вкладеною структурою (edge/intermediate)
        if (category === 'supports' && anyItem.edge && anyItem.intermediate) {
          // Додаємо рядок із загальною назвою опори
          items.push({
            category,
            code: `${code}-parent`,
            name: anyItem.name || 'Бокові частини 1 рядна',
            price: 0,
            weight: null,
            description: '',
            type: 'parent',
            subCode: code,
            isParent: true,
          });
          itemNumber++;
          
          // Крайня опора
          items.push({
            category,
            code: `${code}-edge`,
            name: anyItem.edge?.name || 'Опора крайня',
            price: anyItem.edge?.price || 0,
            weight: anyItem.edge?.weight,
            description: anyItem.edge?.description || '',
            type: 'edge',
            subCode: code,
          });
          itemNumber++;

          // Проміжна опора
          items.push({
            category,
            code: `${code}-intermediate`,
            name: anyItem.intermediate?.name || 'Проміжна опора',
            price: anyItem.intermediate?.price || 0,
            weight: anyItem.intermediate?.weight,
            description: anyItem.intermediate?.description || '',
            type: 'intermediate',
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
            type: 'default',
          });
          itemNumber++;
        }
      });

      // Пустий рядок між категоріями
      items.push({
        category,
        code: '',
        name: '',
        price: 0,
        isHeader: false,
      });
    });

    return items;
  }, [priceData]);

  // Фільтрація
  const filteredItems = useMemo(() => {
    const result: TableItem[] = [];

    allItems.forEach(item => {
      // Заголовки категорій завжди додаємо
      if (item.isHeader) {
        result.push(item);
        return;
      }

      // Пусті рядки завжди додаємо
      if (item.name === '') {
        result.push(item);
        return;
      }

      // Фільтр за категорією
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return;
      }

      // Фільтр за пошуком
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesCode = item.code.toLowerCase().includes(query);
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDescription = item.description?.toLowerCase().includes(query);

        if (!matchesCode && !matchesName && !matchesDescription) {
          return;
        }
      }

      // Перевірка розгорнутої категорії
      const isExpanded = expandedCategories[item.category];
      if (!isExpanded && !item.isHeader) {
        return;
      }

      result.push(item);
    });

    return result;
  }, [allItems, selectedCategory, searchQuery, expandedCategories]);

  // Збереження змін
  const handleSaveEdit = useCallback((category: string, code: string, field: string, value: string, subKey?: string, oldCode?: string) => {
    const updates: any = {};
    
    // Обробка різних типів полів
    switch (field) {
      case 'code':
        updates.code = value;
        break;
      case 'name':
        if (subKey) {
          updates[subKey] = { name: value };
        } else {
          updates.name = value;
        }
        break;
      case 'price':
        const priceValue = parseFloat(value) || 0;
        if (subKey) {
          updates[subKey] = { price: priceValue };
        } else {
          updates.price = priceValue;
        }
        break;
      case 'weight':
        const weightValue = parseFloat(value) || null;
        if (subKey) {
          updates[subKey] = { weight: weightValue };
        } else {
          updates.weight = weightValue;
        }
        break;
      case 'description':
        if (subKey) {
          updates[subKey] = { description: value };
        } else {
          updates.description = value;
        }
        break;
    }

    // Викликаємо onUpdate з правильними параметрами
    const targetCode = oldCode && oldCode !== code ? oldCode : code;
    onUpdate(category, targetCode, updates);
    setEditingCell(null);
  }, [onUpdate]);

  // Зміна ширини стовпчика
  const handleResize = useCallback((column: string, newWidth: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [column]: Math.max(50, newWidth), // Мінімальна ширина 50px
    }));
  }, []);

  // Розгорнути/згорнути категорію
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  // Підрахунок номерів для відображення
  const getItemNumber = useCallback((index: number) => {
    let number = 0;
    for (let i = 0; i < index; i++) {
      if (!filteredItems[i].isHeader && filteredItems[i].name !== '') {
        number++;
      }
    }
    return number;
  }, [filteredItems]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Прайс-лист</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Фільтри */}
        <div className="flex items-center gap-4 mb-4">
          <Input
            type="text"
            placeholder="Пошук за кодом, назвою або описом..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="all">Всі категорії</option>
            <option value="supports">Опори</option>
            <option value="spans">Балки</option>
            <option value="vertical_supports">Вертикальні опори</option>
            <option value="diagonal_brace">Розкоси</option>
            <option value="isolator">Ізолятори</option>
          </select>
        </div>

        {/* Таблиця */}
        <div className="rounded-md border overflow-auto max-h-[700px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-20 border-b">
              <TableRow>
                <TableHead className="relative border-r" style={{ width: columnWidths.number }}>
                  №
                  <ColumnResizer column="number" width={columnWidths.number} onResize={handleResize} />
                </TableHead>
                <TableHead className="relative border-r" style={{ width: columnWidths.code }}>
                  Код
                  <ColumnResizer column="code" width={columnWidths.code} onResize={handleResize} />
                </TableHead>
                <TableHead className="relative border-r" style={{ width: columnWidths.name }}>
                  Назва
                  <ColumnResizer column="name" width={columnWidths.name} onResize={handleResize} />
                </TableHead>
                <TableHead className="relative border-r" style={{ width: columnWidths.category }}>
                  Категорія
                  <ColumnResizer column="category" width={columnWidths.category} onResize={handleResize} />
                </TableHead>
                <TableHead className="relative text-right border-r" style={{ width: columnWidths.price }}>
                  Ціна
                  <ColumnResizer column="price" width={columnWidths.price} onResize={handleResize} />
                </TableHead>
                <TableHead className="relative text-right border-r" style={{ width: columnWidths.weight }}>
                  Вага
                  <ColumnResizer column="weight" width={columnWidths.weight} onResize={handleResize} />
                </TableHead>
                <TableHead className="relative" style={{ width: columnWidths.description }}>
                  Опис
                  <ColumnResizer column="description" width={columnWidths.description} onResize={handleResize} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                        className="cursor-pointer hover:bg-muted/50 bg-muted"
                        onClick={() => toggleCategory(item.category)}
                      >
                        <TableCell colSpan={7} className="font-bold text-base py-3">
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
                  if (item.name === '') {
                    return (
                      <TableRow key={`${item.category}-spacer`}>
                        <TableCell colSpan={7} className="py-2"></TableCell>
                      </TableRow>
                    );
                  }

                  // Батьківський рядок опори (загальна назва)
                  if (item.isParent) {
                    const itemNumber = getItemNumber(index);
                    const isEditing = editingCell?.category === item.category && editingCell?.code === item.code;
                    
                    return (
                      <TableRow key={`${item.category}-${item.code}`} className="bg-muted/30">
                        <TableCell className="font-medium text-muted-foreground border-r">{itemNumber}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground border-r">{item.subCode}</TableCell>
                        <TableCell className="border-r">
                          <div
                            ref={el => { if (el) editingRefs.current[`${item.category}-${item.code}-name`] = el; }}
                            contentEditable={isEditing}
                            suppressContentEditableWarning
                            className="focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 rounded px-2 py-1 min-h-[24px] font-semibold cursor-pointer hover:bg-muted/50"
                            onBlur={(e) => {
                              if (isEditing) {
                                handleSaveEdit(item.category, item.code, 'name', e.currentTarget.textContent || '', undefined, item.subCode);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                (e.target as HTMLDivElement).blur();
                              }
                            }}
                            onClick={() => {
                              if (!isEditing) {
                                setEditingCell({ category: item.category, code: item.code, field: 'name' });
                              }
                            }}
                          >
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell className="border-r">
                          <span className="text-xs px-2 py-1 bg-muted rounded">
                            {CATEGORY_NAMES[item.category as keyof typeof CATEGORY_NAMES] || item.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground border-r">—</TableCell>
                        <TableCell className="text-right text-muted-foreground border-r">—</TableCell>
                        <TableCell className="text-muted-foreground">—</TableCell>
                      </TableRow>
                    );
                  }

                  // Звичайний рядок
                  const itemNumber = getItemNumber(index);
                  const isEditingCode = editingCell?.category === item.category && editingCell?.code === item.code && editingCell?.field === 'code';
                  const isEditingName = editingCell?.category === item.category && editingCell?.code === item.code && editingCell?.field === 'name';
                  const isEditingPrice = editingCell?.category === item.category && editingCell?.code === item.code && editingCell?.field === 'price';
                  const isEditingWeight = editingCell?.category === item.category && editingCell?.code === item.code && editingCell?.field === 'weight';
                  const isEditingDescription = editingCell?.category === item.category && editingCell?.code === item.code && editingCell?.field === 'description';

                  return (
                    <TableRow key={`${item.category}-${item.code}`} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-xs border-r">{itemNumber}</TableCell>
                      
                      {/* Код */}
                      <TableCell className="font-mono text-xs border-r">
                        <div
                          ref={el => { if (el) editingRefs.current[`${item.category}-${item.code}-code`] = el; }}
                          contentEditable={isEditingCode}
                          suppressContentEditableWarning
                          className="focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 rounded px-2 py-1 min-h-[24px] cursor-pointer hover:bg-muted/50"
                          onBlur={(e) => {
                            if (isEditingCode) {
                              handleSaveEdit(item.category, item.code, 'code', e.currentTarget.textContent || '', item.type !== 'default' && item.type !== 'parent' ? item.type : undefined, item.subCode);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              (e.target as HTMLDivElement).blur();
                            }
                          }}
                          onClick={() => {
                            if (!isEditingCode) {
                              setEditingCell({ category: item.category, code: item.code, field: 'code' });
                            }
                          }}
                        >
                          {item.code}
                        </div>
                      </TableCell>
                      
                      {/* Назва */}
                      <TableCell className="border-r">
                        <div
                          ref={el => { if (el) editingRefs.current[`${item.category}-${item.code}-name`] = el; }}
                          contentEditable={isEditingName}
                          suppressContentEditableWarning
                          className="focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 rounded px-2 py-1 min-h-[24px] cursor-pointer hover:bg-muted/50"
                          onBlur={(e) => {
                            if (isEditingName) {
                              handleSaveEdit(item.category, item.code, 'name', e.currentTarget.textContent || '', item.type !== 'default' && item.type !== 'parent' ? item.type : undefined, item.subCode);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              (e.target as HTMLDivElement).blur();
                            }
                          }}
                          onClick={() => {
                            if (!isEditingName) {
                              setEditingCell({ category: item.category, code: item.code, field: 'name' });
                            }
                          }}
                        >
                          {item.name}
                        </div>
                      </TableCell>
                      
                      {/* Категорія */}
                      <TableCell className="border-r">
                        <span className="text-xs px-2 py-1 bg-muted rounded">
                          {CATEGORY_NAMES[item.category as keyof typeof CATEGORY_NAMES] || item.category}
                        </span>
                      </TableCell>
                      
                      {/* Ціна */}
                      <TableCell className="text-right border-r">
                        <div
                          ref={el => { if (el) editingRefs.current[`${item.category}-${item.code}-price`] = el; }}
                          contentEditable={isEditingPrice}
                          suppressContentEditableWarning
                          className="focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 rounded px-2 py-1 min-h-[24px] cursor-pointer hover:bg-muted/50 inline-block text-right"
                          onBlur={(e) => {
                            if (isEditingPrice) {
                              handleSaveEdit(item.category, item.code, 'price', e.currentTarget.textContent || '', item.type !== 'default' && item.type !== 'parent' ? item.type : undefined, item.subCode);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              (e.target as HTMLDivElement).blur();
                            }
                          }}
                          onClick={() => {
                            if (!isEditingPrice) {
                              setEditingCell({ category: item.category, code: item.code, field: 'price' });
                            }
                          }}
                        >
                          {item.price.toFixed(2)} ₴
                        </div>
                      </TableCell>
                      
                      {/* Вага */}
                      <TableCell className="text-right border-r">
                        <div
                          ref={el => { if (el) editingRefs.current[`${item.category}-${item.code}-weight`] = el; }}
                          contentEditable={isEditingWeight}
                          suppressContentEditableWarning
                          className="focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 rounded px-2 py-1 min-h-[24px] cursor-pointer hover:bg-muted/50 inline-block text-right"
                          onBlur={(e) => {
                            if (isEditingWeight) {
                              handleSaveEdit(item.category, item.code, 'weight', e.currentTarget.textContent || '', item.type !== 'default' && item.type !== 'parent' ? item.type : undefined, item.subCode);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              (e.target as HTMLDivElement).blur();
                            }
                          }}
                          onClick={() => {
                            if (!isEditingWeight) {
                              setEditingCell({ category: item.category, code: item.code, field: 'weight' });
                            }
                          }}
                        >
                          {item.weight ? `${item.weight.toFixed(2)} кг` : '—'}
                        </div>
                      </TableCell>
                      
                      {/* Опис */}
                      <TableCell>
                        <div
                          ref={el => { if (el) editingRefs.current[`${item.category}-${item.code}-description`] = el; }}
                          contentEditable={isEditingDescription}
                          suppressContentEditableWarning
                          className="focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 rounded px-2 py-1 min-h-[24px] cursor-pointer hover:bg-muted/50 text-sm text-muted-foreground truncate max-w-full"
                          onBlur={(e) => {
                            if (isEditingDescription) {
                              handleSaveEdit(item.category, item.code, 'description', e.currentTarget.textContent || '', item.type !== 'default' && item.type !== 'parent' ? item.type : undefined, item.subCode);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              (e.target as HTMLDivElement).blur();
                            }
                          }}
                          onClick={() => {
                            if (!isEditingDescription) {
                              setEditingCell({ category: item.category, code: item.code, field: 'description' });
                            }
                          }}
                        >
                          {item.description || '—'}
                        </div>
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
          Показано {filteredItems.filter(i => !i.isHeader && i.name !== '').length} позицій
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceTable;
