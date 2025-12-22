import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import { authSharedService } from "../../services/shared/AuthSharedService";
import {
  userProfileService,
  UserProfile,
} from "../../services/user/UserProfileService";
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
  Camera,
  MapPin,
} from "lucide-react";

import { UserInfo } from "../../services/shared/AuthSharedService";

export default function Profile() {
  const { user: authUser } = useAuthStore();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    city: "",
  });

  // Fetch user info
  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    setIsLoading(true);
    try {
      const userInfo = await authSharedService.getCurrentUser();
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
          dob: userProfile.dob || "",
          city: userProfile.city || "",
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
          dob: "",
          city: "",
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarLoading(true);
      try {
        const updatedProfile = await userProfileService.updateAvatar(file);
        setProfile(updatedProfile);
        setMessage({
          type: "success",
          text: "Avatar updated successfully!",
        });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.error("Failed to update avatar:", error);
        setMessage({
          type: "error",
          text: "Failed to update avatar",
        });
      } finally {
        setAvatarLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update profile service
      const updated = await userProfileService.updateMyProfile(formData);
      setProfile(updated);

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
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        dob: profile.dob || "",
        city: profile.city || "",
      });
    } else if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
        dob: "",
        city: "",
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

  const getDisplayName = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName} ${formData.lastName}`;
    }
    return user?.username;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account information</p>
          </div>
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
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              {/* Left Sidebar / Avatar */}
              <div className="md:w-1/3 bg-gray-50 p-8 border-r border-gray-100 flex flex-col items-center text-center">
                 <div className="relative group mb-6">
                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200">
                      {profile?.avatar ? (
                        <img 
                          src={profile.avatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-600">
                           <User className="text-white w-20 h-20" />
                        </div>
                      )}
                    </div>
                    
                    {/* Avatar Upload Overlay */}
                    <div 
                      onClick={handleAvatarClick}
                      className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                       {avatarLoading ? (
                         <Loader className="text-white animate-spin" />
                       ) : (
                         <Camera className="text-white" />
                       )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                 </div>
                 
                 <h2 className="text-xl font-bold text-gray-900 mb-1">{getDisplayName()}</h2>
                 <p className="text-gray-500 mb-4">@{user.username}</p>
                 
                 <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {Array.isArray(user.roles) &&
                      user.roles.map((role: any, index: number) => {
                        const roleName =
                          typeof role === "string"
                            ? role
                            : role.name || JSON.stringify(role);
                        return (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wide"
                          >
                            {roleName}
                          </span>
                        );
                      })}
                  </div>
              </div>

              {/* Right Content */}
              <div className="md:w-2/3 p-8">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>
                    )}
                 </div>

                 {!isEditing ? (
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">First Name</label>
                            <p className="font-medium text-gray-900 mt-1">{profile?.firstName || "-"}</p>
                         </div>
                         <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Last Name</label>
                            <p className="font-medium text-gray-900 mt-1">{profile?.lastName || "-"}</p>
                         </div>
                      </div>
                      
                      <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                          <div className="flex items-center gap-2 mt-1">
                             <p className="font-medium text-gray-900">{profile?.email || "-"}</p>
                             {user.emailVerified && <CheckCircle size={14} className="text-green-500" />}
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date of Birth</label>
                            <div className="flex items-center gap-2 mt-1">
                               <Calendar size={16} className="text-gray-400" />
                               <p className="font-medium text-gray-900">{profile?.dob || "-"}</p>
                            </div>
                         </div>
                         <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">City</label>
                            <div className="flex items-center gap-2 mt-1">
                               <MapPin size={16} className="text-gray-400" />
                               <p className="font-medium text-gray-900">{profile?.city || "-"}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                 ) : (
                   <form className="space-y-5">
                      <div className="grid grid-cols-2 gap-5">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                           <input
                             type="text"
                             name="firstName"
                             value={formData.firstName}
                             onChange={handleInputChange}
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                           <input
                             type="text"
                             name="lastName"
                             value={formData.lastName}
                             onChange={handleInputChange}
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                           />
                         </div>
                      </div>

                      <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                         <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                           <input
                             type="date"
                             name="dob"
                             value={formData.dob}
                             onChange={handleInputChange}
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                           <input
                             type="text"
                             name="city"
                             value={formData.city}
                             onChange={handleInputChange}
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                           />
                         </div>
                      </div>

                      <div className="flex gap-3 pt-4 justify-end border-t mt-6">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-5 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={isLoading}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-70 flex items-center gap-2"
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
                      </div>
                   </form>
                 )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
