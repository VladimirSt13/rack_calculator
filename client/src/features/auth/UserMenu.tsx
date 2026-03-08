import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/DropdownMenu';
import { User, LogOut, Package, Shield } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
    setOpen(false);
  };

  if (!user) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
          aria-label="Меню користувача"
        >
          <User className="w-5 h-5" />
          <span className="hidden sm:inline-block text-sm font-medium">
            {user.email.split('@')[0]}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.email}</p>
            {user.role === 'admin' && (
              <span className="text-xs text-muted-foreground">Адміністратор</span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Загальні налаштування */}
        <DropdownMenuItem
          onClick={() => {
            navigate('/profile');
            setOpen(false);
          }}
          className="cursor-pointer"
        >
          <User className="w-4 h-4 mr-2" />
          <span>Профіль</span>
        </DropdownMenuItem>

        {/* Адмін-панель (тільки для admin) */}
        {user.role === 'admin' && (
          <DropdownMenuItem
            onClick={() => {
              navigate('/admin');
              setOpen(false);
            }}
            className="cursor-pointer"
          >
            <Shield className="w-4 h-4 mr-2" />
            <span>Адмін-панель</span>
          </DropdownMenuItem>
        )}

        {/* Збережені комплекти */}
        <DropdownMenuItem
          onClick={() => {
            navigate('/my-sets');
            setOpen(false);
          }}
          className="cursor-pointer"
        >
          <Package className="w-4 h-4 mr-2" />
          <span>Мої комплекти</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Вихід */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Вийти</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
