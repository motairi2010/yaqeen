import axios from "axios";
import { errorLogger } from '../utils/errorLogger';

const baseURL =
  process.env.NODE_ENV === "development"
    ? "/api"
    : (process.env.REACT_APP_API_URL || "/api");

export const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

let requestQueue = [];
let isRefreshing = false;

http.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV === 'development') {
      config.metadata = { startTime: Date.now() };
    }

    return config;
  },
  error => {
    if (errorLogger) {
      errorLogger.log({
        type: 'request-error',
        error: error.message,
        stack: error.stack
      });
    }
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  response => {
    if (process.env.NODE_ENV === 'development' && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`[HTTP] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    return response;
  },
  async error => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const url = error?.config?.url;

    if (errorLogger) {
      errorLogger.log({
        type: 'response-error',
        status,
        url,
        error: error.message,
        data: error?.response?.data
      });
    }

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          requestQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
          localStorage.setItem('auth_token', data.token);

          requestQueue.forEach(({ resolve, config }) => {
            config.headers.Authorization = `Bearer ${data.token}`;
            resolve(http(config));
          });
          requestQueue = [];

          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return http(originalRequest);
        }
      } catch (refreshError) {
        requestQueue.forEach(({ reject }) => reject(refreshError));
        requestQueue = [];
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 404) {
      console.warn(`[HTTP 404] ${url} not found`);
    } else if (status >= 500) {
      console.error(`[HTTP ${status}] Server error on ${url}`);
    } else {
      console.error("HTTP:", status ?? "ERR", url ?? "-", error?.message);
    }

    return Promise.reject(error);
  }
);

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('auth_token', token);
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('auth_token');
    delete http.defaults.headers.common['Authorization'];
  }
}

export function clearAuth() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  delete http.defaults.headers.common['Authorization'];
}
