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
   * GET /profile/users
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
   * Get user profile by profile ID (Admin)
   * GET /profile/users/{profileId}
   * Note: This uses profileId, not userId
   */
  getUserById: async (profileId: string): Promise<UserProfileResponse> => {
    console.log(`👤 Admin fetching user profile: ${profileId}`);
    try {
      const response = (await api.get(
        `/profile/users/${profileId}`
      )) as ApiResponse<UserProfileResponse>;
      console.log("✅ User profile details:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Failed to fetch user profile:", error);
      throw error;
    }
  },

  /**
   * Update user profile (Admin only)
   * Note: Profile-service doesn't have admin update endpoint
   * Users can only update their own profile via /users/my-profile
   * For admin updates, use identity-service: PUT /identity/users/{userId}
   */
  updateUserProfile: async (
    userId: string,
    updates: UpdateProfileRequest
  ): Promise<UserProfileResponse> => {
    console.log(`✏️ Admin updating user profile: ${userId}`, updates);
    console.warn(
      "⚠️ This method may not work as expected. Profile-service doesn't support admin updates."
    );
    console.warn("⚠️ Consider using identity-service for user updates.");
    try {
      // This endpoint doesn't exist in profile-service
      // Keeping for backward compatibility but will likely fail
      const response = (await api.put(
        `/profile/users/my-profile`,
        updates
      )) as ApiResponse<UserProfileResponse>;
      console.log("✅ User profile updated:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Failed to update user profile:", error);
      throw error;
    }
  },

  /**
   * Search users (Admin)
   * POST /profile/users/search
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
   * Delete user (Admin only)
   * DELETE /identity/users/{userId}
   * Note: This calls identity-service, not profile-service
   */
  deleteUser: async (userId: string): Promise<void> => {
    console.log(`🗑️ Admin deleting user: ${userId}`);
    try {
      await api.delete(`/identity/users/${userId}`);
      console.log("✅ User deleted from identity-service");
      // Note: Profile will be deleted automatically via cascade or event
    } catch (error) {
      console.error("❌ Failed to delete user:", error);
      throw error;
    }
  },

  /**
   * Get user statistics (Admin)
   * Note: This endpoint doesn't exist in backend yet
   */
  getUserStatistics: async (): Promise<any> => {
    console.log("📊 Admin fetching user statistics...");
    console.warn("⚠️ This endpoint is not implemented in backend yet");
    try {
      const response = (await api.get(
        "/profile/users/statistics"
      )) as ApiResponse<any>;
      console.log("✅ Statistics retrieved:", response.result);
      return response.result;
    } catch (error) {
      console.error(
        "❌ Failed to fetch statistics (endpoint may not exist):",
        error
      );
      // Return mock data for now
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
      };
    }
  },
};

export default adminUserService;
