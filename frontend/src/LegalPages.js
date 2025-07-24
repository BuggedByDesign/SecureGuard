import React from "react";
import { Link } from "react-router-dom";

const baseSectionClass = "max-w-4xl mx-auto py-12 px-6 bg-white dark:bg-gray-900 rounded-lg shadow-md";

const headerClass = "text-4xl font-extrabold mb-8 text-gray-900 dark:text-white border-b-4 border-blue-600 pb-2";

const paragraphClass = "mb-6 leading-relaxed text-gray-700 dark:text-gray-300";

const subHeaderClass = "text-2xl font-semibold mt-8 mb-4 text-blue-600 dark:text-blue-400";

const listClass = "list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300";

const buttonClass = "inline-block mt-10 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition";

export function TermsOfService() {
  return (
    <section className={baseSectionClass}>
      <h1 className={headerClass}>Terms of Service</h1>
      <article>
        <p className={paragraphClass}>
          Welcome to <strong>SecureGuard</strong>. By accessing or using our website and services, you agree to be bound by these <strong>Terms of Service</strong> (“Terms”). Please read them carefully. If you do not agree, please do not use our services.
        </p>
        <p className={paragraphClass}>
          <strong>Use of Services:</strong> You agree to use SecureGuard only for lawful purposes and in a way that does not infringe the rights of others or restrict or inhibit anyone else’s use and enjoyment of the website.
        </p>
        <p className={paragraphClass}>
          <strong>User Content:</strong> You are responsible for any content you submit, including reviews or comments. You agree not to post false, misleading, offensive, or defamatory content. We reserve the right to remove such content at our discretion.
        </p>
        <p className={paragraphClass}>
          <strong>Disclaimer of Warranties:</strong> All reviews, ratings, and information provided on SecureGuard are for informational purposes only. We do not guarantee the accuracy or completeness of the content, nor do we endorse any product.
        </p>
        <p className={paragraphClass}>
          <strong>Limitation of Liability:</strong> SecureGuard and its affiliates are not liable for any damages arising from your use of our website or reliance on any information provided.
        </p>
        <p className={paragraphClass}>
          <strong>Changes to Terms:</strong> We reserve the right to modify these Terms at any time. Continued use after changes constitutes acceptance of the new Terms.
        </p>
        <p className={paragraphClass}>
          <strong>Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of Bulgaria. Any disputes arising out of or related to these Terms will be subject to the exclusive jurisdiction of the courts in Bulgaria.
        </p>
      </article>
      <Link to="/" className={buttonClass}>← Back to Home</Link>
    </section>
  );
}

export function PrivacyPolicy() {
  return (
    <section className={baseSectionClass}>
      <h1 className={headerClass}>Privacy Policy</h1>
      <article>
        <p className={paragraphClass}>
          SecureGuard respects your privacy and is committed to protecting your personal data. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.
        </p>
        <h2 className={subHeaderClass}>Information We Collect</h2>
        <ul className={listClass}>
          <li><strong>Personal Information:</strong> If you register or contact us, we collect your name, email address, and any other information you provide.</li>
          <li><strong>Usage Data:</strong> We collect anonymous analytics such as pages visited, time spent on the site, and other metrics to improve our services.</li>
          <li><strong>Cookies:</strong> We use cookies to enhance user experience, remember preferences, and analyze traffic.</li>
        </ul>
        <h2 className={subHeaderClass}>How We Use Your Information</h2>
        <p className={paragraphClass}>
          Your data is used to:
        </p>
        <ul className={listClass}>
          <li>Provide and maintain our services</li>
          <li>Communicate with you about updates and support</li>
          <li>Analyze site usage and improve our offerings</li>
          <li>Comply with legal obligations</li>
        </ul>
        <h2 className={subHeaderClass}>Data Sharing and Security</h2>
        <p className={paragraphClass}>
          We do not sell or rent your personal data to third parties. We may share data with trusted service providers who assist us in operating the website, under strict confidentiality agreements.
        </p>
        <p className={paragraphClass}>
          We implement reasonable technical and organizational measures to protect your data against unauthorized access, loss, or misuse.
        </p>
        <h2 className={subHeaderClass}>Your Rights</h2>
        <p className={paragraphClass}>
          You have the right to:
        </p>
        <ul className={listClass}>
          <li>Access your personal data</li>
          <li>Request correction or deletion</li>
          <li>Withdraw consent at any time</li>
          <li>Object to certain data processing activities</li>
        </ul>
        <p className={paragraphClass}>
          To exercise these rights, please contact us at{" "}
          <a href="mailto:support@secureguard.com" className="text-blue-600 hover:underline">support@secureguard.com</a>.
        </p>
        <h2 className={subHeaderClass}>Changes to This Policy</h2>
        <p className={paragraphClass}>
          We may update this Privacy Policy periodically. We encourage you to review it regularly. Continued use of our services means you accept the updated policy.
        </p>
      </article>
      <Link to="/" className={buttonClass}>← Back to Home</Link>
    </section>
  );
}

export function CookiePolicy() {
  return (
    <section className={baseSectionClass}>
      <h1 className={headerClass}>Cookie Policy</h1>
      <article>
        <p className={paragraphClass}>
          This Cookie Policy explains how SecureGuard uses cookies and similar technologies on our website.
        </p>
        <h2 className={subHeaderClass}>What Are Cookies?</h2>
        <p className={paragraphClass}>
          Cookies are small text files stored on your device by your web browser. They help websites recognize your device and remember information about your visit.
        </p>
        <h2 className={subHeaderClass}>How We Use Cookies</h2>
        <ul className={listClass}>
          <li><strong>Essential Cookies:</strong> Necessary for the website to function properly.</li>
          <li><strong>Preference Cookies:</strong> Remember your language, theme, or other settings.</li>
          <li><strong>Analytics Cookies:</strong> Collect anonymous data on site usage to improve performance.</li>
          <li><strong>Advertising Cookies:</strong> Used to deliver relevant ads and track campaign performance.</li>
        </ul>
        <h2 className={subHeaderClass}>Your Choices</h2>
        <p className={paragraphClass}>
          You can manage cookie preferences through your browser settings. Disabling cookies may impact website functionality.
        </p>
        <h2 className={subHeaderClass}>More Information</h2>
        <p className={paragraphClass}>
          For questions or concerns about our cookie practices, contact us at{" "}
          <a href="mailto:support@secureguard.com" className="text-blue-600 hover:underline">support@secureguard.com</a>.
        </p>
      </article>
      <Link to="/" className={buttonClass}>← Back to Home</Link>
    </section>
  );
}

export function AffiliateDisclosure() {
  return (
    <section className={baseSectionClass}>
      <h1 className={headerClass}>Affiliate Disclosure</h1>
      <article>
        <p className={paragraphClass}>
          Some of the links on SecureGuard are affiliate links, meaning we may earn a commission if you make a purchase through these links — at no additional cost to you.
        </p>
        <p className={paragraphClass}>
          Our reviews and recommendations are based on our independent research and testing. Affiliate partnerships do not influence our content or opinions.
        </p>
        <p className={paragraphClass}>
          We believe in full transparency and strive to provide honest, unbiased information to help you make informed decisions.
        </p>
      </article>
      <Link to="/" className={buttonClass}>← Back to Home</Link>
    </section>
  );
}

export function TestingMethodology() {
  return (
    <section className={baseSectionClass}>
      <h1 className={headerClass}>Testing Methodology</h1>
      <article>
        <p className={paragraphClass}>
          Our antivirus testing is performed using rigorous, real-world scenarios to ensure accuracy and reliability.
        </p>
        <h2 className={subHeaderClass}>Test Environment</h2>
        <p className={paragraphClass}>
          Tests are conducted on a clean, fully patched Windows 11 virtual machine with no other software running to eliminate interference.
        </p>
        <h2 className={subHeaderClass}>Evaluation Criteria</h2>
        <ul className={listClass}>
          <li><strong>Malware Detection:</strong> Ability to detect and block malware samples including viruses, trojans, ransomware, and spyware.</li>
          <li><strong>Performance Impact:</strong> Assessment of system resource usage and slowdown during scans and real-time protection.</li>
          <li><strong>Features & Usability:</strong> Analysis of the user interface, ease of use, and availability of advanced features.</li>
          <li><strong>Price-to-Value:</strong> Comparison of cost relative to features and protection level.</li>
        </ul>
        <h2 className={subHeaderClass}>Review Updates</h2>
        <p className={paragraphClass}>
          Reviews are updated regularly to reflect new releases, updated threat landscapes, and changes in product features.
        </p>
      </article>
      <Link to="/" className={buttonClass}>← Back to Home</Link>
    </section>
  );
}
