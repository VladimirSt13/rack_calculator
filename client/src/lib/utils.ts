import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function for combining class names
 * Аналог cn() з shadcn/ui
 */
export function cn(...classes: ClassValue[]) {
  return clsx(...classes);
}

export default cn;
