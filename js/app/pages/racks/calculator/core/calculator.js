// js/pages/racks/core/calculator.js

import {
  calculateBeams,
  calculateRackLength,
  calculateTotalSpans,
} from "./utils/beams.js";
import {
  calculateBraces,
  supportsFn,
  verticalSupportsFn,
} from "./utils/supports.js";
import { rackNameFn } from "./utils/rackName.js";

/**
 * Calculate the total cost of the components
 * @param {Array} components - array of components where each component is an object with "amount" and "price" properties or an array of such objects
 * @returns {number} total cost of the components
 */
const totalCostCalculation = ({ components }) =>
  components.reduce(
    (sum, c) =>
      Array.isArray(c)
        ? sum + c.reduce((s, item) => s + item.amount * item.price, 0)
        : sum + c.amount * c.price,
    0,
  );

/**
 * Calculate the components and total cost of a rack based on the given rack configuration and price.
 *
 * @param {Object} options - The options for calculating the components and total cost.
 * @param {Object} options.rackConfig - The configuration of the rack.
 * @param {Object} options.price - The price of the rack components.
 * @return {Object} An object containing the current rack details including the components, total length, and total cost.
 */
const calculateComponents = ({ rackConfig, price }) => {
  const { floors, rows, beams, supports, verticalSupports, beamsPerRow } =
    rackConfig;

  const isEnoughDataForCalculation =
    price !== null ||
    floors ||
    rows ||
    beams.length ||
    supports ||
    beamsPerRow ||
    !(floors > 1 && verticalSupports);

  if (!isEnoughDataForCalculation)
    return { components: {}, totalLength: 0, totalCost: 0 };

  const totalSpans = calculateTotalSpans(beams);
  const totalLength = calculateRackLength(beams);
  const { description, abbreviation } = rackNameFn({
    totalLength,
    floors,
    rows,
    supports,
  });

  const { edgeSupports, intermediateSupports, supportsData } = supportsFn(
    floors,
    totalSpans,
    price,
    supports,
  );

  const beamsData = calculateBeams({
    beams,
    rows,
    beamsPerRow,
    beamsData: Object.entries(price.beams),
    floors,
  });

  // --- Вертикальні стійки та розкоси ---
  const verticalSupportsData = verticalSupportsFn(
    Object.entries(price.vertical_supports),
    verticalSupports,
  );

  const bracesObj = Object.entries(price.diagonal_brace).find(
    (b) => b[0] === "diagonal_brace",
  );
  const bracesData = {
    name: "Розкос",
    amount: 0,
    price: bracesObj?.[1]?.price || 0,
  };

  if (floors > 1) {
    const spans = totalSpans + 1;
    verticalSupportsData.amount = spans * 2;
    bracesData.amount = calculateBraces(spans);
  }

  // --- Ізолятори ---
  const isolatorObj = price.isolator;
  const isolatorsData = {
    name: "Ізолятор",
    amount: 0,
    price: isolatorObj.isolator?.price || 0,
  };
  if (floors === 1) {
    isolatorsData.amount = (edgeSupports + intermediateSupports) * 2;
  }

  // --- Фінальний масив компонентів ---
  const components = {
    supports: supportsData,
    beams: beamsData,
    ...(floors > 1 ? { verticalSupports: verticalSupportsData } : {}),
    ...(floors > 1 ? { braces: bracesData } : {}),
    ...(floors === 1 ? { isolators: isolatorsData } : {}),
  };

  // --- Розрахунок totalCost для кожного компонента та загальної вартості ---
  const totalCost = totalCostCalculation(Object.values(components));

  const currentRack = {
    description,
    abbreviation,
    components,
    totalLength,
    totalCost,
  };

  return { currentRack };
};

export { calculateComponents };
