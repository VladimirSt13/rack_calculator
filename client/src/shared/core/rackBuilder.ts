import { defaultFloorGap, defaultSupportHeight, standardHeights, standardSpans, standardWidths } from './constants';
import { getClosestLarger, removeDuplicateCombinations } from './utils';
import { calcRackSpans } from './spanCalculator';
import { optimizeRacks } from './optimizeRacks';

/**
 * Розраховує ширину стелажа
 */
export const calcRackWidth = ({ elementWidth, rows }: { elementWidth: number; rows: number }): number =>
  getClosestLarger({ value: elementWidth * rows, standards: standardWidths });

/**
 * Розраховує висоту стелажа
 */
export const calcRackHeight = ({
  elementHeight,
  floors,
  floorGap = defaultFloorGap,
  supportHeight = defaultSupportHeight,
}: {
  elementHeight: number;
  floors: number;
  floorGap?: number;
  supportHeight?: number;
}): number =>
  getClosestLarger({
    value: floors * elementHeight + floors * (supportHeight + floorGap),
    standards: standardHeights,
  });

/**
 * Будує конфігурацію стелажа
 */
export const buildRackConfig = ({
  element,
  totalCount,
  floors,
  rows,
  gap,
}: {
  element: { length: number; width: number; height: number; weight: number };
  totalCount: number;
  floors: number;
  rows: number;
  gap: number;
}) => {
  const itemsPerRow = Math.ceil(totalCount / (floors * rows));
  const rackLength = itemsPerRow * element.length + (itemsPerRow - 1) * gap;

  const spanCombinations = removeDuplicateCombinations(
    calcRackSpans({
      rackLength,
      accLength: element.length,
      accWeight: element.weight,
      gap,
      standardSpans,
    })
  );

  return {
    floors,
    rows,
    length: rackLength,
    width: calcRackWidth({ elementWidth: element.width, rows }),
    height: calcRackHeight({ elementHeight: element.height, floors }),
    spanCombinations,
  };
};

/**
 * Генерує варіанти стелажів і оптимізує прольоти (TOP-5)
 */
export const generateRackVariants = ({
  element,
  totalCount,
  gap,
  rows = 1,
  floors = 1,
  supportType = 'straight',
  price = null,
}: {
  element: { length: number; width: number; height: number; weight: number };
  totalCount: number;
  gap: number;
  rows?: number;
  floors?: number;
  supportType?: string;
  price?: any;
}) => {
  const config = buildRackConfig({
    element,
    totalCount,
    floors,
    rows,
    gap,
  });

  const optimizedSpans = optimizeRacks(
    config.spanCombinations,
    config.length,
    Math.max(...standardSpans.map((s) => s.length)),
    5,
    price
  );

  return [
    {
      ...config,
      supportType,
      topSpans: optimizedSpans,
    },
  ];
};
