import React, { useEffect, useState } from "react";
import { api } from "../../services/apiClient";
import {
  User,
  Mail,
  Book,
  Heart,
  Clock,
  Award,
  Settings,
  Camera,
  Edit3,
  Save,
  X,
} from "lucide-react";

interface UserStats {
  totalBooksRead: number;
  currentlyReading: number;
  wishlistCount: number;
  reviewsWritten: number;
  favoriteGenre: string;
  joinedDate: string;
}

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock user stats for demo
  const [userStats] = useState<UserStats>({
    totalBooksRead: 45,
    currentlyReading: 3,
    wishlistCount: 12,
    reviewsWritten: 28,
    favoriteGenre: "Science Fiction",
    joinedDate: "2023-01-15",
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/identity/users/my-info")
      .then((r) => {
        if (!mounted) return;
        const u = r.data;
        setUserId(u?.id);
        setName(u?.name || "");
        setEmail(u?.email || "");
      })
      .catch(() => setMessage("Failed to load profile information"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  async function save() {
    setMessage(undefined);
    setLoading(true);
    try {
      if (!userId) throw new Error("Missing user id");
      await api.put(`/identity/users/${userId}`, { name, email });
      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (e: any) {
      setMessage(e?.message || "Failed to save profile");
    }
    setLoading(false);
  }

  const handleCancel = () => {
    setIsEditing(false);
    setMessage(undefined);
    // Reset form to original values if needed
  };

  if (loading && !userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600">
                  Manage your account and reading preferences
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? (
                <X className="h-4 w-4" />
              ) : (
                <Edit3 className="h-4 w-4" />
              )}
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center gap-6 mb-8">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  {isEditing && (
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {name || "Your Name"}
                  </h2>
                  <p className="text-gray-600">
                    {email || "your.email@example.com"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Member since{" "}
                    {new Date(userStats.joinedDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              {/* Message Display */}
              {message && (
                <div
                  className={`mb-6 p-4 rounded-lg ${
                    message.includes("success") || message.includes("Saved")
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Edit Form */}
              {isEditing && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t">
                    <button
                      onClick={save}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Profile Information Display */}
              {!isEditing && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">
                      {name || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">
                      {email || "Not provided"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reading Statistics */}
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Reading Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Book className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">Books Read</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {userStats.totalBooksRead}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-gray-700">Currently Reading</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">
                    {userStats.currentlyReading}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    <span className="text-gray-700">Wishlist</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {userStats.wishlistCount}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">Reviews Written</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {userStats.reviewsWritten}
                  </span>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Preferences
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-600">Favorite Genre:</span>
                  <div className="mt-1">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {userStats.favoriteGenre}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Account Settings
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">
                    Change Password
                  </div>
                  <div className="text-sm text-gray-600">
                    Update your account password
                  </div>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">
                    Email Preferences
                  </div>
                  <div className="text-sm text-gray-600">
                    Manage notification settings
                  </div>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">
                    Privacy Settings
                  </div>
                  <div className="text-sm text-gray-600">
                    Control your data and privacy
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
