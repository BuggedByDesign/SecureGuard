import React from "react";
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
import WelcomePrompt from "./components/WelcomePrompt";
import {
  TermsOfService,
  PrivacyPolicy,
  CookiePolicy,
  AffiliateDisclosure,
  TestingMethodology,
} from "./LegalPages";
import VerifyEmail from "./VerifyEmail";
import NewsPage from "./components/News";
import NewsDetails from "./components/NewsDetails";
import AdminNews from "./components/AdminNews";
import AntivirusPicker from "./components/AntivirusPicker";
import ProfilePage from "./components/ProfilePage";
import GlobalThemeWrapper from "./context/GlobalThemeWrapper";
import ThreatScanner from "./components/ThreatScanner";

function AppContent() {
  const location = useLocation();
  const hideNavAndFooter = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      <GlobalThemeWrapper />
      <div className="bg-white text-black dark:bg-[#111827] dark:text-white transition-colors duration-300 min-h-screen flex flex-col">
        {!hideNavAndFooter && <Navbar />}

        <div className="flex-grow">
          <Routes>
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
            <Route path="/threat-scan" element={<ThreatScanner />} />
            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* News */}
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsDetails />} />

            {/* Products */}
            <Route path="/product/:name" element={<ProductDetails />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/picker" element={<AntivirusPicker />} />

            {/* Policies */}
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/affiliate" element={<AffiliateDisclosure />} />
            <Route path="/testing" element={<TestingMethodology />} />
            <Route path="/gdpr" element={<GdprPolicy />} />

            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/news"
              element={
                <ProtectedRoute>
                  <AdminNews />
                </ProtectedRoute>
              }
            />
          </Routes>

          <WelcomePrompt />
        </div>

        {!hideNavAndFooter && <Footer />}
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
