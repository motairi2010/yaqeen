import axios from "axios";

// في التطوير نستعمل proxy على /api، وفي الإنتاج نقرأ من REACT_APP_API_URL
const baseURL =
  process.env.NODE_ENV === "development"
    ? "/api"
    : (process.env.REACT_APP_API_URL || "/api");

export const http = axios.create({
  baseURL,
  timeout: 15000,
});

http.interceptors.response.use(
  r => r,
  err => {
    const s = err?.response?.status;
    const u = err?.config?.url;
    console.error("HTTP:", s ?? "ERR", u ?? "-", err?.message);
    return Promise.reject(err);
  }
);
