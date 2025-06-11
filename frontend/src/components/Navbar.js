import React, { useEffect, useState, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, isAdmin, logout } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/admin")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("❌ Failed to fetch products:", err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = searchTerm
    ? products.filter((p) =>
        (p.ProductName?.toLowerCase() + " " + p.Description?.toLowerCase()).includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-800 flex items-center gap-1">
          🛡️ SecureGuard
        </Link>

        <div className="flex items-center gap-5">
          <Link to="/compare" className="text-gray-700 hover:text-blue-600 text-sm font-medium">Compare</Link>
          <a href="#top-picks" className="text-gray-700 hover:text-blue-600 text-sm font-medium">Top Picks</a>
          <a href="#expert-reviews" className="text-gray-700 hover:text-blue-600 text-sm font-medium">Expert Reviews</a>
          <a href="#faq" className="text-gray-700 hover:text-blue-600 text-sm font-medium">FAQ</a>

          {/* Search */}
          <div className="relative group" ref={searchRef}>
            <div className="flex items-center border border-gray-300 rounded-full px-3 py-1 bg-white w-9 group-hover:w-64 focus-within:w-64 transition-all duration-300 overflow-hidden">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search antivirus..."
                className="ml-2 w-full text-sm focus:outline-none opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filtered.length > 0) {
                    navigate(`/product/${encodeURIComponent(filtered[0].ProductName)}`);
                    setSearchTerm("");
                  }
                }}
              />
            </div>

            {filtered.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-50 max-h-60 overflow-y-auto">
                {filtered.map((product) => (
                  <div
                    key={product.ProductID}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm flex justify-between"
                    onClick={() => {
                      navigate(`/product/${encodeURIComponent(product.ProductName)}`);
                      setSearchTerm("");
                    }}
                  >
                    <span>{product.ProductName}</span>
                    <span className="text-blue-600 font-medium">{product.Price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-600 hover:text-white transition text-sm font-medium"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-600 hover:text-white transition text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition text-sm font-medium"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
