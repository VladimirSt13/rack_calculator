/**
 * Функція для розрахунку кiлькості опор
 * @param {number} floors - кiлькість поверхів
 * @param {number} totalSpans - загальна довжина стелажа
 * @param {Object} rackComponents - об'єкт з даними прайсу
 * @param {string} support - ключ опори
 * @returns {{edgeSupports: number, intermediateSupports: number, supportsData: Array<{name: string, amount: number, price: number}>}}
 * @example
 * const res = supportFn(2, 3000, rackComponents, "215");
 * console.log(res.supportsData); // [{name: "Опора 215", amount: 4, price: 600.0}, {name: "Опора 215 пром", amount: 2, price: 620.0}]
 */
export const supportFn = (floors, totalSpans, rackComponents, support) => {
  const edgeSupports = 2 * floors;
  const intermediateSupports = Math.max(0, totalSpans + 1 - 2) * floors;

  const supportObj = Object.entries(rackComponents.supports).find((s) => s[0] === support);

  const supportsData = [
    {
      name: `Опора ${support}`,
      amount: edgeSupports,
      price: supportObj?.[1]?.edge?.price || 0,
    },
    {
      name: `Опора ${support} пром`,
      amount: intermediateSupports,
      price: supportObj?.[1]?.intermediate?.price || 0,
    },
  ];
  return { edgeSupports, intermediateSupports, supportsData };
};

/**
 * Функція для розрахунку кiлькості вертикальних стійок
 * @param {Object} rackComponents - об'єкт з даними прайсу
 * @param {string} verticalSupport - ключ вертикальної стійки
 * @returns {{name: string, amount: number, price: number}}
 * @example
 * const res = verticalSupportsFn(rackComponents, "632");
 */
export const verticalSupportsFn = (verticalSupportsData, verticalSupport) => {
  const verticalObj = verticalSupportsData.find((v) => v[0] === verticalSupport);

  const res = {
    name: `Верт. стійка ${verticalSupport}`,
    amount: 0,
    price: verticalObj?.[1]?.price || 0,
  };
  return res;
};

/**
 * Розрахунок кількості розкосів
 * @param {number} spans - кількість прольотів
 * @returns {number} кількість розкосів
 */
export const calculateBraces = (spans) => {
  if (!spans || spans < 2) return 0;
  if (spans <= 2) return 2;
  return (spans - 3) * 2 + 2;
};
