import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  Package,
  FileText,
  Sheet,
} from 'lucide-react';

export interface AdminSidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

const menuItems = [
  {
    path: '/admin',
    label: 'Дашборд',
    icon: LayoutDashboard,
  },
  {
    path: '/admin/users',
    label: 'Користувачі',
    icon: Users,
  },
  {
    path: '/admin/roles',
    label: 'Ролі та дозволи',
    icon: Settings,
  },
  {
    path: '/admin/price',
    label: 'Прайс',
    icon: Sheet,
  },
  {
    path: '/admin/rack-sets',
    label: 'Комплекти стелажів',
    icon: Package,
  },
  {
    path: '/admin/audit',
    label: 'Журнал аудиту',
    icon: FileText,
  },
];

/**
 * AdminSidebar - бічна панель навігації адмін-панелі
 */
export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  className,
  collapsed = false,
  onToggle,
}) => {
  return (
    <aside
      className={cn(
        'w-64 bg-card border-r border-border flex flex-col',
        'transition-all duration-300 ease-in-out',
        collapsed && 'w-0 lg:w-16',
        className
      )}
    >
      {/* Toggle button для мобільних */}
      <button
        onClick={onToggle}
        className="lg:hidden absolute -right-3 top-4 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
        aria-label={collapsed ? 'Відкрити меню' : 'Закрити меню'}
      >
        {collapsed ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        )}
      </button>

      {/* Навігація */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'text-sm font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center px-2'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={cn('w-5 h-5 flex-shrink-0', collapsed && 'w-6 h-6')} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer сайдбара */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Адмін-панель
          </p>
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;
