import React from "react";

function ReviewCard({ review, isAdmin, onDelete }) {
  return (
    <div className="bg-white p-4 shadow-md rounded-md mb-4">
      <p className="text-yellow-600 font-semibold">⭐ {review.Rating} / 5</p>
      <p className="text-gray-800">{review.ReviewText}</p>
      {isAdmin && (
        <button
          onClick={() => onDelete(review.ReviewID)}
          className="text-red-500 text-sm mt-2 hover:underline"
        >
          Изтрий
        </button>
      )}
    </div>
  );
}

export default ReviewCard;
