# 🎨 Rack Calculator - shadcn/ui Дизайн-система

## 📋 Огляд

Цей проєкт використовує **shadcn/ui** дизайн-систему з **Tailwind CSS** для створення консистентного, доступного та красивого інтерфейсу.

---

## 🎯 Ключові принципи

1. **Консистентність** - однакові стилі для всіх компонентів
2. **Доступність** - ARIA атрибути, клавіатурна навігація
3. **Адаптивність** - mobile-first підхід
4. **Переиспользование** - компоненти для повторного використання

---

## 🎨 Кольорова палітра (HSL)

### Основні кольори

```css
/* Фон та текст */
--background: 0 0% 100%      /* Білий фон */
--foreground: 222.2 84% 4.9% /* Темний текст */

/* Картки */
--card: 0 0% 100%
--card-foreground: 222.2 84% 4.9%

/* Primary (головний акцент) */
--primary: 222.2 47.4% 11.2%
--primary-foreground: 210 40% 98%

/* Secondary (вторинарний) */
--secondary: 210 40% 96.1%
--secondary-foreground: 222.2 47.4% 11.2%

/* Muted (приглушений) */
--muted: 210 40% 96.1%
--muted-foreground: 215.4 16.3% 46.9%

/* Accent (акцент при наведенні) */
--accent: 210 40% 96.1%
--accent-foreground: 222.2 47.4% 11.2%

/* Destructive (помилки) */
--destructive: 0 84.2% 60.2%
--destructive-foreground: 210 40% 98%

/* Технічні */
--border: 214.3 31.8% 91.4%
--input: 214.3 31.8% 91.4%
--ring: 222.2 84% 4.9%
```

### Як використовувати в Tailwind

```tsx
// Фон
<div className="bg-primary">Контент</div>

// Текст
<p className="text-primary-foreground">Текст</p>

// Рамка
<div className="border border-border">Контент</div>

// Комбінації
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Кнопка
</button>
```

---

## 📦 Компоненти

### Button

```tsx
import { Button } from '@/shared/components';

// Варіанти
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Розміри
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Plus /></Button>

// Стан
<Button disabled>Disabled</Button>
```

**Приклади використання:**

```tsx
// Головна кнопка дії
<Button onClick={calculate} size="lg" className="w-full">
  Розрахувати
</Button>

// Кнопка видалення
<Button variant="destructive" size="icon">
  <Trash2 className="w-4 h-4" />
</Button>

// Кнопка повернення
<Button variant="outline" variant="ghost">
  Скасувати
</Button>
```

---

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/components';

<Card>
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
  </CardHeader>
  <CardContent>
    Контент
  </CardContent>
  <CardFooter>
    Дії
  </CardFooter>
</Card>
```

**Приклади:**

```tsx
// Картка форми
<Card>
  <CardHeader>
    <CardTitle className="text-lg font-semibold">Параметри</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <RackForm />
  </CardContent>
</Card>

// Картка результату
<Card className="border-primary/20 shadow-lg">
  <CardHeader>
    <CardTitle>Стелаж</CardTitle>
  </CardHeader>
  <CardContent>
    <RackResults />
  </CardContent>
</Card>
```

---

### Input

```tsx
import { Input } from '@/shared/components';

<Input
  type="number"
  placeholder="Введіть значення"
  className="w-full"
/>
```

**У формі:**

```tsx
<div className="space-y-2">
  <Label htmlFor="floors">Кількість поверхів</Label>
  <Input
    id="floors"
    type="number"
    min={1}
    max={10}
    value={value}
    onChange={handleChange}
  />
</div>
```

---

### Select

```tsx
import { Select } from '@/shared/components';

<Select value={value} onChange={handleChange}>
  <option value="">Виберіть...</option>
  <option value="1">Опція 1</option>
  <option value="2">Опція 2</option>
</Select>
```

---

### Label

```tsx
import { Label } from '@/shared/components';

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

---

### Table

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/shared/components';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Назва</TableHead>
      <TableHead>Кількість</TableHead>
      <TableHead>Вартість</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map(item => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell className="text-center">{item.amount}</TableCell>
        <TableCell className="text-right">{item.price} ₴</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### Alert

```tsx
import { Alert, AlertTitle } from '@/shared/components';

// Помилка
<Alert variant="destructive">
  <AlertTitle>Помилка</AlertTitle>
  <p className="text-sm">Текст помилки</p>
</Alert>

// Успіх
<Alert variant="default">
  <AlertTitle>Успіх</AlertTitle>
  <p className="text-sm">Операція виконана</p>
</Alert>
```

---

### Badge

```tsx
import { Badge } from '@/shared/components';

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
```

**У картці:**

```tsx
<CardDescription className="flex flex-wrap gap-2">
  <Badge variant="secondary">
    {floorsWords[floors]}
  </Badge>
  <Badge variant="outline">
    {rowsWords[rows]}
  </Badge>
</CardDescription>
```

---

### Skeleton

```tsx
import { Skeleton } from '@/shared/components';

// Завантаження
{isLoading ? (
  <Skeleton className="h-64 w-full rounded-lg" />
) : (
  <Card>
    <CardContent>Контент</CardContent>
  </Card>
)}
```

---

## 📐 Layout компоненти

### RackPageLayout

```tsx
import {
  RackPageLayout,
  RackPageHeader,
  RackPageTwoCols,
  RackSidebar,
  RackMainContent,
} from '@/shared/layout';

<RackPageLayout>
  <div className="container mx-auto px-6 py-8">
    <RackPageHeader
      title="Розрахунок стелажа"
      description="Налаштуйте параметри"
    />
    
    <RackPageTwoCols
      sidebar={
        <RackSidebar>
          <FormCard />
        </RackSidebar>
      }
    >
      <RackMainContent>
        <ResultsCard />
      </RackMainContent>
    </RackPageTwoCols>
  </div>
</RackPageLayout>
```

### BatteryPageLayout

```tsx
import {
  BatteryPageLayout,
  BatteryPageHeader,
  BatteryPageTwoCols,
  BatterySidebar,
  BatteryMainContent,
} from '@/shared/layout';

<BatteryPageLayout>
  <div className="container mx-auto px-6 py-8">
    <BatteryPageHeader
      title="Підбір стелажа для батареї"
      description="Вкажіть параметри"
    />
    
    <BatteryPageTwoCols
      sidebar={
        <BatterySidebar>
          <BatteryForm />
        </BatterySidebar>
      }
    >
      <BatteryMainContent>
        <BatteryResults />
      </BatteryMainContent>
    </BatteryPageTwoCols>
  </div>
</BatteryPageLayout>
```

---

## 📱 Адаптивність

### Breakpoints

| Назва | Min Width | Клас |
|-------|-----------|------|
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| xl | 1280px | `xl:` |
| 2xl | 1536px | `2xl:` |

### Приклади

```tsx
// Різна ширина
<div className="w-full sm:w-1/2 lg:w-1/3">

// Приховати на мобільних
<div className="hidden lg:block">

// Різна сітка
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Різна висота
<div className="h-48 sm:h-64 lg:h-80">
```

---

## 🎨 Приклади готових комбінацій

### Картка з формою

```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-lg font-semibold">Параметри</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="floors">Кількість поверхів</Label>
      <Input
        id="floors"
        type="number"
        min={1}
        max={10}
      />
    </div>
    
    <Button className="w-full" size="lg">
      Розрахувати
    </Button>
  </CardContent>
</Card>
```

### Таблиця результатів

```tsx
<Card>
  <CardHeader>
    <CardTitle>Компоненти</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow className="bg-secondary">
          <TableHead>Назва</TableHead>
          <TableHead className="text-center">Кількість</TableHead>
          <TableHead className="text-right">Ціна</TableHead>
          <TableHead className="text-center">Загалом</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {components.map(component => (
          <TableRow key={component.id}>
            <TableCell className="font-medium">
              {component.name}
            </TableCell>
            <TableCell className="text-center">
              {component.amount}
            </TableCell>
            <TableCell className="text-right font-medium">
              {component.total.toFixed(2)} ₴
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

### Сайдбар з основним контентом

```tsx
<div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
  {/* Sidebar */}
  <aside className="sticky top-6 space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Фільтри</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Форма */}
      </CardContent>
    </Card>
  </aside>

  {/* Main Content */}
  <main className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Результати</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Результати */}
      </CardContent>
    </Card>
  </main>
</div>
```

---

## 🛠️ Утиліти

### Відступи

```tsx
// Margin
className="m-4"      // 1rem (16px)
className="my-8"     // 2rem (32px) vertical
className="mx-auto"  // center horizontal

// Padding
className="p-4"      // 1rem (16px)
className="py-6"     // 1.5rem (24px) vertical
className="px-8"     // 2rem (32px) horizontal
```

### Flexbox

```tsx
// Center
className="flex items-center justify-center"

// Space between
className="flex justify-between items-center"

// Vertical stack
className="flex flex-col gap-4"

// Horizontal row
className="flex flex-row gap-2"
```

### Grid

```tsx
// 3 колонки
className="grid grid-cols-3 gap-4"

// Адаптивна сітка
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Фіксована + гнучка
className="grid grid-cols-[320px_1fr] gap-8"
```

### Тіні

```tsx
className="shadow-sm"   // Мала
className="shadow-md"   // Середня
className="shadow-lg"   // Велика
className="shadow-xl"   // Дуже велика
```

### Заокруглення

```tsx
className="rounded-md"   // Середнє
className="rounded-lg"   // Велике
className="rounded-xl"   // Дуже велике
className="rounded-full" // Коло
```

---

## 📚 Корисні посилання

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Class Variance Authority](https://cva.style)

---

## 🎯 Best Practices

### 1. Використовуйте готові варіанти

```tsx
// ✅ Добре
<Button variant="destructive">Видалити</Button>

// ❌ Погано
<Button className="bg-red-500 text-white">Видалити</Button>
```

### 2. Компоненти для layout

```tsx
// ✅ Добре
<RackPageTwoCols sidebar={<Sidebar />}>
  <MainContent />
</RackPageTwoCols>

// ❌ Погано
<div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
  ...
</div>
```

### 3. Консистентні відступи

```tsx
// ✅ Добре
<CardContent className="space-y-4">

// ❌ Погано
<CardContent className="space-y-2">
```

### 4. Типографіка

```tsx
// ✅ Добре
<CardTitle className="text-lg font-semibold">

// ❌ Погано
<h3 className="text-lg font-bold">
```

---

## 🎨 Повний приклад сторінки

```tsx
import {
  RackPageLayout,
  RackPageHeader,
  RackPageTwoCols,
  RackSidebar,
  RackMainContent,
} from '@/shared/layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Alert,
  Skeleton,
} from '@/shared/components';

function RackPage() {
  const { isLoading, error, calculate } = useRackCalculator();

  return (
    <RackPageLayout>
      <div className="container mx-auto px-6 py-8">
        <RackPageHeader
          title="Розрахунок стелажа"
          description="Налаштуйте параметри та отримайте специфікацію"
        />

        <RackPageTwoCols
          sidebar={
            <RackSidebar>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Параметри
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RackForm />
                  
                  <Button
                    onClick={calculate}
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? 'Розрахунок...' : 'Розрахувати'}
                  </Button>

                  {error && (
                    <Alert variant="destructive">
                      <p className="text-sm">{error}</p>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </RackSidebar>
          }
        >
          <RackMainContent>
            <RackResults />
            <RackSetCard />
          </RackMainContent>
        </RackPageTwoCols>
      </div>
    </RackPageLayout>
  );
}
```

---

**Оновлено:** 1 березня 2026
**Версія:** 2.0.0
