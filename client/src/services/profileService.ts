import api, { ApiResponse } from "./apiClient";

// =============================================
// Request Interfaces
// =============================================

/**
 * Request để cập nhật profile
 * PUT /profile/users/my-profile
 */
export interface UpdateProfileRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  dob?: string; // Format: YYYY-MM-DD (LocalDate)
  city?: string;
}

/**
 * Request để tìm kiếm user
 * POST /profile/users/search
 */
export interface SearchUserRequest {
  keyword: string;
}

// =============================================
// Response Interfaces
// =============================================

/**
 * Response cho User Profile
 * Tương ứng với UserProfileResponse.java
 */
export interface UserProfile {
  id: string; // Profile ID
  userId: string; // User ID từ identity service
  username: string;
  avatar?: string;
  email: string;
  firstName: string;
  lastName: string;
  dob?: string; // Format: YYYY-MM-DD
  city?: string;
}

// =============================================
// Profile Service
// =============================================

const profileService = {
  /**
   * Lấy profile của người dùng hiện tại
   * GET /profile/users/my-profile
   * @returns Promise<UserProfile>
   */
  getMyProfile: async (): Promise<UserProfile> => {
    console.log("👤 Fetching my profile...");
    try {
      const response: ApiResponse<UserProfile> = await api.get(
        "/profile/users/my-profile"
      );
      console.log("✅ My profile:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Get my profile error:", error);
      throw error;
    }
  },

  /**
   * Lấy profile theo profile ID
   * GET /profile/users/{profileId}
   * @param profileId - ID của profile (không phải userId)
   * @returns Promise<UserProfile>
   */
  getProfile: async (profileId: string): Promise<UserProfile> => {
    console.log(`👤 Fetching profile: ${profileId}...`);
    try {
      const response: ApiResponse<UserProfile> = await api.get(
        `/profile/users/${profileId}`
      );
      console.log("✅ Profile fetched:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Get profile error:", error);
      throw error;
    }
  },

  /**
   * Lấy tất cả profiles (có thể cần quyền admin)
   * GET /profile/users
   * @returns Promise<UserProfile[]>
   */
  getAllProfiles: async (): Promise<UserProfile[]> => {
    console.log("👥 Fetching all profiles...");
    try {
      const response: ApiResponse<UserProfile[]> = await api.get(
        "/profile/users"
      );
      console.log("✅ All profiles fetched:", response.result?.length);
      return response.result!;
    } catch (error) {
      console.error("❌ Get all profiles error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật profile của người dùng hiện tại
   * PUT /profile/users/my-profile
   * @param data - UpdateProfileRequest
   * @returns Promise<UserProfile>
   */
  updateMyProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    console.log("✏️ Updating my profile...", data);
    try {
      const response: ApiResponse<UserProfile> = await api.put(
        "/profile/users/my-profile",
        data
      );
      console.log("✅ Profile updated:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Update profile error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật avatar của người dùng hiện tại
   * PUT /profile/users/avatar
   * @param file - File ảnh avatar
   * @returns Promise<UserProfile>
   */
  updateAvatar: async (file: File): Promise<UserProfile> => {
    console.log("🖼️ Updating avatar...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response: ApiResponse<UserProfile> = await api.put(
        "/profile/users/avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("✅ Avatar updated:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Update avatar error:", error);
      throw error;
    }
  },

  /**
   * Tìm kiếm users theo keyword
   * POST /profile/users/search
   * @param keyword - Từ khóa tìm kiếm (username, email, firstName, lastName)
   * @returns Promise<UserProfile[]>
   */
  searchUsers: async (keyword: string): Promise<UserProfile[]> => {
    console.log("🔍 Searching users with keyword:", keyword);
    try {
      const request: SearchUserRequest = { keyword };
      const response: ApiResponse<UserProfile[]> = await api.post(
        "/profile/users/search",
        request
      );
      console.log("✅ Search results:", response.result?.length, "users found");
      return response.result || [];
    } catch (error) {
      console.error("❌ Search users error:", error);
      throw error;
    }
  },

  // =============================================
  // Internal APIs (Chỉ dùng cho internal services)
  // =============================================

  /**
   * [INTERNAL] Lấy profile theo userId
   * GET /profile/internal/users/{userId}
   * Note: Endpoint này thường được gọi bởi identity-service hoặc internal services
   * @param userId - User ID từ identity service
   * @returns Promise<UserProfile>
   */
  getProfileByUserId: async (userId: string): Promise<UserProfile> => {
    console.log(`🔍 [INTERNAL] Fetching profile by userId: ${userId}...`);
    try {
      const response: ApiResponse<UserProfile> = await api.get(
        `/profile/internal/users/${userId}`
      );
      console.log("✅ Profile fetched by userId:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Get profile by userId error:", error);
      throw error;
    }
  },
};

export default profileService;
