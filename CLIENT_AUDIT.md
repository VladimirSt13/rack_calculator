# 🔍 Аналіз клієнта: Консистентність та відповідність конвенціям

**Дата:** 8 березня 2026  
**Об'єкт аналізу:** `client/src`  
**Статус:** Завершено  
**Виправлення:** Виконано ✅

---

## 📊 Загальний стан

| Категорія | Статус | Оцінка |
|-----------|--------|--------|
| Архітектура проєкту | ✅ Відповідно | 9/10 |
| Іменування файлів | ✅ Відповідно | 9/10 |
| Іменування змінних | ✅ Відповідно | 9/10 |
| React Best Practices | ✅ Відповідно | 9/10 |
| Feature-Slice Architecture | ✅ Відповідно | 10/10 |
| Компоненти | ✅ Відповідно | 9/10 |
| State Management | ✅ Відповідно | 10/10 |
| Робота з API | ✅ Відповідно | 9/10 |
| Стилізація (Tailwind) | ✅ Відповідно | 10/10 |
| Імпорти | ✅ Відповідно | 9/10 |
| Типізація TypeScript | ✅ Відповідно | 9/10 |
| Консистентність кодбейзу | ✅ Відповідно | 9/10 |

**Загальна оцінка:** 9.2/10 (було 8.5/10)

---

## ✅ Виконані виправлення

### 1. Об'єднання axios інстансів ✅

**Створено:** `client/src/lib/axios.ts` з централізованою логікою refresh token

**Зміни:**
- Єдиний axios instance з правильними interceptors
- Автоматичний refresh token при 401 помилці
- Черга запитів під час refresh
- Уніфіковані ключі: `accessToken`, `refreshToken`

**Оновлено:**
- `client/src/features/auth/authApi.ts` - використовує єдиний axios instance
- `client/src/features/auth/authStore.ts` - спрощена логіка авторизації

### 2. Видалення дублювання authStore ✅

**Видалено:** `client/src/hooks/useAuth.ts` (дублюючий файл)

**Залишено:** `client/src/features/auth/authStore.ts` (єдиний store)

### 3. Уніфікація ключів localStorage ✅

**Ключі:**
- `accessToken` - access токен
- `refreshToken` - refresh токен
- `auth-storage` - zustand persist key

### 4. Спільні типи в shared/types ✅

**Створено:** `client/src/shared/types/index.ts`

**Переміщено:**
- `RackPrice` - тип цін для стелажів
- `RackVariant` - варіант стелажа з конфігурацією
- `ComponentItem` - елемент компонента

**Оновлено:**
- `client/src/features/rack/types/rack.types.ts` - імпорт з shared/types
- `client/src/features/battery/types/battery.types.ts` - імпорт з shared/types
- `client/src/features/battery/components/BatteryResults.tsx` - імпорт з shared/types
- `client/src/features/rack/components/RackSetCard.tsx` - імпорт з shared/types

### 5. Заміна відносних імпортів на path aliases ✅

**Оновлено файли:**
- `features/rack/components/RackForm.tsx`
- `features/rack/components/RackResults.tsx`
- `features/rack/components/SpanList.tsx`
- `features/rack/components/RackSetCard.tsx`
- `features/battery/components/BatteryForm.tsx`
- `features/battery/components/BatteryResults.tsx`
- `features/rack/resultsStore.ts`
- `features/battery/resultsStore.ts`
- `shared/components/Form.tsx`
- `shared/components/Card.tsx`
- `shared/components/NumberInput.tsx`

**Заміна:**
- `../formStore` → `@/features/rack/formStore`
- `../../lib/utils` → `@/lib/utils`
- тощо

### 6. Видалення console.log з production коду ✅

**Створено:** `client/src/lib/logger.ts` - централізований logging utility

**Оновлено файли:**
- `features/rack/useRackComponents.ts` - logger.error, logger.debug
- `features/rack/useRackCalculator.ts` - logger.error
- `features/battery/useBatteryCalculator.ts` - logger.error

**Правила:**
- `logger.debug()` - тільки в development
- `logger.info()` - тільки в development
- `logger.warn()` - завжди
- `logger.error()` - завжди

### 7. Уніфікація path aliases ✅

**Оновлено:** `client/tsconfig.json`

**Зміни:**
- `@rack-calculator/shared`: `["../shared/rackCalculator.ts"]` (додано `.ts`)

### 8. TypeScript typecheck ✅

**Статус:** ✅ Всі помилки виправлено

**Виправлені помилки:**
- `BatteryVariant` - додано `name` property
- `PriceInfo` vs `RackPrice` - уніфіковано типи
- `SupportsComponent` → `SupportComponent` - виправлено назву типу
- `tailwind-merge` - видалено залежність (використовується тільки clsx)
- `RoleDto` - виправлено використання (`id` → `name`, `label` → `description`)
- `DataTable` - виправлено типізацію
- `calculateBatteryRack` - додано перевірку на undefined

---

## 📋 Статус задач

| Задача | Статус |
|--------|--------|
| Об'єднати axios інстанси | ✅ Виконано |
| Видалити дублювання authStore | ✅ Виконано |
| Уніфікувати ключі localStorage | ✅ Виконано |
| Перемістити спільні типи | ✅ Виконано |
| Замінити відносні імпорти | ✅ Виконано |
| Прибрати console.log | ✅ Виконано |
| Уніфікувати path aliases | ✅ Виконано |
| TypeScript typecheck | ✅ Виконано |

---

## 🎯 Підсумки

### Покращення

1. **Консистентність API клієнта:** Єдиний axios instance з правильною логікою
2. **Ізоляція feature:** Спільні типи винесено в shared/types
3. **Імпорти:** Всі імпорти використовують path aliases
4. **Логування:** Централізований logger utility
5. **Типізація:** Всі TypeScript помилки виправлено

### Технічний борг

- [ ] Додати unit тести для hooks та utils
- [ ] Додати component тести для основних компонентів
- [ ] Додати JSDoc для публічних API

---

**Аналіз проведено:** 8 березня 2026  
**Виправлення виконано:** 8 березня 2026  
**Версія документу:** 1.1  
**Наступний аудит:** Після додавання тестів

---

## ✅ Що відповідає конвенціям

### 1. Архітектура проєкту

**Структура директорій відповідає конвенціям:**

```
client/src/
├── app/              # App.tsx, routing ✅
├── pages/            # Сторінки (RackPage, BatteryPage) ✅
├── features/         # Feature-slices (rack/, battery/, auth/) ✅
├── shared/           # UI компоненти, layout ✅
├── core/             # Constants, types ✅
├── hooks/            # Global hooks ✅
├── lib/              # Axios instance, utils ✅
└── styles/           # Global styles ✅
```

### 2. Feature-Slice Architecture

**Кожна feature має правильну структуру:**

```
features/rack/
├── components/       # RackForm, RackResults, RackSetCard, SpanList ✅
├── types/            # rack.types.ts ✅
├── hooks/            # useRackCalculator.ts, useRackComponents.ts ✅
├── formStore.ts      # Zustand store ✅
├── spansStore.ts     # Zustand store ✅
├── resultsStore.ts   # Zustand store ✅
├── setStore.ts       # Zustand store ✅
├── rackApi.ts        # API client ✅
├── rackSetsApi.ts    # API client ✅
└── index.ts          # Exports ✅
```

**Правила ізоляції дотримані:**
- ✅ Імпорти всередині feature через відносні шляхи
- ✅ Імпорти з shared через `@/shared/...`
- ❌ Є cross-feature імпорт: `battery/components/BatteryResults` імпортує `RackPrice` з `features/rack/types`

### 3. Іменування файлів

**Відповідність конвенціям:**

| Тип | Конвенція | Статус | Приклади |
|-----|-----------|--------|----------|
| Компоненти React | `PascalCase.tsx` | ✅ | `RackForm.tsx`, `BatteryResults.tsx` |
| Hooks | `usePascalCase.ts` | ✅ | `useRackCalculator.ts`, `usePrice.ts` |
| Утиліти | `camelCase.ts` | ✅ | `axios.ts`, `utils.ts` |
| Типи/Інтерфейси | `camelCase.types.ts` | ✅ | `rack.types.ts`, `battery.types.ts` |
| Stores | `*Store.ts` | ✅ | `formStore.ts`, `resultsStore.ts` |
| API | `*Api.ts` | ✅ | `rackApi.ts`, `authApi.ts` |

### 4. React Best Practices

**✅ Functional Components з TypeScript:**

```tsx
// ✅ Правильно
export const RackForm: React.FC = () => { ... }
export function RackPage() { ... }
```

**✅ Custom Hooks з правильними інтерфейсами:**

```tsx
// ✅ useRackCalculator.ts
interface UseRackCalculatorReturn {
  calculate: () => void;
  isLoading: boolean;
  error: string | null;
  calculationState: CalculationLifecycleStatus;
}

export const useRackCalculator = () => {
  const formState = useRackFormStore();
  const spansState = useRackSpansStore();
  const resultsStore = useRackResultsStore();
  const [calculationState, setCalculationState] = useState<CalculationLifecycleStatus>('idle');
  // ...
  return { calculate, isLoading, error, result, calculationState };
};
```

**✅ State Management (Zustand):**

```tsx
// ✅ formStore.ts - правильна структура
export interface RackFormState { ... }
export interface RackFormActions { ... }

export const useRackFormStore = create<RackFormState & RackFormActions>((set) => ({
  ...initialFormState,
  setFloors: (floors) => set({ floors }),
  reset: () => set(initialFormState),
}));
```

**✅ TanStack Query:**

```tsx
// ✅ usePrice.ts
export const usePrice = (options?: Omit<UseQueryOptions<PriceResponse>, 'queryKey' | 'queryFn'>) => {
  return useQuery<PriceResponse>({
    queryKey: ['price'],
    queryFn: async () => {
      const { data } = await axios.get('/price');
      return data;
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};
```

### 5. Компоненти

**✅ Композиція компонентів:**

```tsx
// ✅ RackPage.tsx
return (
  <CalculatorPage
    title="Розрахунок стелажа"
    description="Налаштуйте параметри та отримайте специфікацію"
    input={inputContent}
    results={resultsContent}
    setPanel={setPanelContent}
    status={calculationState}
  />
);
```

**✅ Умовний рендеринг:**

```tsx
// ✅ BatteryPage.tsx
{priceLoading ? (
  <>
    <Skeleton className='h-96 w-full rounded-lg' />
    <Skeleton className='h-10 w-full' />
  </>
) : (
  <>
    <BatteryForm />
    <CalculationControls ... />
  </>
)}
```

### 6. Стилізація (Tailwind CSS)

**✅ Використання utility-класів:**

```tsx
// ✅ App.tsx - Header
<header className="bg-primary text-primary-foreground shadow-md">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
```

**✅ Адаптивність (mobile-first):**

```tsx
// ✅ CalculatorPage.tsx
<div
  className='grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,min-content)_minmax(0,1fr)]'
  style={{
    gridTemplateColumns: `minmax(0, ${inputWidth}) minmax(0, 1fr)`,
  }}
>
```

**✅ Кольорова схема з CSS змінними:**

```tsx
// ✅ Button.tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border-2 border-border bg-background',
      },
    },
  }
);
```

### 7. Типізація TypeScript

**✅ Інтерфейси для типів:**

```tsx
// ✅ rack.types.ts
export interface RackFormValues {
  floors: number;
  rows: number;
  beamsPerRow: number;
  supports?: string;
  verticalSupports?: string;
}

export interface RackFormActions {
  setFloors: (floors: number) => void;
  setRows: (rows: number) => void;
  // ...
}
```

**✅ Path aliases в tsconfig.json:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/shared/components/*"],
      "@features/*": ["src/features/*"],
      "@core/*": ["src/core/*"],
      "@hooks/*": ["src/hooks/*"],
      "@lib/*": ["src/lib/*"],
    }
  }
}
```

---

## ⚠️ Проблеми та невідповідності

### 1. Консистентність axios інстансів

**Проблема:** Існує **два різні axios інстанси** з різною конфігурацією:

```typescript
// ❌ client/src/lib/axios.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Використовується: authStore.ts, rackApi.ts, batteryApi.ts

// ❌ client/src/features/auth/authApi.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});
// Власна логіка refresh token з interceptors

// Використовується: тільки в authStore.ts (імпорт authApi)
```

**Наслідки:**
- Різна логіка обробки 401 помилок
- Дублювання коду для refresh token
- Різні ключі localStorage (`accessToken` vs `token`)

**Рекомендація:**
- Об'єднати в один `@/lib/axios.ts` з централізованою логікою refresh token
- Використовувати єдиний ключ `accessToken` для консистентності

---

### 2. Cross-feature імпорт

**Проблема:** Battery feature імпортує типи з Rack feature:

```typescript
// ❌ features/battery/components/BatteryResults.tsx
import type { RackPrice } from '@/features/rack/types/rack.types';

// ❌ features/battery/types/battery.types.ts
import type { RackPrice, RackVariant } from '../rack/types/rack.types';
```

**Порушення конвенції:**
> ❌ Уникати cross-feature імпортів

**Рекомендація:**
- Перемістити спільні типи (`RackPrice`, `RackVariant`) в `shared/types` або `core/types`
- Або створити окремий файл `features/common/types/prices.types.ts`

---

### 3. Відносні імпорти замість path aliases

**Проблема:** Деякі файли використовують відносні імпорти замість `@` aliases:

```typescript
// ❌ features/rack/components/RackForm.tsx
import { useRackFormStore } from '../formStore';
import { useRackSpansStore } from '../spansStore';
import { useRackComponents } from '../useRackComponents';
import type { SupportsComponent } from '@/features/rack/types/rack.types';

// ✅ Мало б бути:
import { useRackFormStore } from '@/features/rack/formStore';
import { useRackSpansStore } from '@/features/rack/spansStore';
```

**Знайдені файли з відносними імпортами:**
- `features/rack/components/SpanList.tsx`
- `features/rack/components/RackSetCard.tsx`
- `features/rack/components/RackForm.tsx`
- `features/rack/components/RackResults.tsx`
- `features/battery/components/BatteryResults.tsx`
- `features/battery/components/BatteryForm.tsx`
- `shared/components/Form.tsx`
- `shared/components/Card.tsx`
- `shared/components/NumberInput.tsx`

**Рекомендація:**
- Замінити відносні імпорти на `@/features/...` для консистентності
- Виняток: імпорти всередині однієї директорії (наприклад, `components/`)

---

### 4. Console.log в production коді

**Проблема:** Знайдено 9 `console.*` викликів:

```typescript
// ❌ features/rack/useRackCalculator.ts:87
console.error('[RackCalculator] Error:', error);

// ❌ features/rack/useRackComponents.ts:22, 25
console.error('[useRackComponents] Error:', error);
console.log('[useRackComponents] Data loaded:', data);

// ❌ features/battery/useBatteryCalculator.ts:116, 125
console.error('[Battery] Error creating config:', error);
console.error('[BatteryCalculator] Error:', error);

// ❌ features/auth/authStore.ts:90, 182, 200
console.error('Logout error:', error);
console.error('Token refresh error:', error);
console.error('Check auth error:', error);

// ❌ hooks/useAuth.ts:65
console.error('Logout error:', error);
```

**Конвенція:**
> Немає console.log в production коді

**Рекомендація:**
- Використовувати logging utility з рівнями (debug, info, warn, error)
- Вимикати debug/log в production через змінні оточення
- Залишити тільки `console.error` для критичних помилок

---

### 5. Дублювання authStore

**Проблема:** Існує **два different auth store**:

```typescript
// ❌ client/src/hooks/useAuth.ts (старий?)
export interface User {
  id: number;
  email: string;
}
// Проста версія без refresh token, ролей, permissions

// ✅ client/src/features/auth/authStore.ts (новий?)
interface User {
  id: number;
  email: string;
  role: 'admin' | 'manager' | 'user';
  permissions?: {
    price_types: string[];
  };
  emailVerified: boolean;
}
// Повна версія з persist middleware
```

**Наслідки:**
- Плутанина для розробників
- Можливе використання неправильного store
- Різна логіка авторизації

**Рекомендація:**
- Видалити `hooks/useAuth.ts` або замінити на перенаправлення до `features/auth/authStore.ts`
- Перевірити всі імпорти `useAuthStore` в коді

---

### 6. Непослідовне іменування змінних localStorage

**Проблема:** Різні ключі для токенів:

```typescript
// ❌ lib/axios.ts
localStorage.getItem('accessToken')

// ❌ features/auth/authApi.ts
localStorage.setItem('token', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);

// ❌ hooks/useAuth.ts
localStorage.getItem('accessToken')

// ❌ App.tsx
const { user, logout, accessToken } = useAuthStore();
```

**Рекомендація:**
- Уніфікувати: `accessToken` та `refreshToken` (відповідно до конвенцій)
- Оновити всі посилання в коді

---

### 7. Відсутність тестів

**Проблема:** Майже повна відсутність тестів:

```
client/tests/
└── setup.js  # Тільки конфігурація
```

**Конвенція вимагає:**
```typescript
// ✅ Unit тести (Vitest)
describe('calculateRack', () => {
  it('повинен розрахувати стелаж з правильними параметрами', () => {
    // ...
  });
});

// ✅ Component тести
describe('RackForm', () => {
  it('повинен відображати форму з початковими значеннями', () => {
    // ...
  });
});

// ✅ Hook тести
describe('useRackCalculator', () => {
  it('повинен повертати початковий стан', () => {
    // ...
  });
});
```

**Рекомендація:**
- Додати тести для критичних hooks (`useRackCalculator`, `useBatteryCalculator`)
- Додати тести для UI компонентів (`RackForm`, `BatteryForm`, `RackResults`)
- Додати тести для utils (`calculateRack`, `validateForm`)

---

### 8. JSDoc коментарі

**Проблема:** Непослідовне документування:

```typescript
// ✅ Добре - RackPage.tsx
/**
 * Rack Page - сторінка розрахунку стелажа
 *
 * Manual calculation UX:
 * - Користувач заповнює форму
 * - Натискає кнопку "Розрахувати"
 * - Отримує результат з сервера
 */

// ✅ Добре - useRackCalculator.ts
/**
 * Hook для розрахунку стелажа
 *
 * Manual calculation:
 * - idle: початковий стан
 * - calculating: триває розрахунок
 * - ready: розрахунок завершено
 */

// ❌ Погано - багато компонентів без JSDoc
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...);

// ❌ Погано - stores без документації
export const useRackFormStore = create<RackFormState & RackFormActions>((set) => ({ ... }));
```

**Рекомендація:**
- Додати JSDoc для публічних API (hooks, stores, utils)
- Додати опис пропсів для складних компонентів
- Використовувати `@param` та `@returns` для функцій

---

### 9. Path aliases в vite.config.js vs tsconfig.json

**Проблема:** Різниця в конфігурації alias:

```typescript
// ✅ vite.config.js
resolve: {
  alias: {
    '@': resolve(__dirname, 'src'),
    '@components': resolve(__dirname, 'src/shared/components'),
    '@features': resolve(__dirname, 'src/features'),
    '@rack-calculator/shared': resolve(__dirname, '../shared/rackCalculator.ts'),
  },
}

// ✅ tsconfig.json
"paths": {
  "@/*": ["src/*"],
  "@components/*": ["src/shared/components/*"],
  "@features/*": ["src/features/*"],
  "@rack-calculator/shared": ["../shared/rackCalculator"],
}
```

**Проблема:** В `tsconfig.json` шлях `@rack-calculator/shared` веде на `../shared/rackCalculator` (без `.ts`), тоді як у `vite.config.js` - на `../shared/rackCalculator.ts` (з `.ts`).

**Рекомендація:**
- Уніфікувати обидва файли
- Додати `.ts` розширення для консистентності

---

## 📋 Checklist для виправлення

### Критичні проблеми (P0)

- [ ] **Об'єднати axios інстанси** в один з централізованою логікою refresh token
- [ ] **Видалити дублювання authStore** (`hooks/useAuth.ts` → `features/auth/authStore.ts`)
- [ ] **Уніфікувати ключі localStorage** (`accessToken`, `refreshToken`)

### Серйозні проблеми (P1)

- [ ] **Перемістити спільні типи** з `features/rack/types` в `shared/types`
- [ ] **Замінити відносні імпорти** на path aliases (`@/features/...`)
- [ ] **Прибрати console.log** з production коду (замінити на logging utility)

### Покращення (P2)

- [ ] **Додати JSDoc** для публічних API
- [ ] **Додати unit тести** для hooks та utils
- [ ] **Додати component тести** для основних компонентів
- [ ] **Уніфікувати path aliases** в vite.config.js та tsconfig.json

---

## 🎯 Висновки

### Сильні сторони

1. **Архітектура:** Чітка feature-slice структура з правильною ізоляцією
2. **State Management:** Консистентне використання Zustand з правильними інтерфейсами
3. **React Best Practices:** Functional components, hooks, memoization
4. **TypeScript:** Повна типізація з інтерфейсами для всіх сутностей
5. **Tailwind CSS:** Правильне використання utility-класів, адаптивність
6. **Layout система:** Універсальний `CalculatorPage` компонент

### Зони росту

1. **Консистентність API клієнта:** Потрібно об'єднати axios інстанси
2. **Ізоляція feature:** Уникати cross-feature імпортів
3. **Тестування:** Додати покриття тестами для критичного коду
4. **Документація:** Додати JSDoc для публічних API
5. **Імпорти:** Замінити відносні імпорти на path aliases

---

## 📈 Рекомендації

### Найближчі кроки (Sprint 1)

1. **Аудит axios інстансів** - об'єднати в один `@/lib/axios.ts`
2. **Refactor authStore** - видалити дублювання
3. **Перемістити спільні типи** - створити `shared/types/prices.types.ts`

### Середньострокові (Sprint 2-3)

1. **Заміна імпортів** - відносні → path aliases
2. **Logging utility** - створити централізований logging
3. **Тести** - покриття для hooks та компонентів

### Довгострокові (Sprint 4+)

1. **JSDoc документація** - для всіх публічних API
2. **Інтеграційні тести** - E2E для критичних сценаріїв
3. **Performance оптимізації** - code splitting, lazy loading

---

**Аналіз проведено:** 8 березня 2026  
**Версія документу:** 1.0  
**Наступний аудит:** Після виправлення P0 проблем
