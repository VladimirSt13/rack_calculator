/**
 * Типи для feature: rack
 */

import type { SpanItem, RackComponents } from "@rack-calculator/shared";
import type { RackVariant } from "@/shared/types";

// ===== Form Types =====

export interface RackFormValues {
  floors: number;
  rows: number;
  beamsPerRow: number;
  supports?: string;
  verticalSupports?: string;
}

export interface RackFormState {
  floors: number;
  rows: number;
  beamsPerRow: number;
  supports: string;
  verticalSupports: string;
}

export interface RackFormActions {
  setFloors: (floors: number) => void;
  setRows: (rows: number) => void;
  setBeamsPerRow: (beams: number) => void;
  setSupports: (supports: string) => void;
  setVerticalSupports: (vertical: string) => void;
  reset: () => void;
}

// ===== Spans Types =====

export interface SpanState {
  spans: SpanItem[];
  spansArray: number[];
}

export interface SpanActions {
  addSpan: (span: SpanItem) => void;
  removeSpan: (index: number) => void;
  updateSpan: (index: number, span: SpanItem) => void;
  setSpansArray: (spansArray: number[]) => void;
  resetSpans: () => void;
}

// ===== Results Types =====

export type CalculationState = "idle" | "calculating" | "ready" | "error";

export interface RackResults {
  name: string;
  components: RackComponents;
  totalCost: number;
  totalWithoutIsolators: number;
  zeroPrice?: number;
}

export interface ResultsState {
  calculationState: CalculationState;
  error: string | null;
  results: RackResults | null;
}

export interface ResultsActions {
  setCalculationState: (state: CalculationState) => void;
  setError: (error: string | null) => void;
  setResults: (results: RackResults) => void;
  resetResults: () => void;
}

// ===== Rack Set Types =====

export interface RackSetItem {
  id: number;
  name: string;
  objectName?: string;
  description?: string;
  racks: RackVariant[];
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

// RackVariant та RackPrice імпортовані з @/shared/types

export interface RackSetFormData {
  name: string;
  objectName: string;
  description: string;
  racks: RackVariant[];
}

// ComponentOption type
export interface ComponentOption {
  value: string;
  label: string;
  code?: string;
  name?: string;
  price?: number;
}

// Re-export component types from priceComponentsApi
export type {
  SupportComponent,
  SpanComponent,
  VerticalSupportComponent,
} from "@/features/rack/priceComponentsApi";
