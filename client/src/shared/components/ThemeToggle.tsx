import React, { memo, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
}

const THEME_STORAGE_KEY = 'rack-calculator-theme';

/**
 * ThemeToggle - перемикач темної/світлої теми
 *
 * Зберігає вибір користувача в localStorage
 * Додає/видаляє клас 'dark' на document.documentElement
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = memo(({
  className,
  size = 'md',
  variant = 'ghost',
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Перевірка збереженої теми в localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        return saved === 'dark';
      }
      // Перевірка системної теми
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={toggleTheme}
      className={cn(sizeClasses[size], className)}
      aria-label={isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
      title={isDark ? 'Світла тема' : 'Темна тема'}
    >
      <Sun
        className={cn(
          'transition-all duration-300',
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        )}
        aria-hidden="true"
      />
      <Moon
        className={cn(
          'absolute transition-all duration-300',
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        )}
        aria-hidden="true"
      />
    </Button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

/**
 * ThemeProvider - провайдер теми для додатку
 * 
 * Використовується для ініціалізації теми при завантаженні
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = memo(({
  children,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY,
}) => {
  useEffect(() => {
    const root = document.documentElement;
    
    // Спроба отримати збережену тему
    const savedTheme = localStorage.getItem(storageKey);
    
    if (savedTheme) {
      if (savedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      return;
    }
    
    // Якщо немає збереженої, використовуємо системну
    if (defaultTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      }
    } else if (defaultTheme === 'dark') {
      root.classList.add('dark');
    }
  }, [defaultTheme, storageKey]);

  return <>{children}</>;
});

ThemeProvider.displayName = 'ThemeProvider';
