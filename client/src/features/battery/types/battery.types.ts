/**
 * Типи для feature: battery
 */

import type { ComponentItem } from "@rack-calculator/shared";
import type { RackPrice } from "@/shared/types";

// ===== Battery Types =====

export interface BatteryDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface BatteryFormValues {
  batteryType: string;
  quantity: number;
  length: number;
  width: number;
  height: number;
  weight: number;
  format: string;
}

export interface BatteryFormState {
  batteryType: string;
  quantity: number;
  length: number;
  width: number;
  height: number;
  weight: number;
  format: string;
}

export interface BatteryFormActions {
  setBatteryType: (type: string) => void;
  setQuantity: (quantity: number) => void;
  setDimensions: (dimensions: {
    length: number;
    width: number;
    height: number;
  }) => void;
  setWeight: (weight: number) => void;
  setFormat: (format: string) => void;
  reset: () => void;
}

// ===== Battery Calculation Types =====

export interface BatteryCalculationRequest {
  batteryDimensions: BatteryDimensions;
  quantity: number;
  format?: string;
}

export interface BatteryVariant {
  id: string;
  name: string;
  rackLength: number;
  batteriesPerRow: number;
  rows: number;
  totalBatteries: number;
  config: {
    floors: number;
    rows: number;
    beamsPerRow: number;
    spansArray: number[];
  };
  components: ComponentItem[];
  prices?: RackPrice[];
  totalCost?: number;
}

export interface BatteryBestMatch {
  variant: BatteryVariant;
  score: number;
  reasons: string[];
}

export interface BatteryCalculationResponse {
  variants: BatteryVariant[];
  bestMatch?: BatteryBestMatch;
  recommendedFormat?: string;
}

// ===== Battery Results Types =====

export interface BatteryResultsState {
  isLoading: boolean;
  error: string | null;
  variants: BatteryVariant[];
  bestMatch: BatteryBestMatch | null;
  selectedVariant: BatteryVariant | null;
}

export interface BatteryResultsActions {
  setVariants: (variants: BatteryVariant[]) => void;
  setBestMatch: (match: BatteryBestMatch | null) => void;
  setSelectedVariant: (variant: BatteryVariant | null) => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

// ===== Battery Set Types =====

export interface BatterySetItem {
  id: number;
  name: string;
  objectName?: string;
  description?: string;
  batteryType: string;
  quantity: number;
  variants: BatteryVariant[];
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface BatterySetFormData {
  name: string;
  objectName: string;
  description: string;
  batteryType: string;
  quantity: number;
  variants: BatteryVariant[];
}

// ===== Format Option Types =====

export interface FormatOption {
  value: string;
  label: string;
  description?: string;
}
