import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Login from "./Login";
import Register from "./Register";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || "login");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-screen">
          <div className="hidden md:block">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Welcome to MyBook
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Discover, share, and connect through books. Join our community
                of book lovers.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Explore Books
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Discover thousands of books across all genres
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Personalized Library
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Build and manage your personal book collection
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zM5 20a3 3 0 015.856-1.487M5 10a3 3 0 015.856 1.487"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Connect & Share
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Connect with other readers and share reviews
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-2xl p-8">
              <div className="flex gap-2 mb-8">
                <button
                  onClick={() => setTab("login")}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                    tab === "login"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setTab("register")}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                    tab === "register"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {tab === "login" ? <Login /> : <Register />}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center text-sm text-gray-600">
                  {tab === "login" ? (
                    <>
                      <p>
                        Need an account?{" "}
                        <button
                          onClick={() => setTab("register")}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Sign up
                        </button>
                      </p>
                      <p className="mt-2">
                        <a
                          href="/forgot-password"
                          className="text-blue-600 hover:underline"
                        >
                          Forgot password?
                        </a>
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Already have an account?{" "}
                        <button
                          onClick={() => setTab("login")}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Sign in
                        </button>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
