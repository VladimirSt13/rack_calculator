/**
 * Rack Calculator - Client Version
 * Тільки типи та UI-функції для клієнта
 * Всі розрахунки виконуються на сервері
 */

// ==================== ТИПИ ====================

export interface SpanItem {
  item: string;
  quantity: number;
}

export interface RackConfig {
  floors: number;
  rows: number;
  beamsPerRow: number;
  supports?: string;
  verticalSupports?: string;
  spans?: SpanItem[];
  spansArray?: number[];
  beams?: number;
}

export interface PriceData {
  supports: Record<string, { edge: { price: number }; intermediate: { price: number } }>;
  spans: Record<string, { price: number }>;
  vertical_supports: Record<string, { price: number }>;
  diagonal_brace: Record<string, { price: number }>;
  isolator: Record<string, { price: number }>;
}

export interface ComponentItem {
  name: string;
  amount: number;
  price: number;
  total: number;
}

export type RackComponents = Record<string, ComponentItem | ComponentItem[]>;

// ==================== UI ФУНКЦІЇ ====================

/**
 * Генерація назви стелажа (для rack page)
 * Тільки UI функція - не використовується для розрахунків
 */
export const generateRackName = (config: RackConfig): string => {
  const { floors, rows, spans, supports } = config;

  const totalLength = spans?.reduce(
    (sum, s) => sum + (parseInt(s.item) || 0) * (s.quantity || 0),
    0,
  ) || 0;

  const hasC = supports?.includes('C') || false;
  const cleanSupports = supports?.replace('C', '') || '';
  const abbreviation = `L${floors}A${rows}${hasC ? 'C' : ''}-${totalLength}/${cleanSupports}`;

  const floorsWords = [
    '',
    'одноповерховий',
    'двоповерховий',
    'трьохповерховий',
    'чотириповерховий',
    "п'ятиповерховий",
  ];
  const rowsWords = ['', 'однорядний', 'двохрядний', 'трьохрядний', 'чотирьохрядний'];

  const description = [
    `Стелаж ${floorsWords[floors] || `${floors}-поверховий`}`,
    rowsWords[rows] || `${rows}-рядний`,
    hasC ? 'ступінчатий' : '',
  ].filter(Boolean).join(' ');

  return `${description} ${abbreviation}`;
};

/**
 * Генерація назви стелажа (для battery page)
 * Тільки UI функція - не використовується для розрахунків
 */
export const generateBatteryRackName = ({
  floors,
  rows,
  supportType,
  rackWidth,
  rackLength,
  spans,
}: {
  floors: number;
  rows: number;
  supportType: string;
  rackWidth: number;
  rackLength: number;
  spans: number[];
}): string => {
  const supportMarker = supportType === 'step' ? 'C' : '';
  const prefix = `L${floors}A${rows}${supportMarker}`;
  const spansSum = spans.reduce((a, b) => a + b, 0);
  const base = `${prefix}-${spansSum}/${rackWidth}`;
  const spansDetail = spans.join('+');
  const detail = floors > 1 ? ` (${spansDetail} - ${rackLength})` : ` (${spansDetail})`;

  return base + detail;
};

/**
 * Генерація HTML таблиці компонентів (тільки для rack page)
 * Тільки UI функція - не використовується для розрахунків
 */
export const generateComponentsTable = (components: RackComponents, showPrices = true): string => {
  const rows: string[] = [];
  const priceVisibilityClass = showPrices ? '' : ' rack__prices-hidden';
  const checkboxCheckedAttr = showPrices ? 'checked' : '';
  const toggleLabelText = showPrices ? 'Приховати ціни' : 'Показати ціни';

  for (const items of Object.values(components)) {
    const itemsArray = Array.isArray(items) ? items : [items];
    itemsArray.forEach((item) => {
      rows.push(`
        <tr class="table__row">
          <td class="table__cell table__cell--name">${item.name}</td>
          <td class="table__cell table__cell--qty">${item.amount}</td>
          <td class="table__cell table__cell--price" data-price="${item.price.toFixed(2)}">${item.price.toFixed(2)} ₴</td>
          <td class="table__cell table__cell--total" data-total="${item.total.toFixed(2)}">${item.total.toFixed(2)} ₴</td>
        </tr>
      `);
    });
  }

  if (rows.length === 0) {
    return '<p class="empty-state">Недостатньо даних для розрахунку</p>';
  }

  return `
    <div class="table-wrapper${priceVisibilityClass}">
      <div class="rack__price-toggle">
        <label class="rack__price-toggle-label">
          <span class="rack__price-toggle-text">${toggleLabelText}</span>
          <input
            type="checkbox"
            data-js="rack-togglePrices"
            ${checkboxCheckedAttr}
          />
          <span class="rack__price-switch" aria-hidden="true"></span>
        </label>
      </div>
      <table class="table">
        <thead class="table__header">
          <tr class="table__row table__row--header">
            <th class="table__cell table__cell--header table__cell--name">Компонент</th>
            <th class="table__cell table__cell--header table__cell--qty">Кількість</th>
            <th class="table__cell table__cell--header table__cell--price rack__price-header">Ціна за од.</th>
            <th class="table__cell table__cell--header table__cell--total rack__price-header">Загальна вартість</th>
          </tr>
        </thead>
        <tbody class="table__body">
          ${rows.join('')}
        </tbody>
      </table>
    </div>
  `;
};

// ==================== ЕКСПОРТИ ====================

export default {
  generateRackName,
  generateBatteryRackName,
  generateComponentsTable,
};
