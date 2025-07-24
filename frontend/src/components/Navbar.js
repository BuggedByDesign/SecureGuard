// src/components/Navbar.jsx
import React, { useEffect, useState, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
const { user, isLoggedIn, isAdmin, logout } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

// BEACON
useEffect(() => {
  const sendOfflineBeacon = () => {
    if (!user?.id || window._beaconSent) return;
    window._beaconSent = true;
    console.log("📡 Sending logout beacon for user ID:", user.id);

    navigator.sendBeacon(
      "http://localhost:5000/api/auth/logout-beacon",
    new Blob([JSON.stringify({ userId: user.id })], { type: "application/json" })    );
  };

  window.addEventListener("offline", () => {
    console.log("⚠️ User went offline");
    sendOfflineBeacon();
  });

  window.addEventListener("beforeunload", () => {
    console.log("🔄 Page unloading...");
    sendOfflineBeacon();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      console.log("👀 Tab hidden — triggering beacon");
      sendOfflineBeacon();
    }
  });

  return () => {
    window.removeEventListener("offline", sendOfflineBeacon);
    window.removeEventListener("beforeunload", sendOfflineBeacon);
    document.removeEventListener("visibilitychange", sendOfflineBeacon);
  };
}, [user]);


  // –→

  useEffect(() => {
    fetch("http://localhost:5000/api/admin")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("❌ Failed to fetch products:", err));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = searchTerm
    ? products.filter((p) =>
        (p.ProductName + " " + p.Description)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="w-full px-4 py-3 flex items-center justify-around">
        <div className="flex items-center gap-4">
          <button
            className="block p-2 hover:bg-gray-100 rounded transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link
            to="/"
            className="text-xl font-bold text-blue-800 flex items-center gap-1"
          >
             SecureGuard
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group block" ref={searchRef}>
            <div className="flex items-center border border-gray-300 rounded-full px-3 py-1 bg-white w-9 group-hover:w-64 transition-all duration-300 overflow-hidden">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search antivirus..."
                className="ml-2 w-full text-sm focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filtered.length) {
                    navigate(
                      `/product/${encodeURIComponent(
                        filtered[0].ProductName
                      )}`
                    );
                    setSearchTerm("");
                  }
                }}
              />
            </div>

            {searchTerm && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-50 max-h-60 overflow-y-auto">
                {filtered.length ? (
                  filtered.map((p) => (
                    <div
                      key={p.ProductID}
                      className="px-4 py-2 hover:bg-blue-100 cursor-pointer flex justify-between text-sm"
                      onClick={() => {
                        navigate(
                          `/product/${encodeURIComponent(p.ProductName)}`
                        );
                        setSearchTerm("");
                      }}
                    >
                      <span>{p.ProductName}</span>
                      <span className="text-blue-600 font-medium">
                        {p.Price}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>

          {isLoggedIn && (
            <Link
              to="/profile"
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Profile
            </Link>
          )}

          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3 py-1 border border-green-600 text-green-600 rounded hover:bg-green-600 hover:text-white text-sm"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="px-3 py-1 border border-red-600 text-red-600 rounded hover:bg-red-600 hover:text-white text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white text-sm"
            >
              Login / Register
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMenuOpen(false)}
          ></div>

          {/* Side Drawer with light/dark theme */}
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-[#181818] text-gray-900 dark:text-white z-50 shadow-lg flex flex-col">
            {/* Header with logo */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Link
                to="/"
                className="flex items-center text-blue-800 dark:text-white text-lg font-semibold gap-1"
                onClick={() => setMenuOpen(false)}
              >
                 SecureGuard
              </Link>
            </div>

            {/* Navigation */}
            <ul className="flex flex-col px-4 py-4 gap-3 text-sm">
              <Link
                to="/compare"
                onClick={() => setMenuOpen(false)}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                Compare
              </Link>
              <Link
                to="/news"
                onClick={() => setMenuOpen(false)}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                News
              </Link>
              <a
                href="#top-picks"
                onClick={() => setMenuOpen(false)}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                Top Picks
              </a>
              <a
                href="#expert-reviews"
                onClick={() => setMenuOpen(false)}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                Expert Reviews
              </a>
              <a
                href="#faq"
                onClick={() => setMenuOpen(false)}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                FAQ
              </a>
              <Link
                to="/picker"
                onClick={() => setMenuOpen(false)}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                Antivirus Picker
              </Link>
              <Link
                to="/threat-scan"
                onClick={() => setMenuOpen(false)}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                File Check
              </Link>
            </ul>
          </div>
        </>
      )}
    </nav>
  );
}
