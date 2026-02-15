// js/pages/battery/core/rackBuilder.js
import { standardSpans, standardWidths, standardHeights, defaultFloorGap, defaultSupportHeight } from "./constants.js";
import { getClosestLarger, removeDuplicateCombinations } from "./utils.js";
import { calcRackSpans } from "./spanCalculator.js";
import { scoreSpanCombinations } from "./scoring.js";

/**
 * Розраховує ширину стелажа
 * @param {number} elementWidth
 * @param {number} rows
 * @returns {number} Ширина стелажа
 */
export const calcRackWidth = ({ elementWidth, rows }) =>
  getClosestLarger({ value: elementWidth * rows, standards: standardWidths });

/**
 * Розраховує висоту стелажа
 * @param {{elementHeight: number, floors: number, floorGap: number, supportHeight: number}} params - об'єкт з параметрами
 * @param {number} params.elementHeight - висота елемента
 * @param {number} params.floors - кiлькість поверхів
 * @param {number} [params.floorGap=defaultFloorGap] - відстань між поверхнями
 * @param {number} [params.supportHeight=defaultSupportHeight] - висота балок
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
 * Будує конфігурацію стелажа
 * @param {Object} params - об'єкт з параметрами
 * @param {Object} params.element - об'єкт елемента (має властивості length, width, height, weight)
 * @param {number} params.totalCount - загальна кiлькість елементів
 * @param {number} params.floors - кiлькість поверхів
 * @param {number} params.rows - кiлькість рядів
 * @param {number} params.gap - відстань між елементами
 * @returns {Object} конфігурація стелажа
 */
export const buildRackConfig = ({ element, totalCount, floors, rows, gap }) => {
  const itemsPerRow = Math.ceil(totalCount / (floors * rows));
  const rackLength = itemsPerRow * element.length + (itemsPerRow - 1) * gap;

  const spans = scoreSpanCombinations(
    removeDuplicateCombinations(
      calcRackSpans({
        rackLength,
        accLength: element.length,
        accWeight: element.weight,
        gap,
        standardSpans,
      }),
    ),
    rackLength,
  );

  return {
    floors,
    rows,
    length: rackLength,
    width: calcRackWidth(element.width, rows),
    height: calcRackHeight(element.height, floors),
    spans,
  };
};

/**
 * Генерує варіанти стелажів
 * @param {Object} params - { element, totalCount, gap }
 * @returns {Array<Object>} Масив конфігурацій
 */
export const generateRackVariants = ({ element, totalCount, gap }) => {
  const variants = [];
  [1, 2].forEach((floors) => {
    [1, 2].forEach((rows) => {
      variants.push(buildRackConfig({ element, totalCount, floors, rows, gap }));
    });
  });
  return variants;
};
