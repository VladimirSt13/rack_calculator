import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeToggle, Toaster } from '@/shared/components';
import RackPage from '@/pages/RackPage';
import BatteryPage from '@/pages/BatteryPage';
import { cn } from '@/lib/utils';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 хвилин
      retry: 1,
    },
  },
});

interface NavItem {
  path: string;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/rack', label: 'Стелаж' },
  { path: '/battery', label: 'Акумулятор' },
];

// Header компонент з навігацією
const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="header__brand">
          <h1 className="text-xl sm:text-2xl font-semibold mb-0">Акку-енерго</h1>
          <p className="text-xs sm:text-sm opacity-80 m-0">Калькулятор стелажів</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="header__nav" aria-label="Головна навігація">
            <ul className="flex list-none gap-2 sm:gap-4 m-0 p-0">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'px-3 py-2 rounded-md transition-fast font-medium text-sm sm:text-base',
                      location.pathname === item.path
                        ? 'bg-primary-foreground/10 text-primary-foreground underline'
                        : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" />
        </div>
      </div>
    </header>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app min-h-screen flex flex-col bg-background">
          <Header />
          <main className="main flex-1">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
              <Routes>
                <Route path="/" element={<Navigate to="/rack" replace />} />
                <Route path="/rack" element={<RackPage />} />
                <Route path="/battery" element={<BatteryPage />} />
              </Routes>
            </div>
          </main>
          <Toaster />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
