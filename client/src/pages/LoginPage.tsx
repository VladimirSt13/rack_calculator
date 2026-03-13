import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/authStore';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { Label } from '@/shared/components/Label';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_REDIRECT_ROUTE, PUBLIC_ROUTES } from '@/core/constants/routes';

const loginSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(6, 'Пароль має бути не менше 6 символів'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    clearError();

    try {
      await login(data.email, data.password);
      toast.success('Вхід успішний');

      // Визначаємо куди редиректити після логіну
      const redirectPath = from || DEFAULT_REDIRECT_ROUTE;
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const errorMessage =
        (err as any).response?.data?.error || (err as any).response?.data?.message || 'Помилка входу';

      // Спеціальна обробка для непідтвердженого email
      if ((err as any).response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        toast.error('Підтвердіть email будь ласка');
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`, { replace: true });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
      <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-lg border">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-primary rounded-full">
              <LogIn className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Вхід</h1>
          <p className="text-muted-foreground">
            Введіть свої дані для входу в систему
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              className={errors.email?.message ? 'border-destructive' : ''}
              {...register('email')}
              disabled={isSubmitting}
            />
            {errors.email?.message && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Пароль</Label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Забули пароль?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className={errors.password?.message ? 'border-destructive' : ''}
              {...register('password')}
              disabled={isSubmitting}
            />
            {errors.password?.message && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full"
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Вхід...
              </>
            ) : (
              'Увійти'
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Немає акаунту? </span>
          <Link to={PUBLIC_ROUTES.REGISTER} className="text-primary hover:underline font-medium">
            Зареєструватися
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
