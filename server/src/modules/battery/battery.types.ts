/**
 * Вхідні дані для розрахунку стелажа для акумуляторів
 */
export interface BatteryRackCalculationInput {
  batteryModel: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight?: number;
  };
  quantity: number;
  gap?: number;
  orientation?: 'lengthwise' | 'widthwise';
}

/**
 * Результат розрахунку стелажа для акумуляторів
 */
export interface BatteryRackCalculationResult {
  batteryModel: string;
  quantity: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight?: number;
  };
  rackConfiguration: {
    rows: number;
    columns: number;
    levels: number;
    braceCount?: number;
    totalLength: number;
    totalWidth: number;
    totalHeight: number;
    totalCapacity: number;
  };
  components: Array<{
    type: string;
    quantity: number;
    description?: string;
  }>;
  recommendedRackConfigurationId?: string;
}

/**
 * Інформація про акумулятор
 */
export interface BatteryInfo {
  id: string;
  model: string;
  manufacturer: string;
  type: string;
  voltage: number;
  capacity: number; // Ah
  dimensions: {
    length: number; // mm
    width: number; // mm
    height: number; // mm
    weight?: number; // kg
  };
}
