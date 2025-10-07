import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5217';

export const api = axios.create({
  baseURL: API_BASE,
});

let accessToken: string | null = localStorage.getItem('accessToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');

export function setTokens(newAccessToken?: string, newRefreshToken?: string) {
  if (newAccessToken) {
    accessToken = newAccessToken;
    localStorage.setItem('accessToken', newAccessToken);
  }
  if (newRefreshToken) {
    refreshToken = newRefreshToken;
    localStorage.setItem('refreshToken', newRefreshToken);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
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
      }
    }
    return Promise.reject(err);
  }
);
