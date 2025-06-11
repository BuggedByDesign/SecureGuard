import React, { useEffect, useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

function ExpertReviews() {
  const [products, setProducts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("❌ Грешка при зареждане на продукти:", err));
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const parseLines = (text) =>
    typeof text === "string"
      ? text.replace(/\\n/g, "\n").split("\n").filter((line) => line.trim() !== "")
      : [];

  const renderStars = (value) => (
    <span className="text-yellow-500">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i}>{i < value ? "★" : "☆"}</span>
      ))}
    </span>
  );

  return (
    <section id="expert-reviews" className="max-w-6xl mx-auto py-10">
      <h2 className="text-2xl font-bold text-center text-blue-800 mb-2">
        Expert Reviews
      </h2>
      <p className="text-center text-sm text-gray-600 mb-8">
        Our in-depth analysis of each antivirus solution based on extensive testing.
      </p>

      {products.map((product) => (
        <div
          key={product.ProductID}
          className="bg-white rounded-xl shadow mb-6 overflow-hidden"
        >
          <button
            onClick={() => toggleExpand(product.ProductID)}
            className="flex items-center justify-between w-full px-6 py-4 bg-gray-100 hover:bg-gray-200"
          >
            <div className="flex items-center gap-4">
              <img
                src={
                  product.ImageURL?.startsWith("data:image")
                    ? product.ImageURL
                    : product.ImageURL?.startsWith("http")
                    ? product.ImageURL
                    : `http://localhost:5000${product.ImageURL}`
                }
                alt={product.ProductName}
                className="w-12 h-12 object-contain rounded"
              />
              <div>
                <h3 className="font-semibold text-left text-lg">
                  {product.ProductName}
                </h3>
                <p className="text-yellow-500 text-sm flex items-center gap-1">
                  {product.AverageRating ? renderStars(Math.round(product.AverageRating)) : "N/A"}
                  <span className="ml-1 text-sm text-gray-700 font-medium">
                    {product.AverageRating ? product.AverageRating.toFixed(1) : "N/A"}/5.0
                  </span>
                </p>
              </div>
            </div>
            <span className="text-lg">
              {expandedId === product.ProductID ? "▲" : "▼"}
            </span>
          </button>

          {expandedId === product.ProductID && (
            <div className="p-6 md:flex gap-6 text-sm bg-white">
              <div className="md:w-2/3">
                <h4 className="font-semibold mb-2 text-lg">Our Review</h4>
                <p className="mb-4 whitespace-pre-line text-gray-700">
                  {product.OurReview || "No review available."}
                </p>

                <div className="flex flex-wrap gap-10">
                  <div>
                    <h5 className="text-green-600 font-semibold mb-1">Pros</h5>
                    {product.Pros ? (
                      <ul className="text-green-700 ml-2 space-y-1">
                        {parseLines(product.Pros).map((pro, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-green-500" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400">–</p>
                    )}
                  </div>
                  <div>
                    <h5 className="text-red-600 font-semibold mb-1">Cons</h5>
                    {product.Cons ? (
                      <ul className="text-red-600 ml-2 space-y-1">
                        {parseLines(product.Cons).map((con, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <AlertCircle size={14} className="text-red-500" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400">–</p>
                    )}
                  </div>
                </div>

                <h5 className="mt-6 font-semibold text-base">Bottom Line</h5>
                <p className="whitespace-pre-line text-gray-700">
                  {product.BottomLine || "Summary not available."}
                </p>
              </div>

              <div className="md:w-1/3 bg-blue-50 p-6 rounded-lg shadow-sm">
                <h5 className="font-semibold mb-4 text-base">Test Results</h5>
                <div className="space-y-4 text-sm">
                  {["MalwareProtection", "PerformanceImpact", "UserInterface", "ValueForMoney"].map((metric) => (
                    <div key={metric}>
                      <div className="flex justify-between mb-1">
                        <span>{metric.replace(/([A-Z])/g, " $1").trim()}</span>
                        <span className="font-medium">
                          {product[metric] ? `${product[metric]}/5` : "- /5"}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-300 rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded"
                          style={{ width: product[metric] ? `${(product[metric] / 5) * 100}%` : "0%" }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <h5 className="font-semibold mt-6 mb-3 text-base">Protection Features</h5>
                <ul className="text-sm space-y-2">
                  {parseLines(product.ProtectionFeatures).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-blue-600 rounded-full"></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => window.open(product.OfficialWebsite, "_blank")}
                  className="mt-6 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 text-sm font-semibold"
                >
                  Visit Official Website
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

export default ExpertReviews;