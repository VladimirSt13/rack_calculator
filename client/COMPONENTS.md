# shadcn/ui Components - Документація

## 📦 Встановлені компоненти

### ✅ Базові компоненти

| Компонент | Імпорт | Опис |
|-----------|--------|------|
| **Button** | `import { Button } from '@/shared/components'` | Кнопки з варіантами (primary, outline, ghost, destructive) |
| **Card** | `import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/components'` | Картки для групування контенту |
| **Input** | `import { Input } from '@/shared/components'` | Текстові поля вводу |
| **Select** | `import { Select } from '@/shared/components'` | Випадаючі списки |
| **Table** | `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/components'` | Таблиці даних |
| **Form** | `import { FormField, FormLabel, FormControl, FormMessage } from '@/shared/components'` | Елементи форм |

### ✅ Додаткові компоненти

| Компонент | Імпорт | Опис | Приклад використання |
|-----------|--------|------|---------------------|
| **Dialog** | `import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components'` | Модальні вікна | `<Dialog><DialogTrigger><Button>Відкрити</Button></DialogTrigger><DialogContent>Контент</DialogContent></Dialog>` |
| **Alert** | `import { Alert, AlertTitle, AlertDescription } from '@/shared/components'` | Повідомлення (default, destructive, success, warning) | `<Alert variant="destructive"><AlertTitle>Помилка</AlertTitle>Текст помилки</Alert>` |
| **Skeleton** | `import { Skeleton } from '@/shared/components'` | Індикатор завантаження | `<Skeleton className="h-4 w-[250px]" />` |
| **Badge** | `import { Badge } from '@/shared/components'` | Мітки/теги (default, secondary, destructive, outline, success, warning) | `<Badge variant="success">Успіх</Badge>` |
| **Separator** | `import { Separator } from '@/shared/components'` | Розділювач (горизонтальний/вертикальний) | `<Separator className="my-4" />` |
| **Label** | `import { Label } from '@/shared/components'` | Лейбл для форми | `<Label htmlFor="email">Email</Label>` |
| **Checkbox** | `import { Checkbox } from '@/shared/components'` | Чекбокс | `<Checkbox id="terms" />` |
| **ScrollArea** | `import { ScrollArea, ScrollBar } from '@/shared/components'` | Контейнер зі скролом | `<ScrollArea className="h-[400px]">Контент</ScrollArea>` |
| **Tabs** | `import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components'` | Вкладки | `<Tabs defaultValue="tab1"><TabsList><TabsTrigger value="tab1">Tab 1</TabsTrigger></TabsList><TabsContent value="tab1">Контент</TabsContent></Tabs>` |
| **Tooltip** | `import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/shared/components'` | Підказки | `<Tooltip><TooltipTrigger>?</TooltipTrigger><TooltipContent>Підказка</TooltipContent></Tooltip>` |

---

## 🎨 Варіанти використання

### Button Variants

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>
```

### Button Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Plus /></Button>
```

### Badge Variants

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
```

### Alert Variants

```tsx
<Alert variant="default">Info</Alert>
<Alert variant="destructive">Error</Alert>
<Alert variant="success">Success</Alert>
<Alert variant="warning">Warning</Alert>
```

---

## 📋 Приклади використання

### 1. Modal Dialog

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Button } from '@/shared/components';

function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Відкрити модалку</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Заголовок</DialogTitle>
        </DialogHeader>
        <p>Контент модалки</p>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. Loading State

```tsx
import { Skeleton } from '@/shared/components';

function LoadingCard() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
```

### 3. Form with Validation

```tsx
import { Label, Input, Button, Alert } from '@/shared/components';

function MyForm() {
  const [error, setError] = React.useState('');
  
  return (
    <form>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="example@mail.com" />
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Помилка</AlertTitle>
          {error}
        </Alert>
      )}
      
      <Button type="submit" className="mt-4">Відправити</Button>
    </form>
  );
}
```

### 4. Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components';

function TabsExample() {
  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList>
        <TabsTrigger value="account">Акаунт</TabsTrigger>
        <TabsTrigger value="password">Пароль</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p>Контент акаунту</p>
      </TabsContent>
      <TabsContent value="password">
        <p>Контент паролю</p>
      </TabsContent>
    </Tabs>
  );
}
```

### 5. Tooltip

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components';

function TooltipExample() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Button variant="outline">Наведи на мене</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Це підказка!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

### 6. Badge with Status

```tsx
import { Badge } from '@/shared/components';

function StatusBadges() {
  return (
    <div className="space-x-2">
      <Badge variant="default">Новий</Badge>
      <Badge variant="secondary">В обробці</Badge>
      <Badge variant="success">Успішно</Badge>
      <Badge variant="warning">Увага</Badge>
      <Badge variant="destructive">Помилка</Badge>
    </div>
  );
}
```

---

## 🔧 Конфігурація

### Tailwind Config (tailwind.config.js)

```js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
    },
  },
  plugins: [],
}
```

### CSS Variables (src/styles/index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}
```

---

## 📚 Корисні посилання

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [class-variance-authority](https://cva.style)
