# Unified Rack & Battery Algorithm

**Date:** March 10, 2026
**Author:** Senior Web Developer
**Project:** Rack Calculator v2.0
**Architecture:** Server-Side Calculations

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Common Entities](#common-entities)
4. [Server API Routes](#server-api-routes)
5. [Rack Page Algorithm](#rack-page-algorithm)
6. [Battery Page Algorithm](#battery-page-algorithm)
7. [Component Calculation Formulas](#component-calculation-formulas)

---

## Overview

### ⭐ Architecture Principle

**Client (Frontend):**
- ❌ NO calculation formulas
- ✅ Only UI and data collection
- ✅ Send requests to server
- ✅ Display results

**Server (Backend):**
- ✅ ALL calculations
- ✅ Validation
- ✅ Database operations
- ✅ Price permissions

---

## Architecture

### Data Flow

```
┌─────────────────┐
│   Client        │
│  (RackPage/     │
│   BatteryPage)  │
│                 │
│  1. Collect     │
│     form data   │
│                 │
│  2. Send to     │
│     server      │
└────────┬────────┘
         │
         │ POST /api/...
         ▼
┌─────────────────┐
│   Server        │
│                 │
│  3. Calculate   │◄── server/src/services/
│     components  │    pricingService.js
│                 │
│  4. Apply price │
│     permissions │
│                 │
│  5. Save to DB  │
│                 │
│  6. Return      │
│     result      │
└────────┬────────┘
         │
         │ {components, prices, totalCost}
         ▼
┌─────────────────┐
│   Client        │
│  (display only) │
└─────────────────┘
```

### Client Files

| File | Purpose |
|------|---------|
| `client/src/shared/core/rackCalculator.ts` | **Types & UI functions ONLY** (generateRackName, generateComponentsTable) |
| `client/src/shared/core/batteryCalculator.ts` | **Types ONLY** (BatteryVariant, BatteryRackConfig) |
| `client/src/features/rack/useRackCalculator.ts` | Hook: calls server API |
| `client/src/features/battery/useBatteryCalculator.ts` | Hook: calls server API |

### Server Files

| File | Purpose |
|------|---------|
| `shared/rackCalculator.ts` | **ALL calculation formulas** (calculateRackComponents, calculateSupports, etc.) |
| `server/src/services/pricingService.js` | Price calculations with permissions |
| `server/src/controllers/rackController.js` | Rack calculations |
| `server/src/controllers/batteryController.js` | Battery calculations |

---

## Common Entities

### 1. RackConfig

```typescript
interface RackConfig {
  floors: number;                    // Number of floors (tiers)
  rows: number;                      // Number of rows (sides)
  beamsPerRow: number;               // Beams per row
  supports?: string | null;          // Support type (e.g., "C80", "430C")
  verticalSupports?: string | null;  // Vertical stands (e.g., "632", "1190", "1500")
  spans?: number[] | null;           // Spans array [600, 600, 750]
  braces?: string | null;            // Brace type (e.g., "diagonal_brace")
}
```

**Multi-floor logic:**
- `floors === 1` → Uses `isolators` (no vertical supports/braces)
- `floors > 1` → Uses `verticalSupports` + `braces` (no isolators)

### 2. ComponentItem

```typescript
interface ComponentItem {
  name: string;    // e.g., "Опора C80 (крайня)", "Верт. стійка 1190", "Розкос"
  amount: number;  // Quantity
  price: number;   // Price per unit
  total: number;   // Total cost (amount × price)
}
```

**Component types:**
- `supports` - Supports (edge and intermediate) - **all floors**
- `beams` - Beams (spans) - **all configurations**
- `verticalSupports` - Vertical stands - **only multi-floor (floors > 1)**
- `braces` - Diagonal braces - **only multi-floor (floors > 1)**
- `isolators` - Isolators - **only single-floor (floors === 1)**

**Price structure (legacy/price.json):**
```json
{
  "supports": {
    "430": { "edge": { "price": 930 }, "intermediate": { "price": 980 } },
    "430C": { "edge": { "price": 1140 }, "intermediate": { "price": 1190 } }
  },
  "spans": {
    "600": { "price": 500 },
    "750": { "price": 630 }
  },
  "vertical_supports": {
    "632": { "price": 630 },
    "1190": { "price": 1150 },
    "1500": { "price": 1450 },
    "2000": { "price": 0 }
  },
  "diagonal_brace": {
    "diagonal_brace": { "price": 380 }
  },
  "isolator": {
    "isolator": { "price": 69 }
  }
}
```

### 3. PriceInfo

```typescript
interface PriceInfo {
  type: 'базова' | 'без_ізоляторів' | 'нульова';
  label: string;       // Display label
  value: number;       // Price value
}
```

**Price types by role:**

| Role | `price_types` |
|------|---------------|
| `admin` | `['базова', 'без_ізоляторів', 'нульова']` |
| `manager` | `['нульова']` |
| `user` | `[]` |

### 4. RackCalculationResult

```typescript
interface RackCalculationResult {
  name: string;                    // Rack name
  components: Record<string, ComponentItem | ComponentItem[]>;
  prices: PriceInfo[];
  totalCost: number;
  rackConfigId?: number;           // DB configuration ID
  form?: RackFormState;            // Form data
  spans?: SpanItem[];              // For Rack Page
  config?: RackConfig;             // For Battery Page
}
```

### 5. BatteryVariant

```typescript
interface BatteryVariant extends RackCalculationResult {
  _index?: number;
  span?: number;
  spansCount?: number;
  totalLength?: number;
  combination: number[];           // [600, 600, 750]
  beams: number;
  batteriesPerRow?: number;
  excessLength?: number;
  isBest?: boolean;
  quantity?: number;               // For sets
  setId?: number;                  // For sets
}
```

### 6. RackSetItem

```typescript
interface RackSetItem extends RackCalculationResult {
  setId: number;
  rackConfigId?: number;
  quantity: number;
}
```

---

## Server API Routes

### Base URL: `/api`

#### Health Check
```
GET /health
Response: { status: 'ok', timestamp: '...' }
```

---

### Rack Routes (`/api/rack`)

#### POST `/rack/calculate`
Calculate rack from manual parameters.

**Request:**
```json
{
  "floors": 1,
  "rows": 1,
  "beamsPerRow": 2,
  "supports": "C80",
  "spans": [
    { "item": "600", "quantity": 2 },
    { "item": "750", "quantity": 1 }
  ]
}
```

**Response:**
```json
{
  "name": "Стелаж одноповерховий однорядний L1A1-1950/80x80",
  "total": 840,
  "totalWithoutIsolators": 760,
  "zeroBase": 1210,
  "components": {
    "supports": [
      { "name": "Опора C80 (крайня)", "amount": 2, "price": 100, "total": 200 }
    ],
    "beams": [
      { "name": "Балка 600", "amount": 4, "price": 50, "total": 200 },
      { "name": "Балка 750", "amount": 2, "price": 60, "total": 120 }
    ],
    "isolators": [
      { "name": "Ізолятор", "amount": 8, "price": 10, "total": 80 }
    ]
  },
  "prices": [
    { "type": "базова", "label": "Базова ціна", "value": 840 },
    { "type": "без_ізоляторів", "label": "Без ізоляторів", "value": 760 },
    { "type": "нульова", "label": "Нульова ціна", "value": 1210 }
  ]
}
```

**Multi-floor example (floors > 1):**
```json
{
  "name": "Стелаж двоповерховий дворядний L2A2-3000/C80",
  "total": 2450,
  "components": {
    "supports": [
      { "name": "Опора C80 (крайня)", "amount": 4, "price": 100, "total": 400 },
      { "name": "Опора C80 (пром)", "amount": 4, "price": 80, "total": 320 }
    ],
    "beams": [
      { "name": "Балка 600", "amount": 12, "price": 50, "total": 600 },
      { "name": "Балка 750", "amount": 4, "price": 60, "total": 240 }
    ],
    "verticalSupports": [
      { "name": "Верт. стійка 1190", "amount": 6, "price": 1150, "total": 6900 }
    ],
    "braces": [
      { "name": "Розкос", "amount": 8, "price": 380, "total": 3040 }
    ]
  },
  "prices": [
    { "type": "базова", "label": "Базова ціна", "value": 10500 },
    { "type": "нульова", "label": "Нульова ціна", "value": 15120 }
  ]
}
```

#### POST `/rack/calculate-batch`
Batch calculation for multiple racks.

**Request:**
```json
{
  "racks": [
    { "floors": 1, "rows": 1, "beamsPerRow": 2, ... },
    { "floors": 1, "rows": 2, "beamsPerRow": 3, ... }
  ]
}
```

**Response:**
```json
{
  "results": [
    { "index": 0, "name": "...", "components": {...}, "totalCost": 840 },
    { "index": 1, "name": "...", "components": {...}, "totalCost": 1200 }
  ]
}
```

---

### Battery Routes (`/api/battery`)

#### POST `/battery/calculate`
Calculate single rack configuration for battery.

**Request:**
```json
{
  "batteryDimensions": {
    "length": 600,
    "width": 300,
    "height": 200,
    "weight": 15,
    "gap": 50
  },
  "weight": 15,
  "quantity": 24,
  "config": {
    "floors": 1,
    "rows": 1,
    "beamsPerRow": 2,
    "supports": "C80",
    "spansArray": [600, 600, 750]
  }
}
```

**Response:**
```json
{
  "rackConfigId": 123,
  "name": "Стелаж одноповерховий однорядний L1A1-...",
  "components": {...},
  "prices": [...],
  "totalCost": 760
}
```

#### POST `/battery/find-best` ⭐
Find best rack variants for battery (TOP-5 optimized).

**Request:**
```json
{
  "batteryDimensions": {
    "length": 430,
    "width": 175,
    "height": 225,
    "weight": 15,
    "gap": 10
  },
  "weight": 15,
  "quantity": 48,
  "config": {
    "floors": 1,
    "rows": 2,
    "supports": "430С"
  }
}
```

**Response:**
```json
{
  "rackConfigId": 456,
  "requiredLength": 10550,
  "batteriesPerRow": 24,
  "variants": [
    {
      "rackConfigId": 456,
      "name": "L1A2-10800/175 (600+600+... / 2 beams)",
      "config": {
        "floors": 1,
        "rows": 2,
        "beamsPerRow": 2,
        "supports": "C80",
        "spansArray": [600, 600, 600, ...]
      },
      "components": {
        "beams": [...],
        "supports": [...],
        "isolators": [...]
      },
      "prices": [...],
      "totalCost": 1850,
      "span": 600,
      "spansCount": 18,
      "totalLength": 10800,
      "combination": [600, 600, 600, ...],
      "beams": 2,
      "batteriesPerRow": 24,
      "excessLength": 250,
      "isBest": true
    }
    // ... 4 more variants
  ],
  "bestMatch": { ... }
}
```

**Multi-floor Battery example (floors > 1):**
```json
{
  "rackConfigId": 789,
  "requiredLength": 10550,
  "batteriesPerRow": 24,
  "variants": [
    {
      "rackConfigId": 789,
      "name": "L2A2-10800/430 (600+600+... - 1190 / 2 beams)",
      "config": {
        "floors": 2,
        "rows": 2,
        "beamsPerRow": 2,
        "supports": "430С",
        "verticalSupports": "1190",
        "spansArray": [600, 600, 600, ...],
        "braces": "diagonal_brace"
      },
      "components": {
        "beams": [
          { "name": "Балка 600", "amount": 72, "price": 500, "total": 36000 }
        ],
        "supports": [
          { "name": "Опора C80 (крайня)", "amount": 4, "price": 1020, "total": 4080 },
          { "name": "Опора C80 (пром)", "amount": 68, "price": 1070, "total": 72760 }
        ],
        "verticalSupports": [
          { "name": "Верт. стійка 1190", "amount": 76, "price": 1150, "total": 87400 }
        ],
        "braces": [
          { "name": "Розкос", "amount": 144, "price": 380, "total": 54720 }
        ]
      },
      "prices": [
        { "type": "базова", "label": "Базова ціна", "value": 254960 },
        { "type": "нульова", "label": "Нульова ціна", "value": 367142 }
      ],
      "totalCost": 367142,
      "span": 600,
      "spansCount": 18,
      "totalLength": 10800,
      "combination": [600, 600, ...],
      "beams": 2,
      "batteriesPerRow": 24,
      "excessLength": 250,
      "isBest": true
    }
  ],
  "bestMatch": { ... }
}
```

---

### Rack Sets Routes (`/api/rack-sets`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get user's rack sets |
| `GET` | `/deleted` | Get deleted sets |
| `GET` | `/:id` | Get specific set with details |
| `GET` | `/:id/export` | Export set to Excel |
| `POST` | `/` | Create new set |
| `PUT` | `/:id` | Update existing set |
| `DELETE` | `/:id` | Soft delete set |
| `POST` | `/:id/restore` | Restore deleted set |
| `DELETE` | `/:id/hard` | Hard delete (admin only) |
| `POST` | `/:id/revision` | Create set revision |
| `GET` | `/:id/revisions` | Get revision history |
| `POST` | `/export` | Export new (unsaved) set |
| `POST` | `/cleanup` | Cleanup deleted sets (admin) |

#### POST `/rack-sets` (Create Set)

**Request:**
```json
{
  "name": "Стелажі для складу №1",
  "object_name": "Склад готової продукції",
  "description": "Основний склад",
  "rack_items": [
    { "rackConfigId": 123, "quantity": 2 },
    { "rackConfigId": 456, "quantity": 1 }
  ]
}
```

**Response:**
```json
{
  "rackSet": {
    "id": 789,
    "user_id": 1,
    "name": "Стелажі для складу №1",
    "object_name": "Склад готової продукції",
    "description": "Основний склад",
    "total_cost_snapshot": 4270,
    "created_at": "2026-03-10T14:30:00Z",
    "rack_items": [
      {
        "rackConfigId": 123,
        "quantity": 2,
        "rack_config": {...},
        "components": {...},
        "prices": [...]
      }
    ]
  }
}
```

#### POST `/rack-sets/export` (Export New Set)

**Request:**
```json
{
  "rack_items": [
    { "rackConfigId": 123, "quantity": 2 },
    { "rackConfigId": 456, "quantity": 1 }
  ],
  "includePrices": true
}
```

**Response:** Excel file (binary)

---

## Rack Page Algorithm

### Data Flow

```
RackPage Component
    │
    ├─→ formStore (Zustand) ──┐
    │                          │
    ├─→ spansStore (Zustand) ──┤
    │                          │
    ▼                          │
useRackCalculator hook          │
    │                          │
    ▼                          │
rackApi.findOrCreateConfiguration() │
    │                          │
    ▼                          │
POST /api/rack/calculate       │
    │                          │
    ▼                          │
rackCalculator (shared) ───────┘
    │
    ▼
setStore.addRack()
    │
    ▼
RackSetModal (Save/Export)
```

### Step-by-Step

#### Step 1: User Input

**formStore:**
```typescript
{
  floors: 1,
  verticalSupports: '',
  supports: 'C80',
  rows: 1,
  beamsPerRow: 2
}
```

**spansStore:**
```typescript
{
  spans: [
    { item: '600', quantity: 2 },
    { item: '750', quantity: 1 }
  ]
}
```

#### Step 2: Calculation

```typescript
// useRackCalculator.ts
const calculate = useCallback(async () => {
  // 1. Validation
  if (!formState.supports || !formState.rows) return;

  // 2. Filter valid spans
  const validSpans = spansState.spans.filter(s => s.item && s.quantity > 0);

  // 3. Prepare config
  const rackConfig = {
    floors: formState.floors,
    rows: formState.rows,
    beamsPerRow: formState.beamsPerRow,
    supports: formState.supports,
    verticalSupports: formState.verticalSupports,
    spans: validSpans.map(s => ({ item: s.item, quantity: s.quantity }))
  };

  // 4. Call API
  const response = await rackApi.findOrCreateConfiguration(rackConfig);

  // 5. Save result
  resultsStore.setResult({
    name: response.name,
    components: response.components,
    prices: response.prices,
    totalCost: response.totalCost,
    rackConfigId: response.rackConfigId,
    form: { ...formState },
    spans: validSpans
  });
}, [formState, spansState.spans]);
```

#### Step 3: Server Response

See [POST `/rack/calculate`](#post-rackcalculate) above.

---

## Battery Page Algorithm

### Data Flow

```
BatteryPage Component
    │
    ├─→ formStore (Zustand)
    │
    ▼
useBatteryCalculator hook
    │
    ▼
batteryApi.findBest()
    │
    ▼
POST /api/battery/find-best
    │
    ├─→ Get prices from DB
    ├─→ Get available spans
    ├─→ Calculate batteriesPerRow
    ├─→ Calculate requiredLength
    ├─→ Generate span combinations (batteryRackBuilder.js)
    ├─→ Optimize variants (TOP-5)
    ├─→ Calculate prices for each variant
    └─→ Find/create rackConfigId for best match
    │
    ▼
Transform response to BatteryVariant[]
    │
    ▼
resultsStore.setVariants()
    │
    ▼
BatteryResults UI
    │
    ├─→ addRack() → setStore
    │
    ▼
BatterySetModal (Save/Export)
```

### Step-by-Step

#### Step 1: Battery Input

**formStore:**
```typescript
{
  length: 600,        // mm
  width: 300,         // mm
  height: 200,        // mm
  weight: 15,         // kg
  gap: 50,            // mm
  count: 24,          // quantity
  rows: 1,
  floors: 1,
  supportType: 'straight'
}
```

#### Step 2: Server Calculation

```javascript
// batteryController.js → findBestRackForBattery()

// 1. Calculate batteries per row
const batteriesPerRow = Math.ceil(quantity / (rows * floors));

// 2. Calculate required length
const requiredLength = (batteriesPerRow * batteryLength) +
                       ((batteriesPerRow - 1) * gap);

// 3. Generate span combinations
const combinations = calcRackSpans({
  rackLength: requiredLength,
  accLength: batteryLength,
  accWeight: batteryDimensions.weight,
  gap,
  standardSpans: spanObjects
});

// 4. Optimize (TOP-5)
const optimizedVariants = optimizeRacks(combinations, requiredLength, maxSpan, 5, price);

// 5. Calculate prices for each variant
const variantsWithPrices = optimizedVariants.map((v, index) => {
  // Determine brace type based on rack length
  const variantLength = v.totalLength || requiredLength;
  const variantBraces = variantLength >= 1500 ? 'D1500' 
                        : variantLength >= 1000 ? 'D1000' 
                        : 'D600';

  const variantConfig = {
    floors, 
    rows,
    beamsPerRow: v.beams,
    supports: config?.supports || 'C80',
    verticalSupports: floors > 1 ? config?.verticalSupports || '1190' : null,
    spansArray: v.combination,
    braces: floors > 1 ? variantBraces : null
  };
  
  const variantPrices = calculateRackPricesWithPermissions(variantConfig, price, user);
  
  return {
    config: variantConfig,
    components: variantPrices.components,
    prices: variantPrices.prices,
    totalCost: variantPrices.totalCost,
    combination: v.combination,
    beams: v.beams,
    totalLength: v.totalLength,
    excessLength: v.overLength,
    isBest: index === 0
  };
});
```

#### Step 3: Optimization Criteria

Variants are sorted by priority:

1. **Fewer beams** - cheaper construction
2. **Fewer spans** - simpler design
3. **More symmetry** - better aesthetics
4. **Lower price** - cost efficiency
5. **Shorter length** - less excess

#### Step 4: Server Response

See [POST `/battery/find-best`](#post-batteryfind-best-) above.

---

## Common Component Calculator

### Main Function

**File:** `shared/rackCalculator.ts`

```typescript
export const calculateRackComponents = (
  config: RackConfig,
  price: PriceData
): RackComponents => {
  const components: RackComponents = {};

  // 1. Supports (all floors)
  if (config.supports && config.spans) {
    const supportsData = calculateSupports(config, price);
    if (supportsData.length > 0) {
      components.supports = supportsData;
    }
  }

  // 2. Beams (mandatory)
  const beamsData = calculateSpans(config, price);
  if (beamsData.length > 0) {
    components.beams = beamsData;
  }

  // 3. Vertical stands (ONLY if floors > 1)
  if (config.floors > 1 && config.verticalSupports) {
    const verticalData = calculateVerticalSupports(config, price);
    if (verticalData) {
      components.verticalSupports = verticalData;
    }
  }

  // 4. Braces (ONLY if floors > 1)
  if (config.floors > 1) {
    const bracesData = calculateBraces(config, price);
    if (bracesData) {
      components.braces = bracesData;
    }
  }

  // 5. Isolators (ONLY if floors === 1)
  if (config.floors === 1) {
    const isolatorsData = calculateIsolators(config, price);
    if (isolatorsData) {
      components.isolators = isolatorsData;
    }
  }

  return components;
};
```

**Key points:**
- `supports` and `beams` are calculated for **all configurations**
- `verticalSupports` and `braces` are **mutually exclusive** with `isolators`
- Multi-floor racks (`floors > 1`) use vertical stands + braces
- Single-floor racks (`floors === 1`) use isolators

### Support Calculation

**For all floor configurations:**

```typescript
export const calculateSupports = (config, price) => {
  const { floors, spans, supports } = config;
  const result = [];

  const totalSpans = spans.reduce((sum, s) => sum + s.quantity, 0);

  // Edge supports: 2 × floors
  const edgeSupports = 2 * floors;
  
  // Intermediate supports: (spans - 1) × floors
  const intermediateSupports = Math.max(0, totalSpans - 1) * floors;

  const supportPrice = price.supports[supports];

  if (edgeSupports > 0) {
    result.push({
      name: `Опора ${supports} (крайня)`,
      amount: edgeSupports,
      price: supportPrice.edge.price,
      total: edgeSupports * supportPrice.edge.price
    });
  }

  if (intermediateSupports > 0) {
    result.push({
      name: `Опора ${supports} (пром)`,
      amount: intermediateSupports,
      price: supportPrice.intermediate.price,
      total: intermediateSupports * supportPrice.intermediate.price
    });
  }

  return result;
};
```

**Example (multi-floor):**
- `floors: 2`, `spans: [{item: "600", quantity: 3}]`, `supports: "C80"`
- `totalSpans = 3`
- `edgeSupports = 2 × 2 = 4` (2 per floor)
- `intermediateSupports = (3 - 1) × 2 = 4` (2 per floor)
- Total supports: 8 (4 edge + 4 intermediate)

### Beam Calculation

```typescript
export const calculateSpans = (config, price) => {
  const { rows, beamsPerRow, spans, floors, spansArray, beams } = config;
  const spansMap = new Map();

  // For Rack Page (spans with quantity)
  if (spans && spans.length > 0) {
    spans.forEach(span => {
      const code = span.item;
      const qty = span.quantity * rows * beamsPerRow * floors;
      const current = spansMap.get(code) || 0;
      spansMap.set(code, current + qty);
    });
  }
  // For Battery Page (spansArray)
  else if (spansArray && spansArray.length > 0) {
    spansArray.forEach(spanLength => {
      const code = String(spanLength);
      const qty = 1 * beams * rows * floors;
      const current = spansMap.get(code) || 0;
      spansMap.set(code, current + qty);
    });
  }

  const result = [];
  spansMap.forEach((amount, code) => {
    const beamPrice = price.spans[code]?.price || 0;
    result.push({
      name: `Балка ${code}`,
      amount,
      price: beamPrice,
      total: amount * beamPrice
    });
  });

  // Sort by length
  result.sort((a, b) => {
    const aCode = parseInt(a.name.replace('Балка ', ''));
    const bCode = parseInt(b.name.replace('Балка ', ''));
    return aCode - bCode;
  });

  return result;
};
```

### Vertical Stands Calculation

**For multi-floor racks (floors > 1):**

```typescript
export const calculateVerticalSupports = (config, price) => {
  const { floors, spans, spansArray, verticalSupports } = config;

  if (!verticalSupports || floors <= 1) return null;

  // Number of spans + 1 = stands per side
  // × 2 = stands on both sides (left and right)
  // Note: Does NOT depend on rows or floors
  const totalSpans = spans
    ? spans.reduce((sum, s) => sum + s.quantity, 0)
    : spansArray?.length || 0;

  const totalStands = (totalSpans + 1) * 2;

  const standPrice = price.vertical_supports[verticalSupports]?.price || 0;

  return {
    name: `Верт. стійка ${verticalSupports}`,
    amount: totalStands,
    price: standPrice,
    total: totalStands * standPrice
  };
};
```

**Example:**
- `floors: 2`, `rows: 2`, `spans: [{item: "600", quantity: 3}]`
- `totalSpans = 3`
- `totalStands = (3 + 1) × 2 = 8 vertical stands`

**Important:** Vertical stands count = `(spans + 1) × 2`. Does NOT depend on `rows` or `floors`.

---

### Braces Calculation

**For multi-floor racks (floors > 1):**

```typescript
export const calculateBraces = (config, price) => {
  const { floors, spans, spansArray } = config;

  if (floors <= 1) return null;

  const totalSpans = spans
    ? spans.reduce((sum, s) => sum + s.quantity, 0)
    : spansArray?.length || 0;

  // Formula: (spans - 1) × 2 + 2 = braces on both sides
  // Note: Does NOT depend on rows or floors
  const totalBraces = totalSpans > 1
    ? (totalSpans - 1) * 2 + 2
    : 2;

  // Use first available brace from price list
  const braceCode = Object.keys(price.diagonal_brace)[0];
  const bracePrice = price.diagonal_brace[braceCode]?.price || 0;

  return {
    name: 'Розкос',
    amount: totalBraces,
    price: bracePrice,
    total: totalBraces * bracePrice
  };
};
```

**Example:**
- `floors: 2`, `rows: 3`, `spans: [{item: "750", quantity: 1}]`
- `totalSpans = 1`
- `totalBraces = (1 - 1) × 2 + 2 = 2 braces`

**Important:** Braces count = `(spans - 1) × 2 + 2`. Does NOT depend on `rows` or `floors`.

---

**Component presence by floor count:**

| Component | floors = 1 | floors > 1 |
|-----------|------------|------------|
| `supports` | ✅ | ✅ |
| `beams` | ✅ | ✅ |
| `verticalSupports` | ❌ | ✅ |
| `braces` | ❌ | ✅ |
| `isolators` | ✅ | ❌ |

### Isolators Calculation

```typescript
export const calculateIsolators = (config, price) => {
  const { floors, spans, spansArray } = config;

  if (floors > 1) return null;

  const totalSpans = spans
    ? spans.reduce((sum, s) => sum + s.quantity, 0)
    : spansArray?.length || 0;

  // Supports: 2 edge + (spans - 1) intermediate
  const edgeSupports = 2;
  const intermediateSupports = Math.max(0, totalSpans - 1);
  const totalSupports = edgeSupports + intermediateSupports;

  // 2 isolators per support
  const totalIsolators = totalSupports * 2;
  const isolatorPrice = price.isolator?.isolator?.price || 0;

  return {
    name: 'Ізолятор',
    amount: totalIsolators,
    price: isolatorPrice,
    total: totalIsolators * isolatorPrice
  };
};
```

### Total Cost Calculation

```typescript
export const calculateTotalCost = (components: RackComponents): number => {
  let total = 0;
  for (const [type, items] of Object.entries(components)) {
    const itemsArray = Array.isArray(items) ? items : [items];
    for (const item of itemsArray) {
      total += item.total;
    }
  }
  return total;
};

export const calculateTotalWithoutIsolators = (components: RackComponents): number => {
  let total = 0;
  for (const [type, items] of Object.entries(components)) {
    if (type === 'isolators') continue;
    const itemsArray = Array.isArray(items) ? items : [items];
    for (const item of itemsArray) {
      total += item.total;
    }
  }
  return total;
};
```

---

## Adding to Set

### Rack Page → Set

```typescript
// setStore.ts
const addRack = (rack, quantity = 1) =>
  set((state) => {
    // Check for duplicates by rackConfigId or name
    const existingIndex = state.racks.findIndex(r =>
      r.rackConfigId
        ? r.rackConfigId === rack.rackConfigId
        : r.name === rack.name
    );

    if (existingIndex !== -1) {
      // Update quantity
      return {
        racks: state.racks.map((r, i) =>
          i === existingIndex
            ? { ...r, quantity: r.quantity + quantity }
            : r
        )
      };
    }

    // Add new
    return {
      racks: [...state.racks, { ...rack, setId: state.nextId, quantity }],
      nextId: state.nextId + 1
    };
  });
```

### Battery Page → Set

```typescript
// battery/setStore.ts
const addRack = (rack, quantity = 1) =>
  set((state) => {
    // Check for duplicates by rackConfigId or _index
    const existingIndex = state.racks.findIndex(r =>
      r.rackConfigId && rack.rackConfigId
        ? r.rackConfigId === rack.rackConfigId
        : r._index === rack._index
    );

    if (existingIndex !== -1) {
      return {
        racks: state.racks.map((r, i) =>
          i === existingIndex
            ? { ...r, quantity: r.quantity + quantity }
            : r
        )
      };
    }

    return {
      racks: [...state.racks, { ...rack, setId: state.nextId, quantity }],
      nextId: state.nextId + 1
    };
  });
```

---

## Saving Set

### Rack Page → Submit

```typescript
// RackSetModal.tsx
const onSubmit = (data) => {
  const rackItems = racks
    .filter(rack => rack.rackConfigId)
    .map(rack => ({
      rackConfigId: rack.rackConfigId!,
      quantity: rack.quantity || 1
    }));

  createMutation.mutate({
    ...data,
    rack_items: rackItems
  });
};
```

### Battery Page → Submit

```typescript
// BatterySetModal.tsx
const onSubmit = (data) => {
  // Convert spansArray to Rack Page format
  const convertSpansToRackFormat = (spansArray) => {
    const spansMap = new Map();
    spansArray.forEach(span => {
      const key = String(span);
      spansMap.set(key, (spansMap.get(key) || 0) + 1);
    });
    return Array.from(spansMap.entries()).map(([item, quantity]) => ({
      item,
      quantity
    }));
  };

  const rackItems = racks
    .filter(rack => rack.rackConfigId)
    .map(rack => ({
      rackConfigId: rack.rackConfigId!,
      quantity: rack.quantity || 1,
      spans: rack.config?.spans
        ? convertSpansToRackFormat(rack.config.spans)
        : []
    }));

  createMutation.mutate({
    ...data,
    rack_items: rackItems
  });
};
```

### Server Processing

```javascript
// rackSetController.js → createRackSet()

// 1. Get rack configurations from DB
const rackConfigs = db.prepare(`
  SELECT id, floors, rows, beams_per_row, supports, vertical_supports, spans, braces
  FROM rack_configurations
  WHERE id IN (${rackConfigIds.map(() => '?').join(',')})
`).all(...rackConfigIds);

// 2. Calculate components and prices for each rack
for (const rackConfig of rackConfigs) {
  const components = calculateRackComponents(rackConfig, priceData);
  const totalCost = calculateTotalCost(components);
  // ...
}

// 3. Save set to DB
const result = db.prepare(`
  INSERT INTO rack_sets (user_id, name, object_name, description, total_cost)
  VALUES (?, ?, ?, ?, ?)
`).run(userId, name, objectName, description, totalCost);

// 4. Save rack_items relationships
rackItems.forEach((item) => {
  db.prepare(`
    INSERT INTO rack_set_items (rack_set_id, rack_config_id, quantity)
    VALUES (?, ?, ?)
  `).run(rackSetId, item.rackConfigId, item.quantity);
});
```

---

## Export to Excel

### Export New Set (Unsaved)

```typescript
// rackSetsApi.ts
const exportNew = async (rackItems, includePrices = false) => {
  const response = await api.post('/rack-sets/export', {
    rack_items: rackItems,
    includePrices
  }, {
    responseType: 'arraybuffer'
  });
  return response.data;
};
```

### Export Saved Set

```typescript
// rackSetsApi.ts
const exportSaved = async (setId) => {
  const response = await api.get(`/rack-sets/${setId}/export`, {
    responseType: 'arraybuffer'
  });
  return response.data;
};
```

### Excel File Structure

**Sheet 1: Rack Set**

| № | Rack Name | Quantity | Zero Price | Total |
|---|-----------|----------|------------|-------|
| 1 | L1A1-1950 | 2 | 1210 | 2420 |
| 2 | L1A2-3000 | 1 | 1850 | 1850 |
| **Total** | | **3** | | **4270** |

**Sheet 2: Components Details** (for each rack)

| № | Component | Qty per 1 | Total Qty | Price | Sum |
|---|-----------|-----------|-----------|-------|-----|
| 1 | Опора C80 (крайня) | 2 | 4 | 100 | 400 |
| 2 | Балка 600 | 4 | 8 | 50 | 400 |
| 3 | Ізолятор | 8 | 16 | 10 | 160 |

---

## Database Schema

### `rack_configurations`

```sql
CREATE TABLE rack_configurations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  floors INTEGER NOT NULL,
  rows INTEGER NOT NULL,
  beams_per_row INTEGER NOT NULL,
  supports TEXT,
  vertical_supports TEXT,
  spans TEXT,              -- JSON array [600, 600, 750]
  braces TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Uniqueness:** Configuration is unique by combination of:
- `floors`, `rows`, `beams_per_row`
- `supports`, `vertical_supports`, `spans`, `braces`

---

### `rack_sets`

```sql
CREATE TABLE rack_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  object_name TEXT,
  description TEXT,
  total_cost REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,     -- Soft delete
  deleted_by INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

### `rack_set_items`

```sql
CREATE TABLE rack_set_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rack_set_id INTEGER NOT NULL,
  rack_config_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rack_set_id) REFERENCES rack_sets(id),
  FOREIGN KEY (rack_config_id) REFERENCES rack_configurations(id)
);
```

---

## Comparison: Rack vs Battery

| Aspect | Rack Page | Battery Page | Common |
|--------|-----------|--------------|--------|
| **Input** | Manual rack params | Battery dimensions | `floors`, `rows` |
| **Spans** | User-defined `{item, quantity}` | Auto-generated `[600, 600, 750]` | Stored as JSON in DB |
| **Calculation** | Single result | TOP-5 optimized variants | Same `rackCalculator.ts` |
| **Components** | `supports`, `beams`, `isolators` | `beams`, `supports`, `isolators` | Same structure |
| **Prices** | 3 types (based on permissions) | 3 types (based on permissions) | `базова`, `без_ізоляторів`, `нульова` |
| **DB Storage** | `rack_configurations` | `rack_configurations` | Same table |
| **Set Storage** | `rack_sets` + `rack_set_items` | `rack_sets` + `rack_set_items` | Same tables |
| **Export** | Excel via `/rack-sets/export` | Excel via `/rack-sets/export` | Same endpoint |

---

## Key Differences

### 1. Span Format

**Rack Page:**
```json
{
  "spans": [
    { "item": "600", "quantity": 2 },
    { "item": "750", "quantity": 1 }
  ]
}
```

**Battery Page:**
```json
{
  "spansArray": [600, 600, 750]
}
```

**Conversion:**
```typescript
const convertSpansToRackFormat = (spansArray: number[]) => {
  const spansMap = new Map<string, number>();
  spansArray.forEach(span => {
    const key = String(span);
    spansMap.set(key, (spansMap.get(key) || 0) + 1);
  });
  return Array.from(spansMap.entries()).map(([item, quantity]) => ({
    item,
    quantity
  }));
};
```

### 2. Component Calculation

**Rack Page:** Uses `config.spans` with quantity
**Battery Page:** Uses `config.spansArray` and `config.beams`

Both flow into the same `calculateSpans()` function.

### 3. Duplicate Detection in Sets

**Rack Page:**
```typescript
racks.findIndex(r =>
  r.rackConfigId ? r.rackConfigId === rack.rackConfigId : r.name === rack.name
)
```

**Battery Page:**
```typescript
racks.findIndex(r =>
  r.rackConfigId && rack.rackConfigId
    ? r.rackConfigId === rack.rackConfigId
    : r._index === rack._index
)
```

---

## Summary

Both Rack and Battery pages:
- ✅ Use the **same component calculator** (`rackCalculator.ts`)
- ✅ Share the **same API** for saving and exporting sets
- ✅ Store configurations in the **same database tables**
- ✅ Apply **user permissions** for price visibility
- ✅ Support **duplicate detection** when adding to sets
- ✅ Export to **the same Excel format**

**Main differences:**
- Input method (manual vs automatic)
- Span format (object with quantity vs array)
- Number of results (single vs TOP-5 variants)
- Duplicate detection logic (rackConfigId/name vs rackConfigId/_index)

---

## Component Calculation Formulas

**Location:** `shared/rackCalculator.ts`

### 1. Supports (Опори)

**For all floor configurations:**

```typescript
// Edge supports: 2 × floors
const edgeSupports = 2 * floors;

// Intermediate supports: (spans - 1) × floors
const intermediateSupports = Math.max(0, totalSpans - 1) * floors;
```

**Example:**
- `floors: 2`, `spans: [{item: "600", quantity: 3}]`
- `edgeSupports = 2 × 2 = 4`
- `intermediateSupports = (3 - 1) × 2 = 4`
- **Total: 8 supports**

---

### 2. Beams (Балки)

**For Rack Page (spans with quantity):**

```typescript
const qty = span.quantity * rows * beamsPerRow * floors;
```

**For Battery Page (spansArray):**

```typescript
const qty = 1 * beams * rows * floors;
```

**Example:**
- `spans: [{item: "600", quantity: 1}]`, `rows: 2`, `beamsPerRow: 2`, `floors: 2`
- `qty = 1 × 2 × 2 × 2 = 8 beams`

---

### 3. Vertical Stands (Вертикальні стійки)

**For multi-floor racks (floors > 1):**

```typescript
// Formula: (spans + 1) × 2
// Note: Does NOT depend on rows or floors
const totalStands = (totalSpans + 1) * 2;
```

**Example:**
- `spans: [{item: "600", quantity: 1}]` → `totalSpans = 1`
- `totalStands = (1 + 1) × 2 = 4 vertical stands`

---

### 4. Braces (Розкоси)

**For multi-floor racks (floors > 1):**

```typescript
// Formula: (spans - 1) × 2 + 2
// Note: Does NOT depend on rows or floors
const totalBraces = totalSpans > 1 
  ? (totalSpans - 1) * 2 + 2 
  : 2;
```

**Example:**
- `spans: [{item: "600", quantity: 1}]` → `totalSpans = 1`
- `totalBraces = 2` (minimum for 1 span)

---

### 5. Isolators (Ізолятори)

**For single-floor racks (floors === 1):**

```typescript
// Formula: (edgeSupports + intermediateSupports) × 2
const edgeSupports = 2;
const intermediateSupports = Math.max(0, totalSpans - 1);
const totalSupports = edgeSupports + intermediateSupports;
const totalIsolators = totalSupports * 2;
```

**Example:**
- `spans: [{item: "600", quantity: 3}]` → `totalSpans = 3`
- `edgeSupports = 2`
- `intermediateSupports = 3 - 1 = 2`
- `totalSupports = 2 + 2 = 4`
- `totalIsolators = 4 × 2 = 8 isolators`

---

## Component Presence by Floor Count

| Component | floors = 1 | floors > 1 |
|-----------|------------|------------|
| `supports` | ✅ | ✅ |
| `beams` | ✅ | ✅ |
| `verticalSupports` | ❌ | ✅ |
| `braces` | ❌ | ✅ |
| `isolators` | ✅ | ❌ |

---

## Quick Reference

| Component | Formula | Depends On |
|-----------|---------|------------|
| **Edge Supports** | `2 × floors` | floors |
| **Intermediate Supports** | `(spans - 1) × floors` | spans, floors |
| **Beams** | `quantity × rows × beamsPerRow × floors` | spans, rows, beamsPerRow, floors |
| **Vertical Stands** | `(spans + 1) × 2` | spans ONLY |
| **Braces** | `(spans > 1) ? (spans - 1) × 2 + 2 : 2` | spans ONLY |
| **Isolators** | `(2 + max(0, spans - 1)) × 2` | spans ONLY |
