import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpertReviews from "./ExpertReviews";

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={`full-${i}`} className="text-yellow-400">★</span>);
  }

  if (halfStar) {
    stars.push(<span key="half" className="text-yellow-400">☆</span>);
  }

  while (stars.length < 5) {
    stars.push(<span key={`empty-${stars.length}`} className="text-gray-300">★</span>);
  }

  return stars;
}

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/assets/products/default.png"; // по подразбиране
  if (imagePath.startsWith("data:image")) {
    return imagePath; // base64
  }
  if (imagePath.startsWith("/assets/")) {
    return imagePath; // вече правилен път
  }
  // ако е само име на файл
  return `/assets/products/${imagePath}`;
};

function AntivirusListT() {
  const [products, setProducts] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/admin")
      .then((res) => res.json())
      .then(async (data) => {
        const enriched = await Promise.all(
          data.map(async (product) => {
            try {
              const res = await fetch(`http://localhost:5000/api/product/${encodeURIComponent(product.ProductName)}/features`);
              const features = await res.json();
              return { ...product, features };
            } catch {
              return { ...product, features: [] };
            }
          })
        );
        setProducts(enriched);
      })
      .catch((err) => console.error("❌ Error loading products:", err));
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
      const getFinalPrice = (product) => {
        const raw = typeof product.Price === "string" ? product.Price.replace(/[^\d.]/g, "") : product.Price;
        const price = parseFloat(raw);
        const discount = parseFloat(product.Discount);
        if (!isNaN(price) && discount > 0) {
          return price * (1 - discount / 100);
        }
        return price;
      };

      const priceA = getFinalPrice(a);
      const priceB = getFinalPrice(b);
      return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
    });
  } else if (sortBy === "rating") {
    sortedProducts.sort((a, b) =>
      sortOrder === "asc"
        ? (a.AverageRating || 0) - (b.AverageRating || 0)
        : (b.AverageRating || 0) - (a.AverageRating || 0)
    );
  }

  const topRated = [...products].sort((a, b) => (b.AverageRating || 0) - (a.AverageRating || 0))[0]?.ProductID;
  const bestValue = [...products].sort((a, b) => parseFloat(a.Price) - parseFloat(b.Price))[0]?.ProductID;

  return (
    <section id="top-picks" className="bg-gray-100 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 text-center">
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={() => handleSort("rating")}
              className={`px-3 py-1 rounded ${sortBy === "rating" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Sort by Rating {sortBy === "rating" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => handleSort("price")}
              className={`px-3 py-1 rounded ${sortBy === "price" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
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
          {sortedProducts.map((product) => {
            const rawPrice = typeof product.Price === "string"
              ? product.Price.replace(/[^\d.]/g, "")
              : product.Price;

            const originalPrice = parseFloat(rawPrice);
            const discountValue = parseFloat(product.Discount);
            const isValidPrice = !isNaN(originalPrice) && originalPrice > 0;
            const hasDiscount = !isNaN(discountValue) && discountValue > 0 && isValidPrice;
            const discountedPrice = hasDiscount
              ? (originalPrice * (1 - discountValue / 100)).toFixed(2)
              : null;

            return (
              <div
                key={product.ProductID}
                className="relative bg-white p-4 rounded-lg shadow-md hover:shadow-xl text-center transition-transform duration-300 hover:scale-105"
              >
                {hasDiscount && (
                  <div className="absolute top-0 right-0 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-bl-lg font-semibold">
                    Save {discountValue}%!
                  </div>
                )}

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
                  src={getImageUrl(product.ImageURL)}
                  alt={product.ProductName}
                  className="h-20 mx-auto my-6 object-contain"
                />
                <h3 className="font-semibold">{product.ProductName}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.Description}</p>

                <div className="text-center mb-1">
                  {hasDiscount ? (
                    <div>
                      <p className="text-gray-500 line-through text-sm">${originalPrice.toFixed(2)}/year</p>
                      <p className="text-green-600 font-bold text-lg">
                        ${discountedPrice}/year{" "}
                        <span className="text-sm text-green-700 font-medium">
                          ({discountValue}% OFF)
                        </span>
                      </p>
                    </div>
                  ) : isValidPrice ? (
                    <p className="text-blue-700 font-bold">${originalPrice.toFixed(2)}/year</p>
                  ) : (
                    <p className="text-gray-400 italic">Price not available</p>
                  )}
                </div>

                <div className="mt-1">
                  {typeof product.AverageRating === "number" && product.AverageRating > 0 ? (
                    <div className="text-yellow-500 font-medium flex justify-center items-center gap-1">
                      {renderStars(product.AverageRating)}
                      <span className="text-sm text-gray-600">({product.AverageRating.toFixed(1)})</span>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No Review</p>
                  )}
                </div>

                {product.features && product.features.length > 0 && (
                  <div className="text-left mt-4">
                    <h4 className="font-semibold text-sm mb-1">Key Features</h4>
                    <ul className="list-inside">
                      {typeof product.KeyFeatures === "string"
                        ? product.KeyFeatures.split(/\n|\\n/).map((line, index) => (
                            <li key={index} className="flex items-start text-sm text-gray-700 mb-1">
                              <span className="text-purple-600 mr-2">✔️</span>
                              <span>{line}</span>
                            </li>
                          ))
                        : null}
                    </ul>
                  </div>
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
            );
          })}
        </div>

        <div className="mt-16">
          <ExpertReviews />
        </div>
      </div>
    </section>
  );
}

export default AntivirusListT;
