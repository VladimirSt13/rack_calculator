import ExcelJS from "exceljs";

/**
 * Сервіс для парсингу Excel файлів з прайсом
 */

/**
 * Валідні категорії прайсу
 */
const VALID_CATEGORIES = new Set([
  "supports",
  "spans",
  "vertical_supports",
  "diagonal_brace",
  "isolator",
]);

/**
 * Розпарсити Excel файл з прайсом
 * @param {Buffer} buffer - Buffer Excel файлу
 * @returns {Promise<Object>} Розпарсені дані
 */
export const parsePriceExcel = async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const result = {
    supports: {},
    spans: {},
    vertical_supports: {},
    diagonal_brace: {},
    isolator: {},
    errors: [],
  };

  let currentCategory = null;

  const worksheet = workbook.getWorksheet(1); // Перший лист

  worksheet.eachRow((row, rowNumber) => {
    // Пропускаємо заголовок
    if (rowNumber === 1) return;

    const cells = row.values;
    const code = cells[1]; // Код
    const name = cells[2]; // Назва
    const price = cells[3]; // Ціна
    const category = cells[4]; // Категорія
    const weight = cells[5]; // Вага
    const description = cells[6]; // Опис

    // Ігноруємо підсумковий рядок "Всього позицій"
    if (name && name.toString().toLowerCase().includes("всього позицій")) {
      return;
    }

    // Перевірка на категорію (тільки якщо це нова категорія, а не поточна)
    if (category && VALID_CATEGORIES.has(category.toString().trim())) {
      const newCategory = category.toString().trim();
      // Змінюємо категорію тільки якщо вона відрізняється від поточної
      if (newCategory !== currentCategory) {
        currentCategory = newCategory;
        console.log(
          "[Parse] Category found:",
          currentCategory,
          "at row",
          rowNumber,
        );
      }
      // Не повертаємо, а продовжуємо обробку рядка з даними
    }

    // Пропускаємо пусті рядки
    if (!currentCategory || !name) return;

    // Для опор - логуємо назву
    if (currentCategory === "supports") {
      const nameStr = name.toString().toLowerCase();
      const isEdge =
        nameStr.includes("крайн") ||
        nameStr.includes("edge") ||
        nameStr.includes(" кр");
      const isIntermediate =
        nameStr.includes("проміжн") ||
        nameStr.includes("intermediate") ||
        nameStr.includes(" пром");
      console.log("[Parse] Support row:", {
        code,
        name,
        isEdge,
        isIntermediate,
      });
    }

    // Парсинг назви для отримання коду і типу (для опор)
    // Формат 1: "215 (Крайня)" або "215 (Проміжна)"
    // Формат 2: "Опора крайня" або "Проміжна опора" (з експорту)
    // Формат 3: "215 кр" або "215 пром" (короткий з експорту)
    const nameMatch = name.match(
      /^(\d+|[A-Za-z0-9]+)\s*\((Крайня|Проміжна)\)?/i,
    );
    const nameStr = name.toString().toLowerCase();
    const isEdge =
      nameStr.includes("крайн") ||
      nameStr.includes("edge") ||
      nameStr.includes(" кр");
    const isIntermediate =
      nameStr.includes("проміжн") ||
      nameStr.includes("intermediate") ||
      nameStr.includes(" пром");

    if (
      currentCategory === "supports" &&
      (nameMatch || isEdge || isIntermediate)
    ) {
      let codeStr;
      let typeShort;

      if (nameMatch) {
        // Формат з дужками: "215 (Крайня)"
        codeStr = nameMatch[1];
        const type = nameMatch[2].toLowerCase();
        typeShort = type.includes("крайн") ? "edge" : "intermediate";
      } else {
        // Формат з експорту: "Опора крайня" або "Проміжна опора"
        // Код береться з першого стовпчика
        codeStr = code?.toString() || name.toString().split(" ")[0];
        typeShort = isEdge ? "edge" : "intermediate";
      }

      if (!result.supports[codeStr]) {
        // Створюємо нову позицію з вкладеними edge/intermediate
        // Назва = код (наприклад, "215", "290", "430C")
        result.supports[codeStr] = {
          code: codeStr,
          name: codeStr, // ← Назва = код
          category: "supports",
          edge: {
            price: 0,
            weight: null,
            name: "Опора крайня",
            description: "",
          },
          intermediate: {
            price: 0,
            weight: null,
            name: "Проміжна опора",
            description: "",
          },
        };
      }

      // Оновлюємо відповідну вкладену позицію
      result.supports[codeStr][typeShort].price = parseFloat(price) || 0;
      result.supports[codeStr][typeShort].weight = weight
        ? parseFloat(weight)
        : null;
      result.supports[codeStr][typeShort].name = name.toString();

      // Оновлюємо опис у вкладеній позиції
      if (description) {
        result.supports[codeStr][typeShort].description =
          description.toString();
      }
    } else {
      // Звичайний елемент
      const codeStr = code?.toString() || name.toString();
      result[currentCategory][codeStr] = {
        code: codeStr,
        name: name.toString(),
        category: currentCategory,
        price: parseFloat(price) || 0,
        weight: weight ? parseFloat(weight) : null,
        description: description?.toString() || "",
      };
    }
  });

  return result;
};

export default {
  parsePriceExcel,
};
