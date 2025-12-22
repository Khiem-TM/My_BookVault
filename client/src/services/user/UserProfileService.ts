import { api, ApiResponse } from "../apiClient";

export interface UserProfile {
  id: string; // Profile ID
  userId: string; // User ID from identity service
  username: string;
  avatarUrl?: string; // Aligning with TotalUsers usage (avatarUrl)
  avatar?: string; // Keeping for backward compat if needed
  email: string;
  firstName: string;
  lastName: string;
  dob?: string;
  dateOfBirth?: string; // Alias or preferred
  city?: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  gender?: string;
}

export interface UpdateProfileRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  city?: string;
}

export const userProfileService = {
  /**
   * Get my profile
   */
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await api.get<ApiResponse<UserProfile>>(
      "/profile/users/my-profile"
    );
    return response.data.result!;
  },

  /**
   * Update my profile
   */
  updateMyProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await api.put<ApiResponse<UserProfile>>(
      "/profile/users/my-profile",
      data
    );
    return response.data.result!;
  },

  /**
   * Update avatar
   */
  updateAvatar: async (file: File): Promise<UserProfile> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.put<ApiResponse<UserProfile>>(
      "/profile/users/avatar",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.result!;
  },

  /**
   * Get profile by ID (Public/Shared? but usually user action)
   */
  getProfile: async (profileId: string): Promise<UserProfile> => {
    const response = await api.get<ApiResponse<UserProfile>>(
      `/profile/users/${profileId}`
    );
    return response.data.result!;
  },
};
