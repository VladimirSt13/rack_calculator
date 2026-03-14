import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/authStore';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { Label } from '@/shared/components/Label';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { PUBLIC_ROUTES } from '@/core/constants/routes';

const verifySchema = z.object({
  token: z.string().min(1, "Токен обов'язковий"),
});

type VerifyForm = z.infer<typeof verifySchema>;

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token');
  const emailFromUrl = searchParams.get('email');

  const { verifyEmail, resendVerification, isLoading, error, clearError } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState(emailFromUrl || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      token: tokenFromUrl || '',
    },
  });

  useEffect(() => {
    if (tokenFromUrl) {
      handleVerify(tokenFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromUrl]);

  const handleVerify = async (token: string) => {
    setIsSubmitting(true);
    clearError();

    try {
      await verifyEmail(token);
      setIsVerified(true);
      toast.success('Email підтверджено!');

      // Через 2 секунди редірект на login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage =
        (err as any).response?.data?.error || (err as any).response?.data?.message || 'Помилка підтвердження';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: VerifyForm) => {
    await handleVerify(data.token);
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Введіть email');
      return;
    }

    setIsSubmitting(true);
    try {
      await resendVerification(email);
      toast.success('Лист з підтвердженням відправлено');
    } catch (err) {
      const errorMessage =
        (err as any).response?.data?.error || (err as any).response?.data?.message || 'Помилка відправки';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerified) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100'>
        <div className='w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-lg border text-center'>
          <div className='flex justify-center'>
            <div className='p-3 bg-green-500 rounded-full'>
              <CheckCircle2 className='w-12 h-12 text-white' />
            </div>
          </div>
          <h1 className='text-3xl font-bold text-green-600'>Email підтверджено!</h1>
          <p className='text-muted-foreground'>Ваш email успішно підтверджено. Перенаправляємо на сторінку входу...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 py-12 px-4'>
      <div className='w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-lg border'>
        <div className='space-y-2 text-center'>
          <div className='flex justify-center'>
            <div className='p-3 bg-primary rounded-full'>
              <Mail className='w-8 h-8 text-primary-foreground' />
            </div>
          </div>
          <h1 className='text-3xl font-bold'>Підтвердження email</h1>
          <p className='text-muted-foreground'>Введіть токен з листа або натисніть на посилання</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='token'>Токен підтвердження</Label>
            <Input
              id='token'
              type='text'
              placeholder='Вставте токен з листа'
              className={errors.token?.message ? 'border-destructive' : ''}
              {...register('token')}
              disabled={isSubmitting}
            />
            {errors.token?.message && <p className='text-sm text-destructive'>{errors.token.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email для повторної відправки</Label>
            <div className='flex gap-2'>
              <Input
                id='email'
                type='email'
                placeholder='your@email.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <Button type='button' variant='outline' onClick={handleResend} disabled={isSubmitting || !email}>
                Відправити
              </Button>
            </div>
          </div>

          {error && <div className='p-3 text-sm text-destructive bg-destructive/10 rounded-md'>{error}</div>}

          <Button type='submit' disabled={isSubmitting || isLoading || !tokenFromUrl} className='w-full'>
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Підтвердження...
              </>
            ) : (
              'Підтвердити email'
            )}
          </Button>
        </form>

        <div className='text-center text-sm'>
          <span className='text-muted-foreground'>Вже підтвердили? </span>
          <Link to={PUBLIC_ROUTES.LOGIN} className='text-primary hover:underline font-medium'>
            Увійти
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
