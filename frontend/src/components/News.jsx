import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function NewsPage() {
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/news")
      .then((res) => res.json())
      .then((data) => setNewsList(Array.isArray(data) ? data : []))
      .catch((err) => console.error("❌ Failed to load news:", err));
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Security News & Tips</h1>

      {newsList.length === 0 ? (
        <p className="text-center text-gray-500">No news available.</p>
      ) : (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
          {newsList.map((item) => (
            <article
              key={item.NewsID}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2">
                  <Link to={`/news/${item.NewsID}`} className="hover:underline">
                    {item.Title}
                  </Link>
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {new Date(item.CreatedAt).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-gray-700 mb-4">
                  {item.Content.slice(0, 150).trim()}…
                </p>
                <Link to={`/news/${item.NewsID}`} className="text-blue-600 font-medium hover:underline">
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
