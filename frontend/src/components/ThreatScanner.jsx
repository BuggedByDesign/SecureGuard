import React, { useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#9ca3af"];
const API_BASE_URL = "http://localhost:5000";

const TAB = {
  base: "px-4 py-2 cursor-pointer transition",
  active: "border-b-2 border-blue-600 text-blue-600 font-semibold",
  inactive: "text-gray-500 hover:text-gray-700",
};

export default function ThreatScanner() {
  const [mode, setMode] = useState("file");
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const reset = () => {
    setError("");
    setResult(null);
    setLoading(false);
  };

  const handleFileChange = (e) => {
    reset();
    setFile(e.target.files[0]);
  };

  const scanFile = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/scan`, fd);
      setResult({ stats: data.stats, total: data.total });
    } catch {
      setError("Scan result not ready. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const scanUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/url-scan`, { url });
      const stats = data.stats;
      const total = stats.harmless + stats.malicious + stats.suspicious + stats.undetected;
      setResult({ stats, total });
    } catch {
      setError("URL scan failed. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = result
    ? [
        { name: "Harmless", value: result.stats.harmless },
        { name: "Malicious", value: result.stats.malicious },
        { name: "Suspicious", value: result.stats.suspicious },
        { name: "Undetected", value: result.stats.undetected },
      ]
    : [];

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 max-w-lg mx-auto mt-16">
      {/* Tabs */}
      <div className="flex justify-center mb-6">
        {["file", "url"].map((tab) => (
          <div
            key={tab}
            className={`${TAB.base} ${mode === tab ? TAB.active : TAB.inactive}`}
            onClick={() => {
              setMode(tab);
              reset();
              setFile(null);
              setUrl("");
            }}
          >
            {tab === "file" ? "File Scan" : "URL Scan"}
          </div>
        ))}
      </div>

      {/* Heading */}
      <h2 className="text-center text-xl font-bold text-red-600 mb-4 flex items-center justify-center gap-2">
        <span role="img">{mode === "file" ? "🛡️" : "🔐"}</span>
        {mode === "file" ? "File Scanner" : "URL Scanner"}
      </h2>

      {/* Input */}
      {mode === "file" ? (
        <input
          key="file-input"
          type="file"
          onChange={handleFileChange}
          className="border rounded px-3 py-2 w-full mb-4"
        />
      ) : (
        <input
          key="url-input"
          type="url"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border rounded px-3 py-2 w-full mb-4"
        />
      )}

      {/* Button */}
      <button
        onClick={mode === "file" ? scanFile : scanUrl}
        disabled={loading || (mode === "file" ? !file : url.trim() === "")}
        className="bg-blue-600 disabled:bg-blue-300 text-white w-full py-2 rounded mb-4 hover:bg-blue-700 transition"
      >
        {loading ? "Scanning..." : mode === "file" ? "Analyze File" : "Scan URL"}
      </button>

      {/* Error */}
      {error && <p className="text-center text-red-600 mb-4">{error}</p>}

      {/* Result */}
      {result && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
          <p className="text-center text-gray-700 mt-1">
            Detected by{" "}
            <strong className="text-red-600">{result.stats.malicious}</strong>{" "}
            of <strong>{result.total}</strong> engines.
          </p>
        </div>
      )}

      {/* Pie Chart */}
      {result && (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={60}
                outerRadius={80}
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" formatter={(val) => val} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
