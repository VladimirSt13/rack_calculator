/**
 * Типи для feature: price
 */

/**
 * Категорії прайсу
 */
export type PriceCategory =
  | "supports"
  | "spans"
  | "vertical_supports"
  | "diagonal_brace"
  | "isolator";

/**
 * Тип опори (для supports)
 */
export type SupportType = "edge" | "intermediate";

/**
 * Окрема позиція прайсу (базова)
 */
export interface BasePriceItem {
  code: string;
  name: string;
  category: PriceCategory;
  price: number; // ціна без ПДВ, грн
  weight: number; // вага, кг
  description?: string;
}

/**
 * Позиція для опор (з вкладеними edge/intermediate)
 */
export interface SupportPriceItem extends BasePriceItem {
  category: "supports";
  edge: {
    name: string;
    price: number;
    weight: number | null;
  };
  intermediate: {
    name: string;
    price: number;
    weight: number | null;
  };
}

/**
 * Позиція для інших категорій (плоска структура)
 */
export interface SimplePriceItem extends BasePriceItem {
  category: "spans" | "vertical_supports" | "diagonal_brace" | "isolator";
}

/**
 * Об'єднаний тип для позиції прайсу
 */
export type PriceItem = SupportPriceItem | SimplePriceItem;

/**
 * Структура прайсу по категоріях
 */
export interface PriceData {
  supports: Record<string, PriceItem>;
  spans: Record<string, PriceItem>;
  vertical_supports: Record<string, PriceItem>;
  diagonal_brace: Record<string, PriceItem>;
  isolator: Record<string, PriceItem>;
}

/**
 * Версія прайсу (для історії)
 */
export interface PriceVersion {
  id: number;
  created_at: string;
  created_by: string;
  items_count: number;
}

/**
 * Результат парсингу Excel файлу
 */
export interface ParsedPriceData {
  supports: Record<string, PriceItem>;
  spans: Record<string, PriceItem>;
  vertical_supports: Record<string, PriceItem>;
  diagonal_brace: Record<string, PriceItem>;
  isolator: Record<string, PriceItem>;
  errors: ParseError[];
}

/**
 * Помилка парсингу
 */
export interface ParseError {
  row: number;
  sheet: string;
  message: string;
  code?: string;
}

/**
 * Пропси для компонента завантаження
 */
export interface PriceUploadProps {
  onFileParsed: (data: ParsedPriceData, file: File) => void;
  onError: (error: string) => void;
}

/**
 * Пропси для компонента перегляду
 */
export interface PricePreviewProps {
  data: ParsedPriceData;
  onConfirm: () => void;
  onCancel: () => void;
  isUploading: boolean;
}

/**
 * Пропси для компонента історії
 */
export interface PriceHistoryProps {
  onRestore: (versionId: number) => void;
  onViewDetails: (versionId: number) => void;
}

/**
 * Статус завантаження прайсу
 */
export type PriceUploadStatus =
  | "idle"
  | "parsing"
  | "preview"
  | "uploading"
  | "success"
  | "error";
