import { type ClassValue, clsx } from "clsx";

/**
 * Об'єднує Tailwind класи з розумним merge
 *
 * @param inputs - Список класів для об'єднання
 * @returns Об'єднаний рядок класів
 *
 * @example
 * ```tsx
 * // Базове використання
 * <div className={cn('bg-red-500', 'text-white')} />
 *
 * // Умовні класи
 * <div className={cn(
 *   'base-class',
 *   isActive && 'active-class',
 *   isError ? 'error-class' : 'success-class'
 * )} />
 *
 * // Масиви класів
 * <div className={cn(['class-1', 'class-2'])} />
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Форматує число у валютний формат
 *
 * @param value - Число для форматування
 * @param currency - Валюта (за замовчуванням 'UAH')
 * @returns Відформатований рядок
 *
 * @example
 * ```typescript
 * formatCurrency(1500.50); // "1 500,50 ₴"
 * formatCurrency(1500.50, 'USD'); // "1 500,50 $"
 * ```
 */
export function formatCurrency(
  value: number,
  currency: string = "UAH",
): string {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Форматує дату у локальний формат
 *
 * @param date - Дата для форматування
 * @param options - Опції форматування
 * @returns Відформатований рядок дати
 *
 * @example
 * ```typescript
 * formatDate(new Date()); // "08.03.2026"
 * formatDate(new Date(), { year: 'numeric', month: 'long' }); // "березень 2026"
 * ```
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  return new Intl.DateTimeFormat("uk-UA", options || defaultOptions).format(
    dateObj,
  );
}

/**
 * Форматує дату та час
 *
 * @param date - Дата для форматування
 * @returns Відформатований рядок з часом
 *
 * @example
 * ```typescript
 * formatDateTime(new Date()); // "08.03.2026, 14:30"
 * ```
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

/**
 * Перевіряє чи email має правильний формат
 *
 * @param email - Email для перевірки
 * @returns true якщо email валідний
 *
 * @example
 * ```typescript
 * isValidEmail('user@example.com'); // true
 * isValidEmail('invalid-email'); // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Перевіряє чи пароль відповідає вимогам безпеки
 *
 * @param password - Пароль для перевірки
 * @returns Об'єкт з результатами перевірки
 *
 * @requirements
 * - Мінімум 8 символів
 * - Хоча б одна велика літера
 * - Хоча б одна мала літера
 * - Хоча б одна цифра
 *
 * @example
 * ```typescript
 * validatePassword('weak'); // { valid: false, errors: ['too_short', ...] }
 * validatePassword('Strong123'); // { valid: true, errors: [] }
 * ```
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("too_short");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("no_uppercase");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("no_lowercase");
  }
  if (!/\d/.test(password)) {
    errors.push("no_digit");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Обрізає рядок до вказаної довжини з додаванням ...
 *
 * @param text - Текст для обрізання
 * @param maxLength - Максимальна довжина
 * @returns Обрізаний текст
 *
 * @example
 * ```typescript
 * truncate('Дуже довгий текст', 10); // "Дуже дов..."
 * truncate('Короткий', 20); // "Короткий"
 * ```
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Генерує випадковий ID
 *
 * @param length - Довжина ID (за замовчуванням 8)
 * @returns Випадковий рядок
 *
 * @example
 * ```typescript
 * generateId(); // "a1b2c3d4"
 * generateId(16); // "a1b2c3d4e5f6g7h8"
 * ```
 */
export function generateId(length: number = 8): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Затримка виконання (sleep)
 *
 * @param ms - Час затримки в мілісекундах
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await sleep(1000); // Затримка 1 секунда
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce функція - відкладає виклик функції після останнього виклику
 *
 * @param func - Функція для виклику
 * @param wait - Час очікування в мілісекундах
 * @returns Debounced функція
 *
 * @example
 * ```typescript
 * const search = debounce((query) => {
 *   api.search(query);
 * }, 300);
 *
 * // Викличе api.search через 300ms після останнього введення
 * search('query1');
 * search('query2'); // Попередній виклик скасовано
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle функція - обмежує частоту викликів функції
 *
 * @param func - Функція для виклику
 * @param limit - Мінімальний інтервал між викликами в мс
 * @returns Throttled функція
 *
 * @example
 * ```typescript
 * const handleScroll = throttle(() => {
 *   updatePosition();
 * }, 100);
 *
 * // Викличе updatePosition не частіше ніж раз на 100ms
 * window.addEventListener('scroll', handleScroll);
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Глибоке порівняння двох об'єктів
 *
 * @param obj1 - Перший об'єкт
 * @param obj2 - Другий об'єкт
 * @returns true якщо об'єкти рівні
 *
 * @example
 * ```typescript
 * deepEqual({ a: 1 }, { a: 1 }); // true
 * deepEqual({ a: 1 }, { a: 2 }); // false
 * deepEqual({ a: { b: 1 } }, { a: { b: 1 } }); // true
 * ```
 */
export function deepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1) as Array<keyof typeof obj1>;
  const keys2 = Object.keys(obj2) as Array<keyof typeof obj2>;

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}
