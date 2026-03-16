/**
 * DTO для результату експорту
 */
export class ExportResultDto {
  success: boolean;
  fileName: string;
  fileSize: number;
  downloadUrl?: string;
  message?: string;
}

/**
 * DTO для статистики експорту
 */
export class ExportStatsDto {
  totalExports: number;
  totalFileSize: number;
  lastExportDate?: Date;
}
