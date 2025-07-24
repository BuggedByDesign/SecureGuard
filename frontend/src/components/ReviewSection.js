
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser(payload);
        setIsAdmin(payload.isAdmin === true);
      } catch {
        localStorage.removeItem("token");
      }
    }

    fetch(`http://localhost:5000/api/reviews/${productId}`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(console.error);
  }, [productId]);

  const handleSubmit = async () => {
    if (!user || !reviewText.trim()) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ productId, reviewText, rating })
      });
      if (res.status === 401 || res.status === 403) {
        alert("Сесията ви е изтекла, моля влезте отново.");
        localStorage.removeItem("token");
        return navigate("/login");
      }
      if (!res.ok) throw new Error();
      const newReview = await res.json();
      setReviews(prev => [...prev, newReview]);
      setReviewText("");
      setRating(5);
    } catch (err) {
      console.error("❌ Error submitting review:", err);
      alert("Грешка при изпращане на ревюто.");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token || !isAdmin) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
      });
      if (res.status === 401 || res.status === 403) {
        alert("Нямате права, моля влезте отново.");
        localStorage.removeItem("token");
        return navigate("/login");
      }
      if (!res.ok) throw new Error();
      setReviews(prev => prev.filter(r => r.ReviewID !== id));
    } catch (err) {
      console.error("❌ Error deleting review:", err);
      alert("Грешка при изтриване на ревюто.");
    }
  };

  const handleReport = async (reviewId) => {
    if (!user) {
      return setShowModal(true);
    }
    const reason = prompt("Моля, въведете причина за докладване:");
    if (!reason) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/reviews/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ reviewId, reason })
      });
      if (res.status === 401 || res.status === 403) {
        alert("Сесията ви е изтекла, моля влезте отново.");
        localStorage.removeItem("token");
        return navigate("/login");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert(data.message);
    } catch (err) {
      console.error("❌ Error reporting review:", err);
      alert("Грешка при докладване на ревюто.");
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
      <h3 className="text-lg font-semibold text-center text-blue-700 mb-4">
        Потребителски ревюта
      </h3>

      {reviews.map((r) => (
        <div
          key={r.ReviewID}
          className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50 hover:shadow-md transition mb-4"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium text-gray-800">
              {r.UserName || "Анонимен"}
            </div>
            <div className="flex items-center gap-2">
              {renderStars(r.Rating)}
              {isAdmin && (
                <button
                  onClick={() => handleDelete(r.ReviewID)}
                  className="text-red-500 text-sm hover:underline ml-2"
                  title="Изтрий ревю"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-700 text-sm italic">“{r.ReviewText}”</p>
          {user && (
            <button
              onClick={() => handleReport(r.ReviewID)}
              className="text-sm text-red-500 hover:underline mt-2"
            >
              Докладвай
            </button>
          )}
        </div>
      ))}

      {user ? (
        <div className="border-t pt-4 mt-6">
          <h4 className="font-semibold mb-2 text-center text-gray-800">
            Добави ревю
          </h4>
          <textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="Какво мислиш за този продукт?"
            className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-medium text-gray-700">Рейтинг:</span>
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
            Изпрати ревю
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-6">
          🔒 Само регистрирани потребители могат да оставят ревю или доклад.
        </p>
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
            <h2 className="text-xl font-bold text-center mb-4">
              Моля влезте във вашия профил
            </h2>
            <p className="text-center text-gray-600 mb-6">
              За да оставите ревю, трябва да сте влезли в системата.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Вход
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg font-semibold"
              >
                Регистрация
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
