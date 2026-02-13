/**
 * Функція для розрахунку кiлькості опор
 * @param {number} floors - кiлькість поверхів
 * @param {number} totalSpans - загальна довжина стелажа
 * @param {Object} rackComponents - об'єкт з даними прайсу
 * @param {string} supports - ключ опори
 * @returns {{edgeSupports: number, intermediateSupports: number, supportsData: Array<{name: string, amount: number, price: number}>}}
 * @example
 * const res = supportFn(2, 3000, rackComponents, "215");
 */
export const supportsFn = (floors, totalSpans, rackComponents, supports) => {
    const edgeSupports = 2 * floors;
    const intermediateSupports = Math.max(0, totalSpans + 1 - 2) * floors;

    const supportsObj = Object.entries(rackComponents.supports).find(
        (s) => s[0] === supports,
    );

    const supportsData = [
        {
            name: `Опора ${supports}`,
            amount: edgeSupports,
            price: supportsObj?.[1]?.edge?.price || 0,
        },
        {
            name: `Опора ${supports} пром`,
            amount: intermediateSupports,
            price: supportsObj?.[1]?.intermediate?.price || 0,
        },
    ];
    return { edgeSupports, intermediateSupports, supportsData };
};

/**
 * Функція для розрахунку кiлькості вертикальних стійок
 * @param {Object} rackComponents - об'єкт з даними прайсу
 * @param {string}  verticalSupports- ключ вертикальної стійки
 * @returns {{name: string, amount: number, price: number}}
 * @example
 * const res = verticalSupportsFn(rackComponents, "632");
 */
export const verticalSupportsFn = (verticalSupportsData, verticalSupports) => {
    const verticalObj = verticalSupportsData.find(
        (v) => v[0] === verticalSupports,
    );

    const res = {
        name: `Верт. стійка ${verticalSupports}`,
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
