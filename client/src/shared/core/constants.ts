/** Стандартні ширини стелажів (мм) */
export const standardWidths = [290, 430, 580];

/** Стандартні висоти стелажів (мм) */
export const standardHeights = [632, 1190, 1500];

/** Стандартні прольоти з вантажопідйомністю */
export const standardSpans = [
  { length: 600, capacity: 400 },
  { length: 750, capacity: 320 },
  { length: 900, capacity: 260 },
  { length: 950, capacity: 250 },
  { length: 1000, capacity: 240 },
  { length: 1050, capacity: 230 },
  { length: 1200, capacity: 200 },
  { length: 1500, capacity: 150 },
];

/** Діапазон кількості балок */
export const beamsRange = [2, 3, 4];

/** Стандартний зазор між поверхами (мм) */
export const defaultFloorGap = 150;

/** Стандартна висота опори (мм) */
export const defaultSupportHeight = 150;

/** Максимальне перевищення довжини стелажа (мм) */
export const rackLengthTolerance = 200;

/** Максимальний розмір прольоту для оцінки */
export const maxSpanReference = 1500;
