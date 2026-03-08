import { Link } from 'react-router-dom';
import { Users, Package, Settings, TrendingUp, FileText } from 'lucide-react';

const adminMenuItems = [
  {
    path: '/admin/users',
    label: 'Користувачі',
    description: 'Управління користувачами та ролями',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    path: '/admin/roles',
    label: 'Ролі та дозволи',
    description: 'Налаштування ролей та дозволів',
    icon: Settings,
    color: 'bg-purple-500',
  },
  {
    path: '/admin/price',
    label: 'Прайс',
    description: 'Управління прайс-листом',
    icon: TrendingUp,
    color: 'bg-green-500',
  },
  {
    path: '/admin/rack-sets',
    label: 'Комплекти стелажів',
    description: 'Перегляд та експорт комплектів',
    icon: Package,
    color: 'bg-orange-500',
  },
  {
    path: '/admin/audit',
    label: 'Журнал аудиту',
    description: 'Історія всіх дій у системі',
    icon: FileText,
    color: 'bg-red-500',
  },
];

export const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Адмін-панель</h1>
        <p className="text-muted-foreground">
          Керування користувачами, ролями та налаштуваннями системи
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </div>
  );
};

export default AdminDashboard;
