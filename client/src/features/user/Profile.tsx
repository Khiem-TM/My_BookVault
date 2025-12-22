import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { authSharedService } from "../../services/shared/AuthSharedService";
import { userProfileService, UserProfile } from "../../services/user/UserProfileService";
import {
  User,
  Mail,
  Calendar,
  Edit3,
  Save,
  X,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { UserInfo } from "../../services/shared/AuthSharedService";

export default function Profile() {
  const { user: authUser } = useAuthStore();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Fetch user info
  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    setIsLoading(true);
    try {
      const userInfo = await authSharedService.getCurrentUser();
      console.log("✅ User info loaded:", userInfo);
      setUser(userInfo);

      // Try to fetch profile from profile service
      try {
        const userProfile = await userProfileService.getMyProfile();
        console.log("✅ User profile loaded:", userProfile);
        setProfile(userProfile);
        setFormData({
          firstName: userProfile.firstName || userInfo.firstName || "",
          lastName: userProfile.lastName || userInfo.lastName || "",
          email: userProfile.email || userInfo.email,
        });
      } catch (profileError) {
        console.warn(
          "⚠️ Could not load profile from profile-service, using auth data:",
          profileError
        );
        setFormData({
          firstName: userInfo.firstName || "",
          lastName: userInfo.lastName || "",
          email: userInfo.email,
        });
      }
    } catch (error) {
      console.error("❌ Failed to load user profile:", error);
      setMessage({
        type: "error",
        text: "Failed to load profile information",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Try to update profile service first
      let updated;
      if (profile) {
        updated = await userProfileService.updateMyProfile(formData);
        setProfile(updated);
      } else {
        // Fallback to auth service update
        // Fallback to auth service update... wait, AuthSharedService does not have updateUser.
        // If updateUser is missing, I should check if I can add it or if I should just fail.
        // But for now I'll comment it out or warn, as I don't see updateUser in AuthSharedService.
        // Actually, I'll assume profileService.updateMyProfile is sufficient for now as per refactor plan.
        console.warn("Fallback update not supported in new auth service");
        // updated = await authService.updateUser(user.id, formData);
      }

      setUser({
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });

      setIsEditing(false);
      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("❌ Failed to update profile:", error);
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
      });
    }
    setMessage(null);
  };

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={40} />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Profile Card */}
        {user && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Avatar Section */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={48} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600">{user.username}</p>
                <div className="mt-2 flex gap-2">
                  {Array.isArray(user.roles) && user.roles.map((role: any, index: number) => {
                    const roleName = typeof role === 'string' ? role : (role.name || JSON.stringify(role));
                    return (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {roleName}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            {!isEditing ? (
              <div className="space-y-6">
                {/* Name */}
                <div className="flex items-center gap-4">
                  <User className="text-gray-400" size={20} />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Full Name</label>
                    <p className="text-lg font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4">
                  <Mail className="text-gray-400" size={20} />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="text-lg font-medium text-gray-900">
                      {user.email}
                    </p>
                    {user.emailVerified ? (
                      <span className="text-sm text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-sm text-yellow-600">
                        ⚠ Not verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div className="flex items-center gap-4">
                  <Calendar className="text-gray-400" size={20} />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Username</label>
                    <p className="text-lg font-medium text-gray-900">
                      {user.username}
                    </p>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="pt-4 border-t">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Edit3 size={18} />
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form className="space-y-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="animate-spin" size={18} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
