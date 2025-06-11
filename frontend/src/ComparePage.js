import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ComparePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error("❌ Error loading products:", err));
  }, []);

  // Find best rating and lowest price
  const highestRating = Math.max(...products.map(p => p.AverageRating || 0));
  const lowestPrice = Math.min(...products.map(p => parseFloat(p.Price) || Infinity));

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/"
          className="inline-block mb-6 text-blue-600 hover:underline font-medium"
        >
          ← Back to Home
        </Link>

        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-2">
          Antivirus Comparison
        </h2>
        <p className="text-center text-gray-600 mb-10">
          Compare features, pricing, and performance to find the right antivirus solution for your needs.
        </p>

        <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-blue-50 text-blue-800 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Antivirus</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Price/Year</th>
                <th className="px-6 py-4">Malware Protection</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4">Platforms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => {
                const isBestRating = (product.AverageRating || 0) === highestRating;
                const isBestPrice = parseFloat(product.Price) === lowestPrice;

                const rowClass = isBestRating
                  ? "bg-green-50"
                  : isBestPrice
                  ? "bg-blue-50"
                  : "";

                return (
                  <tr key={product.ProductID} className={`${rowClass} hover:bg-gray-50 transition`}>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {product.ProductName || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-yellow-600 font-medium">
                      {product.AverageRating
                        ? `${product.AverageRating.toFixed(1)} / 5.0`
                        : "–"}
                    </td>
                    <td className="px-6 py-4 text-blue-700 font-semibold">
                      {product.Price}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        Excellent
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                        Medium
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {["Windows", "macOS", "iOS", "Android"].map((os) => (
                          <span
                            key={os}
                            className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs"
                          >
                            {os}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
