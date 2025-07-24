import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function NewsDetails() {
  const { id } = useParams();
  const [news, setNews] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/news/${id}`)
      .then((res) => res.json())
      .then((data) => setNews(data))
      .catch((err) => console.error("❌ Error loading news:", err));
  }, [id]);

  if (!news) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading news...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">{news.Title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Published on:{" "}
        {new Date(news.CreatedAt).toLocaleDateString("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <p className="text-gray-800 leading-relaxed whitespace-pre-line">
        {news.Content}
      </p>

      <div className="mt-10">
        <Link
          to="/news"
          className="text-blue-600 hover:underline font-medium"
        >
          ← Back to all news
        </Link>
      </div>
    </div>
  );
}
