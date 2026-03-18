import api from '@/lib/axios';

export const authApi = {
  // Реєстрація
  register: async (email: string, password: string) => {
    const { data } = await api.post('/auth/register', { email, password });
    return data.data;
  },

  // Вхід (створення сесії)
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data;
  },

  // Вихід (видалення сесії)
  logout: async () => {
    await api.post('/auth/logout');
  },

  // Отримати поточного користувача
  me: async () => {
    const { data } = await api.get('/users/me');
    return data.data; // Сервер повертає { data: user }
  },

  // Підтвердження email
  verifyEmail: async (token: string) => {
    const { data } = await api.post('/auth/verify-email', { token });
    return data.data;
  },

  // Повторна відправка підтвердження
  resendVerification: async (email: string) => {
    // TODO: реалізувати на сервері
    const { data } = await api.post('/auth/resend-verification', { email });
    return data.data;
  },

  // Запит на скидання пароля
  forgotPassword: async (email: string) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data.data;
  },

  // Скидання пароля з токеном
  resetPassword: async (token: string, newPassword: string) => {
    const { data } = await api.post('/auth/reset-password', { token, password: newPassword });
    return data.data;
  },

  // Зміна пароля (для авторизованого)
  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.post('/users/me/change-password', {
      currentPassword,
      newPassword,
    });
    return data.data;
  },
};

export default authApi;
