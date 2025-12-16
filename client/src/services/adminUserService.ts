import api, { ApiResponse } from "./apiClient";

export interface UserProfileResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchUserRequest {
  keyword?: string;
  page?: number;
  size?: number;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  bio?: string;
}

const adminUserService = {
  /**
   * Get all user profiles (Admin only)
   */
  getAllUsers: async (): Promise<UserProfileResponse[]> => {
    console.log("👥 Admin fetching all users...");
    try {
      const response = (await api.get("/profile/users")) as ApiResponse<
        UserProfileResponse[]
      >;
      console.log("✅ Users fetched:", response.result);
      return response.result || [];
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
      throw error;
    }
  },

  /**
   * Get user by ID (Admin)
   */
  getUserById: async (userId: string): Promise<UserProfileResponse> => {
    console.log(`👤 Admin fetching user: ${userId}`);
    try {
      const response = (await api.get(
        `/profile/users/${userId}`
      )) as ApiResponse<UserProfileResponse>;
      console.log("✅ User details:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Failed to fetch user:", error);
      throw error;
    }
  },

  /**
   * Update user profile (Admin only)
   */
  updateUserProfile: async (
    userId: string,
    updates: UpdateProfileRequest
  ): Promise<UserProfileResponse> => {
    console.log(`✏️ Admin updating user: ${userId}`, updates);
    try {
      const response = (await api.put(
        `/profile/users/${userId}`,
        updates
      )) as ApiResponse<UserProfileResponse>;
      console.log("✅ User updated:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Failed to update user:", error);
      throw error;
    }
  },

  /**
   * Search users (Admin)
   */
  searchUsers: async (
    request: SearchUserRequest
  ): Promise<UserProfileResponse[]> => {
    console.log("🔍 Admin searching users...", request);
    try {
      const response = (await api.post(
        "/profile/users/search",
        request
      )) as ApiResponse<UserProfileResponse[]>;
      console.log("✅ Users found:", response.result);
      return response.result || [];
    } catch (error) {
      console.error("❌ Failed to search users:", error);
      throw error;
    }
  },

  /**
   * Delete user (Admin only) - Note: May need to be implemented in backend
   */
  deleteUser: async (userId: string): Promise<void> => {
    console.log(`🗑️ Admin deleting user: ${userId}`);
    try {
      await api.delete(`/profile/users/${userId}`);
      console.log("✅ User deleted");
    } catch (error) {
      console.error("❌ Failed to delete user:", error);
      throw error;
    }
  },

  /**
   * Get user statistics (Admin)
   */
  getUserStatistics: async (): Promise<any> => {
    console.log("📊 Admin fetching user statistics...");
    try {
      const response = (await api.get(
        "/profile/users/statistics"
      )) as ApiResponse<any>;
      console.log("✅ Statistics retrieved:", response.result);
      return response.result;
    } catch (error) {
      console.error("❌ Failed to fetch statistics:", error);
      throw error;
    }
  },
};

export default adminUserService;
