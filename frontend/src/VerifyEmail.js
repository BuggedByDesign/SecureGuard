import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function VerifyEmail() {
  const [status, setStatus] = useState("Verifying your email...");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("❌ Missing verification token.");
      return;
    }

    fetch(`http://localhost:5000/api/auth/verify-email?token=${token}`) // добавих /auth, ако ползваш такъв route prefix
      .then((res) => {
        if (!res.ok) throw new Error("Invalid or expired verification token.");
        return res.text();
      })
      .then((msg) => {
        setStatus(`✅ ${msg}`);
        setTimeout(() => navigate("/login"), 4000); // след 4 сек. пренасочва към логин
      })
      .catch(() => {
        setStatus("❌ This verification link is invalid or has expired.");
      });
  }, [navigate]);

  // Определяне на тип на съобщението (успех/грешка)
  const isSuccess = status.startsWith("✅");
  const isError = status.startsWith("❌");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 px-4">
      <div className="bg-gray-900 border border-gray-800 shadow-xl rounded-2xl max-w-md w-full p-10 text-center">
        <h1 className="text-white text-2xl font-semibold mb-6">Email Verification</h1>

        <div
          className={`text-sm rounded-lg py-4 px-6 ${
            isSuccess
              ? "bg-green-600/10 text-green-300 border border-green-700"
              : isError
              ? "bg-red-600/10 text-red-400 border border-red-700"
              : "bg-gray-800 text-gray-300 border border-gray-700"
          }`}
        >
          {status}
        </div>

        {isSuccess && (
          <p className="mt-5 text-xs text-gray-400">
            Redirecting you to login page...
          </p>
        )}

        {isError && (
          <button
            onClick={() => navigate("/resend-verification")}
            className="mt-6 bg-white text-black text-sm font-medium px-6 py-2 rounded-md hover:bg-gray-200 transition"
          >
            Resend Email
          </button>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
