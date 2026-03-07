import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { usersApi } from '@/features/users/usersApi';
import { rolesApi } from '@/features/users/rolesApi';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { Label } from '@/shared/components/Label';
import { toast } from 'sonner';

const userSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(6, 'Пароль має бути не менше 6 символів').optional(),
  role: z.enum(['admin', 'manager', 'user']),
  price_types: z.array(z.string()).default([]),
});

type UserForm = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: {
    id?: number;
    email: string;
    role: string;
    permissions?: {
      price_types: string[];
    };
  };
  onClose: () => void;
  onSuccess: () => void;
}

const PRICE_TYPES = [
  { value: 'без_ізоляторів', label: 'Без ізоляторів' },
  { value: 'загальна', label: 'Загальна' },
  { value: 'нульова', label: 'Нульова' },
  { value: 'собівартість', label: 'Собівартість' },
  { value: 'оптова', label: 'Оптова' },
];

export const UserForm: React.FC<UserFormProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const isEdit = !!user?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email || '',
      role: (user?.role as 'admin' | 'manager' | 'user') || 'user',
      price_types: user?.permissions?.price_types || [],
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: UserForm & { password: string }) =>
      usersApi.create(data),
    onSuccess: () => {
      toast.success('Користувача створено');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Помилка створення');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<UserForm>) =>
      usersApi.update(id, data),
    onSuccess: () => {
      toast.success('Користувача оновлено');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Помилка оновлення');
    },
  });

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getAll,
  });

  const onSubmit = (data: UserForm) => {
    if (isEdit && user?.id) {
      updateMutation.mutate({ id: user.id, ...data });
    } else {
      if (!data.password) {
        toast.error('Пароль обов\'язковий');
        return;
      }
      createMutation.mutate(data as UserForm & { password: string });
    }
  };

  const watchedPriceTypes = watch('price_types');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          {...register('email')}
          className={errors.email?.message ? 'border-destructive' : ''}
          disabled={createMutation.isPending || updateMutation.isPending}
        />
        {errors.email?.message && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className={errors.password?.message ? 'border-destructive' : ''}
            disabled={createMutation.isPending || updateMutation.isPending}
          />
          {errors.password?.message && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="role">Роль</Label>
        <select
          id="role"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register('role')}
          disabled={createMutation.isPending || updateMutation.isPending || rolesLoading}
        >
          {rolesLoading ? (
            <option>Завантаження...</option>
          ) : (
            rolesData?.map((role: any) => (
              <option key={role.id} value={role.name}>
                {role.label}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="space-y-3">
        <Label>Доступні типи цін</Label>
        <div className="grid grid-cols-2 gap-3">
          {PRICE_TYPES.map((type) => (
            <label
              key={type.value}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                value={type.value}
                checked={watchedPriceTypes?.includes(type.value)}
                onChange={(e) => {
                  const current = watchedPriceTypes || [];
                  const updated = e.target.checked
                    ? [...current, type.value]
                    : current.filter((v) => v !== type.value);
                  setValue('price_types', updated);
                }}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          Скасувати
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {isEdit ? 'Зберегти' : 'Створити'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
