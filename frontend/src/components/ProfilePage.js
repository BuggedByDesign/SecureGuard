import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./profile.css";

export default function ProfilePage() {
  const { token, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return navigate("/login");

    fetch("http://localhost:5000/api/profile/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          logout();
          navigate("/login");
        } else if (!res.ok) {
          throw new Error("Failed to load profile.");
        }
        return res.json();
      })
      .then(setProfile)
      .catch((err) => {
        console.error(err);
        logout();
        navigate("/login");
      });
  }, [token, logout, navigate]);

  const handleEmailChange = async () => {
    setMessage("");
    const res = await fetch("http://localhost:5000/api/profile/change-email", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newEmail }),
    });

    const data = await res.json();
    setMessage(data.message || "Email update failed.");
  };

  const handlePasswordChange = async () => {
    setMessage("");
    const res = await fetch("http://localhost:5000/api/user/request-change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    setMessage(data.message || "Password update failed.");
  };

  if (!profile) return <p className="p-8 text-center">Loading...</p>;

  return (
    <section className="profile-container">
      <div className="profile-left">
        <h1 className="profile-title">👋 Hello, {profile.user.FullName}!</h1>

        <div className="profile-card">
          <button className="toggle-btn" onClick={() => setShowSettings(!showSettings)}>
            ⚙️ Profile Settings {showSettings ? "▲" : "▼"}
          </button>

          {showSettings && (
            <>
              <div className="form-group">
                <label>Change Email</label>
                <input
                  type="email"
                  placeholder="Enter new email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <button onClick={handleEmailChange}>Update Email</button>
              </div>

              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button onClick={handlePasswordChange}>Change Password</button>
              </div>

              {message && <p className="form-message">{message}</p>}
            </>
          )}
        </div>

        <div className="profile-card">
          <h2>⭐ Favorite Products</h2>
          <ul>
            {profile.favorites.map((f) => (
              <li key={f.ProductID}>
                {f.ProductName} ({new Date(f.AddedAt).toLocaleDateString()})
              </li>
            ))}
          </ul>
        </div>

        <div className="profile-card">
          <button className="toggle-btn" onClick={() => setShowReviews(!showReviews)}>
            📑 My Reviews {showReviews ? "▲" : "▼"}
          </button>

          {showReviews && (
            <div className="review-list">
              {profile.myReviews.map((r) => (
                <div className="review-item" key={r.ReviewID}>
                  <span>{r.ProductName}</span>
                  <p>⭐ {r.Rating}</p>
                  <p>{r.Comment}</p>
                  <small>{new Date(r.CreatedAt).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="profile-right">
        <h2>⏱️ Recently Viewed</h2>
        <ul className="recent-list">
          {profile.history.map((h) => (
            <li key={`${h.ProductID}-${new Date(h.ViewedAt).getTime()}`} className="recent-item">
              <span>{h.ProductName}</span>
              <span>{new Date(h.ViewedAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
