import api, { ApiResponse } from "./apiClient";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  dob?: string; // Format: YYYY-MM-DD
  city?: string;
}

export interface UserUpdateRequest {
  password?: string;
  roles?: string[];
}

export interface IntrospectRequest {
  token: string;
}

export interface RefreshRequest {
  token: string;
}

export interface LogoutRequest {
  token: string;
}

// response interface

export interface AuthResponse {
  token: string;
  expiryTime: string; // ISO Date string
}

export interface IntrospectResponse {
  valid: boolean;
}

export interface RoleResponse {
  name: string;
  description: string;
  permissions: PermissionResponse[];
}

export interface PermissionResponse {
  name: string;
  description: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  roles: RoleResponse[];
}

// auth service

const authService = {
  /**
   *
   * đăng nhập lấy token
   * POST /identity/auth/token
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    console.log("🔐 Logging in user:", credentials.username);
    try {
      const response: ApiResponse<AuthResponse> = await api.post(
        "/identity/auth/token",
        credentials
      );
      console.log("✅ Login successful");
      return response.result!;
    } catch (error) {
      console.error("❌ Login API error:", error);
      throw error;
    }
  },

  /**
   * đăng ký
   * POST /identity/users/registration
   */
  register: async (data: RegisterRequest): Promise<UserInfo> => {
    console.log("📝 Calling register API...");
    try {
      const response: ApiResponse<UserInfo> = await api.post(
        "/identity/users/registration",
        data
      );
      console.log("✅ Register successful");
      return response.result!;
    } catch (error) {
      console.error("❌ Register API error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin người dùng
   * GET /identity/users/my-info
   */
  getCurrentUser: async (): Promise<UserInfo> => {
    console.log("👤 Fetching current user info...");
    try {
      const response: ApiResponse<UserInfo> = await api.get(
        "/identity/users/my-info"
      );
      console.log("✅ Current user fetched");
      return response.result!;
    } catch (error) {
      console.error("❌ Get current user error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin toàn bộ users (Admin only)
   * GET /identity/users
   */
  getAllUsers: async (): Promise<UserInfo[]> => {
    console.log("👥 Fetching all users (Admin)...");
    try {
      const response: ApiResponse<UserInfo[]> = await api.get(
        "/identity/users"
      );
      console.log("✅ All users fetched");
      return response.result!;
    } catch (error) {
      console.error("❌ Get all users error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin người dùng theo id
   * GET /identity/users/{userId}
   */
  getUserById: async (userId: string): Promise<UserInfo> => {
    console.log("👤 Fetching user:", userId);
    try {
      const response: ApiResponse<UserInfo> = await api.get(
        "/identity/users/" + userId
      );
      console.log("✅ User fetched");
      return response.result!;
    } catch (error) {
      console.error("❌ Get user by ID error:", error);
      throw error;
    }
  },

  /**
   * Update (Admin only)
   * PUT /identity/users/{userId}
   */
  updateUser: async (
    userId: string,
    data: UserUpdateRequest
  ): Promise<UserInfo> => {
    console.log("✏️ Updating user:", userId);
    try {
      const response: ApiResponse<UserInfo> = await api.put(
        "/identity/users/" + userId,
        data
      );
      console.log("✅ User updated");
      return response.result!;
    } catch (error) {
      console.error("❌ Update user error:", error);
      throw error;
    }
  },

  /**
   * Update thông tin cá nhân
   * PUT /identity/users/me
   */
  updateMyProfile: async (data: UserUpdateRequest): Promise<UserInfo> => {
    console.log("✏️ Updating my profile...");
    try {
      const response: ApiResponse<UserInfo> = await api.put(
        "/identity/users/me",
        data
      );
      console.log("✅ Profile updated");
      return response.result!;
    } catch (error) {
      console.error("❌ Update profile error:", error);
      throw error;
    }
  },

  /**
   * Xoá user (Admin only)
   * DELETE /identity/users/{userId}
   */
  deleteUser: async (userId: string): Promise<void> => {
    console.log("🗑️ Deleting user:", userId);
    try {
      await api.delete("/identity/users/" + userId);
      console.log("✅ User deleted");
    } catch (error) {
      console.error("❌ Delete user error:", error);
      throw error;
    }
  },

  /**
   * Introspect token - check if token is valid
   * POST /identity/auth/introspect
   */
  introspect: async (token: string): Promise<IntrospectResponse> => {
    console.log("🔍 Introspecting token...");
    try {
      const response: ApiResponse<IntrospectResponse> = await api.post(
        "/identity/auth/introspect",
        { token }
      );
      console.log("✅ Token introspected");
      return response.result!;
    } catch (error) {
      console.error("❌ Introspect error:", error);
      throw error;
    }
  },

  /**
   * Refresh token
   * POST /identity/auth/refresh
   */
  refreshToken: async (token: string): Promise<AuthResponse> => {
    console.log("🔄 Refreshing token...");
    try {
      const response: ApiResponse<AuthResponse> = await api.post(
        "/identity/auth/refresh",
        { token }
      );
      console.log("✅ Token refreshed");
      return response.result!;
    } catch (error) {
      console.error("❌ Refresh token error:", error);
      throw error;
    }
  },

  /**
   * Logout user
   * POST /identity/auth/logout
   */
  logout: async (): Promise<void> => {
    console.log("🚪 Logging out...");
    const token = localStorage.getItem("token");
    try {
      if (token) {
        await api.post("/identity/auth/logout", { token });
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      console.log("Logout successful");
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  /**
   * Get stored token
   */
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  /**
   * Store token
   */
  setToken: (token: string): void => {
    localStorage.setItem("token", token);
  },

  /**
   * Get stored user info
   */
  getStoredUser: (): UserInfo | null => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Store user info
   */
  setStoredUser: (user: UserInfo): void => {
    localStorage.setItem("user", JSON.stringify(user));
  },
};

export default authService;
