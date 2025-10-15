import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5217';

export const api = axios.create({
  baseURL: API_BASE,
});

// Decide storage: prefer sessionStorage (non-remember), fallback to localStorage (remember)
let tokenStorage: Storage = sessionStorage.getItem('accessToken') ? sessionStorage : localStorage;
let accessToken: string | null = tokenStorage.getItem('accessToken') || null;
let refreshToken: string | null = tokenStorage.getItem('refreshToken') || null;

export function setRemember(remember: boolean) {
  tokenStorage = remember ? localStorage : sessionStorage;
}

export function setTokens(newAccessToken?: string, newRefreshToken?: string) {
  if (newAccessToken) {
    accessToken = newAccessToken;
    // Clear from both then set in chosen storage
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    tokenStorage.setItem('accessToken', newAccessToken);
  }
  if (newRefreshToken) {
    refreshToken = newRefreshToken;
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('refreshToken');
    tokenStorage.setItem('refreshToken', newRefreshToken);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
}

// Simple user cache in localStorage for navbar/profile usage
const CURRENT_USER_KEY = 'currentUser';
export function setCurrentUser(user: any | null) {
  if (user) {
    // Clear from both then set in chosen storage
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
    tokenStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getCurrentUser(): any | null {
  try {
    const raw = sessionStorage.getItem(CURRENT_USER_KEY) ?? localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchCurrentUser(): Promise<any> {
  const { data } = await api.get('/api/auth/me');
  setCurrentUser(data);
  return data;
}

api.interceptors.request.use((config) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && refreshToken && !err.config.__isRetryRequest) {
      try {
        const { data } = await axios.post(`${API_BASE}/api/auth/refresh-token`, { refreshToken });
        setTokens(data.accessToken, data.refreshToken);
        err.config.__isRetryRequest = true;
        err.config.headers = err.config.headers || {};
        err.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return axios(err.config);
      } catch (_e) {
        clearTokens();
        setCurrentUser(null);
        // If refresh failed, force re-login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    if (err.response?.status === 401 && !refreshToken) {
      // No refresh token flow (email/password). Clear and redirect.
      clearTokens();
      setCurrentUser(null);
      if (typeof window !== 'undefined' && !err.config.__isRetryRequest) {
        // Avoid loops on login page itself
        const path = window.location.pathname;
        if (path !== '/login') window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);
