// js/pages/battery/core/rackBuilder.js
import { standardSpans, standardWidths, standardHeights, defaultFloorGap, defaultSupportHeight } from "./constants.js";
import { getClosestLarger, removeDuplicateCombinations } from "./utils.js";
import { calcRackSpans } from "./spanCalculator.js";
import { optimizeRacks } from "./optimizeRacks.js";

/**
 * Розраховує ширину стелажа
 * @param {{elementWidth: number, rows: number}} params
 * @returns {number} Ширина стелажа
 */
export const calcRackWidth = ({ elementWidth, rows }) =>
  getClosestLarger({ value: elementWidth * rows, standards: standardWidths });

/**
 * Розраховує висоту стелажа
 * @param {{elementHeight: number, floors: number, floorGap: number, supportHeight: number}} params
 * @returns {number} Висота стелажа
 */
export const calcRackHeight = ({
  elementHeight,
  floors,
  floorGap = defaultFloorGap,
  supportHeight = defaultSupportHeight,
}) =>
  getClosestLarger({ value: floors * elementHeight + floors * (supportHeight + floorGap), standards: standardHeights });

/**
 * Будує конфігурацію стелажа (сирі варіанти спанів)
 * @param {Object} params
 * @param {Object} params.element - об'єкт елемента (length, width, height, weight)
 * @param {number} params.totalCount - загальна кількість елементів
 * @param {number} params.floors
 * @param {number} params.rows
 * @param {number} params.gap
 * @returns {Object} конфігурація стелажа із сирими комбінаціями спанів
 */
export const buildRackConfig = ({ element, totalCount, floors, rows, gap }) => {
  const itemsPerRow = Math.ceil(totalCount / (floors * rows));
  const rackLength = itemsPerRow * element.length + (itemsPerRow - 1) * gap;
  // 1️⃣ генеруємо всі можливі комбінації спанів (без оцінки)
  const spanCombinations = removeDuplicateCombinations(
    calcRackSpans({
      rackLength,
      accLength: element.length,
      accWeight: element.weight,
      gap,
      standardSpans,
    }),
  );

  return {
    floors,
    rows,
    length: rackLength,
    width: calcRackWidth({ elementWidth: element.width, rows }),
    height: calcRackHeight({ elementHeight: element.height, floors }),
    spanCombinations, // сирі варіанти для подальшої оптимізації
  };
};

/**
 * Генерує варіанти стелажів і оптимізує прольоти (TOP-5)
 * @param {Object} params - { element, totalCount, gap }
 * @returns {Array<Object>} Масив конфігурацій із оптимізованими спанами
 */
export const generateRackVariants = ({ element, totalCount, gap }) => {
  const configs = [];

  [1, 2].forEach((floors) => {
    [1, 2].forEach((rows) => {
      const config = buildRackConfig({ element, totalCount, floors, rows, gap });

      // Оптимізація прольотів для цієї конфігурації
      const optimizedSpans = optimizeRacks(
        config.spanCombinations, // сирі комбінації
        config.length, // потрібна довжина стелажа
        Math.max(...standardSpans.map((s) => s.length)), // максимальна довжина прольоту
        5, // TOP-5
      );

      configs.push({
        ...config,
        topSpans: optimizedSpans, // тепер масив із TOP-5 варіантів
      });
    });
  });

  return configs;
};
