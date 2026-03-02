# 🎨 Дизайн-система Rack Calculator

## 📦 Layout Компоненти

### Container
Основний контейнер для обмеження ширини контенту.

```tsx
import { Container } from '@/shared/layout';

<Container size="lg" className="py-8">
  {/* Контент */}
</Container>
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'lg')
- `as`: React.ElementType (default: 'div')
- `className`: string

**Розміри:**
- `sm`: max-w-3xl (768px)
- `md`: max-w-5xl (1024px)
- `lg`: max-w-7xl (1280px)
- `xl`: max-w-[1600px]
- `full`: max-w-full

---

### Page
Основний контейнер для всієї сторінки.

```tsx
import { Page, PageContent } from '@/shared/layout';

<Page>
  <PageContent>
    {/* Контент сторінки */}
  </PageContent>
</Page>
```

---

### PageHeader
Заголовок сторінки з описом та діями.

```tsx
import { PageHeader } from '@/shared/layout';

<PageHeader
  title="Розрахунок стелажа"
  description="Налаштуйте параметри та отримайте специфікацію"
  actions={
    <Button>Дія</Button>
  }
/>
```

**Адаптивність:**
- Mobile: вертикальне розташування
- Desktop: горизонтальне розташування (title + actions)

---

### Sidebar
Бічна панель з адаптивністю.

```tsx
import { Sidebar, SidebarSection } from '@/shared/layout';

<Sidebar>
  <SidebarSection title="Фільтри">
    {/* Фільтри */}
  </SidebarSection>
</Sidebar>
```

**Breakpoints:**
- Mobile: повна ширина
- Desktop (≥1024px): фіксована ширина 320px

---

### MainContent
Основний контент з адаптивною сіткою.

```tsx
import { MainContent, ContentGrid } from '@/shared/layout';

<MainContent>
  <ContentGrid columns={2} gap="lg">
    {/* Картки */}
  </ContentGrid>
</MainContent>
```

---

### Grid
Адаптивна сітка.

```tsx
import { Grid, GridItem } from '@/shared/layout';

<Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="lg">
  <GridItem span={{ lg: 2 }}>
    {/* Контент */}
  </GridItem>
</Grid>
```

---

### Stack
Флекс контейнер для вертикального/горизонтального розміщення.

```tsx
import { Stack, Inline } from '@/shared/layout';

<Stack direction="col" gap="md" align="center">
  <Button>Кнопка 1</Button>
  <Button>Кнопка 2</Button>
</Stack>

<Inline gap="sm">
  <Badge>Tag 1</Badge>
  <Badge>Tag 2</Badge>
</Inline>
```

---

### Responsive
Компоненти для адаптивного відображення.

```tsx
import { Responsive, MobileOnly, TabletOnly, DesktopOnly } from '@/shared/layout';

<MobileOnly>
  <p>Видно тільки на мобільних</p>
</MobileOnly>

<DesktopOnly>
  <p>Видно тільки на десктопах</p>
</DesktopOnly>

<Responsive hideOnMobile>
  <p>Приховано на мобільних</p>
</Responsive>
```

---

### Section
Секція сторінки.

```tsx
import { Section } from '@/shared/layout';

<Section padding="lg" background="muted" border="bottom">
  {/* Контент секції */}
</Section>
```

**Props:**
- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `background`: 'default' | 'muted' | 'card' | 'primary' | 'secondary'
- `border`: 'none' | 'top' | 'bottom' | 'y'

---

## 📱 Breakpoints

| Назва | Min Width | Max Width |
|-------|-----------|-----------|
| Mobile | - | 639px |
| sm | 640px | 767px |
| md | 768px | 1023px |
| lg | 1024px | 1279px |
| xl | 1280px | 1535px |
| 2xl | 1536px | - |

---

## 🎨 Приклади використання

### 1. Стандартна сторінка з сайдбаром

```tsx
import { Page, PageContent, PageHeader, Sidebar, MainContent, Container } from '@/shared/layout';

function MyPage() {
  return (
    <Page>
      <PageContent>
        <Container size="xl">
          <PageHeader
            title="Заголовок"
            description="Опис"
          />
          
          <div className="flex flex-col lg:flex-row gap-8">
            <Sidebar>
              {/* Фільтри */}
            </Sidebar>
            
            <MainContent>
              {/* Основний контент */}
            </MainContent>
          </div>
        </Container>
      </PageContent>
    </Page>
  );
}
```

### 2. Сітка карток

```tsx
import { ContentGrid } from '@/shared/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components';

function CardsGrid() {
  return (
    <ContentGrid columns={{ sm: 1, md: 2, lg: 3 }} gap="lg">
      {items.map(item => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {item.content}
          </CardContent>
        </Card>
      ))}
    </ContentGrid>
  );
}
```

### 3. Форма з сайдбаром

```tsx
import { Page, PageContent, PageHeader, Sidebar, MainContent, Container } from '@/shared/layout';

function FormPage() {
  return (
    <Page>
      <PageContent>
        <Container size="lg">
          <PageHeader title="Налаштування" />
          
          <div className="flex flex-col lg:flex-row gap-8">
            <Sidebar className="lg:w-64">
              <form>
                {/* Поля форми */}
              </form>
            </Sidebar>
            
            <MainContent>
              {/* Результати або контент */}
            </MainContent>
          </div>
        </Container>
      </PageContent>
    </Page>
  );
}
```

### 4. Адаптивний контент

```tsx
import { MobileOnly, DesktopOnly } from '@/shared/layout';

function ResponsiveContent() {
  return (
    <div>
      <MobileOnly>
        <p>Мобільна версія</p>
      </MobileOnly>
      
      <DesktopOnly>
        <p>Десктопна версія</p>
      </DesktopOnly>
    </div>
  );
}
```

---

## 🎯 Best Practices

### 1. Використовуйте Container для обмеження ширини

```tsx
// ✅ Добре
<Container size="lg">
  <Content />
</Container>

// ❌ Погано
<div className="max-w-7xl mx-auto px-4">
  <Content />
</div>
```

### 2. Комбінуйте Stack для відступів

```tsx
// ✅ Добре
<Stack gap="lg">
  <Component1 />
  <Component2 />
</Stack>

// ❌ Погано
<div className="space-y-8">
  <Component1 />
  <Component2 />
</div>
```

### 3. Використовуйте Sidebar для фільтрів

```tsx
// ✅ Добре
<div className="flex flex-col lg:flex-row gap-8">
  <Sidebar>
    <Filters />
  </Sidebar>
  <MainContent>
    <Results />
  </MainContent>
</div>

// ❌ Погано
<div className="grid grid-cols-1 lg:grid-cols-4">
  <div className="lg:col-span-1">
    <Filters />
  </div>
  <div className="lg:col-span-3">
    <Results />
  </div>
</div>
```

---

## 📚 Корисні посилання

- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
