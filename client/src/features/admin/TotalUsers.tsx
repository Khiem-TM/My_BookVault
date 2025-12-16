import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Search,
  Edit2,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import adminUserService, {
  UserProfileResponse,
  UpdateProfileRequest,
} from "../../services/adminUserService";

const userSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function TotalUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<UserProfileResponse | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: async () => {
      if (search.trim()) {
        return adminUserService.searchUsers({ keyword: search });
      }
      return adminUserService.getAllUsers();
    },
  });

  const filteredUsers = usersData || [];

  const updateMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      if (!editingUser?.userId) throw new Error("No user selected");
      return adminUserService.updateUserProfile(editingUser.userId, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setNotification({
        type: "success",
        message: "User updated successfully",
      });
      setIsModalOpen(false);
      setEditingUser(null);
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (err: any) => {
      setNotification({
        type: "error",
        message: err.message || "Failed to update user",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      return adminUserService.deleteUser(userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setNotification({
        type: "success",
        message: "User deleted successfully",
      });
      setShowDeleteConfirm(null);
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (err: any) => {
      setNotification({
        type: "error",
        message: err.message || "Failed to delete user",
      });
    },
  });

  const handleEdit = (user: UserProfileResponse) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Notifications */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            notification.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Failed to load users. Please try again.
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden"
            >
              <div className="p-6">
                {/* Avatar */}
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.firstName}
                    className="w-16 h-16 rounded-full mb-4 mx-auto object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4 mx-auto text-white text-xl font-bold">
                    {user.firstName?.charAt(0) || "U"}
                  </div>
                )}

                {/* Info */}
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  {user.email}
                </p>

                {/* Details */}
                <div className="space-y-2 mb-6 text-sm text-gray-600">
                  {user.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{user.address}</span>
                    </div>
                  )}
                  {user.bio && (
                    <div className="pt-2 text-xs text-gray-500 italic">
                      "{user.bio}"
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(user.userId)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No users found
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete User
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(showDeleteConfirm)}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">Edit User</h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <UserForm
                user={editingUser}
                onSubmit={(data) => updateMutation.mutate(data)}
                isSubmitting={updateMutation.isPending}
                onCancel={handleModalClose}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function UserForm({
  user,
  onSubmit,
  isSubmitting,
  onCancel,
}: {
  user: UserProfileResponse;
  onSubmit: (data: UserFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      bio: user.bio || "",
      gender: user.gender || "",
      dateOfBirth: user.dateOfBirth || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            First Name
          </label>
          <input
            {...register("firstName")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="First name"
          />
          {errors.firstName && (
            <p className="text-sm text-red-500 mt-1">
              {String(errors.firstName?.message)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Last Name
          </label>
          <input
            {...register("lastName")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Last name"
          />
          {errors.lastName && (
            <p className="text-sm text-red-500 mt-1">
              {String(errors.lastName?.message)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Phone Number
          </label>
          <input
            {...register("phoneNumber")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Date of Birth
          </label>
          <input
            type="date"
            {...register("dateOfBirth")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Gender
          </label>
          <select
            {...register("gender")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Not specified</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Address
          </label>
          <input
            {...register("address")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Address"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Bio
        </label>
        <textarea
          {...register("bio")}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="User bio"
        />
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save
            </>
          )}
        </button>
      </div>
    </form>
  );
}
