import React from "react";
import { ShieldCheck, Cpu, Lock } from "lucide-react";

export default function Hero() {
  return (
    <section className="w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-24 px-6">
      <div className="max-w-7xl mx-auto text-center">
        {/* Заглавие */}
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-fade-in">
          The Best Antivirus Protection for 2025
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-blue-100 animate-fade-in">
          Trusted reviews and real-world tests to help you choose the perfect antivirus for your needs.
        </p>

        {/* Call to Action */}
        <a
          href="#top-picks"
          className="inline-block bg-white text-blue-700 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition animate-fade-in"
        >
          View Top Picks
        </a>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            {
              icon: <ShieldCheck size={40} className="text-blue-300" />,
              title: "Complete Protection",
              desc: "Malware, phishing, ransomware, spyware – we cover it all.",
            },
            {
              icon: <Cpu size={40} className="text-blue-300" />,
              title: "Performance Tested",
              desc: "We ensure fast and lightweight antivirus solutions.",
            },
            {
              icon: <Lock size={40} className="text-blue-300" />,
              title: "Extra Features",
              desc: "We review VPNs, parental controls, password managers, and more.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-blue-900 p-6 rounded-xl shadow-md hover:shadow-xl transition duration-300 text-left animate-fade-in"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-blue-100">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
