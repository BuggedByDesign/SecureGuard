import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { FaUser, FaLock } from "react-icons/fa";

function Login() {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!fullName || !password) {
      alert("Please enter both name and password.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user.isAdmin);
        alert(data.message || "Login successful!");
        navigate("/");
      } else {
        alert(data.message || "Login failed.");
      }
    } catch (err) {
      alert("Server connection error.");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500">
      <form
        onSubmit={handleLogin}
        className="bg-white/20 backdrop-blur-md shadow-2xl rounded-2xl p-10 w-full max-w-md text-white animate-fade-in"
      >
        <h2 className="text-3xl font-extrabold text-center mb-8 drop-shadow-md">Welcome Back</h2>

        <div className="mb-6 relative">
          <FaUser className="absolute left-3 top-3 text-white/80" />
          <input
            type="text"
            placeholder="Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2 bg-white/30 text-white placeholder-white/80 border border-white/40 rounded focus:outline-none focus:ring-2 focus:ring-white transition-all font-medium"
          />
        </div>

        <div className="mb-6 relative">
          <FaLock className="absolute left-3 top-3 text-white/80" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2 bg-white/30 text-white placeholder-white/80 border border-white/40 rounded focus:outline-none focus:ring-2 focus:ring-white transition-all font-medium"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-white/30 hover:bg-white/40 text-white font-bold py-2 px-4 rounded transition-all"
        >
          Login
        </button>

        <p className="mt-6 text-center text-sm text-white/80">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-yellow-300 hover:underline font-semibold"
          >
            Register here
          </a>
        </p>
      </form>
    </div>
  );
}

export default Login;
