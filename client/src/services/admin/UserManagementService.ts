import { api, ApiResponse } from "../apiClient";
import { UserProfile, UpdateProfileRequest } from "../user/UserProfileService";

export const userManagementService = {
  /**
   * Get all profiles (Admin)
   */
  getAllProfiles: async (): Promise<UserProfile[]> => {
    const response = await api.get<ApiResponse<UserProfile[]>>("/profile/users");
    return response.data.result || [];
  },

  /**
   * Search users (Admin context)
   */
  searchUsers: async (keyword: string): Promise<UserProfile[]> => {
    const response = await api.post<ApiResponse<UserProfile[]>>(
      "/profile/users/search",
      { keyword }
    );
    return response.data.result || [];
  },

  /**
   * Update user profile (Admin)
   */
  updateUser: async (userId: string, data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await api.put<ApiResponse<UserProfile>>(`/profile/users/${userId}`, data);
    return response.data.result!;
  },

  /**
   * Delete user (Admin)
   */
  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/profile/users/${userId}`);
  },
};
