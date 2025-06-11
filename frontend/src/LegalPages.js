import React from "react";
import { Link } from "react-router-dom";

// ✅ Terms of Service
export function TermsOfService() {
  return (
    <section className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4">
        By accessing and using SecureGuard, you agree to comply with and be bound by these Terms. All reviews and comparisons are for informational purposes only. We do not guarantee the performance of any antivirus listed.
      </p>
      <p className="mb-4">
        You agree not to misuse the site or submit false reviews. We reserve the right to remove content and suspend access.
      </p>
      <p className="mb-4">
        These Terms are governed by the laws of Bulgaria. Any disputes will be resolved in accordance with Bulgarian law.
      </p>
      <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
    </section>
  );
}

// ✅ Privacy Policy
export function PrivacyPolicy() {
  return (
    <section className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">
        We collect minimal data including anonymous analytics and, if you register, your email and display name. This information is never sold or shared with third parties.
      </p>
      <p className="mb-4">
        You have the right to request deletion of your data at any time by contacting support@secureguard.com.
      </p>
      <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
    </section>
  );
}

// ✅ Cookie Policy
export function CookiePolicy() {
  return (
    <section className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
      <p className="mb-4">
        We use cookies to improve user experience, remember your preferences, and analyze website traffic.
      </p>
      <p className="mb-4">
        You may disable cookies in your browser, but some features of the site may not work properly.
      </p>
      <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
    </section>
  );
}

// ✅ Affiliate Disclosure
export function AffiliateDisclosure() {
  return (
    <section className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6">Affiliate Disclosure</h1>
      <p className="mb-4">
        SecureGuard may earn commissions from affiliate links. This means if you click a link and make a purchase, we may receive compensation — at no additional cost to you.
      </p>
      <p className="mb-4">
        Our content and reviews remain independent and unbiased regardless of affiliate partnerships.
      </p>
      <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
    </section>
  );
}

// ✅ Testing Methodology
export function TestingMethodology() {
  return (
    <section className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6">Testing Methodology</h1>
      <p className="mb-4">
        All antivirus products are tested using real-world malware, ransomware, and phishing attacks on a clean Windows 11 virtual machine.
      </p>
      <p className="mb-4">
        We evaluate: malware detection, system performance impact, features, usability, and price-to-value ratio.
      </p>
      <p className="mb-4">
        Each review is updated regularly to reflect the most accurate information possible.
      </p>
      <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
    </section>
  );
}
