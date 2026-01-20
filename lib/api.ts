/**
 * @fileoverview Konfigurasi Axios dan manajemen token autentikasi
 * @module lib/api
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

/**
 * Base URL untuk API backend
 * Default menggunakan production URL jika environment variable tidak tersedia
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://cashier-api.faizlzm.com/api";

// Token keys untuk localStorage
const TOKEN_KEY = "cashier_access_token";
const REFRESH_TOKEN_KEY = "cashier_refresh_token";

/**
 * Mengambil access token dari localStorage
 * @returns Access token atau null jika tidak ada atau di server-side
 */
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Mengambil refresh token dari localStorage
 * @returns Refresh token atau null jika tidak ada atau di server-side
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Menyimpan access token dan refresh token ke localStorage
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Menghapus semua token dari localStorage (untuk logout)
 */
export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Instance Axios yang sudah dikonfigurasi dengan base URL dan interceptors
 * - Request interceptor: Menambahkan Authorization header secara otomatis
 * - Response interceptor: Handle 401 error dengan token refresh otomatis
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle 401 and token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;
        setTokens(accessToken, newRefreshToken);

        processQueue(null);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
