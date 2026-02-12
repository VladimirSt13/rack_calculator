/**
 * Функція для заміни номера на відповідне слово
 * @param {number} num - номер, який потрібно замінити
 * @param {string} type - тип слова, який потрібно замінити (floors, rows)
 * @returns {string} слово, яке відповяє переданому номеру
 * @example
 * const res = numberToWord(3, "floors");
 * // res = "трьохповерховий"
 */
export const numberToWord = (num, type) => {
  const words = {
    floors: ["одноповерховий", "двоповерховий", "трьохповерховий", "чотириповерховий", "п’ятиповерховий"],
    rows: ["однорядний", "двохрядний", "трьохрядний", "чотирьохрядний"],
  };
  return words[type]?.[num - 1] || "";
};
