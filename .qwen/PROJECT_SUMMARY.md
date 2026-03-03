# Project Summary

## Overall Goal
Рефакторинг UI калькулятора стелажів (Rack Calculator v2.0) — міграція на React + TypeScript з професійною дизайн-системою для SaaS дашбордів.

## Key Knowledge

### Architecture & Conventions
- **Framework**: React 18 + TypeScript + Vite
- **State Management**: Zustand 4 (form, spans, results, set stores)
- **Styling**: Tailwind CSS + CSS Variables
- **Components**: shadcn/ui pattern (Card, Button, Table, Tabs, etc.)

### Design System (Professional SaaS Dashboard)

#### Color Palette
| Token | HEX | Usage |
|-------|-----|-------|
| `background` | `#F6F7F9` | soft gray background |
| `foreground` | `#111827` | primary text |
| `card` | `#FFFFFF` | surfaces |
| `primary` | `#3B82F6` | professional blue |
| `primary-hover` | `#2563EB` | |
| `primary-soft` | `#EFF6FF` | soft background |
| `secondary` | `#F1F3F5` | secondary surfaces |
| `muted` | `#F1F3F5` | muted elements |
| `muted-foreground` | `#9CA3AF` | secondary text |
| `border/input` | `#E2E6EA` | soft borders |
| `success` | `#16A34A` | success states |
| `warning` | `#D97706` | warning states |
| `destructive` | `#DC2626` | error states |

#### Typography
- **Font**: Inter (sans), JetBrains Mono (numbers)
- **Sizes**: xs (0.75rem), sm (0.875rem), base (1rem), lg (1.125rem), xl (1.25rem)

#### Spacing & Layout
- **Grid**: 4px base
- **Input Height**: 40px (md), 44px (lg)
- **Border Radius**: 6–12px (sm to xl)
- **Container Max**: 1600px

### File Structure
```
rack_calculator/
├── client/src/
│   ├── app/              # App, providers
│   ├── pages/            # RackPage, BatteryPage
│   ├── features/
│   │   ├── rack/         # rack calculator
│   │   └── battery/      # battery selector
│   ├── shared/
│   │   ├── components/   # UI components
│   │   ├── layout/       # CalculatorPage, FieldRow, etc.
│   │   └── core/         # business logic
│   ├── hooks/            # React hooks
│   └── styles/           # CSS, variables
├── server/src/           # Express API
├── shared/               # Shared business logic
└── legacy/               # Vanilla JS (deprecated)
```

### Layout Architecture

#### CalculatorPage (Universal)
```tsx
<CalculatorPage
  title="Розрахунок стелажа"
  description="Налаштуйте параметри"
  mode="analysis" | "builder"
  input={<Form />}
  results={<Results />}
/>
```

#### Structure
```
┌────────────────────────────────────────────┐
│ PageHeader (title + description + actions) │
├────────────────────────────────────────────┤
│ ┌────────────┬────────────────────────────┐│
│ │ InputPanel │ ResultsPanel               ││
│ │ (420px)    │ (flexible)                 ││
│ │ - sticky   │ - CalculationStatus        ││
│ │            │ - SummaryMetrics           ││
│ │            │ - Tabs (variants/structure)││
│ └────────────┴────────────────────────────┘│
└────────────────────────────────────────────┘
```

### Components

#### Layout
- `CalculatorPage` — universal calculator layout
- `InputPanel` — sticky input panel (420px)
- `ResultsPanel` — results with status/metrics/tabs
- `CalculationStatus` — lifecycle status (idle/editing/calculating/ready)
- `PageHeader` — title + description + actions

#### Form Components
- `FieldRow` — ergonomic field row (grid: 140px 1fr auto)
- `FieldRowInput` — monospace numeric input
- `FieldRowSelect` — custom select
- `FieldRowValue` — display value
- `FieldRowGroup` — dense field grouping
- `SectionHeader` — uppercase section header with separator
- `FormSection` — section container
- `FormSectionsGroup` — group with gap-6

#### UI Components
- Card, Button, Table, Tabs, Dialog, etc. (shadcn pattern)

### Calculation Lifecycle

```
idle → editing → calculating → ready
 │                    │
 └────── error ───────┘
```

**States:**
- `idle` — waiting for input
- `editing` — user changed values (debounce 500ms)
- `calculating` — calculation in progress
- `ready` — results displayed

### Battery Page Results Structure

```
┌─────────────────────────────────────────┐
│ ✓ Розрахунок виконано                   │
│   Знайдено 3 варіантів                  │
├─────────────────────────────────────────┤
│ ┌──────────────┬──────────────────────┐ │
│ │ Знайдено     │ Вартість             │ │
│ │ варіантів    │ 100 – 250 ₴          │ │
│ │ 3            │                      │ │
│ └──────────────┴──────────────────────┘ │
├─────────────────────────────────────────┤
│ [Варіанти] [Структура] [Навантаження]   │
│ [Вартість]                              │
├─────────────────────────────────────────┤
│ Table / Content                         │
└─────────────────────────────────────────┘
```

### Rack Page Results Structure

```
┌─────────────────────────────────────────┐
│ ✓ Розрахунок виконано                   │
│   Стелаж: С-400x500-3x2-2               │
├─────────────────────────────────────────┤
│ ┌──────────────┬──────────────────────┐ │
│ │ Загальна     │ Нульова база         │ │
│ │ 150 ₴        │ 216 ₴                │ │
│ └──────────────┴──────────────────────┘ │
├─────────────────────────────────────────┤
│ [Специфікація] [Компоненти] [Вартість]  │
├─────────────────────────────────────────┤
│ Content                                 │
└─────────────────────────────────────────┘
```

## Recent Actions

### 1. [DONE] CalculatorPage Layout
- Universal layout for Rack/Battery pages
- Grid: `grid-cols-[420px_minmax(0,1fr)]`
- Responsive: stacked on mobile
- Sticky input panel on desktop

### 2. [DONE] ResultsPanel Hierarchy
- CalculationStatus card (top)
- SummaryMetrics grid (middle)
- Results content with tabs (bottom)
- Always render empty states

### 3. [DONE] Tabbed Views
- Battery: variants, structure, load, pricing
- Rack: specification, components, pricing
- Compact tabs (h-9, text-xs)
- Icons + labels

### 4. [DONE] Live Recalculation UX
- Non-blocking inputs
- Auto-recalculate on change (debounce 500ms)
- States: idle → editing → calculating → ready
- CalculationStatus indicator

### 5. [DONE] Professional Design System
- Neutral soft background (#F6F7F9)
- Hierarchy via surfaces, not borders
- Minimal color usage
- Accent only for interaction/status
- Fintech/analytics aesthetics

### 6. [DONE] Engineering Data Table
- Numeric columns: right aligned
- Monospace numeric cells
- Compact row height (h-11)
- Hover highlight only
- No zebra stripes

### 7. [DONE] FieldRow Component
- Grid: `[140px_1fr_auto]`
- Monospace numeric inputs (9ch width)
- Compact height (h-8)
- Minimal styling

### 8. [DONE] SectionHeader Component
- Uppercase label
- Subtle separator
- Compact spacing
- FormSection container

### 9. [DONE] CalculatorUIContext
- UI state: mode, calculationState, activeSection
- Non-business logic state
- Provider pattern

### 10. [DONE] Color System
- All colors as HEX in Tailwind config
- Proper contrast (dark text on light bg)
- Status colors (success, warning, error)
- Soft variants for backgrounds

## Current Plan

| # | Task | Status |
|---|------|--------|
| 1 | Universal CalculatorPage layout | [DONE] |
| 2 | ResultsPanel with status/metrics/tabs | [DONE] |
| 3 | Live recalculation UX | [DONE] |
| 4 | Professional design system | [DONE] |
| 5 | Engineering table ergonomics | [DONE] |
| 6 | FieldRow component | [DONE] |
| 7 | SectionHeader component | [DONE] |
| 8 | CalculatorUIContext | [DONE] |
| 9 | Color system (HEX) | [DONE] |
| 10 | Numeric input width (9ch) | [DONE] |
| 11 | RackSet modal view | [TODO] |
| 12 | Export to CSV/PDF | [TODO] |
| 13 | Price visibility toggle | [TODO] |

## Open Questions

1. **RackSet Modal**: Потрібна модалка для детального перегляду комплекту
2. **Export**: CSV/PDF експорт результатів
3. **Price Toggle**: Кнопка показу/приховування цін

---

## Summary Metadata
**Update time**: 2026-03-03
**Version**: 2.0.0 (React + TypeScript)
**Status**: Active Development
