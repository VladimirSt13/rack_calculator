import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/authStore';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { Label } from '@/shared/components/Label';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

const forgotSchema = z.object({
  email: z.string().email('Невірний формат email'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsSubmitting(true);
    clearError();

    try {
      await forgotPassword(data.email);
      setIsSent(true);
      toast.success('Лист зі скиданням пароля відправлено');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || 'Помилка відправки';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-lg border text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-green-500 rounded-full">
              <Mail className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-green-600">Лист відправлено!</h1>
          <p className="text-muted-foreground">
            Перевірте свою пошту для інструкцій зі скидання пароля
          </p>
          <Link to="/login">
            <Button variant="outline" className="mt-4">
              Повернутися до входу
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
              <Mail className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Забули пароль?</h1>
          <p className="text-muted-foreground">
            Введіть свій email і ми відправимо інструкції зі скидання пароля
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
                Відправка...
              </>
            ) : (
              'Відправити посилання'
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Згадали пароль? </span>
          <Link to="/login" className="text-primary hover:underline font-medium">
            Увійти
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
