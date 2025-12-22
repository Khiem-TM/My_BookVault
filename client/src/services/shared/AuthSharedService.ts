import { api, ApiResponse } from "../apiClient";

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  avatar?: string;
  emailVerified?: boolean;
}

export interface AuthResponse {
  token: string;
  authenticated: boolean;
  expiryTime?: Date;
}

export const authSharedService = {
  login: async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/identity/auth/token",
      credentials
    );
    return response.data.result!;
  },

  register: async (data: any): Promise<void> => {
    await api.post("/identity/users/registration", data);
  },

  logout: async (token?: string): Promise<void> => {
      const tokenToLogout = token || localStorage.getItem("token");
      if (tokenToLogout) {
          try {
              await api.post("/identity/auth/logout", { token: tokenToLogout });
          } catch (e) {
              console.warn("Logout API call failed, but clearing local state regardless", e);
          }
      }
  },

  getCurrentUser: async (): Promise<UserInfo> => {
    const response = await api.get<ApiResponse<UserInfo>>("/identity/users/my-info");
    return response.data.result!;
  },
  
  introspect: async (token: string): Promise<boolean> => {
      const response = await api.post<ApiResponse<{ valid: boolean }>>("/identity/auth/introspect", { token });
      return response.data.result?.valid || false;
  }
};
