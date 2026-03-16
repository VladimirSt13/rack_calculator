import { BatteryRackCalculationInput, BatteryRackCalculationResult, BatteryInfo } from './battery.types';

/**
 * Battery Service
 * Відповідає за бізнес-логіку розрахунку стелажів для акумуляторів
 */
export class BatteryService {
  // Приклад бази даних акумуляторів (в реальності це буде з БД)
  private readonly batteriesDatabase: BatteryInfo[] = [
    {
      id: '1',
      model: 'LP 12-100',
      manufacturer: 'Leoch',
      type: 'AGM',
      voltage: 12,
      capacity: 100,
      dimensions: { length: 330, width: 171, height: 215, weight: 30 },
    },
    {
      id: '2',
      model: 'LP 12-200',
      manufacturer: 'Leoch',
      type: 'AGM',
      voltage: 12,
      capacity: 200,
      dimensions: { length: 522, width: 269, height: 223, weight: 60 },
    },
  ];

  /**
   * Розрахувати стелаж для акумуляторів
   */
  async calculateBatteryRack(input: BatteryRackCalculationInput): Promise<BatteryRackCalculationResult> {
    const { batteryModel, dimensions, quantity, gap = 10, orientation = 'lengthwise' } = input;

    // Визначаємо орієнтацію
    const effectiveLength = orientation === 'lengthwise' ? dimensions.length : dimensions.width;
    const effectiveWidth = orientation === 'lengthwise' ? dimensions.width : dimensions.length;

    // Розрахунок оптимальної конфігурації
    const configuration = this.calculateOptimalConfiguration(
      effectiveLength,
      effectiveWidth,
      dimensions.height,
      quantity,
      gap,
    );

    // Розрахунок компонентів
    const components = this.calculateComponents(configuration);

    return {
      batteryModel,
      quantity,
      dimensions: {
        length: dimensions.length,
        width: dimensions.width,
        height: dimensions.height,
        weight: dimensions.weight,
      },
      rackConfiguration: {
        rows: configuration.rows,
        columns: configuration.columns,
        levels: configuration.levels,
        braceCount: configuration.braceCount,
        totalLength: configuration.totalLength,
        totalWidth: configuration.totalWidth,
        totalHeight: configuration.totalHeight,
        totalCapacity: configuration.totalCapacity,
      },
      components,
    };
  }

  /**
   * Отримати список акумуляторів
   */
  async getBatteries(): Promise<BatteryInfo[]> {
    return this.batteriesDatabase;
  }

  /**
   * Отримати акумулятор за моделлю
   */
  async getBatteryByModel(model: string): Promise<BatteryInfo | null> {
    const battery = this.batteriesDatabase.find((b) => b.model.toLowerCase() === model.toLowerCase());
    return battery || null;
  }

  /**
   * Розрахунок оптимальної конфігурації
   */
  private calculateOptimalConfiguration(
    length: number,
    width: number,
    height: number,
    quantity: number,
    gap: number,
  ): {
    rows: number;
    columns: number;
    levels: number;
    braceCount: number;
    totalLength: number;
    totalWidth: number;
    totalHeight: number;
    totalCapacity: number;
  } {
    // Знаходимо оптимальну конфігурацію
    let bestConfig = {
      rows: 1,
      columns: quantity,
      levels: 1,
      braceCount: 2,
      totalLength: 0,
      totalWidth: 0,
      totalHeight: 0,
      totalCapacity: 0,
    };

    let minFootprint = Infinity;

    // Перебираємо можливі конфігурації
    for (let levels = 1; levels <= 4; levels++) {
      for (let columns = 1; columns <= quantity; columns++) {
        const rows = Math.ceil(quantity / (levels * columns));

        if (rows * columns * levels >= quantity) {
          const totalLength = columns * length + (columns - 1) * gap;
          const totalWidth = rows * width + (rows - 1) * gap;
          const totalHeight = levels * (height + 50); // 50mm запас на рівень
          const footprint = totalLength * totalWidth;

          if (footprint < minFootprint) {
            minFootprint = footprint;
            const braceCount = Math.ceil(columns / 2) + 1;

            bestConfig = {
              rows,
              columns,
              levels,
              braceCount,
              totalLength,
              totalWidth,
              totalHeight,
              totalCapacity: rows * columns * levels,
            };
          }
        }
      }
    }

    return bestConfig;
  }

  /**
   * Розрахунок компонентів стелажа
   */
  private calculateComponents(config: any): Array<{ type: string; quantity: number; description?: string }> {
    const components: Array<{ type: string; quantity: number; description?: string }> = [];

    // Опори (uprights)
    const uprightsCount = (config.columns + 1) * 2;
    components.push({
      type: 'upright',
      quantity: uprightsCount,
      description: `Support upright ${config.totalHeight}mm`,
    });

    // Балки (beams)
    const beamsCount = config.columns * config.levels * 2;
    components.push({
      type: 'beam',
      quantity: beamsCount,
      description: `Load beam ${config.totalWidth / config.rows}mm`,
    });

    // Поперечини (braces)
    if (config.braceCount) {
      components.push({
        type: 'brace',
        quantity: config.braceCount * config.levels,
        description: 'Diagonal brace',
      });
    }

    return components;
  }
}

export default BatteryService;
