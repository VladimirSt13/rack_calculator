import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/authStore';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { Label } from '@/shared/components/Label';
import { Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

const resetSchema = z
  .object({
    newPassword: z.string().min(6, 'Пароль має бути не менше 6 символів'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Паролі не співпадають',
    path: ['confirmPassword'],
  });

type ResetForm = z.infer<typeof resetSchema>;

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token');
  
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    if (!tokenFromUrl) {
      toast.error('Токен не знайдено');
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      await resetPassword(tokenFromUrl, data.newPassword);
      toast.success('Пароль змінено успішно');
      
      // Через 2 секунди редірект на login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || 'Помилка скидання пароля';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tokenFromUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/10 to-destructive/5">
        <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-lg border text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-destructive rounded-full">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-destructive">Невірний токен</h1>
          <p className="text-muted-foreground">
            Токен скидання пароля не знайдено в URL
          </p>
          <Link to="/forgot-password">
            <Button className="mt-4">
              Запросити нове посилання
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 py-12 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-lg border">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-primary rounded-full">
              <KeyRound className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Новий пароль</h1>
          <p className="text-muted-foreground">
            Введіть новий пароль для свого акаунту
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Новий пароль</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className={errors.newPassword?.message ? 'border-destructive' : ''}
              {...register('newPassword')}
              disabled={isSubmitting}
            />
            {errors.newPassword?.message && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
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
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
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
                Зміна пароля...
              </>
            ) : (
              'Змінити пароль'
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Згадали старий пароль? </span>
          <Link to="/login" className="text-primary hover:underline font-medium">
            Увійти
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
