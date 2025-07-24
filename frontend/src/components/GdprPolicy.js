import React from "react";
import { Link } from "react-router-dom";

export default function GdprPolicy() {
  return (
    <section className="max-w-4xl mx-auto py-12 px-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900 dark:text-white border-b-4 border-blue-600 pb-2">
        GDPR Policy
      </h1>
      <article className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          At <strong>SecureGuard</strong>, protecting your privacy and personal data is of utmost importance to us. This GDPR Policy explains how we collect, use, store, and protect your information in compliance with the <strong>General Data Protection Regulation (GDPR)</strong>.
        </p>
        <h2 className="text-2xl font-semibold mt-6">1. Data We Collect</h2>
        <p>
          We collect only the necessary personal data to provide and improve our services, including but not limited to:
        </p>
        <ul className="list-disc list-inside ml-4">
          <li>Contact information such as your name and email address.</li>
          <li>Usage data including analytics and interactions with our website.</li>
          <li>Technical data like IP address, browser type, and device information.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6">2. How We Use Your Data</h2>
        <p>
          Your data is used for the following purposes:
        </p>
        <ul className="list-disc list-inside ml-4">
          <li>Providing and personalizing our services to you.</li>
          <li>Communicating important updates and responding to your inquiries.</li>
          <li>Improving website performance and user experience through analytics.</li>
          <li>Ensuring security and preventing fraud or abuse.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6">3. Legal Basis for Processing</h2>
        <p>
          We process your data based on your consent, fulfillment of a contract, legitimate interests to improve our services, and compliance with legal obligations.
        </p>

        <h2 className="text-2xl font-semibold mt-6">4. Data Sharing and Transfers</h2>
        <p>
          We do not sell your personal data. We may share your information with trusted third-party service providers who assist us in delivering our services, under strict confidentiality agreements. We ensure any international data transfers comply with GDPR requirements.
        </p>

        <h2 className="text-2xl font-semibold mt-6">5. Data Retention</h2>
        <p>
          We retain your personal data only as long as necessary to provide our services or comply with legal requirements. When data is no longer needed, we securely delete or anonymize it.
        </p>

        <h2 className="text-2xl font-semibold mt-6">6. Your Rights</h2>
        <p>
          Under GDPR, you have the right to:
        </p>
        <ul className="list-disc list-inside ml-4">
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate or incomplete data.</li>
          <li>Request deletion of your personal data, where applicable.</li>
          <li>Object to or restrict the processing of your data.</li>
          <li>Request data portability to another service provider.</li>
          <li>Withdraw consent at any time, without affecting prior processing.</li>
          <li>Lodge a complaint with a supervisory authority if you believe your rights are violated.</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at{" "}
          <a href="mailto:support@secureguard.com" className="text-blue-600 hover:underline font-medium">
            support@secureguard.com
          </a>.
        </p>

        <h2 className="text-2xl font-semibold mt-6">7. Security Measures</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.
        </p>

        <h2 className="text-2xl font-semibold mt-6">8. Cookies and Tracking Technologies</h2>
        <p>
          Our website uses cookies and similar tracking technologies to enhance your experience, analyze traffic, and serve relevant content. You can manage your cookie preferences through your browser settings. For more details, please see our{" "}
          <Link to="/cookie-policy" className="text-blue-600 hover:underline font-medium">
            Cookie Policy
          </Link>.
        </p>

        <h2 className="text-2xl font-semibold mt-6">9. Changes to This Policy</h2>
        <p>
          We may update this GDPR Policy from time to time to reflect changes in legal requirements or our data practices. We encourage you to review this page periodically. Significant changes will be communicated through our website or via email.
        </p>

        <h2 className="text-2xl font-semibold mt-6">10. Contact Information</h2>
        <p>
          If you have any questions, concerns, or requests regarding your personal data or this policy, please contact us at{" "}
          <a href="mailto:support@secureguard.com" className="text-blue-600 hover:underline font-medium">
            support@secureguard.com
          </a>.
        </p>
      </article>

      <div className="mt-10">
        <Link to="/" className="inline-block text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md font-semibold transition">
          ← Back to Home
        </Link>
      </div>
    </section>
  );
}
