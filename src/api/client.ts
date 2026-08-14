import axios, { AxiosError } from 'axios';
import { AUTH_STORAGE_KEY } from '@/utils/constants';

/**
 * Central axios instance. Every service imports `api` from here so base URL,
 * headers, auth injection, and global error handling live in one place.
 *
 * Base URL note: when MSW is enabled (dev), leaving this as a relative "/api"
 * lets the service worker intercept requests. Point NEXT_PUBLIC_API_BASE_URL at
 * the real backend to switch over — no service code changes required.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach the auth token if present.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem(AUTH_STORAGE_KEY) ||
        sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (token) {
        config.headers.set('token', token);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: broadcast auth/server failures as window events so the
// app shell can react (e.g. redirect to /login) without coupling services to
// the router. See AppShell for the listeners.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    if (typeof window !== 'undefined') {
      if (status === 401 || status === 403) {
        window.dispatchEvent(new CustomEvent('api:unauthorized'));
      } else if (status === 500) {
        window.dispatchEvent(new CustomEvent('api:serverError'));
      }
    }
    return Promise.reject(error);
  },
);

export default api;
