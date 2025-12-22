import { Route, Routes, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Home from "./features/user/Home";
import BooksList from "./features/user/BooksList";
import BookDetail from "./features/user/BookDetail";
import Orders from "./features/user/Orders";
import MyPlaylist from "./features/user/MyPlaylist";
import PlaylistDetail from "./features/user/PlaylistDetail";
import Profile from "./features/user/Profile";
import Genres from "./features/user/Genres";
import History from "./features/user/History";
import AdminDashboard from "./features/admin/AdminDashboard";
import AuthPage from "./features/auth/AuthPage";
import TotalBooks from "./features/admin/TotalBooks";
import AdminBookDetail from "./features/admin/AdminBookDetail";
import TotalUsers from "./features/admin/TotalUsers";
import TotalBorrows from "./features/admin/TotalBorrows";
import { JSX } from "react";
import Layout from "./shared/ui/Layout";
import AdminLayout from "./features/admin/AdminLayout";
import AdminCommunity from "./features/admin/AdminCommunity";
import { useAuthStore } from "./store/authStore";

/**
 * Protected Route Wrapper
 * - Checks if user is authenticated (has token)
 * - Optionally checks if user has required role
 */
function ProtectedRoute({
  children,
  role,
}: {
  children: JSX.Element;
  role?: "ADMIN" | "USER";
}) {
  const { isAuthenticated, token, role: userRole } = useAuthStore();

  console.log("🔐 ProtectedRoute check:", { isAuthenticated, role, userRole });

  if (!isAuthenticated || !token) {
    console.warn("⚠️ Not authenticated, redirecting to login");
    return <Navigate to="/auth" replace />;
  }

  if (role && userRole !== role) {
    console.warn(
      `⚠️ Insufficient permissions. Required: ${role}, Have: ${userRole}`
    );
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600 mt-2">
          You don't have permission to access this page.
        </p>
        <a href="/" className="text-blue-600 hover:underline mt-4 block">
          Go back to home
        </a>
      </div>
    );
  }

  return children;
}

export default function App() {
  const { initAuth } = useAuthStore();

  // Initialize auth from storage on app mount
  useEffect(() => {
    console.log("🚀 App mounted, initializing auth...");
    initAuth();
  }, [initAuth]);

  return (
    <Routes>
      {/* Auth Routes - Public */}
      <Route path="/auth/*" element={<AuthPage />} />

      {/* User Routes - Protected */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="books" element={<BooksList />} />
        <Route path="books/:id" element={<BookDetail />} />
        <Route path="orders" element={<Orders />} />
        <Route path="playlists" element={<MyPlaylist />} />
        <Route path="playlists/:id" element={<PlaylistDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="genres" element={<Genres />} />
        <Route path="history" element={<History />} />
      </Route>

      {/* Admin Routes - Protected + Role Check */}
      <Route
        element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/total-books" element={<TotalBooks />} />
        <Route path="admin/books/:id" element={<AdminBookDetail />} />
        <Route path="admin/total-users" element={<TotalUsers />} />
        <Route path="admin/total-borrows" element={<TotalBorrows />} />
        <Route path="admin/community" element={<AdminCommunity />} />
      </Route>

      {/* Catch-all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
