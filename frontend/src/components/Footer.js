import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white pt-12 pb-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Лого + описание */}
        <div>
          <h2 className="text-2xl font-extrabold mb-3">SecureGuard</h2>
          <p className="text-sm text-blue-200">
            Your trusted source for antivirus reviews and protection tips.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-2 text-sm text-blue-200">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/compare" className="hover:underline">Compare</Link></li>
            <li><a href="#faq" className="hover:underline">FAQ</a></li>
            <li><Link to="/login" className="hover:underline">Login</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Legal</h3>
          <ul className="space-y-2 text-sm text-blue-200">
            <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:underline">Terms of Use</Link></li>
            <li><Link to="/cookies" className="hover:underline">Cookies</Link></li>
            <li><Link to="/gdpr" className="hover:underline">GDPR Policy</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-blue-300 mt-10">
        &copy; {new Date().getFullYear()} SecureGuard. All rights reserved.
      </div>
    </footer>
  );
}
