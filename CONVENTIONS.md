# 📋 Конвенції проєкту Rack Calculator

> Версія: 2.0.0  
> Оновлено: 6 березня 2026

Цей документ описує стандарти розробки для monorepo проєкту Rack Calculator (React + Express + TypeScript).

---

## 🏗️ Архітектура проєкту

### Monorepo структура

```
rack_calculator/
├── client/              # React додаток (Vite + TypeScript)
│   ├── src/
│   │   ├── app/         # App.tsx, providers, routing
│   │   ├── pages/       # Сторінки (RackPage, BatteryPage)
│   │   ├── features/    # Feature-slices (rack/, battery/)
│   │   ├── shared/      # UI компоненти, layout, helpers
│   │   ├── core/        # Бізнес-логіка, constants, types
│   │   ├── hooks/       # Custom hooks (global)
│   │   ├── lib/         # Axios instance, utils
│   │   └── styles/      # Global styles
│   └── tests/           # Тести
├── server/              # Express API
│   └── src/
│       ├── routes/      # API routes
│       ├── controllers/ # Controllers
│       ├── db/          # SQLite + migrations
│       └── middleware/  # Auth, error handlers
├── shared/              # Спільна бізнес-логіка (TypeScript)
└── legacy/              # Vanilla JS (тимчасово)
```

---

## 📝 Іменування

### Файли та директорії

| Тип | Конвенція | Приклад | Обґрунтування |
|-----|-----------|---------|---------------|
| **Компоненти React** | `PascalCase.tsx` | `RackForm.tsx`, `BatteryResults.tsx` | Відповідає імені експортованого компонента |
| **Hooks** | `usePascalCase.ts` | `useRackCalculator.ts`, `usePrice.ts` | Чітко ідентифікує hook |
| **Утиліти** | `camelCase.ts` | `formatPrice.ts`, `validateForm.ts` | Функції, не компоненти |
| **Константи** | `UPPER_SNAKE_CASE.ts` | `API_ENDPOINTS.ts`, `VALIDATION_RULES.ts` | Тільки для констант |
| **Типи/Інтерфейси** | `camelCase.types.ts` | `rack.types.ts`, `api.types.ts` | Суфікс `.types` для ясності |
| **Сторінки** | `PascalCase.tsx` | `RackPage.tsx`, `BatteryPage.tsx` | Компоненти сторінок |
| **Тести** | `*.test.tsx` або `*.test.ts` | `RackForm.test.tsx`, `utils.test.ts` | Стандарт Vitest |
| **Директорії** | `kebab-case` | `rack-calculator/`, `ui-components/` | URL-friendly |

### Змінні та функції

```typescript
// ✅ Добре
const rackCount = 5;
function calculateRack() { }
const RACK_TYPES = Object.freeze({});

// ❌ Погано
const RackCount = 5;           // PascalCase для змінних
const rack_count = 5;          // snake_case в TypeScript
function CalculateRack() { }   // PascalCase для функцій
```

### Компоненти

```tsx
// ✅ Добре
export function RackForm() { }
export const BatteryResults = () => { }
export default function RackPage() { }

// ❌ Погано
export function rackForm() { }  // має бути PascalCase
export const RACK_FORM = () => { }
```

---

## ⚛️ React Best Practices

### 1. Functional Components з TypeScript

```tsx
// ✅ Використовуйте FC тип або явний тип пропсів
interface RackFormProps {
  onSubmit: (data: RackData) => void;
  isLoading?: boolean;
}

export const RackForm: React.FC<RackFormProps> = ({ onSubmit, isLoading = false }) => {
  return <form>...</form>;
};

// Або з деструктуризацією в параметрах
export function RackForm({ onSubmit, isLoading = false }: RackFormProps) {
  return <form>...</form>;
}
```

### 2. Custom Hooks

```tsx
// ✅ Правильна структура hook
interface UseRackCalculatorProps {
  priceData?: PriceData;
}

interface UseRackCalculatorReturn {
  calculate: () => void;
  isLoading: boolean;
  error: string | null;
  calculationState: CalculationState;
  setCalculationState: (state: CalculationState) => void;
}

export function useRackCalculator({
  priceData,
}: UseRackCalculatorProps): UseRackCalculatorReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const calculate = useCallback(() => {
    // логіка
  }, [priceData]);

  return { calculate, isLoading, error, calculationState, setCalculationState };
}
```

**Правила hooks:**
- Назва завжди починається з `use`
- Викликаються тільки на верхньому рівні
- Викликаються тільки в React компонентах або інших hooks
- Повертають об'єкт з іменованими властивостями

### 3. State Management

#### Zustand (глобальний стан)

```tsx
// ✅ Приклад store
interface RackFormState {
  floors: number;
  rows: number;
  beamsPerRow: number;
  setFloors: (floors: number) => void;
  reset: () => void;
}

export const useRackFormStore = create<RackFormState>((set) => ({
  floors: 3,
  rows: 2,
  beamsPerRow: 2,
  setFloors: (floors) => set({ floors }),
  reset: () => set({ floors: 3, rows: 2, beamsPerRow: 2 }),
}));

// Використання в компоненті
const floors = useRackFormStore((state) => state.floors);
const setFloors = useRackFormStore((state) => state.setFloors);
```

#### Local State (локальний стан)

```tsx
// ✅ Використовуйте useState для локального стану
const [isOpen, setIsOpen] = useState(false);
const [values, setValues] = useState<FormValues>(initialValues);

// ✅ Для об'єктів використовуйте функціональне оновлення
setValues((prev) => ({ ...prev, floors: newValue }));
```

### 4. Ефекти (useEffect)

```tsx
// ✅ Правильне використання
useEffect(() => {
  const timer = setTimeout(() => {
    calculate();
  }, 500);

  return () => clearTimeout(timer); // cleanup
}, [calculate]);

// ✅ Отримання даних при монтажі
useEffect(() => {
  const fetchData = async () => {
    const data = await api.getData();
    setData(data);
  };
  fetchData();
}, []);

// ❌ Уникати
useEffect(() => {
  // side effect без залежностей
  localStorage.setItem('key', value);
}); // ❌ Немає масиву залежностей
```

### 5. Memoization

```tsx
// ✅ useMemo для дорогих обчислень
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// ✅ useCallback для функцій-залежностей
const handleClick = useCallback(() => {
  onSubmit(value);
}, [onSubmit, value]);

// ❌ Не використовувати без потреби
const value = useMemo(() => simpleValue, [simpleValue]); // ❌ Over-engineering
```

---

## 🎯 Feature-Slice Architecture

### Структура feature

```
features/
└── rack/
    ├── components/      # UI компоненти feature
    │   ├── RackForm.tsx
    │   ├── RackResults.tsx
    │   └── RackSetCard.tsx
    ├── hooks/           # Hooks специфічні для feature
    │   └── useRackCalculator.ts
    ├── types/           # Типи feature
    │   └── rack.types.ts
    ├── constants/       # Константи feature
    │   └── rack.constants.ts
    ├── utils/           # Утиліти feature
    │   └── calculateRack.ts
    ├── formStore.ts     # Zustand store для форми
    └── spansStore.ts    # Zustand store для spans
```

### Правила ізоляції feature

```tsx
// ✅ Імпорти всередині feature
import { RackForm } from '../features/rack/components/RackForm';
import { useRackCalculator } from '../features/rack/hooks/useRackCalculator';

// ✅ Імпорти з shared
import { Button, Card } from '@/shared/components';

// ❌ Уникати cross-feature імпортів
import { BatteryResults } from '../features/battery/components/BatteryResults';
```

---

## 🧩 Компоненти

### 1. Композиція компонентів

```tsx
// ✅ Використовуйте композицію замість успадкування
function RackPage() {
  return (
    <CalculatorPage
      title="Розрахунок стелажа"
      input={<RackForm />}
      results={<RackResults />}
      setPanel={<RackSetCard />}
    />
  );
}

// ✅ Children для гнучкості
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}
```

### 2. Умовний рендеринг

```tsx
// ✅ Використовуйте тернарний оператор
{isLoading ? <Skeleton /> : <Results />}

// ✅ Використовуйте && для простих умов
{error && <Alert variant="destructive">{error}</Alert>}

// ❌ Уникати
{isLoading && <Skeleton />}
{!isLoading && <Results />} // Два рендери замість одного

// ❌ Уникати 0 як React children
{count && <span>{count}</span>} // ❌ 0 буде відображено
{count > 0 && <span>{count}</span>} // ✅
```

### 3. Обробка помилок

```tsx
// ✅ Error Boundary для класів
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <FallbackUI />;
    }
    return this.props.children;
  }
}

// ✅ Обробка помилок в async функціях
try {
  await calculate();
} catch (err) {
  setError(err instanceof Error ? err.message : 'Сталася помилка');
}
```

---

## 📡 Робота з API

### 1. TanStack Query (React Query)

```tsx
// ✅ Custom hook для запиту
export function usePrice() {
  return useQuery({
    queryKey: ['price'],
    queryFn: async () => {
      const response = await api.getPrice();
      return response.data;
    },
  });
}

// ✅ Використання в компоненті
const { data: priceData, isLoading, error } = usePrice();

if (isLoading) return <Skeleton />;
if (error) return <Alert variant="destructive">{error.message}</Alert>;
return <RackForm priceData={priceData} />;
```

### 2. Axios instance

```typescript
// ✅ lib/axios.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для токену
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📐 Форми

### 1. React Hook Form + Zod

```tsx
// ✅ Схема валідації
const rackSchema = z.object({
  floors: z.number().min(1).max(10),
  rows: z.number().min(1),
  beamsPerRow: z.number().min(1),
});

type RackFormValues = z.infer<typeof rackSchema>;

// ✅ Використання в компоненті
export function RackForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<RackFormValues>({
    resolver: zodResolver(rackSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="floors">Кількість поверхів</Label>
        <Input
          id="floors"
          type="number"
          {...register('floors', { valueAsNumber: true })}
        />
        {errors.floors && <span className="text-destructive text-sm">
          {errors.floors.message}
        </span>}
      </div>
      <Button type="submit">Розрахувати</Button>
    </form>
  );
}
```

### 2. Zustand для складних форм

```tsx
// ✅ formStore.ts
interface RackFormState {
  floors: number;
  rows: number;
  spans: Span[];
  setFloors: (floors: number) => void;
  addSpan: (span: Span) => void;
  removeSpan: (id: string) => void;
  reset: () => void;
}

export const useRackFormStore = create<RackFormState>((set) => ({
  floors: 3,
  rows: 2,
  spans: [],
  setFloors: (floors) => set({ floors }),
  addSpan: (span) => set((state) => ({ spans: [...state.spans, span] })),
  removeSpan: (id) => set((state) => ({
    spans: state.spans.filter((s) => s.id !== id),
  })),
  reset: () => set({ floors: 3, rows: 2, spans: [] }),
}));
```

---

## 🎨 Стилізація (Tailwind CSS)

### 1. Використовуйте utility-класи

```tsx
// ✅ Добре
<div className="flex items-center justify-between gap-4 p-6 bg-card rounded-lg shadow-md">
  <h2 className="text-lg font-semibold text-card-foreground">Заголовок</h2>
  <Button size="sm">Дія</Button>
</div>

// ❌ Уникати інлайн стилів
<div style={{ display: 'flex', padding: '24px' }}>
```

### 2. Адаптивність (mobile-first)

```tsx
// ✅ Mobile-first підхід
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4
">
  {/* Контент */}
</div>

// ✅ Приховання на мобільних
<div className="hidden lg:block">
  {/* Desktop only */}
</div>
```

### 3. Консистентні відступи

```tsx
// ✅ Використовуйте space-y для вертикальних відступів
<div className="space-y-4">
  <div>Блок 1</div>
  <div>Блок 2</div>
  <div>Блок 3</div>
</div>

// ✅ Використовуйте gap для grid/flex
<div className="flex gap-2">
  <Button>1</Button>
  <Button>2</Button>
</div>
```

### 4. Кольорова схема

```tsx
// ✅ Використовуйте CSS змінні з design system
<div className="bg-primary text-primary-foreground">
  Primary button
</div>

<div className="bg-destructive text-destructive-foreground">
  Destructive action
</div>

// ❌ Уникати хардкоду кольорів
<div className="bg-blue-500 text-white"> // ❌
```

---

## 🔒 Безпека

### 1. XSS захист

```tsx
// ✅ React автоматично екранує
<div>{userInput}</div>

// ❌ Небезпечно
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Якщо потрібно, використовуйте sanitize
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### 2. Авторизація

```tsx
// ✅ Protected route
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// ✅ JWT токен в localStorage (з обмеженням часу)
localStorage.setItem('token', token);
// + refresh token logic
```

---

## 🧪 Тестування

### 1. Unit тести (Vitest)

```tsx
// ✅ utils.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRack } from './calculateRack';

describe('calculateRack', () => {
  it('повинен розрахувати стелаж з правильними параметрами', () => {
    const result = calculateRack({
      floors: 3,
      rows: 2,
      beamsPerRow: 2,
    });
    
    expect(result.totalBeams).toBe(12);
  });
});
```

### 2. Component тести (React Testing Library)

```tsx
// ✅ RackForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RackForm } from './RackForm';

describe('RackForm', () => {
  it('повинен відображати форму з початковими значеннями', () => {
    render(<RackForm onSubmit={vi.fn()} />);
    
    expect(screen.getByLabelText(/кількість поверхів/i)).toHaveValue(3);
  });

  it('повинен викликати onSubmit при відправці', async () => {
    const handleSubmit = vi.fn();
    render(<RackForm onSubmit={handleSubmit} />);
    
    fireEvent.click(screen.getByText(/розрахувати/i));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
```

### 3. Hook тести

```tsx
// ✅ useRackCalculator.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRackCalculator } from './useRackCalculator';

describe('useRackCalculator', () => {
  it('повинен повертати початковий стан', () => {
    const { result } = renderHook(() => useRackCalculator({}));
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('повинен розраховувати стелаж', async () => {
    const { result } = renderHook(() => useRackCalculator({ priceData: mockPrice }));
    
    await act(async () => {
      await result.current.calculate();
    });
    
    expect(result.current.calculationState).toBe('ready');
  });
});
```

---

## 📦 Імпорти

### 1. Порядок імпортів

```tsx
// 1. React
import React, { useState, useEffect } from 'react';

// 2. Сторонні бібліотеки
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// 3. Внутрішні модулі (absolute paths)
import { Button } from '@/shared/components';
import { useRackCalculator } from '@/features/rack/hooks/useRackCalculator';

// 4. Відносні імпорти
import { RackForm } from '../components/RackForm';
import { calculateRack } from '../../utils/calculateRack';

// 5. Сторонні стилі
import 'tailwindcss/tailwind.css';

// 6. Власні стилі
import './RackForm.css';
```

### 2. Path aliases

```typescript
// ✅ Використовуйте aliases з tsconfig.json
import { Button } from '@/shared/components';
import { useRackCalculator } from '@features/rack/hooks/useRackCalculator';
import { API_ENDPOINTS } from '@core/constants/api';
import { useAuth } from '@hooks/useAuth';
import { api } from '@lib/axios';
```

---

## 📄 Коментарі та документація

### 1. JSDoc для публічних API

```typescript
/**
 * Розраховує параметри стелажа на основі вхідних даних
 * @param params - Параметри стелажа
 * @param params.floors - Кількість поверхів (1-10)
 * @param params.rows - Кількість рядів
 * @param params.beamsPerRow - Кількість балок на ряд
 * @returns Результат розрахунку з компонентами та ціною
 */
export function calculateRack(params: RackParams): RackResult {
  // реалізація
}
```

### 2. Коментарі для складної логіки

```tsx
// ✅ Пояснює "чому", а не "що"
// Дебаунс для уникнення надмірних розрахунків під час введення
useEffect(() => {
  const timer = setTimeout(() => {
    calculate();
  }, 500);
  
  return () => clearTimeout(timer);
}, [calculate]);

// ❌ Зайві коментарі
// Встановлює isLoading в true
setIsLoading(true);
```

### 3. TODO коментарі

```tsx
// TODO: Додати кешування результатів розрахунку
// FIXME: Виправити помилку при від'ємних значеннях
// HACK: Тимчасове рішення для сумісності з legacy
// XXX: Потребує рефакторингу після оновлення API
```

---

## 🚀 Продуктивність

### 1. Code Splitting

```tsx
// ✅ Lazy loading сторінок
const RackPage = lazy(() => import('@/pages/RackPage'));
const BatteryPage = lazy(() => import('@/pages/BatteryPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/rack" element={<RackPage />} />
        <Route path="/battery" element={<BatteryPage />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. Оптимізація рендерів

```tsx
// ✅ React.memo для дорогих компонентів
const ExpensiveComponent = memo(({ data }: { data: Data }) => {
  return <div>{/* рендер */}</div>;
});

// ✅ useMemo для обчислень
const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);

// ✅ Правильні key для списків
{items.map(item => (
  <ListItem key={item.id} data={item} /> // ✅ Унікальний key
))}

// ❌ Уникати
{items.map((item, index) => (
  <ListItem key={index} data={item} /> // ❌ Index як key
))}
```

### 3. Оптимізація зображень

```tsx
// ✅ Використовуйте WebP формат
<img src="/images/rack.webp" alt="Стелаж" loading="lazy" />

// ✅ Вказуйте розміри
<img 
  src="/images/rack.webp" 
  alt="Стелаж"
  width="800"
  height="600"
  loading="lazy"
/>
```

---

## 🔧 Інструменти розробки

### 1. Scripts

```bash
# Розробка
npm run dev              # Запустити client + server
npm run dev:client       # Тільки client (порт 3000)
npm run dev:server       # Тільки server (порт 3001)

# Збірка
npm run build            # Зібрати все
npm run build:client     # Тільки client
npm run build:server     # Тільки server

# Тестування
npm run test             # Запустити всі тести
npm run test:watch       # Тести в режимі watch
npm run test:coverage    # Тести з coverage

# Linting & Formatting
npm run lint             # ESLint
npm run format           # Prettier
npm run typecheck        # TypeScript check
```

### 2. Pre-commit hooks (рекомендовано)

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
npm run lint
npm run typecheck
npm run test
```

---

## 📊 Git Conventions

### 1. Commit messages (Conventional Commits)

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Типи:**
- `feat`: Нова фіча
- `fix`: Виправлення багу
- `docs`: Зміни в документації
- `style`: Форматування, відступи
- `refactor`: Рефакторинг коду
- `perf`: Покращення продуктивності
- `test`: Додавання тестів
- `chore`: Зміни в збірці, інструментах

**Приклади:**
```
feat(rack): додати live recalculation з дебаунсом
fix(battery): виправити помилку розрахунку при 0 значеннях
docs: оновити README.md з інструкціями збірки
refactor(shared): винести бізнес-логіку в shared модуль
test(rack): додати unit тести для calculateRack
```

### 2. Branch naming

```
feature/<description>     # Нова фіча
fix/<description>         # Виправлення
hotfix/<description>      # Термінове виправлення
release/<version>         # Реліз гілка
chore/<description>       # Технічні зміни
```

**Приклади:**
```
feature/live-recalculation
fix/battery-calculation-error
hotfix/auth-token-expiry
release/2.1.0
chore/update-dependencies
```

---

## 🎯 Checklist для Code Review

### Перед відправкою PR

- [ ] Код проходить `npm run lint` без помилок
- [ ] Код проходить `npm run typecheck` без помилок
- [ ] Всі тести проходять `npm run test`
- [ ] Додані тести для нової функціональності
- [ ] Використані path aliases замість відносних шляхів
- [ ] Компоненти типізовані TypeScript
- [ ] Немає console.log в production коді
- [ ] Оброблені стани завантаження та помилок
- [ ] Перевірена адаптивність (mobile, tablet, desktop)
- [ ] Commit messages слідують Conventional Commits

### Архітектура

- [ ] Нова логіка в правильному місці (feature/shared/core)
- [ ] Немає cross-feature імпортів
- [ ] Використані існуючі UI компоненти з shared
- [ ] Custom hooks для reusable логіки
- [ ] Zustand для глобального стану форми

### Безпека

- [ ] Немає чутливих даних в коді
- [ ] Вхідні дані валідуються (Zod)
- [ ] Оброблені помилки API
- [ ] JWT токен зберігається безпечно

---

## 📚 Корисні ресурси

### Документація

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://zustand-demo.pmnd.rs)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

### Best Practices

- [React Patterns](https://reactpatterns.com)
- [Useless React](https://uselessreact.com)
- [Epic React](https://epicreact.dev)
- [Kent C. Dodds Blog](https://kentcdodds.com/blog)

---

**Оновлено:** 6 березня 2026  
**Версія:** 2.0.0  
**Підтримка:** Акку-енерго
