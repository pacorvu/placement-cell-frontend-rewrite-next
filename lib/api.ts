// api.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { userService } from './userService';

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

// Define routes that should trigger user data refetch on POST
const INVALIDATION_ROUTES = [
  '/students',
  '/feedback',
  '/projects',
  '/profile',
  // Add any other routes that modify user-related data
];

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

const setTokens = (
  accessToken: string,
  refreshToken: string,
  userId?: number,
  roleType?: string,
): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('isLoggedIn', 'true');
    if (userId) {
      localStorage.setItem('user_id', userId.toString());
    }
    if (roleType) {
      localStorage.setItem('role_type', roleType);
    }
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
    userService.clearUserCache();

    // Redirect to login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
};

// Check if URL matches invalidation routes
const shouldInvalidateCache = (url: string): boolean => {
  return INVALIDATION_ROUTES.some((route) => url.includes(route));
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

// Response interceptor - Handle token refresh and cache invalidation
api.interceptors.response.use(
  async (response) => {
    // Invalidate and refetch user data on successful POST/PUT/PATCH/DELETE
    const method = response.config.method?.toLowerCase();
    const url = response.config.url || '';

    if (
      ['post', 'put', 'patch', 'delete'].includes(method || '') &&
      shouldInvalidateCache(url)
    ) {
      // Fire and forget - don't wait for refetch
      userService.invalidateAndRefetch().catch((error) => {
        console.error('Failed to refetch user data:', error);
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If no config, just reject
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If not 401 or already retried, just reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If refresh endpoint fails, clear tokens and reject
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

    // No refresh token available, clear and reject
    if (!refreshToken) {
      isRefreshing = false;
      clearTokens();
      return Promise.reject(error);
    }

    try {
      // Attempt token refresh
      const response = await axios.post<RefreshTokenResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`,
        {
          refresh_token: refreshToken,
        },
      );

      const { access_token, refresh_token: new_refresh_token } = response.data;

      // Update tokens in localStorage (preserve user_id and role_type)
      const userId = localStorage.getItem('user_id');
      const roleType = localStorage.getItem('role_type');
      setTokens(
        access_token,
        new_refresh_token,
        userId ? parseInt(userId) : undefined,
        roleType || undefined,
      );

      // Update the original request with new token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
      }

      // Process all queued requests
      processQueue(null, access_token);
      isRefreshing = false;

      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed, clear tokens and reject all queued requests
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

    const { user_id, access_token, refresh_token, role_type } = response.data;

    // Store tokens and user info
    setTokens(access_token, refresh_token, user_id, role_type);

    // Fetch and cache user data
    // if (role_type === "Student") {
    //   await userService.fetchAndCacheUserData();
    // }

    return response.data;
  },

  async logout() {
    const accessToken = getAccessToken();

    try {
      await api.post('/auth/logout', {
        jwt_token: accessToken,
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      clearTokens();
    }
  },

  getAccessToken,
  getRefreshToken,
  getRoleType: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('role_type');
    }
    return null;
  },
  getUserId: (): number | null => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('user_id');
      return userId ? parseInt(userId) : null;
    }
    return null;
  },
  isLoggedIn: (): boolean => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isLoggedIn') === 'true';
    }
    return false;
  },
  setTokens,
  clearTokens,
};
