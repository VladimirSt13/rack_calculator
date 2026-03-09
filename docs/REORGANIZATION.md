# 📁 Реорганізація документації

**Дата:** 9 березня 2026
**Статус:** ✅ Завершено

---

## 📋 Зміни

### 1. Створено папку `/docs`

Всі службові MD файли переміщено в окрему папку `docs/` для кращої організації.

### 2. Переміщені файли

З **кореня проєкту** в **docs/**:
- ✅ `AUDIT_REPORT.md` → `docs/AUDIT_REPORT.md`
- ✅ `BATTERY_PAGE_AUDIT.md` → `docs/BATTERY_PAGE_AUDIT.md`
- ✅ `CLIENT_AUDIT.md` → `docs/CLIENT_AUDIT.md`
- ✅ `CONVENTIONS.md` → `docs/CONVENTIONS.md`
- ✅ `DB_NORMALIZATION_AUDIT.md` → `docs/DB_NORMALIZATION_AUDIT.md`
- ✅ `EXPORT_FIX.md` → `docs/EXPORT_FIX.md`

### 3. Розділено план модернізації

Створено два нові файли в **корені проєкту**:
- ✅ `plan-server.md` - План розробки: Серверна частина
- ✅ `plan-client.md` - План розробки: Клієнтська частина

### 4. Оновлено README.md

Всі посилання в `README.md` оновлено для відповідності новій структурі.

---

## 📁 Нова структура

```
rack_calculator/
├── docs/                      # ← НОВА ПАПКА
│   ├── .gitkeep
│   ├── AUDIT_REPORT.md
│   ├── BATTERY_PAGE_AUDIT.md
│   ├── CLIENT_AUDIT.md
│   ├── CONVENTIONS.md
│   ├── DB_NORMALIZATION_AUDIT.md
│   └── EXPORT_FIX.md
│
├── plan-server.md             # ← НОВИЙ (серверний план)
├── plan-client.md             # ← НОВИЙ (клієнтський план)
├── README.md                  # ← ОНОВЛЕНО
│
├── MODERNIZATION_PLAN.md      # ⚠️ ВИДАЛИТИ (замінено на plan-server.md + plan-client.md)
├── PROJECT_STATUS.md          # ⚠️ ВИДАЛИТИ (інформація в plan-*.md)
├── AUDIT_REPORT.md            # ⚠️ ВИДАЛИТИ (переміщено в docs/)
├── BATTERY_PAGE_AUDIT.md      # ⚠️ ВИДАЛИТИ (переміщено в docs/)
├── CLIENT_AUDIT.md            # ⚠️ ВИДАЛИТИ (переміщено в docs/)
├── CONVENTIONS.md             # ⚠️ ВИДАЛИТИ (переміщено в docs/)
├── DB_NORMALIZATION_AUDIT.md  # ⚠️ ВИДАЛИТИ (переміщено в docs/)
└── EXPORT_FIX.md              # ⚠️ ВИДАЛИТИ (переміщено в docs/)
```

---

## ⚠️ Необхідні дії

### Видаліть старі файли з кореня проєкту:

```bash
# PowerShell
Remove-Item .\MODERNIZATION_PLAN.md
Remove-Item .\PROJECT_STATUS.md
Remove-Item .\AUDIT_REPORT.md
Remove-Item .\BATTERY_PAGE_AUDIT.md
Remove-Item .\CLIENT_AUDIT.md
Remove-Item .\CONVENTIONS.md
Remove-Item .\DB_NORMALIZATION_AUDIT.md
Remove-Item .\EXPORT_FIX.md
```

Або видаліть їх вручну через File Explorer.

---

## 📚 Актуальна документація

### Плани розробки
- **plan-server.md** - Серверна частина (API, БД, міграції, аудит)
- **plan-client.md** - Клієнтська частина (React, компоненти, UX)

### Технічна документація (docs/)
- **CONVENTIONS.md** - Конвенції проєкту
- **AUDIT_REPORT.md** - Аудит відповідності конвенціям
- **CLIENT_AUDIT.md** - Аналіз клієнтської частини
- **EXPORT_FIX.md** - Виправлення експорту комплектів
- **DB_NORMALIZATION_AUDIT.md** - Нормалізація бази даних
- **BATTERY_PAGE_AUDIT.md** - Аудит Battery сторінки

### Server docs (server/docs/)
- ROLES_AND_PERMISSIONS.md
- PRICING.md
- MIGRATIONS_GUIDE.md
- PASSWORD_RESET.md
- AUDIT_MANAGEMENT.md

### Client docs (client/docs/)
- ROUTES.md
- STAGE_3_COMPLETE.md

---

## ✅ Переваги нової структури

1. **Чистіший корінь проєкту** - менше службових файлів
2. **Краща організація** - вся технічна документація в одному місці
3. **Розділені плани** - сервер і клієнт мають окремі плани розробки
4. **Легша навігація** - зрозуміла структура документації

---

**Реорганізацію виконано:** 9 березня 2026
**Статус:** ✅ Завершено (очікується видалення старих файлів)
