/**
 * DTO для результату розрахунку акумулятора
 */
export class BatteryCalculationResultDto {
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
  components: any[];
}

/**
 * DTO для списку акумуляторів
 */
export class BatteryListDto {
  batteries: BatteryInfoDto[];
  total: number;
}

/**
 * DTO для інформації про акумулятор
 */
export class BatteryInfoDto {
  id: string;
  model: string;
  manufacturer: string;
  type: string;
  voltage: number;
  capacity: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight?: number;
  };
}
