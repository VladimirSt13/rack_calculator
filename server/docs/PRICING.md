# 💰 Фільтрація цін за ролями

**Дата:** 7 березня 2026

---

## 📋 Огляд

Система фільтрації цін забезпечує:
- ✅ Сервер повертає **тільки дозволені ціни** для ролі
- ✅ Клієнт відображає **назву ціни + значення**
- ✅ Повна конфігурація через адмін-панель

---

## 🏗️ Архітектура

### Server

#### Controllers
```javascript
// rackController.js, batteryController.js
const formatResultWithPermissions = (components, totalCost, totalWithoutIsolators, permissions) => {
  const result = {
    components: {},
    prices: [], // Масив дозволених цін
  };

  // Фільтрація компонентів
  for (const [type, items] of Object.entries(components)) {
    result.components[type] = itemsArray.map((item) => ({
      name: item.name,
      amount: item.amount,
      price: permissions.price_types?.includes('загальна') ? item.price : null,
      total: permissions.price_types?.includes('загальна') ? item.total : null,
    }));
  }

  // Додавання дозволених типів цін
  if (permissions.price_types?.includes('без_ізоляторів')) {
    result.prices.push({
      type: 'без_ізоляторів',
      label: 'Без ізоляторів',
      value: totalWithoutIsolators,
    });
  }

  // ... інші типи цін

  return result;
};
```

### Client

#### Відображення цін
```tsx
// BatteryResults.tsx
{variant.prices?.map((price) => (
  <div key={price.type}>
    <span className='text-muted-foreground'>{price.label}: </span>
    <span className='font-medium'>
      {price.value.toLocaleString('uk-UA')} ₴
    </span>
  </div>
))}
```

---

## 📊 Формат відповіді API

### Приклад: Admin (всі ціни)

```json
{
  "name": "Стелаж двоповерховий двохрядний L2A2-4000/80",
  "components": {
    "supports": [
      {
        "name": "Опора C80 (крайня)",
        "amount": 4,
        "price": 930,
        "total": 3720
      }
    ],
    "beams": [
      {
        "name": "Балка 2000",
        "amount": 8,
        "price": 790,
        "total": 6320
      }
    ]
  },
  "prices": [
    {
      "type": "без_ізоляторів",
      "label": "Без ізоляторів",
      "value": 13500
    },
    {
      "type": "загальна",
      "label": "Загальна",
      "value": 15000
    },
    {
      "type": "нульова",
      "label": "Нульова",
      "value": 0
    },
    {
      "type": "собівартість",
      "label": "Собівартість",
      "value": 10500
    },
    {
      "type": "оптова",
      "label": "Оптова",
      "value": 12750
    }
  ]
}
```

### Приклад: Manager (тільки нульова)

```json
{
  "name": "Стелаж одноповерховий...",
  "components": {
    "supports": [
      {
        "name": "Опора C80 (крайня)",
        "amount": 4,
        "price": null,
        "total": null
      }
    ]
  },
  "prices": [
    {
      "type": "нульова",
      "label": "Нульова",
      "value": 0
    }
  ]
}
```

### Приклад: User (немає доступу)

```json
{
  "name": "Стелаж...",
  "components": {
    "supports": [
      {
        "name": "Опора C80 (крайня)",
        "amount": 4,
        "price": null,
        "total": null
      }
    ]
  },
  "prices": []
}
```

---

## 🔐 Типи цін

### Доступні типи

| Ключ | Label | Опис |
|------|-------|------|
| `без_ізоляторів` | Без ізоляторів | Вартість без ізоляторів |
| `загальна` | Загальна | Роздрібна ціна |
| `нульова` | Нульова | Нульова ціна (0) |
| `собівартість` | Собівартість | Собівартість (70% від загальної) |
| `оптова` | Оптова | Оптова ціна (85% від загальної) |

### Формули розрахунку

```javascript
// Без ізоляторів
value = totalWithoutIsolators

// Загальна
value = totalCost

// Нульова
value = 0

// Собівартість
value = totalCost * 0.7

// Оптова
value = totalCost * 0.85
```

---

## 🎭 Ролі та дозволи

### Admin
```json
{
  "price_types": [
    "без_ізоляторів",
    "загальна",
    "нульова",
    "собівартість",
    "оптова"
  ]
}
```

**Відповідь:** 5 типів цін

### Manager
```json
{
  "price_types": ["нульова"]
}
```

**Відповідь:** 1 тип ціни

### User
```json
{
  "price_types": []
}
```

**Відповідь:** 0 типів цін

---

## 🛠️ API Endpoints

### POST /api/rack/calculate

**Request:**
```json
{
  "floors": 2,
  "rows": 2,
  "beamsPerRow": 2,
  "supports": "C80",
  "spans": [{"item": "2000", "quantity": 1}]
}
```

**Response (Admin):**
```json
{
  "name": "Стелаж...",
  "components": {...},
  "prices": [
    {"type": "без_ізоляторів", "label": "Без ізоляторів", "value": 14000},
    {"type": "загальна", "label": "Загальна", "value": 15000},
    {"type": "нульова", "label": "Нульова", "value": 0}
  ]
}
```

### POST /api/battery/calculate

**Request:**
```json
{
  "batteryDimensions": {"length": 300, "width": 200, "height": 250},
  "weight": 50,
  "quantity": 10,
  "config": {...}
}
```

**Response (Manager):**
```json
{
  "name": "L1A2-1500/80...",
  "components": {...},
  "prices": [
    {"type": "нульова", "label": "Нульова", "value": 0}
  ]
}
```

---

## 📱 Client Integration

### Типи даних

```typescript
interface PriceInfo {
  type: string;      // 'без_ізоляторів', 'загальна'...
  label: string;     // 'Без ізоляторів', 'Загальна'...
  value: number;     // 14000, 15000, 0...
}

interface BatteryVariant {
  name: string;
  components: {...};
  prices?: PriceInfo[];
  // ...
}
```

### Компонент відображення

```tsx
interface PriceListProps {
  prices: PriceInfo[];
}

export const PriceList: React.FC<PriceListProps> = ({ prices }) => {
  return (
    <div className='space-y-2'>
      {prices.map((price) => (
        <div key={price.type} className='flex justify-between items-center'>
          <span className='text-sm text-muted-foreground'>
            {price.label}
          </span>
          <span className='text-sm font-medium tabular-nums'>
            {price.value.toLocaleString('uk-UA', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} ₴
          </span>
        </div>
      ))}
    </div>
  );
};
```

---

## 🧪 Тестування

### 1. Admin - всі ціни

```bash
# Логін як адмін
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vs.com","password":"P@ssw0rd13"}'

# Розрахунок
curl -X POST http://localhost:3001/api/rack/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"floors":2,"rows":2,"beamsPerRow":2,"supports":"C80","spans":[{"item":"2000","quantity":1}]}'
```

**Очікується:** 5 типів цін у відповіді

---

### 2. Manager - тільки нульова

```bash
# Логін як менеджер
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@test.com","password":"123456"}'

# Розрахунок
curl -X POST http://localhost:3001/api/rack/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -d '{"floors":1,"rows":2,"beamsPerRow":2,"supports":"C80","spans":[{"item":"1500","quantity":2}]}'
```

**Очікується:** 1 тип ціни (нульова)

---

### 3. User - немає доступу

```bash
# Логін як user
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"123456"}'

# Розрахунок
curl -X POST http://localhost:3001/api/rack/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{"floors":1,"rows":2,"beamsPerRow":2,"supports":"C80","spans":[{"item":"1500","quantity":2}]}'
```

**Очікується:** 0 типів цін (пустий масив)

---

## 🔧 Конфігурація

### Зміна дозволів ролі

```bash
# Оновити дозволи для ролі manager
curl -X PUT http://localhost:3001/api/roles/manager/price-types \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"price_types": ["нульова", "загальна"]}'
```

**Очікується:** Manager тепер бачить 2 типи цін

---

## 📝 Файли

### Server
- [`server/src/controllers/rackController.js`](../server/src/controllers/rackController.js) - `formatResultWithPermissions`
- [`server/src/controllers/batteryController.js`](../server/src/controllers/batteryController.js) - `formatResultWithPermissions`
- [`server/src/helpers/roles.js`](../server/src/helpers/roles.js) - `getUserPermissions`

### Client
- [`client/src/features/battery/resultsStore.ts`](../client/src/features/battery/resultsStore.ts) - `PriceInfo` тип
- [`client/src/features/battery/components/BatteryResults.tsx`](../client/src/features/battery/components/BatteryResults.tsx) - відображення цін

---

## ✅ Checklist

- [x] Сервер фільтрує ціни за permissions
- [x] Відповідь містить масив `prices` з `type`, `label`, `value`
- [x] Клієнт відображає назву ціни + значення
- [x] Компоненти фільтрують ціни (null для заборонених)
- [x] Типи даних TypeScript оновлені
- [x] Тестування проведено

---

## 🔗 Посилання

- [ROLES_AND_PERMISSIONS.md](./ROLES_AND_PERMISSIONS.md) - Ролі та дозволи
- [ARCHITECTURE_ROLES.md](./ARCHITECTURE_ROLES.md) - Архітектура ролей
