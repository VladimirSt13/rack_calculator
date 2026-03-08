import api from '@/lib/axios';

export const authApi = {
  // Реєстрація
  register: async (email: string, password: string) => {
    const { data } = await api.post('/auth/users', { email, password });
    // Сервер повертає { user, accessToken, refreshToken } напряму
    return data;
  },

  // Вхід (створення сесії)
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/session', { email, password });
    // Сервер повертає { user, accessToken, refreshToken, emailVerified }
    return data;
  },

  // Вихід (видалення сесії)
  logout: async () => {
    await api.delete('/auth/session');
  },

  // Отримати поточного користувача
  me: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  // Підтвердження email
  verifyEmail: async (token: string) => {
    const { data } = await api.post('/auth/email/verify', { token });
    return data;
  },

  // Повторна відправка підтвердження
  resendVerification: async (email: string) => {
    const { data } = await api.post('/auth/email/verification', { email });
    return data;
  },

  // Запит на скидання пароля
  forgotPassword: async (email: string) => {
    const { data } = await api.post('/auth/password-resets', { email });
    return data;
  },

  // Скидання пароля з токеном (PUT)
  resetPassword: async (token: string, newPassword: string) => {
    const { data } = await api.put('/auth/password', { token, newPassword });
    return data;
  },

  // Зміна пароля (PATCH, для авторизованого)
  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.patch('/auth/password', {
      currentPassword,
      newPassword,
    });
    return data;
  },
};

export default api;
