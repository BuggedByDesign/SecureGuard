import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SiteStatistics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get("/api/admin/stats", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    })
    .then(res => setStats(res.data))
    .catch(err => console.error(err));
  }, []);

  if (!stats) return (
    <div className="p-6 text-center text-white/60 italic">Loading statistics...</div>
  );

  return (
    <div className="admin-box mt-12 max-w-3xl w-full shadow-xl border border-white/10 rounded-xl overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="bg-white/10 px-6 py-4 flex items-center gap-2 border-b border-white/10">
        <span className="text-blue-400 text-2xl">📊</span>
        <h2 className="text-xl font-semibold text-white">Site Statistics</h2>
      </div>

      <table className="w-full text-sm text-white/90">
        <tbody>
          <tr className="border-b border-white/10 hover:bg-white/5 transition">
            <td className="px-6 py-3 font-medium">👥 Total users</td>
            <td className="px-6 py-3">{stats.totalUsers}</td>
          </tr>
          <tr className="border-b border-white/10 hover:bg-white/5 transition">
            <td className="px-6 py-3 font-medium">🛑 Blocked users</td>
            <td className="px-6 py-3">{stats.blockedUsers}</td>
          </tr>
          <tr className="border-b border-white/10 hover:bg-white/5 transition">
            <td className="px-6 py-3 font-medium">🟢 Online users</td>
            <td className="px-6 py-3">{stats.onlineUsers}</td>
          </tr>
          <tr className="border-b border-white/10 hover:bg-white/5 transition">
            <td className="px-6 py-3 font-medium">📝 Total reviews</td>
            <td className="px-6 py-3">{stats.totalReviews}</td>
          </tr>
          <tr className="border-b border-white/10 hover:bg-white/5 transition">
            <td className="px-6 py-3 font-medium">🚩 Total reports</td>
            <td className="px-6 py-3">{stats.totalReports}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
