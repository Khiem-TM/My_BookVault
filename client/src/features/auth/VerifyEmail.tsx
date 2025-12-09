import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      await authService.verifyEmail(token);
      setStatus("success");
      setMessage("Email verified successfully!");
      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      setStatus("error");
      setMessage(error.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
        {status === "loading" && (
          <>
            <Loader
              size={48}
              className="mx-auto mb-4 text-blue-600 animate-spin"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-gray-500 text-sm mt-4">Redirecting to home...</p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle size={48} className="mx-auto mb-4 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate("/auth")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
