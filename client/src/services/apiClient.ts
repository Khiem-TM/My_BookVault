import axios, { AxiosError, AxiosResponse } from "axios";

// Define API Response wrapper interface
export interface ApiResponse<T = any> {
  code?: number;
  message?: string;
  result?: T;
  success?: boolean;
}

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888/api/v1";

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.debug(
        `🔑 Adding token to request: ${config.method?.toUpperCase()} ${
          config.url
        }`
      );
    }
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and refresh token
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    console.debug(
      `✅ Response received: ${response.status} ${response.config.url}`,
      response.data
    );

    // Check if response has error code in body (business logic error)
    // Success codes: 0, 1000, 200
    if (response.data?.code && ![0, 1000, 200].includes(response.data.code)) {
      const status = response.data.code;
      const message = response.data.message;

      console.error(`❌ API Error [${status}]:`, message);

      // Handle specific error codes
      if (status === 1006) {
        // Unauthenticated
        console.warn("🚫 Unauthenticated - clearing auth and redirecting");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        window.location.href = "/auth/login";
      }

      return Promise.reject(response.data);
    }

    return response.data as any;
  },
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    console.error(`❌ API Error [${status}]:`, message);

    // Handle specific status codes
    switch (status) {
      case 401:
        // Unauthenticated - clear token and redirect to login
        console.warn("🚫 Unauthorized - clearing auth and redirecting");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        window.location.href = "/auth/login";
        break;

      case 403:
        console.warn("🚫 Forbidden - user lacks permissions");
        break;

      case 429:
        console.warn("⏱️ Rate limited - please retry later");
        break;

      case 503:
        console.warn("⚠️ Service temporarily unavailable");
        break;

      case 500:
        console.error("💥 Server error");
        break;

      default:
        console.error(`⚠️ HTTP ${status}: ${message}`);
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default api;
