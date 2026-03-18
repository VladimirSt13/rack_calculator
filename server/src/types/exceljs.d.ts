declare module 'exceljs' {
  export interface Workbook {
    creator: string;
    created: Date;
    lastModifiedBy: string;
    addWorksheet(name: string): Worksheet;
    xlsx: {
      write(res: any): Promise<void>;
      writeFile(fileName: string): Promise<void>;
    };
  }

  export interface Worksheet {
    columns: any[];
    getRow(rowNumber: number): Row;
    addRow(values: any[]): Row;
    views: any[];
    autoFilter: string;
    mergeCells(): void;
  }

  export interface Row {
    eachCell(callback: (cell: Cell) => void): void;
    getCell(cellNumber: number): Cell;
    height: number;
  }

  export interface Cell {
    border: any;
    value: any;
    numFmt: string;
    alignment: any;
  }

  const ExcelJS: {
    Workbook: new () => Workbook;
    default: {
      Workbook: new () => Workbook;
    };
  };

  export default ExcelJS;
}
