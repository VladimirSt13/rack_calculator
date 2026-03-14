import { Link } from "react-router-dom";
import {
  Users,
  Package,
  Settings,
  TrendingUp,
  FileText,
  BarChart3,
} from "lucide-react";
import { AdminLayout } from "@/shared/layout/AdminLayout";
import { cn } from "@/lib/utils";

const adminMenuItems = [
  {
    path: "/admin/users",
    label: "Користувачі",
    description: "Управління користувачами та ролями",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    path: "/admin/roles",
    label: "Ролі та дозволи",
    description: "Налаштування ролей та дозволів",
    icon: Settings,
    color: "bg-purple-500",
  },
  {
    path: "/admin/price",
    label: "Прайс",
    description: "Управління прайс-листом",
    icon: TrendingUp,
    color: "bg-green-500",
  },
  {
    path: "/admin/rack-sets",
    label: "Комплекти стелажів",
    description: "Перегляд та експорт комплектів",
    icon: Package,
    color: "bg-orange-500",
  },
  {
    path: "/admin/audit",
    label: "Журнал аудиту",
    description: "Історія всіх дій у системі",
    icon: FileText,
    color: "bg-red-500",
  },
];

const statsCards = [
  {
    title: "Користувачі",
    value: "—",
    icon: Users,
    color: "text-blue-500",
    description: "Активних користувачів",
  },
  {
    title: "Комплекти",
    value: "—",
    icon: Package,
    color: "text-orange-500",
    description: "Всього комплектів",
  },
  {
    title: "Аудит",
    value: "—",
    icon: BarChart3,
    color: "text-red-500",
    description: "Записів в журналі",
  },
  {
    title: "Ролі",
    value: "3",
    icon: Settings,
    color: "text-purple-500",
    description: "Active roles",
  },
];

export const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout
      title="Адмін-панель"
      description="Керування користувачами, ролями та налаштуваннями системи"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-card rounded-lg border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={cn("w-8 h-8", stat.color)} />
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
            <h3 className="font-semibold mb-1">{stat.title}</h3>
            <p className="text-sm text-muted-foreground">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="group block p-6 bg-card rounded-lg border border-border hover:border-primary transition-all duration-200 hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className={`${item.color} p-3 rounded-lg`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                  {item.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
