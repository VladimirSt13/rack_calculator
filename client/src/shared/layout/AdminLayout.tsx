import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { cn } from '@/lib/utils';

export interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * AdminLayout - обгортка для всіх сторінок адмін-панелі
 * Забезпечує єдину структуру з Sidebar
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  description,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div
        className={cn(
          'flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out',
          'lg:ml-64',
          sidebarCollapsed && 'lg:ml-16'
        )}
      >
        <div className="container mx-auto py-8 px-4">
          {/* Header */}
          {(title || description) && (
            <div className="mb-8">
              {title && <h1 className="text-3xl font-bold mb-2">{title}</h1>}
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
          )}

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
