import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Registration successful!");
        window.location.href = "/login";
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (err) {
      alert("Server error.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      <form
        onSubmit={handleRegister}
        className="bg-white/20 backdrop-blur-md shadow-2xl rounded-2xl p-10 w-full max-w-md text-white animate-fade-in"
      >
        <h2 className="text-3xl font-extrabold text-center mb-8 drop-shadow-md">
          Create Account
        </h2>

        <div className="mb-6 relative">
          <FaUser className="absolute left-3 top-3 text-white/80" />
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2 bg-white/30 text-white placeholder-white/80 border border-white/40 rounded focus:outline-none focus:ring-2 focus:ring-white transition-all font-medium"
          />
        </div>

        <div className="mb-6 relative">
          <FaEnvelope className="absolute left-3 top-3 text-white/80" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          Register
        </button>

        <p className="mt-6 text-center text-sm text-white/80">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-yellow-300 hover:underline font-semibold"
          >
            Login here
          </a>
        </p>
      </form>
    </div>
  );
}

export default Register;
