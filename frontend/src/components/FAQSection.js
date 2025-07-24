import React, { useState } from "react";

const faqs = [
  {
    question: "Do I really need antivirus software in 2025?",
    answer: "Yes, antivirus software remains essential in 2025. While operating systems have improved their built-in security, specialized antivirus solutions offer comprehensive protection against sophisticated malware, ransomware, and zero-day exploits. They also provide additional security features like VPNs, password managers, and parental controls that aren't included in default OS protection.",
  },
  {
    question: "What's the difference between free and paid antivirus software?",
    answer: "Free antivirus software typically offers basic malware scanning and removal capabilities. Paid solutions provide more comprehensive protection with features like real-time scanning, ransomware protection, dedicated customer support, VPNs, password managers, parental controls, and protection for multiple devices. If you need robust protection across multiple devices or want advanced security features, paid solutions offer better value.",
  },
  {
    question: "Will antivirus software slow down my computer?",
    answer: "Modern antivirus solutions are designed to have minimal impact on system performance. The best products in our tests show negligible performance impact during normal use. However, during full system scans, you might notice some slowdown. Many programs offer gaming modes or scheduled scans to minimize disruption. Our reviews include performance impact ratings to help you choose software with the least system overhead.",
  },
  {
    question: "Can I use multiple antivirus programs for better protection?",
    answer: "Using multiple real-time antivirus programs simultaneously is not recommended. They can conflict with each other, causing system instability, false positives, and decreased performance. Each program may identify the other as a threat. It's better to choose one comprehensive security solution and supplement it with on-demand scanners (not real-time protection) for occasional second-opinion scans.",
  },
  {
    question: "How often should I run an antivirus scan?",
    answer: "With modern antivirus software, real-time protection continuously monitors your system, so manual scans are less critical. However, it's still good practice to run a full system scan at least once a month and after installing new software or visiting potentially risky websites. Many antivirus programs can be configured to run scheduled scans automatically during times when you're not using your computer.",
  },
  {
    question: "Is Windows Defender good enough for basic protection?",
    answer: "Windows Defender (now called Microsoft Defender) has improved significantly and provides adequate basic protection for casual users. It offers real-time protection against malware and integrates seamlessly with Windows. However, dedicated antivirus solutions still outperform it in detection rates, especially for zero-day threats, and offer valuable additional features like VPNs, password managers, and identity theft protection that Microsoft Defender lacks.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <section id="faq" className="bg-gray-100 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-center text-gray-600 mb-10">
          Common questions about antivirus software and computer security.
        </p>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b last:border-b-0 cursor-pointer transition"
              onClick={() => toggle(index)}
            >
              <div className="px-6 py-4 text-sm font-medium hover:bg-gray-50 flex justify-between items-center">
                {faq.question}
                <span className="text-gray-400">{openIndex === index ? "▲" : "▼"}</span>
              </div>
              {openIndex === index && (
                <div className="px-6 pb-4 text-sm text-gray-700 transition duration-300 ease-in-out">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
