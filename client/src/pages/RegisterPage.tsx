import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/authStore';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { Label } from '@/shared/components/Label';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const ALLOWED_DOMAIN = '@accu-energo.com.ua';

const registerSchema = z
  .object({
    email: z
      .string()
      .email('Невірний формат email')
      .refine(
        (email) => email.endsWith(ALLOWED_DOMAIN),
        `Реєстрація доступна тільки з корпоративною поштою ${ALLOWED_DOMAIN}`
      ),
    password: z.string().min(6, 'Пароль має бути не менше 6 символів'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Паролі не співпадають',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    clearError();

    try {
      await registerUser(data.email, data.password);
      toast.success('Реєстрація успішна! Перевірте email для підтвердження.');
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      const errorMessage =
        (err as any).response?.data?.error || (err as any).response?.data?.message || 'Помилка реєстрації';

      // Спеціальна обробка для існуючого користувача
      if ((err as any).response?.data?.code === 'USER_EXISTS') {
        toast.error('Користувач з таким email вже існує');
        navigate(`/login`);
      } else if ((err as any).response?.data?.code === 'INVALID_DOMAIN') {
        toast.error(`Використовуйте пошту ${ALLOWED_DOMAIN}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 py-12 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-lg border">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-primary rounded-full">
              <UserPlus className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Реєстрація</h1>
          <p className="text-muted-foreground">
            Створіть акаунт для доступу до системи
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder={`your${ALLOWED_DOMAIN}`}
              autoComplete="email"
              className={errors.email?.message ? 'border-destructive' : ''}
              {...register('email')}
              disabled={isSubmitting}
            />
            {errors.email?.message && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Використовуйте корпоративну пошту
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className={errors.password?.message ? 'border-destructive' : ''}
              {...register('password')}
              disabled={isSubmitting}
            />
            {errors.password?.message && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Підтвердіть пароль</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className={errors.confirmPassword?.message ? 'border-destructive' : ''}
              {...register('confirmPassword')}
              disabled={isSubmitting}
            />
            {errors.confirmPassword?.message && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
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
                Реєстрація...
              </>
            ) : (
              'Зареєструватися'
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Вже є акаунт? </span>
          <Link to="/login" className="text-primary hover:underline font-medium">
            Увійти
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
