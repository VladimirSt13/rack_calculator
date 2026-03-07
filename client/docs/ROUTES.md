# 📍 Маршрути (Routes)

## Огляд

Всі маршрути централізовано зберігаються в `@/core/constants/routes.ts`.

---

## Структура

### Публічні маршрути
```typescript
PUBLIC_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ACCESS_DENIED: '/access-denied',
}
```

### Захищені маршрути
```typescript
PROTECTED_ROUTES = {
  HOME: '/',
  RACK: '/rack',
  BATTERY: '/battery',
}
```

### Адмін маршрути
```typescript
ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  USERS: '/admin/users',
  RACK_SETS: '/admin/rack-sets',
  PRICE: '/admin/price',
}
```

---

## Використання

### В компонентах

```tsx
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from '@/core/constants/routes';

// Redirect
<Navigate to={PROTECTED_ROUTES.HOME} replace />

// Link
<Link to={PUBLIC_ROUTES.LOGIN}>Увійти</Link>

// useNavigate
const navigate = useNavigate();
navigate(PROTECTED_ROUTES.BATTERY);
```

### В App.tsx

```tsx
import { 
  PROTECTED_ROUTES, 
  PUBLIC_ROUTES, 
  DEFAULT_REDIRECT_ROUTE 
} from '@/core/constants/routes';

<Routes>
  <Route path={PUBLIC_ROUTES.LOGIN} element={<LoginPage />} />
  <Route path={PROTECTED_ROUTES.RACK} element={
    <ProtectedRoute allowedRoles={['admin']}>
      <RackPage />
    </ProtectedRoute>
  } />
</Routes>
```

### В навігації

```tsx
import { NAVIGATION_ROUTES } from '@/core/constants/routes';

{NAVIGATION_ROUTES.map(route => (
  <Link key={route.path} to={route.path}>
    {route.label}
  </Link>
))}
```

---

## Helper функції

### isPublicRoute()
```typescript
import { isPublicRoute } from '@/core/constants/routes';

if (isPublicRoute(location.pathname)) {
  // Публічний маршрут
}
```

### isAdminRoute()
```typescript
import { isAdminRoute } from '@/core/constants/routes';

if (isAdminRoute(location.pathname)) {
  // Адмін маршрут
}
```

### getRouteByName()
```typescript
import { getRouteByName } from '@/core/constants/routes';

const loginPath = getRouteByName('LOGIN'); // '/login'
```

---

## Перевизначення маршрутів

Якщо потрібно змінити маршрут, редагуйте тільки `routes.ts`:

```typescript
// routes.ts
export const PROTECTED_ROUTES = {
  HOME: '/',
  RACK: '/calculator',  // Змінено з '/rack'
  BATTERY: '/battery',
}
```

Всі компоненти автоматично оновляться!

---

## Типи

### Ролі для маршрутів
```typescript
type RouteRoles = 'admin' | 'manager' | 'user';
```

### Налаштування навігації
```typescript
interface NavigationRoute {
  path: string;
  label: string;
  roles: RouteRoles[];
}
```

---

## Приклади

### ProtectedRoute з константами

```tsx
<ProtectedRoute 
  allowedRoles={['admin']} 
  requireActive
>
  <RackPage />
</ProtectedRoute>
```

### Redirect після входу

```tsx
import { DEFAULT_REDIRECT_ROUTE } from '@/core/constants/routes';

// Після успішного входу
navigate(DEFAULT_REDIRECT_ROUTE); // '/battery'
```

### Адмін редірект

```tsx
import { ADMIN_DEFAULT_REDIRECT } from '@/core/constants/routes';

// Для адміна
navigate(ADMIN_DEFAULT_REDIRECT); // '/admin'
```

---

## Переваги

✅ **Централізація** - всі маршрути в одному місці  
✅ **Типобезпека** - TypeScript перевіряє імена маршрутів  
✅ **Легка зміна** - змінив в одному місці, оновилося всюди  
✅ **Документація** - видно всі маршрути одразу  
✅ **Refactoring** - легко знайти всі використання маршруту

---

## Файли

- [`client/src/core/constants/routes.ts`](../client/src/core/constants/routes.ts) - Основний файл
- [`client/src/app/App.tsx`](../client/src/app/App.tsx) - Використання в App
- [`client/src/features/auth/ProtectedRoute.tsx`](../client/src/features/auth/ProtectedRoute.tsx) - Protected routes
