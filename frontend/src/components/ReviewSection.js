import React, { useEffect, useState } from "react";

export default function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = token ? JSON.parse(atob(token.split(".")[1])) : null;
    setUser(userData);
    setIsAdmin(userData?.isAdmin === true);

    fetch(`http://localhost:5000/api/reviews/${productId}`)
      .then((res) => res.json())
      .then((data) => setReviews(data));
  }, [productId]);

  const handleSubmit = async () => {
    if (!user || !reviewText.trim()) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ productId, reviewText, rating }),
      });

      if (res.ok) {
        const newReview = await res.json();
        setReviews((prev) => [...prev, newReview]);
        setReviewText("");
        setRating(5);
      }
    } catch (err) {
      console.error("❌ Error submitting review:", err);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token || !isAdmin) return;

    try {
      await fetch(`http://localhost:5000/api/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      setReviews((prev) => prev.filter((r) => r.ReviewID !== id));
    } catch (err) {
      console.error("❌ Error deleting review:", err);
    }
  };

  const renderStars = (value) =>
    [...Array(5)].map((_, i) => (
      <span key={i} className={i < value ? "text-yellow-500" : "text-gray-300"}>
        ★
      </span>
    ));

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-10">
      <h3 className="text-lg font-semibold text-center text-blue-700 mb-4">User Reviews</h3>

      {reviews.length === 0 ? (
        <p className="text-center text-gray-500 mb-6">No reviews yet.</p>
      ) : (
        <div className="space-y-4 mb-6">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50 hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium text-gray-800">
                  {review.UserName || "Anonymous"}
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(review.Rating)}
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(review.ReviewID)}
                      className="text-red-500 text-sm hover:underline ml-2"
                      title="Delete review"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-700 text-sm italic">“{review.ReviewText}”</p>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <div className="border-t pt-4 mt-6">
          <h4 className="font-semibold mb-2 text-center text-gray-800">Add a Review</h4>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="What do you think about this product?"
            className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-medium text-gray-700">Rating:</span>
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className={i < rating ? "text-yellow-500 text-xl" : "text-gray-300 text-xl"}
              >
                ★
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Submit Review
          </button>
        </div>
      ) : (
        <div className="text-center mt-6">
          <p className="text-gray-600 italic mb-2">Want to leave a review?</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Login to Review
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fade-in">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
            >
              ×
            </button>
            <h2 className="text-xl font-bold text-center mb-4">Please Log In</h2>
            <p className="text-center text-gray-600 mb-6">
              To write a review, you must be logged into your account.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Login
              </a>
              <a
                href="/register"
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg font-semibold"
              >
                Register
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
