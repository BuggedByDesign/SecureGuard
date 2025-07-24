import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaKey } from "react-icons/fa";

export default function Login() {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const savedName = localStorage.getItem("rememberedFullName");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedName) {
      setFullName(savedName);
      setRememberMe(true);
    }
    if (savedPassword) {
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!fullName || !password) {
      alert("Please enter name and password.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, password }),
      });
      const data = await res.json();

      if (res.ok) {
        alert("A 2FA code was sent to your email.");
        setUserId(data.userId);
        setStep(2);
      } else {
        alert(data.message || "Login failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      alert("Please enter the 2FA code.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp: otpCode }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("userId", data.user.id);
        login(data.token, data.user.isAdmin);

        if (rememberMe) {
          localStorage.setItem("rememberedFullName", fullName);
          localStorage.setItem("rememberedPassword", password);
        } else {
          localStorage.removeItem("rememberedFullName");
          localStorage.removeItem("rememberedPassword");
        }

        alert(data.message || "Login successful!");
        navigate("/");
      } else {
        alert(data.message || "Invalid OTP code.");
      }
    } catch (err) {
      console.error(err);
      alert("Error verifying OTP.");
    }
  };

  const handleResendOtp = async () => {
    if (!userId) return;
    try {
      const res = await fetch("http://localhost:5000/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      alert(data.message || "New code sent.");
    } catch (err) {
      console.error(err);
      alert("Failed to resend code.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500">
      <form
        onSubmit={step === 1 ? handlePasswordLogin : handleOtpSubmit}
        className="bg-white/20 backdrop-blur-md shadow-2xl rounded-2xl p-10 w-full max-w-md text-white"
      >
        <h2 className="text-3xl font-extrabold text-center mb-8">
          {step === 1 ? "Welcome Back" : "Enter 2FA Code"}
        </h2>

        {step === 1 ? (
          <>
            <div className="mb-6 relative">
              <FaUser className="absolute left-3 top-3 text-white/80" />
              <input
                type="text"
                placeholder="Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-white/30 text-gray-900 placeholder-white rounded"
              />
            </div>
            <div className="mb-6 relative">
              <FaLock className="absolute left-3 top-3 text-white/80" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2 bg-white/30 text-gray-900 placeholder-white rounded"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-3 focus:outline-none text-white/80"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="flex items-center mb-6">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="rememberMe" className="text-white/80">
                Remember Me
              </label>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 relative">
              <FaKey className="absolute left-3 top-3 text-white/80" />
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-white/30 text-gray-900 placeholder-white rounded"
              />
            </div>
            <div className="text-right mb-4">
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-sm text-white/80 underline hover:text-yellow-300"
              >
                Resend Code
              </button>
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full bg-white/30 hover:bg-white/40 text-white font-bold py-2 rounded"
        >
          {step === 1 ? "Login" : "Verify Code"}
        </button>

        {step === 1 && (
          <p className="mt-6 text-center text-sm text-white/80">
            Don't have an account?{" "}
            <a href="/register" className="text-yellow-300 hover:underline">
              Register Here
            </a>
          </p>
        )}
      </form>
    </div>
  );
}
