import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// Generic API Response interface
export interface ApiResponse<T = any> {
  code?: number;
  message?: string;
  result?: T;
  success?: boolean;
}

// Gateway URL
const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888/api/v1";

// Create axios instance
export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy acessToken
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Inject X-User-Id header if user info is available (Required for direct microservice calls or dev env)
      const userStr = localStorage.getItem("user");
      if (userStr) {
          try {
              const user = JSON.parse(userStr);
              if (user.id) {
                  config.headers["X-User-Id"] = user.id;
              }
          } catch (e) {
              console.warn("Failed to parse user from storage for header injection");
          }
      }
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Check for custom application error codes in 200 OK responses
    if (response.data?.code && ![0, 1000, 200].includes(response.data.code)) {
      const status = response.data.code;
      const message = response.data.message;

      console.error(`API Error [${status}]:`, message);

      if (status === 1006) {
         // Token invalid/expired
         handleLogout();
      }

      return Promise.reject(response.data);
    }

    return response;
  },
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    console.error(`API Error [${status}]:`, message);

    switch (status) {
      case 401:
        handleLogout();
        break;
      case 403:
        console.warn("Forbidden - user lacks permissions");
        break;
      case 429:
        console.warn("Rate limited - please retry later");
        break;
      case 503:
        console.warn("Service temporarily unavailable");
        break;
    }

    return Promise.reject(error.response?.data || error);
  }
);

function handleLogout() {
  console.warn("Session expired or unauthorized - clearing auth and redirecting");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  // Only redirect if not already on auth page to avoid loops
  if (!window.location.pathname.includes("/auth")) {
    window.location.href = "/auth/login";
  }
}

export default api;
