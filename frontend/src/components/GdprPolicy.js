import React from "react";
import { Link } from "react-router-dom";

export default function GdprPolicy() {
  return (
    <section className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6">GDPR Policy</h1>
      <p className="mb-4">
        At SecureGuard, we value your privacy and are committed to protecting your personal data in accordance with the General Data Protection Regulation (GDPR).
      </p>
      <p className="mb-4">
        You have the right to access, correct, or delete your data at any time. Simply contact us at support@secureguard.com with your request.
      </p>
      <p className="mb-4">
        We only collect data necessary to provide our services, such as email, name, and usage analytics. Your data will never be sold or shared with third parties without consent.
      </p>
      <p className="mb-4">
        For more detailed information, please refer to our <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
      </p>
      <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
    </section>
  );
}
