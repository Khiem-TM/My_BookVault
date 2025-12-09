import axiosInstance from "../utils/axiosConfig";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  roles: string[];
}

export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post(
      "/identity/auth/token",
      credentials
    );
    return response.data.result;
  },

  // Register
  register: async (data: RegisterRequest) => {
    const response = await axiosInstance.post(
      "/identity/users/registration",
      data
    );
    return response.data.result;
  },

  // Verify Email
  verifyEmail: async (token: string) => {
    const response = await axiosInstance.post("/identity/auth/verify-email", {
      token,
    });
    return response.data.result;
  },

  // Resend Verification Email
  resendVerificationEmail: async (email: string) => {
    const response = await axiosInstance.post(
      "/identity/auth/resend-verification-email",
      { email }
    );
    return response.data.result;
  },

  // Forgot Password
  forgotPassword: async (email: string) => {
    const response = await axiosInstance.post(
      "/identity/auth/forgot-password",
      { email }
    );
    return response.data.result;
  },

  // Reset Password
  resetPassword: async (
    token: string,
    password: string,
    confirmPassword: string
  ) => {
    const response = await axiosInstance.post("/identity/auth/reset-password", {
      token,
      password,
      confirmPassword,
    });
    return response.data.result;
  },

  // Validate Reset Token
  validateResetToken: async (token: string) => {
    const response = await axiosInstance.get(
      "/identity/auth/validate-reset-token",
      { params: { token } }
    );
    return response.data.result;
  },

  // Get Current User
  getCurrentUser: async (): Promise<UserInfo> => {
    const response = await axiosInstance.get("/identity/users/my-info");
    return response.data.result;
  },

  // Get All Users (Admin)
  getAllUsers: async (): Promise<UserInfo[]> => {
    const response = await axiosInstance.get("/identity/users");
    return response.data.result;
  },

  // Get User by ID
  getUserById: async (id: string): Promise<UserInfo> => {
    const response = await axiosInstance.get(`/identity/users/${id}`);
    return response.data.result;
  },

  // Update User
  updateUser: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/identity/users/${id}`, data);
    return response.data.result;
  },

  // Update Password
  updatePassword: async (userId: string, password: string) => {
    const response = await axiosInstance.put(`/identity/users/${userId}`, {
      password,
    });
    return response.data.result;
  },

  // Logout
  logout: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axiosInstance.post("/identity/auth/logout", { token });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  },
};

export default authService;
