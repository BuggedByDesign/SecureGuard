import React, { useState } from "react";

const antivirusData = [
  {
    name: "Bitdefender Premium",
    rating: 9.8,
    price: "$89/year",
    vpn: true,
    speed: "Very Fast",
    platforms: "Windows, Mac, Android, iOS"
  },
  {
    name: "Kaspersky Plus",
    rating: 9.5,
    price: "$59/year",
    vpn: true,
    speed: "Fast",
    platforms: "Windows, Mac"
  },
  {
    name: "Avira Free Security",
    rating: 8.9,
    price: "Free",
    vpn: false,
    speed: "Medium",
    platforms: "Windows, Mac"
  },
  {
    name: "Norton 360 Standard",
    rating: 9.2,
    price: "$49/year",
    vpn: true,
    speed: "Fast",
    platforms: "Windows, Mac, iOS"
  }
];

export default function AntivirusFinderV2() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    priority: "",
    usage: "",
    vpn: ""
  });

  const handleSelect = (question, answer) => {
    setAnswers({ ...answers, [question]: answer });
    setStep(step + 1);
  };

  const getTopRecommendations = () => {
    let filtered = antivirusData;

    if (answers.priority === "Security") {
      filtered = filtered.filter(a => a.rating >= 9.2);
    } else if (answers.priority === "Price") {
      filtered = filtered.sort((a, b) => a.price.localeCompare(b.price));
    }

    if (answers.vpn === "Yes") {
      filtered = filtered.filter(a => a.vpn);
    }

    return filtered.slice(0, 3); // Top 3
  };

  return (
    <section id="antivirus-finder" className="bg-gray-100 py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">🛡️ Antivirus Recommendation Generator</h2>

        {step === 0 && (
          <>
            <p className="mb-4">What is your top priority?</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button onClick={() => handleSelect("priority", "Security")} className="btn">Security</button>
              <button onClick={() => handleSelect("priority", "Speed")} className="btn">Speed</button>
              <button onClick={() => handleSelect("priority", "Price")} className="btn">Price</button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p className="mb-4">What do you use your computer for most?</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button onClick={() => handleSelect("usage", "Work")} className="btn">Work</button>
              <button onClick={() => handleSelect("usage", "Gaming")} className="btn">Gaming</button>
              <button onClick={() => handleSelect("usage", "Family")} className="btn">Family</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="mb-4">Do you want built-in VPN?</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => handleSelect("vpn", "Yes")} className="btn">Yes</button>
              <button onClick={() => handleSelect("vpn", "No")} className="btn">No</button>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">✅ Top 3 Recommended Antivirus</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow rounded-xl">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Rating</th>
                    <th className="py-2 px-4">Price</th>
                    <th className="py-2 px-4">VPN</th>
                    <th className="py-2 px-4">Speed</th>
                    <th className="py-2 px-4">Platforms</th>
                  </tr>
                </thead>
                <tbody>
                  {getTopRecommendations().map((antivirus, idx) => (
                    <tr key={idx} className="text-center border-t">
                      <td className="py-2 px-4 font-semibold">{antivirus.name}</td>
                      <td className="py-2 px-4">{antivirus.rating}</td>
                      <td className="py-2 px-4">{antivirus.price}</td>
                      <td className="py-2 px-4">{antivirus.vpn ? "✅" : "❌"}</td>
                      <td className="py-2 px-4">{antivirus.speed}</td>
                      <td className="py-2 px-4">{antivirus.platforms}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="btn mt-6"
              onClick={() => {
                setStep(0);
                setAnswers({ priority: "", usage: "", vpn: "" });
              }}
            >
              Restart Quiz
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
