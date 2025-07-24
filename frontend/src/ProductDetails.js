import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReviewSection from "./components/ReviewSection";

export default function ProductDetails() {
  const { name } = useParams();
  const [product, setProduct] = useState(null);
  const [features, setFeatures] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/admin/name/${name}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found.");
        return res.json();
      })
      .then((data) => setProduct(data))
      .catch((err) => {
        console.error("❌ Error loading product:", err);
        navigate("/");
      });

    fetch(`http://localhost:5000/api/product/${name}/features`)
      .then((res) => res.json())
      .then((data) => setFeatures(data))
      .catch((err) => console.error("❌ Error loading features:", err));
  }, [name, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !product?.ProductID) return;

    fetch(`http://localhost:5000/api/favorites/${product.ProductID}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setIsFavorite(data.isFavorite))
      .catch(() => {});

    fetch(`http://localhost:5000/api/profile/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: product.ProductID }),
    }).catch((err) => console.error("❌ Failed to save to history:", err));
  }, [product]);

  const toggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token || !product?.ProductID) return alert("Login required.");

    const url = `http://localhost:5000/api/favorites${isFavorite ? `/${product.ProductID}` : ""}`;
    const method = isFavorite ? "DELETE" : "POST";
    const body = isFavorite ? null : JSON.stringify({ productId: product.ProductID });

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    if (res.ok) setIsFavorite(!isFavorite);
  };

  if (!product) {
    return <div className="text-center p-8">Loading...</div>;
  }

  const rawPrice = typeof product.Price === "string"
    ? product.Price.replace(/[^\d.]/g, "")
    : product.Price;

  const originalPrice = parseFloat(rawPrice);
  const discountValue = parseFloat(product.Discount);
  const isValidPrice = !isNaN(originalPrice) && originalPrice > 0;
  const hasDiscount = isValidPrice && !isNaN(discountValue) && discountValue > 0;

  const discountedPrice = hasDiscount
    ? (originalPrice * (1 - discountValue / 100)).toFixed(2)
    : null;

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <button
          onClick={() => navigate("/")}
          className="mb-6 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          ← Back to Home
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          <img
            src={product.ImageURL || "/placeholder.png"}
            alt={product.ProductName}
            className="w-32 h-32 object-contain mx-auto md:mx-0"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.ProductName}
            </h1>
            <p className="text-gray-600 mb-4">{product.Description}</p>

            <div className="text-lg mb-2">
              {hasDiscount ? (
                <>
                  <p className="text-gray-500 line-through text-sm">
                    Original: ${originalPrice.toFixed(2)}
                  </p>
                  <p className="text-green-600 font-semibold text-xl">
                    Now: ${discountedPrice}{" "}
                    <span className="text-sm text-green-700 font-medium">
                      ({discountValue}% OFF)
                    </span>
                  </p>
                </>
              ) : isValidPrice ? (
                <p className="text-blue-700 font-semibold text-lg">
                  Price: ${originalPrice.toFixed(2)}
                </p>
              ) : (
                <p className="text-gray-400 italic">Price not available</p>
              )}
            </div>

            {typeof product.AverageRating === "number" && (
              <p className="mt-2 text-yellow-500 font-medium">
                ⭐ {product.AverageRating.toFixed(1)} / 5.0
              </p>
            )}

            <button
              onClick={toggleFavorite}
              className={`mt-4 px-4 py-2 rounded font-medium transition text-white ${
                isFavorite ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isFavorite ? "Remove Favorite" : "Add to Favorites"}
            </button>

            {features.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Key Features:
                </h3>
                <ul className="list-disc list-inside text-gray-700 text-sm">
                  {features.map((f, i) => (
                    <li key={i}>{f.Feature || f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <ReviewSection productId={product.ProductID} />
        </div>
      </div>
    </div>
  );
}
