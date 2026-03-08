# 📋 План модернізації Rack Calculator

**Дата створення:** 7 березня 2026
**Дата оновлення:** 8 березня 2026 (виправлення експорту)
**Версія:** 2.0

---

## 🎯 Загальний огляд

Модернізація додатку включає:
- Систему авторизації з ролями (admin, manager, user)
- Перенесення обчислень на сервер
- Фільтрацію цін за ролями користувачів
- Можливість збереження комплектів стелажів
- Адмін-панель для керування користувачами
- Журнал аудиту з автоматичним очищенням
- Swagger API документація
- Виправлення критичних багів

---

## ✅ ЗАВЕРШЕНІ ЕТАПИ (Phase 1 & 2)

### ✅ Phase 1: Базова функціональність

#### ✅ Етап 1: Міграції БД + ролі + refresh tokens
- [x] Створити міграції для додавання ролей
- [x] Додати поля `email_verified`, `verification_token` до users
- [x] Створити таблицю `refresh_tokens`
- [x] Створити таблицю `email_verifications`
- [x] Оновити модель users
- [x] 9 міграцій виконано

#### ✅ Етап 2: Авторизація на сервері (розширена)
- [x] Оновити реєстрацію з перевіркою домену
- [x] Додати генерацію verification token
- [x] Додати endpoint `/verify-email`
- [x] Додати endpoint створення користувача адміном
- [x] Реалізувати refresh token логіку
- [x] Додати endpoint `/auth/refresh`
- [x] Додати endpoint `/auth/revoke`
- [x] Додати middleware `authorizeRole`
- [x] Додати middleware `filterPrices`
- [x] Додати відновлення пароля (forgot/reset/change)

#### ✅ Етап 3: Авторизація на клієнті
- [x] Створити authStore (Zustand) з refresh token
- [x] Створити authApi
- [x] Створити LoginPage
- [x] Створити RegisterPage
- [x] Створити VerifyEmailPage
- [x] Створити ForgotPasswordPage
- [x] Створити ResetPasswordPage
- [x] Додати ProtectedRoute
- [x] Auto refresh tokens

#### ✅ Етап 4: Обчислення на сервері
- [x] RackController (calculateRack)
- [x] BatteryController (findBestRackForBattery)
- [x] Фільтрація цін за permissions
- [x] Інтеграція з клієнтом

#### ✅ Етап 5: Ролі та дозволи
- [x] 3 типи цін: базова, без ізоляторів, нульова
- [x] Ролі: admin, manager, user
- [x] API для управління ролями
- [x] Зберігання permissions в БД
- [x] RolesController

#### ✅ Етап 6: Адмін-панель (базова)
- [x] AdminDashboard
- [x] UserManagement (CRUD користувачів)
- [x] UserForm (з вибором price_types)
- [x] ProtectedRoute для адміна

---

### ✅ Phase 2: Збереження комплектів та аудит

#### ✅ Етап 7: Збереження комплектів
- [x] Створити таблиці rack_sets, rack_set_revisions
- [x] RackSetController (CRUD)
- [x] RackSetModal (з експортом)
- [x] Сторінка RackSetsList
- [x] Експорт в Excel (окремий файл)

#### ✅ Етап 8: Експорт в Excel
- [x] Встановити exceljs
- [x] Експорт комплектів на одну сторінку
- [x] Опція "Додати ціни в експорт" (чекбокс)
- [x] Український формат чисел (кома)
- [x] Деталізація комплектації по стелажах
- [x] Межі, заливка, перенесення рядків
- [x] Адаптивна модалка (max-w-5xl)

#### ✅ Етап 9: Аудит
- [x] Audit log таблиця (міграція 006)
- [x] Audit helper (server/src/helpers/audit.js)
- [x] Audit routes (server/src/routes/audit.js)
- [x] Audit API (client/src/features/audit/auditApi.ts)
- [x] AuditLogPage (client/src/pages/admin/AuditLogPage.tsx)
- [x] Інтеграція в адмін-панель
- [x] Фільтрація за діями, сутностями, датами
- [x] Пагінація
- [x] Перегляд змін (було/стало)
- [x] Статистика журналу аудиту
- [x] API очищення старих записів
- [x] Скрипт audit:cleanup
- [x] Індекси для оптимізації (міграція 010)
- [x] Cron-планувальник (node-cron)
- [x] Документація (AUDIT_MANAGEMENT.md)

#### ✅ Етап 10: Swagger API Documentation
- [x] Встановити swagger-jsdoc, swagger-ui-express
- [x] Swagger специфікація для всіх API endpoint
- [x] UI документація на /api-docs
- [x] JSDoc коментарі для контролерів
- [x] Документація для Auth, Rack, Battery API
- [x] tsx для TypeScript support
- [x] validator для валідації email

---

## 🔧 ВИПРАВЛЕННЯ (Bug Fixes)

### ✅ Виправлення експорту комплектів (8 березня 2026)
**Проблема:** При експорті комплекту стелажів в Excel не потрапляли стеллажі.

**Причина:** При збереженні комплекту в БД в поле `racks` зберігалися тільки `{rackConfigId, quantity}` без повних даних (`components`, `prices`, `form`).

**Виправлення:**
- [x] `rackSetController.js`: збереження повних даних в `racks` при створенні/оновленні
- [x] `pricingService.js`: використання існуючих даних якщо вони вже розраховані
- [x] `exportController.js`: підтримка експорту для адміністраторів
- [x] `rackSetController.js`: підтримка адміністраторів в `getRackSets`, `getRackSet`

**Документація:** [EXPORT_FIX.md](./EXPORT_FIX.md)

---

## 📋 ПОТОЧНИЙ ПЛАН (Phase 3)

### 🔄 Етап 10: Дашборд з аналітикою
- [ ] Створити DashboardPage з графіками
- [ ] Статистика використання (розрахунки, користувачі)
- [ ] Графік активності (користувачі, розрахунки по днях)
- [ ] Топ користувачів
- [ ] Популярні конфігурації стелажів
- [ ] Експорт статистики в PDF

**Бібліотеки:**
- recharts або chart.js для графіків
- date-fns для роботи з датами

---

### 🔄 Етап 11: Email-сповіщення
- [ ] Налаштувати SMTP (nodemailer)
- [ ] Шаблони листів (Welcome, Password Reset)
- [ ] Сповіщення про створення комплекту
- [ ] Сповіщення про зміни цін
- [ ] Щотижневий звіт (опціонально)
- [ ] Налаштування сповіщень для користувачів

**Бібліотеки:**
- nodemailer (вже встановлено)
- handlebars для шаблонів

---

### 🔄 Етап 12: Notifications (внутрішні)
- [ ] Таблиця notifications в БД
- [ ] NotificationsController (CRUD)
- [ ] Real-time оновлення (WebSocket або polling)
- [ ] Компонент NotificationBell
- [ ] Сторінка перегляду сповіщень
- [ ] Маркування як прочитані

---

### 🔄 Етап 13: Перегляд та редагування комплектів
- [ ] **View Mode для комплектів** (в "Мої комплекти")
  - [x] Діалог перегляду комплекту
  - [ ] Деталізація компонентів стелажа
  - [ ] Порівняння варіантів (для battery)
- [ ] **Редактор комплектів** (окрема сторінка /sets/:id/edit)
  - [ ] Зміна назви, об'єкта, опису
  - [ ] Додавання/видалення стелажів
  - [ ] Зміна кількості стелажів
  - [ ] Переглянути в калькуляторі (Rack/Battery)
  - [ ] Збереження з ревізією
- [ ] **Експорт Battery комплектів**
  - [ ] Додати кнопку експорту в BatteryResults
  - [ ] Інтеграція з exportController

---

### 🔄 Етап 14: Покращення UI/UX
- [ ] Lazy loading для компонентів
- [ ] Code splitting для сторінок
- [ ] Skeleton loaders замість spinner
- [ ] Toast notifications (sonner вже є)
- [ ] Підтримка тем (светла/темна)
- [ ] Анімації переходів
- [ ] Responsive покращення для мобільних

---

### 🔄 Етап 14: Тестування
- [ ] Unit тести для utils (Vitest)
- [ ] Unit тести для hooks
- [ ] Component тести (React Testing Library)
- [ ] Integration тести для API
- [ ] E2E тести (Playwright або Cypress)
- [ ] Coverage > 80%

---

### 🔄 Етап 15: Документація
- [x] API документація (Swagger/OpenAPI) - /api-docs
- [ ] Користувацька інструкція (укр/англ)
- [ ] Відео-інструкції (скрінкасти)
- [ ] FAQ розділ
- [ ] Changelog (CHANGELOG.md)

---

## 🔮 МАЙБУТНІ ПОКРАЩЕННЯ (Phase 4+)

### 📊 3D Візуалізація
- [ ] Three.js для 3D моделі стелажів
- [ ] Інтерактивний перегляд
- [ ] Експорт 3D моделі
- [ ] AR перегляд (опціонально)

### 📦 Складський облік
- [ ] Облік залишків компонентів
- [ ] Автоматичне замовлення при мінімумі
- [ ] Історія руху товарів
- [ ] Інвентаризація

### 💰 Фінанси
- [ ] Генерація рахунків (PDF)
- [ ] ПДВ розрахунок
- [ ] Історія платежів
- [ ] Інтеграція з 1С/Бухгалтерією

### 🚚 Логістика
- [ ] Розрахунок вартості доставки
- [ ] Вибір служби доставки
- [ ] Друк транспортних накладних
- [ ] Трекінг замовлень

### 👥 Командна робота
- [ ] Спільні проекти
- [ ] Ролі з різними правами доступу
- [ ] Коментарі до замовлень
- [ ] Історія змін

### 📱 Мобільний додаток
- [ ] React Native версія
- [ ] PWA (Progressive Web App)
- [ ] Офлайн режим
- [ ] Push-сповіщення

---

## 🛠️ ІНФРАСТРУКТУРА

### 🐳 Docker
- [ ] Dockerfile для сервера
- [ ] Dockerfile для клієнта
- [ ] docker-compose.yml
- [ ] Docker Hub публікація

### 🔄 CI/CD
- [ ] GitHub Actions для тестів
- [ ] Автоматичний деплой при merge
- [ ] Перевірка якості коду (ESLint, Prettier)
- [ ] Автоматичне версіонування

### 📊 Моніторинг
- [ ] Sentry для помилок
- [ ] LogRocket для сесій
- [ ] Google Analytics
- [ ] Performance моніторинг

### 🔒 Безпека
- [ ] Аудит залежностей (npm audit)
- [ ] HTTPS налаштування
- [ ] Rate limiting для API
- [ ] XSS/CSRF захист
- [ ] Penetration testing

---

## 📊 МЕТРИКИ ПРОЕКТУ

### Поточний статус
| Показник | Значення |
|----------|----------|
| **Завершено етапів** | 10/10 (Phase 1 & 2) |
| **Всього міграцій** | 10 |
| **Сторінок** | 15+ |
| **API endpoints** | 30+ |
| **Користувачів** | 4 тестових |
| **Розмір БД** | ~2 MB |
| **API Documentation** | Swagger UI (/api-docs) |

### Цілі Phase 3
| Показник | Ціль |
|----------|------|
| **Завершено етапів** | 6/6 |
| **Test coverage** | > 80% |
| **Productivity score** | A+ |
| **Documentation** | 100% |

---

## 📅 Орієнтовні терміни

| Phase | Етапи | Термін |
|-------|-------|--------|
| **Phase 1** | 1-6 | ✅ Завершено |
| **Phase 2** | 7-10 | ✅ Завершено |
| **Phase 3** | 11-15 | 2-4 тижні |
| **Phase 4** | 16-20 | 4-8 тижнів |

---

## 🎯 Пріоритети

### Високий пріоритет
1. ✅ Аудит (завершено)
2. ✅ Swagger API Documentation (завершено)
3. 📊 Дашборд з аналітикою
4. 📧 Email-сповіщення
5. 🧪 Тестування

### Середній пріоритет
5. 📱 Мобільна версія
6. 🎨 UI/UX покращення
7. 📖 Документація

### Низький пріоритет
8. 🐳 Docker
9. 🔄 CI/CD
10. 🔒 Моніторинг

---

**Затверджено:** 8 березня 2026
**Версія:** 2.0
**Статус:** Phase 1 & 2 ✅ Завершено, Phase 3 🔄 В роботі

---

## 🔐 Серверна частина

### 1. Система авторизації та ролей

#### База даних

**Міграції:**

```sql
-- Додати ролі та permissions до таблиці users
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'other' 
  CHECK(role IN ('admin', 'manager', 'other'));

ALTER TABLE users ADD COLUMN permissions JSON;

ALTER TABLE users ADD COLUMN company_domain TEXT DEFAULT '@accu-energo.com.ua';

-- Таблиця комплектів стелажів
CREATE TABLE rack_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  object_name TEXT,
  description TEXT,
  racks JSON NOT NULL,
  total_cost REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблиця аудиту (опціонально)
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id INTEGER,
  old_value JSON,
  new_value JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_rack_sets_user_id ON rack_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
```

#### Middleware

**`server/src/middleware/authorizeRole.js`:**
```javascript
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};
```

**`server/src/middleware/filterPrices.js`:**
```javascript
export const filterPricesByPermissions = (priceData, permissions) => {
  if (!permissions || permissions.show_all) {
    return priceData;
  }
  
  // Фільтрація за типами цін
  const filtered = { ...priceData };
  
  if (!permissions.show_retail) {
    // Приховати роздрібні ціни
  }
  if (!permissions.show_wholesale) {
    // Приховати оптові ціни
  }
  // ... інша логіка
  
  return filtered;
};
```

#### Нові Routes

**`server/src/routes/users.js`:**
```javascript
// GET /api/users - список користувачів (admin)
// POST /api/users - створити користувача (admin)
// GET /api/users/:id - отримати користувача
// PUT /api/users/:id - оновити користувача (admin)
// DELETE /api/users/:id - видалити користувача (admin)
```

**`server/src/routes/rackSets.js`:**
```javascript
// GET /api/rack-sets - список комплектів
// POST /api/rack-sets - зберегти комплект
// GET /api/rack-sets/:id - отримати комплект
// PUT /api/rack-sets/:id - оновити комплект
// DELETE /api/rack-sets/:id - видалити комплект
```

---

### 2. Перенесення обчислень на сервер

#### Controllers

**`server/src/controllers/rackController.js`:**
```javascript
import { 
  calculateRackComponents,
  calculateTotalCost,
  calculateTotalWithoutIsolators,
  generateRackName 
} from '@rack-calculator/shared';

export const calculateRack = async (req, res, next) => {
  try {
    const config = req.body;
    const db = getDb();
    
    // Отримати актуальний прайс
    const priceRecord = db.prepare(
      'SELECT data FROM prices ORDER BY id DESC LIMIT 1'
    ).get();
    
    if (!priceRecord) {
      return res.status(404).json({ error: 'Price data not found' });
    }
    
    const price = JSON.parse(priceRecord.data);
    
    // Розрахунок компонентів
    const components = calculateRackComponents(config, price);
    const totalCost = calculateTotalCost(components);
    const totalWithoutIsolators = calculateTotalWithoutIsolators(components);
    
    // Фільтрація цін за permissions користувача
    const userPermissions = req.user?.permissions;
    const filteredPrices = filterPricesByPermissions(
      { components, totalCost, totalWithoutIsolators },
      userPermissions
    );
    
    res.json({
      name: generateRackName(config),
      ...filteredPrices
    });
  } catch (error) {
    next(error);
  }
};
```

**`server/src/controllers/batteryController.js`:**
```javascript
export const findBestRackForBattery = async (req, res, next) => {
  try {
    const { batteryDimensions, weight, quantity } = req.body;
    const db = getDb();
    
    // Логіка підбору стелажа по батареї
    // ...
    
    res.json({
      variants: [/* варіанти прольотів */],
      bestMatch: {/* найкращий варіант */}
    });
  } catch (error) {
    next(error);
  }
};
```

**`server/src/controllers/rackSetController.js`:**
```javascript
export const saveRackSet = async (req, res, next) => {
  try {
    const { name, objectName, description, racks } = req.body;
    const db = getDb();
    
    // Розрахунок загальної вартості
    const totalCost = racks.reduce((sum, rack) => sum + (rack.totalCost || 0), 0);
    
    const result = db.prepare(`
      INSERT INTO rack_sets (user_id, name, object_name, description, racks, total_cost)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.userId, name, objectName, description, JSON.stringify(racks), totalCost);
    
    // Audit log
    db.prepare(`
      INSERT INTO audit_log (user_id, action, entity_type, entity_id, new_value)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.userId, 'CREATE', 'rack_set', result.lastInsertRowid, JSON.stringify({ name }));
    
    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      objectName,
      totalCost
    });
  } catch (error) {
    next(error);
  }
};
```

---

### 3. Система цін за ролями

#### Структура permissions

```json
{
  "show_retail": true,
  "show_wholesale": true,
  "show_zero": false,
  "show_no_isolators": true,
  "show_cost_price": false
}
```

#### Ролі за замовчуванням

| Роль | Роздрібна | Оптова | Нульова | Без ізоляторів | Собівартість |
|------|-----------|--------|---------|----------------|--------------|
| `admin` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `manager` | ❌ | ❌ | ✅ | ✅ | ❌ |
| `other` | 📋 | 📋 | 📋 | 📋 | 📋 |

📋 — налаштовується адміном індивідуально

#### Логіка фільтрації

```javascript
const ROLE_DEFAULTS = {
  admin: { show_all: true },
  manager: { show_zero: true, show_no_isolators: true },
  other: null // індивідуально
};

export const getUserPricePermissions = (user) => {
  if (user.permissions) {
    return user.permissions;
  }
  return ROLE_DEFAULTS[user.role] || {};
};
```

---

## 🖥️ Клієнтська частина

### 1. Сторінки авторизації

#### `client/src/pages/LoginPage.tsx`

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/authStore';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';

const loginSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(6, 'Пароль має бути не менше 6 символів'),
});

export const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });
  
  const onSubmit = (data) => {
    login(data);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Вхід</h1>
        
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
        
        <Input
          label="Пароль"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? 'Вхід...' : 'Увійти'}
        </Button>
        
        <p className="mt-4 text-center text-sm">
          Немає акаунту? <a href="/register" className="text-blue-600">Зареєструватися</a>
        </p>
      </form>
    </div>
  );
};
```

#### `client/src/pages/RegisterPage.tsx`

```tsx
const registerSchema = z.object({
  email: z.string()
    .email('Невірний формат email')
    .refine(
      (email) => email.endsWith('@accu-energo.com.ua'),
      'Реєстрація доступна тільки з корпоративною поштою @accu-energo.com.ua'
    ),
  password: z.string().min(6, 'Пароль має бути не менше 6 символів'),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Паролі не співпадають', path: ['confirmPassword'] }
);
```

---

### 2. Auth Store (Zustand)

**`client/src/features/auth/authStore.ts`:**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from './authApi';

interface User {
  id: number;
  email: string;
  role: 'admin' | 'manager' | 'other';
  permissions?: Record<string, boolean>;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.login(credentials);
          set({ user, token, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.register(data);
          set({ user, token, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      logout: () => {
        authApi.logout();
        set({ user: null, token: null });
      },
      
      checkAuth: async () => {
        const token = get().token;
        if (!token) return;
        
        try {
          const user = await authApi.me();
          set({ user });
        } catch (error) {
          set({ user: null, token: null });
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    { name: 'auth-storage' }
  )
);
```

---

### 3. Protected Route

**`client/src/features/auth/ProtectedRoute.tsx`:**

```tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from './authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'manager' | 'other')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, token } = useAuthStore();
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
```

---

### 4. Адмін-панель

#### `client/src/pages/admin/AdminDashboard.tsx`

```tsx
import { Link } from 'react-router-dom';
import { Users, Package, Settings } from 'lucide-react';

const adminMenuItems = [
  { path: '/admin/users', label: 'Користувачі', icon: Users },
  { path: '/admin/rack-sets', label: 'Комплекти стелажів', icon: Package },
  { path: '/admin/settings', label: 'Налаштування', icon: Settings },
];

export const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Адмін-панель</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <item.icon className="w-12 h-12 mb-4 text-primary" />
            <h2 className="text-xl font-semibold">{item.label}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
};
```

#### `client/src/pages/admin/UserManagement.tsx`

```tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/features/users/usersApi';
import { Button } from '@/shared/components/Button';
import { Table } from '@/shared/components/Table';
import { UserForm } from './UserForm';
import { DeleteDialog } from '@/shared/components/DeleteDialog';

export const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });
  
  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setShowDeleteDialog(false);
    },
  });
  
  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = () => {
    deleteMutation.mutate(userToDelete.id);
  };
  
  if (isLoading) return <div>Завантаження...</div>;
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Користувачі</h1>
        <Button onClick={() => setEditingUser({})}>
          Додати користувача
        </Button>
      </div>
      
      <Table
        columns={[
          { key: 'email', header: 'Email' },
          { key: 'role', header: 'Роль' },
          { key: 'createdAt', header: 'Створено' },
        ]}
        data={users}
        actions={(user) => (
          <>
            <Button variant="outline" onClick={() => setEditingUser(user)}>
              Редагувати
            </Button>
            <Button variant="danger" onClick={() => handleDelete(user)}>
              Видалити
            </Button>
          </>
        )}
      />
      
      {editingUser && (
        <UserForm
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => queryClient.invalidateQueries(['users'])}
        />
      )}
      
      {showDeleteDialog && (
        <DeleteDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
          title="Видалити користувача?"
        />
      )}
    </div>
  );
};
```

#### `client/src/pages/admin/UserForm.tsx`

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { usersApi } from '@/features/users/usersApi';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Checkbox } from '@/shared/components/Checkbox';
import { Button } from '@/shared/components/Button';
import { Dialog } from '@/shared/components/Dialog';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(['admin', 'manager', 'other']),
  permissions: z.object({
    show_retail: z.boolean(),
    show_wholesale: z.boolean(),
    show_zero: z.boolean(),
    show_no_isolators: z.boolean(),
  }),
});

export const UserForm: React.FC<{ user?: any; onClose: () => void; onSuccess: () => void }> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const isEdit = !!user?.id;
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email || '',
      role: user?.role || 'other',
      permissions: user?.permissions || {
        show_retail: false,
        show_wholesale: false,
        show_zero: true,
        show_no_isolators: true,
      },
    },
  });
  
  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: onSuccess,
  });
  
  const updateMutation = useMutation({
    mutationFn: usersApi.update,
    onSuccess: onSuccess,
  });
  
  const onSubmit = (data) => {
    if (isEdit) {
      updateMutation.mutate({ id: user.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  return (
    <Dialog isOpen onClose={onClose} title={isEdit ? 'Редагування користувача' : 'Новий користувач'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          {...register('email')}
          error={errors.email?.message}
        />
        
        {!isEdit && (
          <Input
            label="Пароль"
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />
        )}
        
        <Select
          label="Роль"
          options={[
            { value: 'admin', label: 'Адміністратор' },
            { value: 'manager', label: 'Менеджер' },
            { value: 'other', label: 'Інше' },
          ]}
          {...register('role')}
        />
        
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Дозволи (ціни)</h3>
          
          <Checkbox
            label="Роздрібна ціна"
            {...register('permissions.show_retail')}
          />
          <Checkbox
            label="Оптова ціна"
            {...register('permissions.show_wholesale')}
          />
          <Checkbox
            label="Нульова ціна"
            {...register('permissions.show_zero')}
          />
          <Checkbox
            label="Без ізоляторів"
            {...register('permissions.show_no_isolators')}
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Скасувати
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'Зберегти' : 'Створити'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
```

---

### 5. Збереження комплекту стелажів

#### `client/src/features/rack/RackSetModal.tsx`

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { rackSetsApi } from './rackSetsApi';
import { Dialog } from '@/shared/components/Dialog';
import { Input } from '@/shared/components/Input';
import { Textarea } from '@/shared/components/Textarea';
import { Button } from '@/shared/components/Button';

const rackSetSchema = z.object({
  name: z.string().min(1, 'Назва обов\'язкова'),
  objectName: z.string().min(1, 'Назва об\'єкта обов\'язкова'),
  description: z.string().optional(),
});

export const RackSetModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  racks: any[];
}> = ({ isOpen, onClose, racks }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(rackSetSchema),
  });
  
  const saveMutation = useMutation({
    mutationFn: rackSetsApi.create,
    onSuccess: () => {
      onClose();
      // Очистити форму або показати повідомлення
    },
  });
  
  const onSubmit = (data) => {
    saveMutation.mutate({
      ...data,
      racks,
    });
  };
  
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Зберегти комплект стелажів">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Назва комплекту"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Наприклад: Стелажі для складу №1"
        />
        
        <Input
          label="Назва об'єкта"
          {...register('objectName')}
          error={errors.objectName?.message}
          placeholder="Наприклад: Склад готової продукції"
        />
        
        <Textarea
          label="Коментар (необов'язково)"
          {...register('description')}
          rows={3}
        />
        
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-semibold mb-2">Склад комплекту:</h4>
          <ul className="text-sm space-y-1">
            {racks.map((rack, index) => (
              <li key={index}>
                {rack.name} — {rack.totalCost?.toFixed(2)} ₴
              </li>
            ))}
          </ul>
          <p className="font-semibold mt-2 pt-2 border-t">
            Разом: {racks.reduce((sum, r) => sum + (r.totalCost || 0), 0).toFixed(2)} ₴
          </p>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Скасувати
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Збереження...' : 'Зберегти'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
```

#### Додавання кнопки на сторінки Rack/Battery

```tsx
// client/src/pages/RackPage.tsx
import { useState } from 'react';
import { RackSetModal } from '@/features/rack/RackSetModal';

export const RackPage: React.FC = () => {
  const [showSaveSetModal, setShowSaveSetModal] = useState(false);
  const [currentRacks, setCurrentRacks] = useState([]);
  
  const handleSaveSet = () => {
    // Зібрати поточні розраховані стелажі
    setCurrentRacks(calculatedRacks);
    setShowSaveSetModal(true);
  };
  
  return (
    <div>
      {/* ... існуючий код ... */}
      
      <Button onClick={handleSaveSet}>
        Зберегти комплект
      </Button>
      
      <RackSetModal
        isOpen={showSaveSetModal}
        onClose={() => setShowSaveSetModal(false)}
        racks={currentRacks}
      />
    </div>
  );
};
```

---

## 📁 Нова структура файлів

```
rack_calculator/
├── server/
│   └── src/
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── usersController.js
│       │   ├── rackController.js
│       │   ├── batteryController.js
│       │   ├── priceController.js
│       │   └── rackSetController.js
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── authorizeRole.js
│       │   └── filterPrices.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── users.js
│       │   ├── rack.js
│       │   ├── battery.js
│       │   ├── price.js
│       │   └── rackSets.js
│       ├── db/
│       │   ├── index.js
│       │   └── migrations/
│       │       ├── 001_add_roles_to_users.js
│       │       ├── 002_create_rack_sets.js
│       │       └── 003_create_audit_log.js
│       └── index.js
│
├── client/
│   └── src/
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── admin/
│       │   │   ├── AdminDashboard.tsx
│       │   │   ├── UserManagement.tsx
│       │   │   ├── UserForm.tsx
│       │   │   └── RackSetsList.tsx
│       │   └── ...
│       ├── features/
│       │   ├── auth/
│       │   │   ├── authStore.ts
│       │   │   ├── authApi.ts
│       │   │   └── ProtectedRoute.tsx
│       │   ├── users/
│       │   │   ├── usersApi.ts
│       │   │   └── usersStore.ts
│       │   └── rack/
│       │       ├── rackSetsApi.ts
│       │       └── RackSetModal.tsx
│       └── ...
│
└── shared/
    └── rackCalculator.ts
```

---

## 🚀 Порядок реалізації

### ✅ Phase 1: Базова функціональність (ВИКОНАНО)

#### ✅ Етап 1: Міграції БД + ролі + refresh tokens
- [x] Створити міграції для додавання ролей
- [x] Додати поля `email_verified`, `verification_token` до users
- [x] Створити таблицю `refresh_tokens`
- [x] Створити таблицю `email_verifications`
- [x] Оновити модель users

#### ✅ Етап 2: Авторизація на сервері (розширена)
- [x] Оновити реєстрацію з перевіркою домену
- [x] Додати генерацію verification token
- [x] Додати endpoint `/verify-email`
- [x] Додати endpoint створення користувача адміном
- [x] Реалізувати refresh token логіку
- [x] Додати endpoint `/auth/refresh`
- [x] Додати endpoint `/auth/revoke`
- [x] Додати middleware `authorizeRole`
- [x] Додати middleware `filterPrices`
- [x] Додати відновлення пароля (forgot/reset/change)

#### ✅ Етап 3: Авторизація на клієнті
- [x] Створити authStore (Zustand) з refresh token
- [x] Створити authApi
- [x] Створити LoginPage
- [x] Створити RegisterPage
- [x] Створити VerifyEmailPage
- [x] Створити ForgotPasswordPage
- [x] Створити ResetPasswordPage
- [x] Створити ProtectedRoute
- [x] Додати авто-оновлення токену
- [x] Додати перевірку авторизації в App.tsx

#### ✅ Етап 4: Перенесення обчислень на сервер
- [x] Створити rackController
- [x] Створити batteryController
- [x] Оновити client для відправки даних на сервер
- [x] Тестування розрахунків
- [x] Фільтрація цін за permissions

#### ✅ Етап 5: Ролі та дозволи (БД)
- [x] Створити константи ролей та дозволів
- [x] Створити таблиці roles, permissions, role_permissions
- [x] Додати API для управління ролями
- [x] Збереження permissions в БД
- [x] Централізовані константи (routes, roles)

---

### 🔄 Phase 2: Поточний етап

#### Етап 6: Адмін-панель (базова)
- [ ] Створити AdminDashboard
- [ ] Створити UserManagement
- [ ] Створити UserForm (з вибором price_types)
- [ ] CRUD користувачів
- [ ] Сторінка перегляду користувача
- [ ] Створити PriceManagement (перегляд/редагування прайсу)
- [ ] Додати endpoint GET/PUT /api/price/admin

---

### ⏳ Phase 3: Наступні етапи

#### Етап 7: Збереження комплектів + ревізії
- [ ] Створити таблицю `rack_sets`
- [ ] Створити таблицю `rack_set_revisions`
- [ ] Створити rackSetController
- [ ] Додати endpoint збереження комплекту
- [ ] Додати endpoint отримання комплекту
- [ ] Додати endpoint оновлення комплекту (з новою ревізією)
- [ ] Додати endpoint видалення комплекту
- [ ] Додати endpoint отримання історії ревізій
- [ ] Створити rackSetsApi
- [ ] Створити RackSetModal
- [ ] Додати кнопку "Зберегти комплект"
- [ ] Сторінка RackSetsList для перегляду
- [ ] Сторінка перегляду комплекту
- [ ] Сторінка історії ревізій

#### Етап 8: Експорт в Excel
- [ ] Встановити exceljs (server)
- [ ] Встановити file-saver (client)
- [ ] Створити endpoint `/rack-sets/:id/export`
- [ ] Додати кнопку "Експорт в Excel"
- [ ] Тестування експорту

#### Етап 9: Аудит + полірування
- [ ] Створити таблицю `audit_log`
- [ ] Додати логування в audit_log
- [ ] Сторінка аудиту (опціонально)
- [ ] Повне тестування
- [ ] Фінальна документація

---

### Phase 2: Додаткові функції

#### Етап 10: Шаблони стелажів
- [ ] Створити таблицю `rack_templates`
- [ ] Додати seed даних (стандартні шаблони)
- [ ] Створити templatesController
- [ ] Додати endpoint GET /api/templates
- [ ] Додати endpoint POST /api/templates
- [ ] Додати endpoint PUT /api/templates/:id
- [ ] Додати endpoint DELETE /api/templates/:id
- [ ] Додати endpoint POST /api/templates/:id/apply
- [ ] UI вибору шаблонів на сторінках Rack/Battery
- [ ] UI створення власного шаблону

#### Етап 11: Валідація навантаження
- [ ] Створити middleware `validateRackLoad`
- [ ] Додати константи MAX_LOAD_PER_BEAM, MAX_LOAD_PER_SUPPORT
- [ ] Додати валідацію до rack/battery controllers
- [ ] UI відображення статусу безпеки
- [ ] UI порад при перевантаженні

#### Етап 12: Пошук та фільтри комплектів
- [ ] Додати фільтри до GET /api/rack-sets
- [ ] Додати повнотекстовий пошук (FTS)
- [ ] UI фільтрів (пошук, дата, вартість, об'єкт)
- [ ] UI пагінації
- [ ] Сортування результатів

#### Етап 13: Дашборд адміна
- [ ] Створити endpoint GET /api/admin/stats
- [ ] UI KPI карток (користувачі, комплекти, вартість)
- [ ] UI графіків (Chart.js або Recharts)
- [ ] UI топ користувачів
- [ ] UI останньої активності

#### Етап 14: Імпорт прайсу з Excel
- [ ] Додати multer для завантаження файлів
- [ ] Створити endpoint POST /api/price/import-excel
- [ ] UI завантаження Excel файлу
- [ ] UI інструкцій по формату файлу
- [ ] Валідація імпортованих даних

---

### Phase 3: Опціональні покращення (після основної реалізації)

#### Етап 15: Масові операції
- [ ] Endpoint POST /api/rack-sets/batch
- [ ] Endpoint POST /api/rack-sets/:id/duplicate
- [ ] Endpoint GET /api/rack-sets/compare
- [ ] UI масового вибору комплектів
- [ ] UI порівняння комплектів

#### Етап 16: Сповіщення
- [ ] Створити таблицю `notifications`
- [ ] Додати WebSocket (socket.io)
- [ ] UI сповіщень (дзвіночок з лічильником)
- [ ] UI прочитаних/непрочитаних сповіщень

#### Етап 17: Ліміти для ролей
- [ ] Додати таблицю `role_limits`
- [ ] Middleware `checkRackSetLimit`
- [ ] UI попередження при наближенні до ліміту

#### Етап 18: Резервне копіювання
- [ ] Скрипт backupDatabase
- [ ] Cron для автоматичного бекапу
- [ ] Інтеграція з хмарним сховищем (S3)

---

## ✅ Відповіді на питання (вирішено)

1. **Refresh token** — ✅ ПОТРІБЕН (access + refresh пара)
2. **Підтвердження email** — ✅ РОБИТИ
3. **Ціни для ролі "other"** — ✅ АДМІН ВИЗНАЧАЄ ВРУЧНУ (можна вибрати кілька типів: `без_ізоляторів`, `загальна`, `нульова`)
4. **Експорт комплектів** — ✅ В EXCEL
5. **Історія змін комплектів** — ✅ ПОТРІБНА (ревізії)

---

## 🔧 Оновлення архітектури (з урахуванням відповідей)

### Refresh Token

**Структура токенів:**
```javascript
{
  accessToken: {
    payload: { userId, email, role, permissions },
    expiresIn: '15m'
  },
  refreshToken: {
    payload: { userId, tokenId },
    expiresIn: '30d',
    storedIn: 'httpOnly cookie'
  }
}
```

**Нові endpoints:**
```javascript
POST /api/auth/refresh     // Оновлення access token
POST /api/auth/revoke      // Відкликання refresh token
```

**Таблиця refresh tokenів:**
```sql
CREATE TABLE refresh_tokens (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### Підтвердження Email

**Таблиця:**
```sql
CREATE TABLE email_verifications (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Flow:**
1. Реєстрація → створення користувача (status = 'pending')
2. Генерація токену підтвердження
3. Відправка email з посиланням `/verify-email?token=xxx`
4. Клік → підтвердження → status = 'active'
5. Вхід доступний тільки для підтверджених

**Оновлення таблиці users:**
```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN verification_token TEXT;
```

---

### Типи цін (Permissions)

**Структура permissions:**
```json
{
  "price_types": ["без_ізоляторів", "загальна", "нульова"]
}
```

**Приклади для ролей:**
```json
{
  "admin": {
    "price_types": ["без_ізоляторів", "загальна", "нульова", "собівартість", "оптова"]
  },
  "manager": {
    "price_types": ["нульова"]
  },
  "other": {
    "price_types": ["без_ізоляторів", "загальна"]  // адмін налаштовує
  }
}
```

**UI для адміна (вибір типів цін):**
```tsx
<CheckboxGroup label="Доступні типи цін">
  <Checkbox value="без_ізоляторів" label="Без ізоляторів" />
  <Checkbox value="загальна" label="Загальна" />
  <Checkbox value="нульова" label="Нульова" />
  <Checkbox value="собівартість" label="Собівартість" />
  <Checkbox value="оптова" label="Оптова" />
</CheckboxGroup>
```

---

### Управління прайсом (Admin)

**Структура прайсу:**
```json
{
  "supports": {
    "C80": {
      "edge": { "price": 100, "code": "C80-E" },
      "intermediate": { "price": 80, "code": "C80-I" }
    },
    "C100": { ... }
  },
  "spans": {
    "1500": { "price": 500, "code": "B1500" },
    "2000": { "price": 650, "code": "B2000" }
  },
  "vertical_supports": { ... },
  "diagonal_brace": { ... },
  "isolator": { ... }
}
```

**Server endpoint:**
```javascript
// GET /api/price/admin
export const getPriceForAdmin = async (req, res, next) => {
  try {
    const db = getDb();
    const price = db.prepare(
      'SELECT data, updated_at, id FROM prices ORDER BY id DESC LIMIT 1'
    ).get();
    
    if (!price) {
      return res.status(404).json({ error: 'Price not found' });
    }
    
    // Для адміна повертаємо ВСІ ціни + історію змін
    const priceHistory = db.prepare(`
      SELECT id, updated_at 
      FROM prices 
      ORDER BY id DESC 
      LIMIT 10
    `).all();
    
    res.json({
      data: JSON.parse(price.data),
      updatedAt: price.updated_at,
      history: priceHistory
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/price/admin
export const updatePrice = async (req, res, next) => {
  try {
    const db = getDb();
    const { data } = req.body;
    
    // Валідація структури прайсу
    const validatedData = validatePriceStructure(data);
    
    // Отримати попередню версію для аудиту
    const oldPrice = db.prepare(
      'SELECT data FROM prices ORDER BY id DESC LIMIT 1'
    ).get();
    
    // Вставити новий прайс
    const result = db.prepare(
      'INSERT INTO prices (data) VALUES (?)'
    ).run(JSON.stringify(validatedData));
    
    // Audit log
    db.prepare(`
      INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, new_value)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      req.user.userId,
      'UPDATE',
      'price',
      result.lastInsertRowid,
      oldPrice?.data,
      JSON.stringify(validatedData)
    );
    
    const newPrice = db.prepare(
      'SELECT data, updated_at FROM prices WHERE id = ?'
    ).get(result.lastInsertRowid);
    
    res.json({
      data: JSON.parse(newPrice.data),
      updatedAt: newPrice.updated_at
    });
  } catch (error) {
    next(error);
  }
};
```

**Client - PriceManagement сторінка:**
```tsx
export const PriceManagement: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: priceData, isLoading } = useQuery({
    queryKey: ['price', 'admin'],
    queryFn: priceApi.getForAdmin,
  });
  
  const updateMutation = useMutation({
    mutationFn: priceApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries(['price']);
      toast.success('Прайс оновлено');
    },
  });
  
  const handlePriceChange = (category: string, code: string, field: string, value: number) => {
    const newData = {
      ...priceData.data,
      [category]: {
        ...priceData.data[category],
        [code]: {
          ...priceData.data[category][code],
          [field]: value,
        },
      },
    };
    updateMutation.mutate({ data: newData });
  };
  
  if (isLoading) return <div>Завантаження...</div>;
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Управління прайсом</h1>
      
      <Tabs defaultValue="supports">
        <TabsList>
          <TabsTrigger value="supports">Опори</TabsTrigger>
          <TabsTrigger value="spans">Балки</TabsTrigger>
          <TabsTrigger value="vertical_supports">Верт. стійки</TabsTrigger>
          <TabsTrigger value="diagonal_brace">Розкоси</TabsTrigger>
          <TabsTrigger value="isolator">Ізолятори</TabsTrigger>
        </TabsList>
        
        <TabsContent value="supports">
          <PriceCategoryTable
            category="supports"
            data={priceData.data.supports}
            onPriceChange={handlePriceChange}
            columns={['code', 'edge_price', 'intermediate_price']}
          />
        </TabsContent>
        
        <TabsContent value="spans">
          <PriceCategoryTable
            category="spans"
            data={priceData.data.spans}
            onPriceChange={handlePriceChange}
            columns={['code', 'price']}
          />
        </TabsContent>
        
        {/* Інші категорії... */}
      </Tabs>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Історія змін прайсу</h3>
        <PriceHistory history={priceData.history} />
      </div>
    </div>
  );
};
```

**Client - компонент таблиці цін:**
```tsx
interface PriceCategoryTableProps {
  category: string;
  data: Record<string, any>;
  onPriceChange: (category: string, code: string, field: string, value: number) => void;
  columns: string[];
}

export const PriceCategoryTable: React.FC<PriceCategoryTableProps> = ({
  category,
  data,
  onPriceChange,
  columns,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col}>{getColumnLabel(col)}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(data).map(([code, item]) => (
          <TableRow key={code}>
            {columns.map((col) => (
              <TableCell key={col}>
                {col === 'code' ? (
                  item.code || code
                ) : (
                  <Input
                    type="number"
                    value={item[col] || item.price || 0}
                    onChange={(e) =>
                      onPriceChange(category, code, col, parseFloat(e.target.value) || 0)
                    }
                    className="w-24"
                  />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

**Історія прайсу:**
```tsx
export const PriceHistory: React.FC<{ history: any[] }> = ({ history }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Дата</TableHead>
          <TableHead>Дії</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{formatDate(item.updated_at)}</TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Завантажити цю версію */}}
              >
                Переглянути
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Відновити версію */}}
              >
                Відновити
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

---

### Експорт в Excel

**Бібліотека:**
```json
{
  "dependencies": {
    "exceljs": "^4.4.0",        // сервер
    "file-saver": "^2.0.5"       // клієнт
  }
}
```

**Server endpoint:**
```javascript
// GET /api/rack-sets/:id/export
export const exportRackSet = async (req, res, next) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Комплект стелажів');
    
    // Заголовки
    worksheet.columns = [
      { header: 'Назва', key: 'name', width: 30 },
      { header: 'Кількість', key: 'amount', width: 15 },
      { header: 'Ціна', key: 'price', width: 15 },
      { header: 'Загальна', key: 'total', width: 15 },
    ];
    
    // Дані
    rackSet.racks.forEach(rack => {
      rack.components.forEach(comp => {
        worksheet.addRow(comp);
      });
    });
    
    // Відправка файлу
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${rackSet.name}.xlsx"`
    );
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
```

**Client:**
```tsx
const handleExport = async (rackSetId) => {
  const response = await fetch(`/api/rack-sets/${rackSetId}/export`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const blob = await response.blob();
  saveAs(blob, `${rackSetName}.xlsx`);
};
```

---

### Історія змін комплектів (Ревізії)

**Таблиця ревізій:**
```sql
CREATE TABLE rack_set_revisions (
  id INTEGER PRIMARY KEY,
  rack_set_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  racks JSON NOT NULL,
  total_cost REAL,
  change_type TEXT CHECK(change_type IN ('create', 'update', 'delete')),
  change_description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rack_set_id) REFERENCES rack_sets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_revisions_rack_set_id ON rack_set_revisions(rack_set_id);
CREATE INDEX idx_revisions_created_at ON rack_set_revisions(created_at);
```

**Flow:**
1. Створення комплекту → запис в `rack_sets` + ревізія `change_type='create'`
2. Оновлення → оновлення `rack_sets` + нова ревізія `change_type='update'`
3. Перегляд історії → `SELECT * FROM rack_set_revisions WHERE rack_set_id = ? ORDER BY created_at DESC`

**UI перегляду історії:**
```tsx
export const RackSetHistory: React.FC<{ rackSetId: number }> = ({ rackSetId }) => {
  const { data: revisions } = useQuery({
    queryKey: ['rackSet', rackSetId, 'revisions'],
    queryFn: () => rackSetsApi.getRevisions(rackSetId),
  });
  
  return (
    <Timeline>
      {revisions?.map((rev) => (
        <TimelineItem
          key={rev.id}
          date={rev.created_at}
          user={rev.user_email}
          type={rev.change_type}
          description={rev.change_description}
        />
      ))}
    </Timeline>
  );
};
```

---

## 📝 Технічні нотатки

### REST API Endpoints (повний список)

#### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Реєстрація (перевірка домену) | ❌ |
| POST | `/api/auth/login` | Вхід | ❌ |
| POST | `/api/auth/logout` | Вихід (revoke token) | ✅ |
| POST | `/api/auth/refresh` | Оновлення access token | ❌ |
| POST | `/api/auth/verify-email` | Підтвердження email | ❌ |
| GET | `/api/auth/me` | Поточний користувач | ✅ |
| POST | `/api/auth/admin/create-user` | Створення користувача адміном | ✅ Admin |

#### Users (Admin only)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users` | Список користувачів | ✅ Admin |
| GET | `/api/users/:id` | Отримати користувача | ✅ Admin |
| PUT | `/api/users/:id` | Оновити користувача | ✅ Admin |
| DELETE | `/api/users/:id` | Видалити користувача | ✅ Admin |
| GET | `/api/users/:id/revisions` | Історія змін користувача | ✅ Admin |

#### Price

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/price` | Отримати прайс (фільтрований за ролями) | ✅ |
| GET | `/api/price/admin` | Отримати прайс + історію (admin) | ✅ Admin |
| PUT | `/api/price/admin` | Оновити прайс (admin) | ✅ Admin |
| POST | `/api/price/upload` | Завантажити з файлу (admin) | ✅ Admin |
| POST | `/api/price/restore/:id` | Відновити версію прайсу (admin) | ✅ Admin |

#### Rack Calculations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/rack/calculate` | Розрахунок стелажа | ✅ |
| POST | `/api/rack/calculate-batch` | Масовий розрахунок | ✅ |

#### Battery Calculations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/battery/calculate` | Розрахунок стелажа по батареї | ✅ |
| POST | `/api/battery/find-best` | Підбір найкращого варіанту | ✅ |

#### Rack Sets

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/rack-sets` | Список комплектів (фільтрований) | ✅ |
| POST | `/api/rack-sets` | Зберегти ��омплект | ✅ |
| GET | `/api/rack-sets/:id` | Отримати комплект | ✅ |
| PUT | `/api/rack-sets/:id` | Оновити комп��ект | ✅ |
| DELETE | `/api/rack-sets/:id` | В��далит�� комплект | ✅ |
| GET | `/api/rack-sets/:id/revisions` | Історія ревізій | ✅ |
| GET | `/api/rack-sets/:id/export` | Експорт в Excel | ✅ |
| POST | `/api/rack-sets/:id/restore` | Відновити з ревізії | ✅ |

#### Audit (Admin only)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/audit` | Список аудит записів | ✅ Admin |
| GET | `/api/audit/:id` | Деталі аудиту запису | ✅ Admin |

---

### Безпека

- Паролі хешуються через `bcryptjs`
- JWT токен з експірацією
- CORS обмеження за доменом
- Rate limiting для API
- Helmet для security headers

### Перевірка домену при реєстрації

```javascript
const ALLOWED_DOMAIN = '@accu-energo.com.ua';

const validateEmail = (email) => {
  return email.endsWith(ALLOWED_DOMAIN);
};
```

### Адмін за замовчуванням

Перший зареєстрований користувач автоматично отримує роль `admin`.

```javascript
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
const role = userCount.count === 0 ? 'admin' : 'other';
```

---

## 📚 Додаткові ресурси

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [SQLite Foreign Keys](https://www.sqlite.org/foreignkeys.html)

---

## 🎯 Додаткові функції (Phase 2)

### Пріоритетні доповнення

#### 1. Шаблони стелажів

**Мета:** Прискорення роботи менеджерів за допомогою готових конфігурацій.

**База даних:**
```sql
CREATE TABLE rack_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  config JSON NOT NULL,
  category TEXT CHECK(category IN ('standard', 'battery', 'custom')),
  is_default BOOLEAN DEFAULT 0,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Індекси
CREATE INDEX idx_templates_category ON rack_templates(category);
CREATE INDEX idx_templates_created_by ON rack_templates(created_by);
```

**Seed дані (стандартні шаблони):**
```javascript
const defaultTemplates = [
  {
    name: 'Стандартний 1-поверховий',
    category: 'standard',
    is_default: true,
    config: {
      floors: 1,
      rows: 2,
      beamsPerRow: 2,
      supports: 'C80',
      spans: [{ item: '2000', quantity: 1 }]
    }
  },
  {
    name: 'Стандартний 2-поверховий',
    category: 'standard',
    is_default: true,
    config: {
      floors: 2,
      rows: 2,
      beamsPerRow: 2,
      supports: 'C100',
      verticalSupports: 'V80',
      spans: [{ item: '2000', quantity: 1 }]
    }
  },
  {
    name: 'Батарейний',
    category: 'battery',
    is_default: true,
    config: {
      floors: 1,
      rows: 1,
      beamsPerRow: 2,
      supports: 'C80',
      spans: [{ item: '1500', quantity: 1 }]
    }
  }
];
```

**API Endpoints:**
```javascript
GET    /api/templates          // Список шаблонів
POST   /api/templates          // Створити шаблон (admin/manager)
GET    /api/templates/:id      // Отримати шаблон
PUT    /api/templates/:id      // Оновити шаблон
DELETE /api/templates/:id      // Видалити шаблон
POST   /api/templates/:id/apply // Застосувати шаблон до розрахунку
```

---

#### 2. Валідація навантаження

**Мета:** Запобігання створенню небезпечних конструкцій.

**Server validation:**
```javascript
// server/src/middleware/validateRackLoad.js
const MAX_LOAD_PER_BEAM = 500; // кг (з прайсу)
const MAX_LOAD_PER_SUPPORT = 2000; // кг

export const validateRackLoad = (req, res, next) => {
  try {
    const { batteries, config } = req.body;
    
    // Розрахунок навантаження
    const totalWeight = batteries.reduce((sum, b) => sum + b.weight, 0);
    const batteriesPerBeam = Math.ceil(batteries.length / config.beamsPerRow);
    const loadPerBeam = batteriesPerBeam * (totalWeight / batteries.length);
    
    // Перевірка навантаження на балку
    if (loadPerBeam > MAX_LOAD_PER_BEAM) {
      return res.status(400).json({
        error: 'Перевищено навантаження на балку',
        details: {
          current: loadPerBeam.toFixed(2),
          max: MAX_LOAD_PER_BEAM,
          suggestion: 'Збільште кількість балок або зменшіть кількість батарей на ярус'
        }
      });
    }
    
    // Перевірка навантаження на опори
    const loadPerSupport = totalWeight / (config.floors * 2);
    if (loadPerSupport > MAX_LOAD_PER_SUPPORT) {
      return res.status(400).json({
        error: 'Перевищено навантаження на опори',
        details: {
          current: loadPerSupport.toFixed(2),
          max: MAX_LOAD_PER_SUPPORT,
          suggestion: 'Додайте додаткові опори або зменшіть кількість поверхів'
        }
      });
    }
    
    req.validation = {
      loadPerBeam: loadPerBeam.toFixed(2),
      loadPerSupport: loadPerSupport.toFixed(2),
      safetyFactor: ((MAX_LOAD_PER_BEAM / loadPerBeam) * 100).toFixed(1) + '%'
    };
    
    next();
  } catch (error) {
    next(error);
  }
};
```

**Response з валідацією:**
```json
{
  "components": {...},
  "totalCost": 15000,
  "validation": {
    "loadPerBeam": "350.00",
    "loadPerSupport": "800.00",
    "safetyFactor": "70.0%",
    "status": "safe"
  }
}
```

---

#### 3. Пошук та фільтри комплектів

**Мета:** Швидкий пошук серед великої кількості комплектів.

**API з фільтрами:**
```javascript
// GET /api/rack-sets?search=назва&object=склад&from=2025-01-01&to=2025-12-31&minCost=1000&maxCost=50000
export const getRackSetsWithFilters = async (req, res, next) => {
  try {
    const {
      search,
      object,
      from,
      to,
      minCost,
      maxCost,
      sortBy = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;
    
    let query = `
      SELECT rs.*, u.email as creator_email
      FROM rack_sets rs
      JOIN users u ON rs.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (rs.name LIKE ? OR rs.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (object) {
      query += ` AND rs.object_name LIKE ?`;
      params.push(`%${object}%`);
    }
    
    if (from) {
      query += ` AND rs.created_at >= ?`;
      params.push(from);
    }
    
    if (to) {
      query += ` AND rs.created_at <= ?`;
      params.push(to);
    }
    
    if (minCost) {
      query += ` AND rs.total_cost >= ?`;
      params.push(minCost);
    }
    
    if (maxCost) {
      query += ` AND rs.total_cost <= ?`;
      params.push(maxCost);
    }
    
    query += ` ORDER BY ${sortBy} ${order}`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);
    
    const db = getDb();
    const rackSets = db.prepare(query).all(...params);
    
    // Отримати загальну кількість
    const countQuery = `SELECT COUNT(*) as total FROM rack_sets WHERE 1=1 ...`;
    const total = db.prepare(countQuery).get(...params.slice(0, -2)).total;
    
    res.json({
      data: rackSets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
```

**UI компонент фільтрів:**
```tsx
export const RackSetFilters: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    object: '',
    dateRange: { from: '', to: '' },
    costRange: { min: 0, max: 100000 },
  });
  
  const { data, isLoading } = useQuery({
    queryKey: ['rack-sets', filters],
    queryFn: () => rackSetsApi.getAll(filters),
  });
  
  return (
    <div>
      <div className="filters-panel bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-4 gap-4">
          <Input
            label="Пошук"
            placeholder="Назва або опис..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          
          <Input
            label="Об'єкт"
            placeholder="Назва об'єкта..."
            value={filters.object}
            onChange={(e) => setFilters({ ...filters, object: e.target.value })}
          />
          
          <DateRangePicker
            label="Період"
            from={filters.dateRange.from}
            to={filters.dateRange.to}
            onChange={(range) => setFilters({ ...filters, dateRange: range })}
          />
          
          <RangeSlider
            label="Вартість"
            min={0}
            max={100000}
            value={[filters.costRange.min, filters.costRange.max]}
            onChange={([min, max]) => setFilters({ ...filters, costRange: { min, max } })}
          />
        </div>
      </div>
      
      <RackSetList data={data?.data} isLoading={isLoading} />
      
      <Pagination
        currentPage={data?.pagination.page}
        totalPages={data?.pagination.totalPages}
        onPageChange={(page) => {/* update filters */}}
      />
    </div>
  );
};
```

---

#### 4. Дашборд адміна

**Мета:** Загальний огляд стану системи.

**API:**
```javascript
// GET /api/admin/stats
export const getAdminStats = async (req, res, next) => {
  try {
    const db = getDb();
    
    const stats = {
      // Користувачі
      totalUsers: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
      newUsersThisWeek: db.prepare(`
        SELECT COUNT(*) as count FROM users 
        WHERE created_at >= datetime('now', '-7 days')
      `).get().count,
      usersByRole: db.prepare(`
        SELECT role, COUNT(*) as count FROM users GROUP BY role
      `).all(),
      
      // Комплекти
      totalRackSets: db.prepare('SELECT COUNT(*) as count FROM rack_sets').get().count,
      newRackSetsThisWeek: db.prepare(`
        SELECT COUNT(*) as count FROM rack_sets 
        WHERE created_at >= datetime('now', '-7 days')
      `).get().count,
      totalValue: db.prepare('SELECT SUM(total_cost) as total FROM rack_sets').get().total || 0,
      
      // Прайс
      priceChangesCount: db.prepare('SELECT COUNT(*) as count FROM prices').get().count,
      lastPriceChange: db.prepare(`
        SELECT updated_at FROM prices ORDER BY id DESC LIMIT 1
      `).get(),
      
      // Активність
      recentActivity: db.prepare(`
        SELECT * FROM audit_log 
        ORDER BY created_at DESC 
        LIMIT 20
      `).all(),
      
      // Топ користувачів
      topUsers: db.prepare(`
        SELECT u.email, COUNT(rs.id) as rack_sets_count
        FROM users u
        LEFT JOIN rack_sets rs ON u.id = rs.user_id
        GROUP BY u.id
        ORDER BY rack_sets_count DESC
        LIMIT 5
      `).all(),
    };
    
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
```

**UI:**
```tsx
export const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getStats,
  });
  
  if (isLoading) return <DashboardSkeleton />;
  
  return (
    <div className="admin-dashboard p-6">
      <h1 className="text-3xl font-bold mb-6">Дашборд</h1>
      
      {/* KPI картки */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Користувачі"
          value={stats.totalUsers}
          change={stats.newUsersThisWeek}
          changeType="increase"
          icon={Users}
        />
        <StatCard
          title="Комплекти"
          value={stats.totalRackSets}
          change={stats.newRackSetsThisWeek}
          changeType="increase"
          icon={Package}
        />
        <StatCard
          title="Загальна вартість"
          value={`${formatCurrency(stats.totalValue)}`}
          icon={DollarSign}
        />
        <StatCard
          title="Змін прайсу"
          value={stats.priceChangesCount}
          lastChange={formatDate(stats.lastPriceChange?.updated_at)}
          icon={TrendingUp}
        />
      </div>
      
      {/* Графіки */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <ChartCard title="Нові комплекти по тижнях">
          <LineChart data={stats.weeklyRackSets} />
        </ChartCard>
        <ChartCard title="Користувачі по ролях">
          <PieChart data={stats.usersByRole} />
        </ChartCard>
      </div>
      
      {/* Топ користувачів */}
      <Card title="Топ користувачів">
        <Table>
          {stats.topUsers.map(user => (
            <TableRow key={user.email}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.rack_sets_count}</TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
      
      {/* Остання активність */}
      <Card title="Остання активність" className="mt-6">
        <ActivityLog activities={stats.recentActivity} />
      </Card>
    </div>
  );
};
```

---

#### 5. Імпорт прайсу з Excel

**Мета:** Спрощення оновлення прайсу адміном.

**Server:**
```javascript
// server/src/controllers/priceController.js
import ExcelJS from 'exceljs';

export const importPriceFromExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не завантажено' });
    }
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    
    const importedData = {
      supports: {},
      spans: {},
      vertical_supports: {},
      diagonal_brace: {},
      isolator: {}
    };
    
    // Обробка кожного аркуша
    workbook.eachSheet((worksheet) => {
      const sheetName = worksheet.name.toLowerCase();
      
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // заголовок
        
        const values = row.values;
        
        if (sheetName.includes('опор') || sheetName.includes('supports')) {
          const [code, edgePrice, intermediatePrice] = values.slice(1, 4);
          importedData.supports[code] = {
            edge: { price: edgePrice || 0 },
            intermediate: { price: intermediatePrice || 0 }
          };
        } else if (sheetName.includes('бал') || sheetName.includes('spans')) {
          const [code, price] = values.slice(1, 3);
          importedData.spans[code] = { price: price || 0 };
        }
        // ... інші категорії
      });
    });
    
    // Валідація
    const errors = validatePriceStructure(importedData);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    // Збереження
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO prices (data) VALUES (?)'
    ).run(JSON.stringify(importedData));
    
    res.json({
      success: true,
      imported: Object.keys(importedData).length,
      priceId: result.lastInsertRowid
    });
  } catch (error) {
    next(error);
  }
};
```

**UI:**
```tsx
export const PriceImport: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadMutation = useMutation({
    mutationFn: priceApi.importFromExcel,
    onSuccess: () => {
      toast.success('Прайс імпортовано');
      queryClient.invalidateQueries(['price']);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.includes('excel') || file.name.endsWith('.xlsx')) {
      uploadMutation.mutate({ file });
    } else {
      toast.error('Будь ласка, виберіть Excel файл (.xlsx)');
    }
  };
  
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <p className="text-lg font-medium mb-2">Перетягніть Excel файл сюди</p>
      <p className="text-sm text-gray-500 mb-4">або</p>
      
      <Button onClick={() => fileInputRef.current?.click()}>
        Обрати файл
      </Button>
      
      <div className="mt-6 text-left">
        <h4 className="font-semibold mb-2">Формат файлу:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Аркуш "Опори": код, крайня ціна, проміжна ціна</li>
          <li>• Аркуш "Балки": код, ціна</li>
          <li>• Аркуш "Верт. стійки": код, ціна</li>
          <li>• Аркуш "Розкоси": код, ціна</li>
          <li>• Аркуш "Ізолятори": код, ціна</li>
        </ul>
      </div>
    </div>
  );
};
```

---

## 📜 Конвенції проєкту

### 1. Іменування змінних та функцій

```javascript
// ✅ Правильно
const MAX_LOAD_PER_BEAM = 500;        // Константи - UPPER_SNAKE_CASE
const calculateRackComponents = () => {}; // Функції - camelCase
const RackPage = () => {};            // React компоненти - PascalCase
const authStore = create(...);        // Stores - camelCase + Store suffix
const useAuth = () => {};             // Custom hooks - use + camelCase

// ❌ Неправильно
const maxLoad = 500;                  // Константи мають бути UPPER_SNAKE_CASE
const calculate_rack = () => {};      // Не використовувати snake_case для функцій
const rackpage = () => {};            // Компоненти мають бути PascalCase
```

---

### 2. Структура файлів

```
✅ Правильно:
server/src/
├── controllers/
│   ├── authController.js
│   └── rackController.js
├── middleware/
│   ├── auth.js
│   └── validateRackLoad.js
└── routes/

client/src/
├── features/
│   ├── auth/
│   │   ├── authStore.ts
│   │   ├── authApi.ts
│   │   └── ProtectedRoute.tsx
│   └── rack/
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   └── UserManagement.tsx
│   └── ...
└── shared/
    ├── components/
    └── hooks/

❌ Неправильно:
server/src/
├── AuthController.js          # Не використовувати PascalCase для файлів
├── auth_controller.js         # Не використовувати snake_case
└── utils/helpers/misc.js      # Уникати глибоких nesting utils
```

---

### 3. Обробка помилок

```javascript
// ✅ Правильно - Server
try {
  const result = await db.prepare(query).get();
  if (!result) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json({ data: result });
} catch (error) {
  logger.error('Database error:', error);
  next(error); // Передаємо в глобальний error handler
}

// ✅ Правильно - Client
const { data, error, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: usersApi.getAll,
  retry: 1,
  onError: (error) => {
    toast.error(error.message || 'Щось пішло не так');
  },
});

if (isLoading) return <Spinner />;
if (error) return <ErrorState error={error} />;
if (!data) return <EmptyState />;

// ❌ Неправильно
try {
  const data = await fetch('/api/users');
  return data; // Немає обробки помилок
} catch (e) {
  console.log(e); // Тільки лог, без дій
}
```

---

### 4. API Response формат

```javascript
// ✅ Правильно - Успішна відповідь
{
  "data": {...},           // Основні дані
  "meta": {                // Мета-інформація (опціонально)
    "page": 1,
    "total": 100
  }
}

// ✅ Правильно - Помилка
{
  "error": "Invalid credentials",
  "message": "Email або пароль невірні",
  "code": "AUTH_INVALID_CREDENTIALS"  // Машинний код помилки
}

// ✅ Правильно - Валідація помилок
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Невірний формат email"
    },
    {
      "field": "password",
      "message": "Пароль має бути не менше 6 символів"
    }
  ]
}

// ❌ Неправильно
{ "success": true, "result": {...} }  // Зайве поле success
{ "error": true }                      // Недостатньо інформації
```

---

### 5. Робота з базою даних

```javascript
// ✅ Правильно - Використання prepared statements
const db = getDb();
const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

// ✅ Правильно - Транзакції для атомарних операцій
const insertUser = db.transaction((email, passwordHash) => {
  const user = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
    .run(email, passwordHash);
  db.prepare('INSERT INTO audit_log (...) VALUES (...)').run(...);
  return user;
});

// ✅ Правильно - Foreign keys увімкнені
db.pragma('foreign_keys = ON');

// ❌ Неправильно - SQL injection ризик
db.exec(`SELECT * FROM users WHERE email = '${email}'`);

// ❌ Неправильно - Ігнорування foreign keys
db.exec('PRAGMA foreign_keys = OFF');
```

---

### 6. Безпека

```javascript
// ✅ Правильно - Hash паролів
const passwordHash = await bcrypt.hash(password, 12); // 12 раундів
const valid = await bcrypt.compare(password, hash);

// ✅ Правильно - JWT з expiration
const token = jwt.sign(
  { userId, email, role },
  process.env.JWT_SECRET,
  { expiresIn: '15m' } // Access token
);

// ✅ Правильно - Refresh token в httpOnly cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 днів
});

// ✅ Правильно - Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 100 // 100 запитів
});

// ❌ Неправильно
res.cookie('token', token); // Missing httpOnly, secure
const token = jwt.sign({ userId }, 'secret'); // Hardcoded secret
```

---

### 7. TypeScript типи

```typescript
// ✅ Правильно - Інтерфейси для API відповідей
interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    total: number;
  };
}

interface User {
  id: number;
  email: string;
  role: 'admin' | 'manager' | 'other';
  permissions?: PricePermissions;
}

interface PricePermissions {
  price_types: PriceType[];
}

type PriceType = 'без_ізоляторів' | 'загальна' | 'нульова' | 'собівартість';

// ✅ Правильно - Typed hooks
const { data, isLoading } = useQuery<User[]>({
  queryKey: ['users'],
  queryFn: usersApi.getAll,
});

// ❌ Неправильно
const { data } = useQuery({ // Any type
  queryKey: ['users'],
  queryFn: getUsers,
});
```

---

### 8. Git conventions

```bash
# ✅ Правильно - Conventional Commits
git commit -m "feat: додати шаблони стелажів"
git commit -m "fix: виправити розрахунок навантаження на балки"
git commit -m "docs: оновити README з прикладами API"
git commit -m "refactor: винести валідацію в окремий middleware"
git commit -m "test: додати тести для auth controller"
git commit -m "chore: оновити залежності"

# Типи комітів:
# feat     - Нова функціональність
# fix      - Виправлення багів
# docs     - Зміни в документації
# style    - Форматування, відступи (не впливає на логіку)
# refactor - Рефакторинг коду
# test     - Додавання тестів
# chore    - Зміни в збірці, залежностях, конфігураціях

# ❌ Неправильно
git commit -m "fix bug"
git commit -m "updated code"
git commit -m "changes"
```

---

### 9. Testing conventions

```javascript
// ✅ Правильно - Опис тестів
describe('Auth Controller', () => {
  describe('POST /api/auth/login', () => {
    it('should return token for valid credentials', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'password123' };
      
      // Act
      const response = await request(app).post('/api/auth/login').send(credentials);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
    
    it('should return 401 for invalid credentials', async () => {
      // ...
    });
  });
});

// ✅ Правильно - Test file naming
// server/tests/controllers/authController.test.js
// client/src/features/auth/__tests__/authStore.test.ts

// ❌ Неправильно
describe('login test', () => { // Занадто загальний опис
  it('should work', () => { // Непотрібно зрозуміло що тестується
});
```

---

### 10. Environment variables

```bash
# ✅ Правильно - .env.example
NODE_ENV=development
PORT=3001
DB_PATH=./data/rack_calculator.db

# Auth
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d

# Email (для підтвердження)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
EMAIL_FROM=noreply@example.com

# CORS
CORS_ORIGIN=http://localhost:3000

# File upload
MAX_FILE_SIZE=10485760  # 10MB

# ❌ Неправильно - .env (не має бути в git)
# Ніколи не комітьте реальні .env файли!
```

---

### 11. Code organization rules

```javascript
// ✅ Правильно - Єдине джерело істини для типів
// shared/types.js
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OTHER: 'other',
};

export const PRICE_TYPES = {
  NO_ISOLATORS: 'без_ізоляторів',
  RETAIL: 'загальна',
  ZERO: 'нульова',
  COST: 'собівартість',
  WHOLESALE: 'оптова',
};

// Використання в коді
if (user.role === USER_ROLES.ADMIN) { ... }

// ❌ Неправильно - Hardcoded strings
if (user.role === 'admin') { ... } // Magic string
```

---

### 12. Documentation

```javascript
// ✅ Правильно - JSDoc для функцій
/**
 * Розрахунок компонентів стелажа
 * @param {RackConfig} config - Конфігурація стелажа
 * @param {PriceData} price - Дані прайсу
 * @returns {RackComponents} Об'єкт з компонентами
 * @throws {ValidationError} Якщо конфігурація невірна
 */
export const calculateRackComponents = (config, price) => {
  // ...
};

// ✅ Правильно - Коментарі для складної логіки
// Формула розкосів: (прольоти - 1) × 2 + 2
// Пояснення: кожен проліт має 2 розкоси, мінус 1 спільний + 2 крайні
const bracesPerSide = totalSpans > 1 ? (totalSpans - 1) * 2 + 2 : 2;

// ❌ Неправильно - Коментарі що описують що робить код
// Присвоює x значення 5
x = 5;

// ❌ Неправильно - Відсутність коментарів для складної логіки
const result = data.reduce((acc, item) => {
  const val = item.price * item.quantity * (1 - item.discount / 100);
  return acc + val - (val * 0.18);
}, 0);
// Що це? ПДВ? Знижка?
```
