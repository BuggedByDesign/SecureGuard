import React, { useEffect } from "react";
import "./index.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import AdminPage from "./AdminPageT";
import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AntivirusList from "./components/AntivirusListT";
import ProductDetails from "./ProductDetails";
import ComparePage from "./ComparePage";
import FAQSection from "./components/FAQSection";
import StayProtected from "./components/StayProtected";
import Footer from "./components/Footer";
import GdprPolicy from "./components/GdprPolicy";

import {
  TermsOfService,
  PrivacyPolicy,
  CookiePolicy,
  AffiliateDisclosure,
  TestingMethodology,
} from "./LegalPages";

function AppContent() {
  const location = useLocation();
  const hideNavAndFooter = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavAndFooter && <Navbar />}

      <div className="flex-grow">
        <Routes>
          {/* Начална страница */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <AntivirusList />
                <FAQSection />
                <StayProtected />
              </>
            }
          />

          {/* Аутентикация */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Единен админ панел */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Преглед на продукт */}
          <Route path="/product/:name" element={<ProductDetails />} />

          {/* Страници с политики */}
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/affiliate" element={<AffiliateDisclosure />} />
          <Route path="/testing" element={<TestingMethodology />} />
          <Route path="/gdpr" element={<GdprPolicy />} />

          {/* Страница за сравнение */}
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </div>

      {!hideNavAndFooter && <Footer />}
    </div>
  );
}

function App() {
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
