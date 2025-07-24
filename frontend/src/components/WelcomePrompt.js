import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./cookieconsent.css";

export default function WelcomePrompt() {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false); // for animation
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent && !isLoggedIn) {
      setShow(true);
    }
  }, [isLoggedIn]);

  const handleAccept = (redirectTo = null) => {
    localStorage.setItem("cookieConsent", "true");
    setClosing(true);

    setTimeout(() => {
      setShow(false);
      setClosing(false);
      if (redirectTo) navigate(redirectTo);
    }, 300); // match CSS animation duration
  };

  if (!show) return null;

  return (
    <>
      <div className={`blur-overlay ${closing ? "fade-out" : ""}`} />
      <div className={`cookie-popup ${closing ? "slide-down" : ""}`}>
        <p>
          🍪 This website uses cookies to enhance your experience. Please log in or register to access all features.
        </p>
        <div className="btn-group">
          <button className="login" onClick={() => handleAccept("/login")}>
            Login
          </button>
          <button className="register" onClick={() => handleAccept("/register")}>
            Register
          </button>
          <button className="accept" onClick={() => handleAccept()}>
            Got it
          </button>
        </div>
      </div>
    </>
  );
}
