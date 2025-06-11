import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpertReviews from "./ExpertReviews";

function AntivirusListT() {
  const [products, setProducts] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://secureguard-db2i.onrender.com/api/admin")
      .then((res) => res.json())
      .then(async (data) => {
        const enriched = await Promise.all(
          data.map(async (product) => {
            try {
              const res = await fetch(
                `http://localhost:5000/api/products/${product.ProductName}/features`
              );
              const features = await res.json();
              return { ...product, features };
            } catch (err) {
              console.error("❌ Грешка при взимане на features:", err);
              return { ...product, features: [] };
            }
          })
        );
        setProducts(enriched);
      })
      .catch((err) => console.error("❌ Грешка при зареждане:", err));
  }, []);

  const handleSort = (type) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(type);
      setSortOrder("desc");
    }
  };

  const sortedProducts = [...products];

  if (sortBy === "price") {
    sortedProducts.sort((a, b) => {
      const priceA = parseFloat((a.Price || "").replace(/[^0-9.]/g, ""));
      const priceB = parseFloat((b.Price || "").replace(/[^0-9.]/g, ""));
      return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
    });
  } else if (sortBy === "rating") {
    sortedProducts.sort((a, b) =>
      sortOrder === "asc"
        ? (a.AverageRating || 0) - (b.AverageRating || 0)
        : (b.AverageRating || 0) - (a.AverageRating || 0)
    );
  }

  const topRated = [...products]
    .sort((a, b) => (b.AverageRating || 0) - (a.AverageRating || 0))[0]?.ProductID;

  const bestValue = [...products]
    .sort((a, b) => parseFloat(a.Price) - parseFloat(b.Price))[0]?.ProductID;

  return (
    <section id="top-picks" className="bg-gray-100 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 text-center">
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={() => handleSort("rating")}
              className={`px-3 py-1 rounded ${
                sortBy === "rating" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Sort by Rating {sortBy === "rating" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => handleSort("price")}
              className={`px-3 py-1 rounded ${
                sortBy === "price" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Sort by Price {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
          </div>
          <h2 className="text-2xl font-bold">Our Top Antivirus Picks</h2>
          <p className="text-gray-600 mt-2">
            Based on comprehensive testing and evaluation, these are our recommended antivirus solutions for complete protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedProducts.map((product) => (
            <div
              key={product.ProductID}
              className="relative bg-white p-4 rounded-lg shadow-md hover:shadow-xl text-center transition-transform duration-300 hover:scale-105"
            >
              {product.ProductID === topRated && (
                <div className="absolute top-0 left-0 w-full bg-blue-600 text-white py-1 rounded-t-lg text-sm font-semibold">
                  🏅 Editor's Choice
                </div>
              )}
              {product.ProductID === bestValue && product.ProductID !== topRated && (
                <div className="absolute top-0 left-0 w-full bg-green-600 text-white py-1 rounded-t-lg text-sm font-semibold">
                  💰 Best Value
                </div>
              )}
              <img
                src={
                  product.ImageURL?.startsWith("data:image")
                    ? product.ImageURL
                    : product.ImageURL?.startsWith("http")
                    ? product.ImageURL
                    : `http://localhost:5000${product.ImageURL}`
                }
                alt={product.ProductName}
                className="h-20 mx-auto my-6 object-contain"
              />
              <h3 className="font-semibold">{product.ProductName}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.Description}</p>
              <p className="text-blue-700 font-bold">{product.Price}</p>

              {product.features && product.features.length > 0 && (
                <div className="text-left mt-4">
                  <h4 className="font-semibold text-sm mb-1">Key Features</h4>
                  <ul className="list-inside">
                    {product.features.slice(0, 4).map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start text-sm text-gray-700 mb-1"
                      >
                        <span className="text-purple-600 mr-2">✔️</span>
                        <span>{feature.Feature || feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {typeof product.AverageRating === "number" ? (
                <p className="text-yellow-500 mt-1 font-medium">
                  ⭐ {product.AverageRating.toFixed(1)} / 5.0
                </p>
              ) : (
                <p className="text-gray-400 mt-1 italic">No Review</p>
              )}

              <div className="flex justify-center gap-2 mt-4">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => window.open("https://www.example.com", "_blank")}
                >
                  Visit Site
                </button>
                <button
                  className="bg-gray-200 text-blue-700 px-3 py-1 rounded hover:bg-gray-300"
                  onClick={() =>
                    navigate(`/product/${encodeURIComponent(product.ProductName)}`)
                  }
                >
                  Read Review
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <ExpertReviews />
        </div>
      </div>
    </section>
  );
}

export default AntivirusListT;
