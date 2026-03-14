import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/authStore";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Label } from "@/shared/components/Label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/shared/components/Card";
import { Alert, AlertDescription } from "@/shared/components/Alert";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const profileSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Пароль має бути не менше 6 символів")
      .optional(),
    newPassword: z
      .string()
      .min(6, "Пароль має бути не менше 6 символів")
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Якщо заповнено хоча б одне поле пароля, всі мають бути заповнені
      if (data.currentPassword || data.newPassword || data.confirmPassword) {
        return data.currentPassword && data.newPassword && data.confirmPassword;
      }
      return true;
    },
    {
      message: "Заповніть всі поля для зміни пароля",
      path: ["currentPassword"],
    },
  )
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Паролі не співпадають",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user, changePassword, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }) => {
      await changePassword(data.currentPassword, data.newPassword);
    },
    onSuccess: () => {
      toast.success("Пароль змінено");
      reset();
      setIsChangingPassword(false);
    },
    onError: (error: Error) => {
      toast.error(
        (error as any).response?.data?.error || "Помилка зміни пароля",
      );
    },
  });

  const onSubmit = (data: ProfileForm) => {
    if (data.currentPassword && data.newPassword) {
      changePasswordMutation.mutate({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Профіль користувача</h1>

      {/* Інформація про користувача */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Інформація</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <p className="text-sm mt-1">{user?.email}</p>
          </div>
          <div>
            <Label>Роль</Label>
            <p className="text-sm mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user?.role === "admin"
                  ? "Адміністратор"
                  : user?.role === "manager"
                    ? "Менеджер"
                    : "Користувач"}
              </span>
            </p>
          </div>
          <div>
            <Label>Статус email</Label>
            <p className="text-sm mt-1">
              {user?.emailVerified ? (
                <span className="text-green-600">✓ Підтверджено</span>
              ) : (
                <span className="text-yellow-600">⚠ Не підтверджено</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Зміна пароля */}
      <Card>
        <CardHeader>
          <CardTitle>Зміна пароля</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {isChangingPassword ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Поточний пароль</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Введіть поточний пароль"
                    {...register("currentPassword")}
                    className={
                      errors.currentPassword?.message
                        ? "border-destructive"
                        : ""
                    }
                    disabled={changePasswordMutation.isPending}
                  />
                  {errors.currentPassword?.message && (
                    <p className="text-sm text-destructive">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Новий пароль</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Введіть новий пароль"
                    {...register("newPassword")}
                    className={
                      errors.newPassword?.message ? "border-destructive" : ""
                    }
                    disabled={changePasswordMutation.isPending}
                  />
                  {errors.newPassword?.message && (
                    <p className="text-sm text-destructive">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Підтвердження пароля</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Підтвердіть новий пароль"
                    {...register("confirmPassword")}
                    className={
                      errors.confirmPassword?.message
                        ? "border-destructive"
                        : ""
                    }
                    disabled={changePasswordMutation.isPending}
                  />
                  {errors.confirmPassword?.message && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {changePasswordMutation.isPending && (
                  <Alert variant="default">
                    <AlertDescription>Зміна пароля...</AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">
                Натисніть &quot;Змінити пароль&quot; для зміни пароля
              </p>
            )}
          </CardContent>
          <CardFooter className="gap-2">
            {isChangingPassword ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    reset();
                  }}
                  disabled={changePasswordMutation.isPending}
                >
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending
                    ? "Зміна..."
                    : "Змінити пароль"}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => setIsChangingPassword(true)}>
                Змінити пароль
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>

      {/* Небезпечна зона */}
      <Card className="mt-6 border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Небезпечна зона</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Після виходу з системи вам потрібно буде знову увійти.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={handleLogout}>
            Вийти з системи
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfilePage;
