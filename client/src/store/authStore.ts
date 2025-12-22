import { create } from "zustand";
import { authSharedService, UserInfo } from "../services/shared/AuthSharedService";

// Helper function to extract role from JWT token
function extractRoleFromToken(token: string): string {
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    console.log("🔐 Decoded token:", decoded);

    // Check for scope array (Keycloak format)
    if (decoded.scope && typeof decoded.scope === "string") {
      const roles = decoded.scope.split(" ");
      return roles.includes("ROLE_ADMIN") ? "ADMIN" : "USER";
    }

    // Check for roles array
    if (Array.isArray(decoded.roles)) {
      return decoded.roles.includes("ROLE_ADMIN") ? "ADMIN" : "USER";
    }

    // Check for scope array
    if (Array.isArray(decoded.scope)) {
      return decoded.scope.includes("ROLE_ADMIN") ? "ADMIN" : "USER";
    }

    return "USER";
  } catch (error) {
    console.error("Failed to extract role from token:", error);
    return "USER";
  }
}

interface AuthStore {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  role: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUserFromStorage: () => void;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setError: (error: string) => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("token"),
  role: localStorage.getItem("role"),

  login: async (username: string, password: string) => {
    console.log("🔐 Attempting login:", { username });
    set({ isLoading: true, error: null });
    try {
      // authSharedService.login returns AuthResponse { token, expiryTime }
      const authResponse = await authSharedService.login({ username, password });
      console.log("Login successful, token received");

      // Store token
      const token = authResponse.token;
      localStorage.setItem("token", token);

      // Fetch user info
      const user = await authSharedService.getCurrentUser();
      localStorage.setItem("user", JSON.stringify(user));

      // Extract role from token
      const role = extractRoleFromToken(token);
      console.log("Extracted role from token:", role);
      localStorage.setItem("role", role);

      set({
        token,
        user,
        role,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      console.log("Auth store updated, user:", user, "role:", role);
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "Login failed";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  register: async (data: any) => {
    console.log("📝 Attempting registration:", { username: data.username });
    set({ isLoading: true, error: null });
    try {
      await authSharedService.register(data);
      console.log("Registration successful");
      set({ isLoading: false });
    } catch (error: any) {
      console.error("Registration failed:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "Registration failed";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    console.log("🚪 Logging out...");
    set({ isLoading: true });
    try {
      await authSharedService.logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      set({
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      });
      console.log("Logout successful");
    } catch (error: any) {
      console.error("Logout error:", error);
      set({ isLoading: false });
    }
  },

  loadUserFromStorage: () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    if (token && user) {
      set({
        token,
        user: JSON.parse(user),
        role,
        isAuthenticated: true,
      });
      console.log("Auth restored from storage");
    }
  },

  getCurrentUser: async () => {
    console.log(" Fetching current user info...");
    set({ isLoading: true });
    try {
      const user = await authSharedService.getCurrentUser();
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, isLoading: false });
      console.log(" Current user loaded:", user);
    } catch (error: any) {
      console.error(" Failed to load user:", error);
      set({ error: "Failed to load user", isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  setError: (error: string) => set({ error }),

  initAuth: () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    if (token) {
      // Re-extract role from token to ensure it's correct
      const extractedRole = extractRoleFromToken(token);
      set({
        token,
        user: user ? JSON.parse(user) : null,
        role: extractedRole || role,
        isAuthenticated: true,
      });
      console.log(
        "Auth initialized from storage, role:",
        extractedRole || role
      );
    }
  },
}));
