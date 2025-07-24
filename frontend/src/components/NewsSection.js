import React, { useEffect, useState } from "react";

export default function NewsSection() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/news")
      .then((res) => res.json())
      .then((data) => setNews(Array.isArray(data) ? data : []))
      .catch((err) => console.error("❌ Failed to load news:", err));
  }, []);

  return (
    <section id="security-news" className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">🛡️ Security News & Tips</h2>

        {news.length === 0 ? (
          <p className="text-center text-gray-500">No news available.</p>
        ) : (
          <div className="space-y-6">
            {news.map((item) => (
              <div
                key={item.NewsID}
                className="border rounded-lg p-4 shadow-sm bg-gray-50"
              >
                <h3 className="text-lg font-semibold mb-2">{item.Title}</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {item.Content.length > 300
                    ? item.Content.slice(0, 300).trim() + "..."
                    : item.Content}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Published:{" "}
                  {new Date(item.CreatedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
