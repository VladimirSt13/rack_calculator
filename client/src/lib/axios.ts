import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

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
    const token = localStorage.getItem('accessToken');

    if (token) {
      // Гарантовано додаємо Authorization header
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Видаляємо Content-Type для FormData (axios сам встановить multipart/form-data з boundary)
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete (config.headers as any)['Content-Type'];
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
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
  async (error: AxiosError & { config?: InternalAxiosRequestConfig & { _retry?: boolean } }) => {
    const originalRequest = error.config;

    // Якщо помилка 401 і запит ще не був retry
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Якщо вже триває refresh, додаємо запит в чергу
      if (isRefreshing) {
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
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Не редиректимо якщо вже на login
        if (window.location.pathname === '/login') {
          return Promise.reject(new Error('No refresh token'));
        }

        // Використовуємо axios.create без interceptor для запиту refresh
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        // Зберігаємо нові токени
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Обробляємо чергу запитів
        processQueue(null, accessToken);

        // Повторюємо оригінальний запит з новим токеном
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Якщо refresh не вдався - очищаємо токени та редиректимо на login
        processQueue(refreshError as Error, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
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
  }
);

export default axiosInstance;
