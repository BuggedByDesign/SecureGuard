import React, { useState } from "react";

const questions = [
  {
    question: "What device do you primarily use?",
    options: ["Windows PC", "Mac", "Android", "iPhone"],
  },
  {
    question: "What's your top priority?",
    options: ["Security", "Performance", "Parental Control", "Price"],
  },
  {
    question: "How tech-savvy are you?",
    options: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    question: "Do you need additional features?",
    options: ["VPN", "Password Manager", "None", "All of them"],
  },
];

const resultLogic = (answers) => {
  if (answers.includes("Windows PC") && answers.includes("Security")) {
    return [
      { name: "Bitdefender", score: 95 },
      { name: "Kaspersky", score: 92 },
      { name: "ESET NOD32", score: 89 },
    ];
  }
  if (answers.includes("Mac")) {
    return [
      { name: "Norton", score: 93 },
      { name: "Bitdefender", score: 90 },
      { name: "Avast", score: 87 },
    ];
  }
  if (answers.includes("Price")) {
    return [
      { name: "Malwarebytes", score: 88 },
      { name: "McAfee", score: 86 },
      { name: "ESET NOD32", score: 85 },
    ];
  }
  return [
    { name: "Bitdefender", score: 90 },
    { name: "Norton", score: 88 },
    { name: "McAfee", score: 85 },
  ];
};


export default function AntivirusPickerV2() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);

  const handleSelect = (option) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);
    if (step + 1 === questions.length) {
      const final = resultLogic(newAnswers);
      setResults(final);
    } else {
      setStep(step + 1);
    }
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers([]);
    setResults(null);
  };

  return (
    <div className="max-w-2xl mx-auto mt-20 bg-white p-6 rounded-lg shadow-lg">
      {!results ? (
        <>
          <h2 className="text-xl font-semibold mb-4">
            {questions[step].question}
          </h2>
          <div className="flex flex-col gap-3">
            {questions[step].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
              >
                {opt}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Question {step + 1} of {questions.length}
          </p>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6 text-green-700">
            Your Top Antivirus Recommendations:
          </h2>
          <ul className="space-y-3">
            {results.map((r, i) => (
              <li key={i} className="p-4 border rounded-lg bg-gray-50">
                <span className="font-semibold">{i + 1}. {r.name}</span>{" "}
                <span className="text-sm text-gray-600">Score: {r.score}%</span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleRestart}
            className="mt-6 bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded"
          >
            Start Over
          </button>
        </>
      )}
    </div>
  );
}
