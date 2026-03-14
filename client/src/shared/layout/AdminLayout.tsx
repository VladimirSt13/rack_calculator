import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";

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
    <div className="min-h-screen pt-16">
      {/* Admin Grid: sidebar fixed width, content flexible */}
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8 py-6"
        style={{ maxWidth: "1600px" }}
      >
        <div
          className="grid grid-cols-1 gap-6 lg:grid-cols-[256px_minmax(0,1fr)]"
          style={{
            gridTemplateColumns: `256px minmax(0, 1fr)`,
          }}
        >
          {/* Sidebar */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <AdminSidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          {/* Main Content */}
          <main className="min-w-0">
            <div className="space-y-6">
              {/* Header */}
              {(title || description) && (
                <div className="mb-2">
                  {title && (
                    <h1 className="text-3xl font-bold mb-2">{title}</h1>
                  )}
                  {description && (
                    <p className="text-muted-foreground">{description}</p>
                  )}
                </div>
              )}

              {/* Content */}
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
