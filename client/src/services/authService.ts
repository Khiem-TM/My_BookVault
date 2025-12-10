import api from "./apiClient";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  expiryTime?: number;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  roles: Array<{ id: string; name: string }>;
}

const authService = {
  /**
   * Login user with credentials
   */
  login: async (credentials: LoginRequest): Promise<string> => {
    console.log("🔐 Calling login API with username...", credentials.username);
    try {
      const response = await api.post("/identity/auth/token", credentials);
      console.log("✅ Login response:", response);
      return response.result.token;
    } catch (error) {
      console.error("❌ Login API error:", error);
      throw error;
    }
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<UserInfo> => {
    console.log("📝 Calling register API...");
    try {
      const response = await api.post("/identity/auth/register", data);
      console.log("✅ Register response:", response);
      return response.result;
    } catch (error) {
      console.error("❌ Register API error:", error);
      throw error;
    }
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<UserInfo> => {
    console.log("👤 Fetching current user info...");
    try {
      const response = await api.get("/identity/users/my-info");
      console.log("✅ Current user:", response.result);
      return response.result;
    } catch (error) {
      console.error("❌ Get user error:", error);
      throw error;
    }
  },

  /**
   * Get all users (Admin only)
   */
  getAllUsers: async (): Promise<UserInfo[]> => {
    console.log("📋 Fetching all users (Admin)...");
    try {
      const response = await api.get("/identity/users");
      return response.result;
    } catch (error) {
      console.error("❌ Get all users error:", error);
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<UserInfo> => {
    console.log(`👤 Fetching user: ${id}...`);
    try {
      const response = await api.get(`/identity/users/${id}`);
      return response.result;
    } catch (error) {
      console.error("❌ Get user by ID error:", error);
      throw error;
    }
  },

  /**
   * Update user info
   */
  updateUser: async (
    id: string,
    data: Partial<UserInfo>
  ): Promise<UserInfo> => {
    console.log(`✏️ Updating user: ${id}...`);
    try {
      const response = await api.put(`/identity/users/${id}`, data);
      console.log("✅ User updated:", response.result);
      return response.result;
    } catch (error) {
      console.error("❌ Update user error:", error);
      throw error;
    }
  },

  /**
   * Update password
   */
  updatePassword: async (
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    console.log(`🔑 Updating password for user: ${userId}...`);
    try {
      await api.put(`/identity/users/${userId}`, {
        oldPassword,
        password: newPassword,
      });
      console.log("✅ Password updated");
    } catch (error) {
      console.error("❌ Update password error:", error);
      throw error;
    }
  },

  /**
   * Verify email
   */
  verifyEmail: async (token: string): Promise<void> => {
    console.log("✉️ Verifying email...");
    try {
      await api.post("/identity/auth/verify-email", { token });
      console.log("✅ Email verified");
    } catch (error) {
      console.error("❌ Email verification error:", error);
      throw error;
    }
  },

  /**
   * Resend verification email
   */
  resendVerificationEmail: async (email: string): Promise<void> => {
    console.log("✉️ Resending verification email...");
    try {
      await api.post("/identity/auth/resend-verification-email", { email });
      console.log("✅ Verification email sent");
    } catch (error) {
      console.error("❌ Resend verification error:", error);
      throw error;
    }
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<void> => {
    console.log("🔐 Requesting password reset...");
    try {
      await api.post("/identity/auth/forgot-password", { email });
      console.log("✅ Password reset email sent");
    } catch (error) {
      console.error("❌ Forgot password error:", error);
      throw error;
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<void> => {
    console.log("🔐 Resetting password...");
    try {
      await api.post("/identity/auth/reset-password", {
        token,
        password,
        confirmPassword,
      });
      console.log("✅ Password reset successfully");
    } catch (error) {
      console.error("❌ Reset password error:", error);
      throw error;
    }
  },

  /**
   * Validate reset token
   */
  validateResetToken: async (token: string): Promise<boolean> => {
    console.log("🔑 Validating reset token...");
    try {
      const response = await api.get("/identity/auth/validate-reset-token", {
        params: { token },
      });
      return response.result;
    } catch (error) {
      console.error("❌ Validate reset token error:", error);
      return false;
    }
  },

  /**
   * Refresh token
   */
  refreshToken: async (token: string): Promise<string> => {
    console.log("🔄 Refreshing token...");
    try {
      const response = await api.post("/identity/auth/refresh", { token });
      console.log("✅ Token refreshed");
      return response.result.token;
    } catch (error) {
      console.error("❌ Refresh token error:", error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    console.log("🚪 Logging out...");
    const token = localStorage.getItem("token");
    try {
      if (token) {
        await api.post("/identity/auth/logout", { token });
      }
    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      console.log("✅ Logout successful");
    }
  },

  /**
   * Delete user (Admin only)
   */
  deleteUser: async (userId: string): Promise<void> => {
    console.log(`🗑️ Deleting user: ${userId}...`);
    try {
      await api.delete(`/identity/users/${userId}`);
      console.log("✅ User deleted");
    } catch (error) {
      console.error("❌ Delete user error:", error);
      throw error;
    }
  },
};

export default authService;
