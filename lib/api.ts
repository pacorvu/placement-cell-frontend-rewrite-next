// api.ts// api.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// Auth response types
interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
}

interface LoginResponse {
  user_id: number;
  access_token: string;
  refresh_token: string;
  role_type: string;
  token_type?: 'bearer';
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Token management helpers
const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token');
  }
  return null;
};

const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }
};

const clearTokens = (): void => {
  if (typeof window !== 'undefined') {
    const theme = localStorage.getItem('theme');
    const message = localStorage.getItem('message');
    localStorage.clear();
    if (theme) {
      localStorage.setItem('theme', theme);
    }
    if (message) {
      localStorage.setItem('message', message);
    }
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
};

// Request interceptor - Add access token to all requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// Response interceptor - Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/refresh')) {
      clearTokens();
      return Promise.reject(error);
    }

    // Queue requests while refreshing
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      isRefreshing = false;
      clearTokens();
      return Promise.reject(error);
    }

    try {
      const response = await axios.post<RefreshTokenResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`,
        { refresh_token: refreshToken },
      );

      const { access_token, refresh_token: new_refresh_token } = response.data;
      setTokens(access_token, new_refresh_token);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
      }

      processQueue(null, access_token);
      isRefreshing = false;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;
      clearTokens();
      return Promise.reject(refreshError);
    }
  },
);

// Auth service
export const authService = {
  async login(email: string, password: string) {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    const { access_token, refresh_token } = response.data;
    setTokens(access_token, refresh_token);

    return response.data;
  },

  async logout() {
    const accessToken = getAccessToken();
    try {
      await api.post('/auth/logout', { jwt_token: accessToken });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      clearTokens();
    }
  },

  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
};
