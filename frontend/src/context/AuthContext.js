import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const adminFlag = localStorage.getItem("isAdmin") === "true";
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      setIsAdmin(adminFlag);
    }
  }, []);

  // 🔁 Refresh token every 5 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) return;

      try {
        const res = await fetch("http://localhost:5000/api/auth/refresh-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });

        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          console.log("✅ Access token refreshed.");
        } else {
          console.warn("⚠️ Token refresh failed.");
        }
      } catch (error) {
        console.error("❌ Error refreshing token:", error);
      }
    }, 5 * 60 * 1000); // every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const login = (newToken, isAdminFlag) => {
    setToken(newToken);
    setIsLoggedIn(true);
    setIsAdmin(isAdminFlag);
    localStorage.setItem("token", newToken);
    localStorage.setItem("isAdmin", isAdminFlag);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userId");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isAdmin, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
