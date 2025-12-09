import { create } from "zustand";
import authService, { UserInfo } from "../services/authService";

interface AuthStore {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUserFromStorage: () => void;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setError: (error: string) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("token"),

  login: async (username: string, password: string) => {
    console.log("🔐 AuthStore login attempt:", { username });
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ username, password });
      const { token } = response;
      console.log(
        "✅ Login successful, token received:",
        token ? `${token.substring(0, 20)}...` : "No token"
      );

      localStorage.setItem("token", token);

      // Decode token to get user info
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const role = decoded.scope?.includes("ROLE_ADMIN") ? "ADMIN" : "USER";
      console.log("👤 Decoded user info:", { decoded, role });

      localStorage.setItem("role", role);

      set({ token, isAuthenticated: true, isLoading: false });
      console.log("✅ AuthStore state updated successfully");
    } catch (error: any) {
      console.error("❌ Login error:", error);
      const errorMsg = error.response?.data?.message || "Login failed";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  register: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(data);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Registration failed";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      set({ isLoading: false });
    }
  },

  loadUserFromStorage: () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      set({ token, user: JSON.parse(user), isAuthenticated: true });
    }
  },

  getCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, isLoading: false });
    } catch (error: any) {
      set({ error: "Failed to load user", isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  setError: (error: string) => set({ error }),
}));
