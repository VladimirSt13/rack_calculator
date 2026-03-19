import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '@/features/auth/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Axios інстанс з автоматичним refresh token
 *
 * @features
 * - Автоматичне оновлення access token при 401 помилці
 * - Зберігання токенів в localStorage
 * - Retry логіка для оновлення сесії
 * - Черга запитів під час refresh token
 *
 * @example
 * ```typescript
 * import axiosInstance from '@/lib/axios';
 *
 * // GET запит
 * const response = await axiosInstance.get('/users');
 *
 * // POST запит
 * const user = await axiosInstance.post('/users', { email, password });
 * ```
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Черга запитів для refresh token
 * Використовується коли отримано 401 помилку і триває процес оновлення токену
 */
interface FailedRequest {
  /** Функція успіху */
  resolve: (value?: unknown) => void;
  /** Функція помилки */
  reject: (reason?: unknown) => void;
}

let failedQueue: FailedRequest[] = [];
let isRefreshing = false;

/**
 * Обробка черги запитів після refresh token
 *
 * @param error - Помилка або null якщо успіх
 * @param token - Новий access token або null
 *
 * @example
 * ```typescript
 * // Успішний refresh
 * processQueue(null, 'new-token');
 *
 * // Помилка refresh
 * processQueue(new Error('Refresh failed'), null);
 * ```
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request interceptor - додає access token до запитів
 *
 * @param config - Конфігурація запиту
 * @returns Конфігурація з Authorization header
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Якщо токен вже є в headers (наприклад, після refresh), не перезаписуємо
    if (config.headers?.Authorization) {
      return config;
    }

    // Беремо токен з authStore (надійніше ніж localStorage)
    const token = useAuthStore.getState().accessToken || localStorage.getItem('accessToken');

    if (token) {
      // Гарантовано додаємо Authorization header
      if (!config.headers) {
        config.headers = {} as typeof config.headers;
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Видаляємо Content-Type для FormData (axios сам встановить multipart/form-data з boundary)
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

/**
 * Response interceptor - обробляє 401 помилки та refresh token
 *
 * @logic
 * 1. При 401 помилці перевіряємо чи не триває вже refresh
 * 2. Якщо триває - додаємо запит в чергу
 * 3. Якщо ні - запускаємо refresh token запит
 * 4. Після успішного refresh - обробляємо чергу
 * 5. При помилці refresh - розлогінюємо користувача
 *
 * @returns Оновлений запит або помилка
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (
    error: AxiosError & {
      config?: InternalAxiosRequestConfig & { _retry?: boolean };
    },
  ) => {
    const originalRequest = error.config;

    // Якщо помилка 401 і запит ще не був retry
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      console.log('[Axios] 401 error, attempting refresh token...');

      // Якщо вже триває refresh, додаємо запит в чергу
      if (isRefreshing) {
        console.log('[Axios] Refresh already in progress, queueing request');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Беремо refresh token з authStore (надійніше ніж localStorage)
        const refreshToken = useAuthStore.getState().refreshToken || localStorage.getItem('refreshToken');
        console.log('[Axios] Refresh token exists:', !!refreshToken);

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Не редиректимо якщо вже на login
        if (window.location.pathname === '/login') {
          return Promise.reject(new Error('No refresh token'));
        }

        console.log('[Axios] Calling /auth/refresh...');

        // Використовуємо axios.create без interceptor для запиту refresh
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        console.log('[Axios] Refresh response:', refreshResponse.data);

        // Сервер повертає { success: true, data: { user, tokens } }
        // Тому токени знаходяться в refreshResponse.data.data.tokens
        const responseData = refreshResponse.data.data || refreshResponse.data;
        const accessToken = responseData.tokens?.accessToken || responseData.accessToken;
        const newRefreshToken = responseData.tokens?.refreshToken || responseData.refreshToken;

        if (!accessToken || !newRefreshToken) {
          console.error('[Axios] Invalid refresh response format:', refreshResponse.data);
          throw new Error('Invalid refresh response');
        }

        // Оновлюємо токени в authStore (який також збереже в localStorage)
        useAuthStore.setState({ accessToken, refreshToken: newRefreshToken });
        console.log('[Axios] Tokens updated in authStore');

        // Обробляємо чергу запитів
        processQueue(null, accessToken);

        // Повторюємо оригінальний запит з НОВИМ токеном
        // Важливо: повністю перезаписуємо Authorization header
        console.log('[Axios] Retrying original request with new token');
        console.log('[Axios] New access token:', accessToken.substring(0, 20) + '...');

        // Використовуємо оригінальний запит з оновленим header
        if (originalRequest.headers) {
          // Для AxiosHeaders використовуємо set метод
          if (typeof originalRequest.headers.set === 'function') {
            originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
          } else {
            // Для звичайних об'єктів
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
        }
        console.log('[Axios] Authorization header updated');

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('[Axios] Refresh token failed:', refreshError);
        // Якщо refresh не вдався - очищаємо токени та редиректимо на login
        processQueue(refreshError as Error, null);
        useAuthStore.setState({ accessToken: null, refreshToken: null, user: null });
        // Не редиректимо якщо вже на login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
