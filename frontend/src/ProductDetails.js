import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReviewSection from "./components/ReviewSection";

export default function ProductDetails() {
  const { name } = useParams();
  const [product, setProduct] = useState(null);
  const [features, setFeatures] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://secureguard-db2i.onrender.com/api/admin/name/${name}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found.");
        return res.json();
      })
      .then((data) => setProduct(data))
      .catch((err) => {
        console.error("❌ Error loading product:", err);
        navigate("/");
      });

    fetch(`https://secureguard-db2i.onrender.com/api/products/${name}/features`)
      .then((res) => res.json())
      .then((data) => setFeatures(data))
      .catch((err) =>
        console.error("❌ Error loading features:", err)
      );
  }, [name, navigate]);

  if (!product) {
    return <div className="text-center p-8">Loading...</div>;
  }

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
            <p className="text-blue-700 font-semibold text-lg">
              Price: {product.Price}
            </p>

            {typeof product.AverageRating === "number" && (
              <p className="mt-2 text-yellow-500 font-medium">
                ⭐ {product.AverageRating.toFixed(1)} / 5.0
              </p>
            )}

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
