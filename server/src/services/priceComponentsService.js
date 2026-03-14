/**
 * Сервис для работы с комплектующими прайса
 */

/**
 * Отформатировать комплектующие из прайса
 * @param {Object} price - Данные прайса
 * @returns {Object} Отформатированные комплектующие
 */
export const formatPriceComponents = (price) => {
  const components = {
    supports: [],
    spans: [],
    verticalSupports: [],
    diagonalBrace: [],
    isolator: [],
  };

  // Опоры (supports)
  if (price.supports) {
    components.supports = Object.entries(price.supports).map(
      ([code, data]) => ({
        code,
        name: data.name || `Опора ${code}`,
      }),
    );
  }

  // Балки (spans)
  if (price.spans) {
    components.spans = Object.entries(price.spans).map(([code, data]) => ({
      code,
      name: data.name || `Балка ${code}`,
    }));
  }

  // Вертикальные опоры (vertical_supports)
  if (price.vertical_supports) {
    components.verticalSupports = Object.entries(price.vertical_supports).map(
      ([code, data]) => ({
        code,
        name: data.name || `Верт. опора ${code}`,
      }),
    );
  }

  // Раскосы (diagonal_brace)
  if (price.diagonal_brace) {
    components.diagonalBrace = Object.entries(price.diagonal_brace).map(
      ([code, data]) => ({
        code,
        name: data.name || `Раскос ${code}`,
      }),
    );
  }

  // Изоляторы (isolator)
  if (price.isolator) {
    components.isolator = Object.entries(price.isolator).map(
      ([code, data]) => ({
        code,
        name: data.name || `Изолятор ${code}`,
      }),
    );
  }

  return components;
};

export default {
  formatPriceComponents,
};
