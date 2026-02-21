// js/app/pages/racks/set/utils/generateRackId.js

/**
 * Генерує валідний HTML id з об’єкта
 * @param {Object} rack - об’єкт для генерації id
 * @returns {string} валідний HTML id
 */
export const generateRackId = (rack) => {
  // Перетворюємо об’єкт у рядок JSON
  const json = JSON.stringify(rack);

  // Хешуємо рядок за допомогою простого алгоритму djb2
  let hash = 5381;
  for (let i = 0; i < json.length; i++) {
    hash = (hash << 5) + hash + json.charCodeAt(i); /* hash * 33 + c */
  }
  hash = hash >>> 0; // перетворюємо у беззнакове число

  // Формуємо id у вигляді рядка з префіксом, щоб точно бути валідним
  return `rack-${hash}`;
};
