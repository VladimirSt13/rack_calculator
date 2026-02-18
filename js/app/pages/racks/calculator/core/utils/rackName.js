// js/pages/racks/core/utils/rackName.js

import { numberToWord } from "./numToWord.js";

/**
 * Функція для формування назви стелажа
 * @param {{totalLength: number, floors: number, rows: number, support: string}} rackConfig
 * @returns {{description: string, abbreviation: string}} об’єкт з описом стелажа та його абревіатурою
 * @example
 * const res = rackNameFn({
 *   totalLength: 3000,
 *   floors: 2,
 *   rows: 3,
 *   support: "430",
 * });
 */
export const rackNameFn = ({ totalLength, floors, rows, supports }) => {
  const hasC = supports.includes("C");
  const description = [
    `Стелаж ${numberToWord(floors, "floors")}`,
    numberToWord(rows, "rows"),
    hasC ? "ступінчатий" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const name = `L${floors}A${rows}${hasC ? "C" : ""}-${totalLength}/${supports.replace("C", "")}`;
  return { description, abbreviation: name };
};
