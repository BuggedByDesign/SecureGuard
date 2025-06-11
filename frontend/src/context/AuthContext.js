import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");

  const login = (token, adminFlag) => {
    localStorage.setItem("token", token);
    localStorage.setItem("isAdmin", adminFlag);
    setIsLoggedIn(true);
    setIsAdmin(adminFlag);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    setIsAdmin(localStorage.getItem("isAdmin") === "true");
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
