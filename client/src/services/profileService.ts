import api from "./apiClient";

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  dob?: string;
  city?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  dob?: string;
  city?: string;
  avatar?: string;
}

const profileService = {
  /**
   * Get my profile
   */
  getMyProfile: async (): Promise<UserProfile> => {
    console.log("👤 Fetching my profile...");
    try {
      const response = await api.get("/profile/users/my-profile");
      console.log("✅ My profile:", response.result);
      return response.result;
    } catch (error) {
      console.error("❌ Get profile error:", error);
      throw error;
    }
  },

  /**
   * Get profile by ID
   */
  getProfile: async (profileId: string): Promise<UserProfile> => {
    console.log(`👤 Fetching profile: ${profileId}...`);
    try {
      const response = await api.get(`/profile/users/${profileId}`);
      console.log("✅ Profile:", response.result);
      return response.result;
    } catch (error) {
      console.error("❌ Get profile error:", error);
      throw error;
    }
  },

  /**
   * Update my profile
   */
  updateMyProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    console.log("✏️ Updating my profile...", data);
    try {
      const response = await api.put("/profile/users/my-profile", data);
      console.log("✅ Profile updated:", response.result);
      return response.result;
    } catch (error) {
      console.error("❌ Update profile error:", error);
      throw error;
    }
  },

  /**
   * Update avatar
   */
  updateAvatar: async (file: File): Promise<UserProfile> => {
    console.log("🖼️ Updating avatar...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.put("/profile/users/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("✅ Avatar updated:", response.result);
      return response.result;
    } catch (error) {
      console.error("❌ Update avatar error:", error);
      throw error;
    }
  },

  /**
   * Search users
   */
  searchUsers: async (query: string): Promise<UserProfile[]> => {
    console.log("🔍 Searching users...", query);
    try {
      const response = await api.post("/profile/users/search", { query });
      console.log("✅ Search results:", response.result);
      return response.result;
    } catch (error) {
      console.error("❌ Search error:", error);
      throw error;
    }
  },
};

export default profileService;
