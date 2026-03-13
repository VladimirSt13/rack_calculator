# Рефакторинг: Универсальные компоненты SetCard и SetModal

## Дата: 12 марта 2026 г.

## Проблема

Дублирование кода между Battery и Rack страницами:

| Компонент | Battery | Rack | Дублирование |
|-----------|---------|------|--------------|
| **SetCard** | `BatterySetCard.tsx` | `RackSetCard.tsx` | ~90% |
| **SetModal** | `BatterySetModal.tsx` | `RackSetModal.tsx` | ~95% |
| **ModalContent** | `BatterySetModalContent.tsx` | `RackSetModalContent.tsx` | ~80% |
| **useSetModal** | `useBatterySetModal.ts` | `useRackSetModal.ts` | ~95% |

---

## Решение

Созданы универсальные компоненты в `shared/`:

### 1. `SetCard` — универсальная карточка комплекта

**Путь:** `client/src/shared/components/SetCard.tsx`

**Особенности:**
- Дженерик-тип `T extends BaseSetItem`
- Пропсы для кастомизации:
  - `priceConfig` — конфигурация цен
  - `getPrimaryPrice` — функция получения основной цены
  - `renderSummary` — кастомный рендер подытогов
  - `renderExtraColumns` — дополнительные колонки в таблице
  - `modalComponent` — компонент модального окна

**Пример использования:**
```tsx
<SetCard<BatterySetItem>
  title="Комплект стелажів"
  racks={racks}
  removeRack={removeRack}
  updateRackQuantity={updateRackQuantity}
  clear={clear}
  priceConfig={priceConfig}
  getPrimaryPrice={getZeroPrice}
  modalComponent={<BatterySetModal racks={racks} />}
/>
```

---

### 2. `SetModalContent` — универсальное модальное окно

**Путь:** `client/src/shared/components/SetModalContent.tsx`

**Особенности:**
- Дженерик-тип `T extends BaseSetItemWithPrices`
- Пропсы для кастомизации:
  - `dialogTitle` — заголовок диалога
  - `namePlaceholder`, `objectNamePlaceholder` — плейсхолдеры полей
  - `renderSetContent` — кастомный рендер содержимого комплекта
  - `submitButtonText`, `exportButtonText` — текст кнопок

**Пример использования:**
```tsx
<SetModalContent<RackSetItem>
  isOpen={isOpen}
  onClose={onClose}
  form={form}
  includePrices={includePrices}
  setIncludePrices={setIncludePrices}
  isExporting={isExporting}
  isPending={createMutation.isPending}
  onSubmit={onSubmit}
  handleExport={handleExport}
  groupedRacks={groupedRacks}
  totalCost={totalCost}
  hasRacks={racks.length > 0}
  dialogTitle="Зберегти комплект стелажів"
  renderSetContent={renderSetContent}
/>
```

---

### 3. `useSetModal` — универсальный хук

**Путь:** `client/src/shared/hooks/useSetModal.ts`

**Особенности:**
- Дженерик-тип `T extends BaseSetItemWithPrices`
- Пропсы для кастомизации:
  - `schema` — схема валидации формы (zod)
  - `getPriceForTotal` — функция расчёта общей стоимости
  - `clearSetStore` — очистка store комплекта
  - `clearResultsStore` — очистка store результатов

**Пример использования:**
```tsx
export const useBatterySetModal = ({ isOpen, onClose, racks }) => {
  return useSetModal<BatterySetItem>({
    isOpen,
    onClose,
    racks,
    schema: defaultBatterySetSchema,
    getPriceForTotal: (rack) => rack.prices?.find(p => p.type === 'нульова')?.value || 0,
    clearSetStore: () => useBatterySetStore.getState().clear(),
    clearResultsStore: () => useBatteryResultsStore.getState().clear(),
  });
};
```

---

## Обновлённые файлы

### Battery (упрощены)

| Файл | Было строк | Стало строк | Изменение |
|------|------------|-------------|-----------|
| `BatterySetCard.tsx` | 107 | 36 | -66% |
| `BatterySetModal.tsx` | 51 | 53 | +2 (но проще) |
| `useBatterySetModal.ts` | 153 | 62 | -59% |
| ~~`BatterySetModalContent.tsx`~~ | 203 | **удалён** | ✅ |

### Rack (упрощены)

| Файл | Было строк | Стало строк | Изменение |
|------|------------|-------------|-----------|
| `RackSetCard.tsx` | 167 | 90 | -46% |
| `RackSetModal.tsx` | 51 | 161 | +215 (но с кастомным рендером) |
| `useRackSetModal.ts` | 134 | 62 | -54% |
| ~~`RackSetModalContent.tsx`~~ | 212 | **удалён** | ✅ |

---

## Итог

**Удалено дублирования:**
- ~400 строк повторяющегося кода
- 2 файла удалены
- 4 файла значительно упрощены

**Добавлено:**
- 3 универсальных компонента/хука
- Гибкая система кастомизации через пропсы
- Типобезопасность через дженерики

**Выигрыш:**
- Легче поддерживать
- Легче добавлять новые типы комплектов
- Меньше багов из-за рассинхронизации

---

## Будущие улучшения

1. **Экспорт в разные форматы** — добавить пропсы для разных форматов экспорта (админ/менеджер)
2. **Ролевая модель** — разные конфигурации для разных ролей
3. **Расширенные типы цен** — поддержка большего количества типов цен

---

## Примечания

- `notes.md` не трогать! 🚫
- Старые файлы `*ModalContent.tsx` удалены
- Экспорты добавлены в `shared/components/index.ts` и `shared/hooks/index.ts`
