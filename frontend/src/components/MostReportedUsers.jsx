import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MostReportedUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportedUsers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/admin/most-reported-users",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            withCredentials: true,
          }
        );
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch most reported users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportedUsers();
  }, []);

  if (loading)
    return (
      <div className="admin-box mt-12 max-w-3xl w-full shadow-xl border border-white/10 rounded-xl overflow-hidden p-6 text-center text-white/70 italic">
        Loading most reported users...
      </div>
    );

  return (
    <div className="admin-box mt-12 max-w-3xl w-full shadow-xl border border-white/10 rounded-xl overflow-hidden bg-gray-900">
      <div className="bg-white/10 px-6 py-4 flex items-center gap-3 border-b border-white/10">
        <span
          role="img"
          aria-label="Warning"
          className="text-pink-500 text-3xl select-none"
        >
          ⛔
        </span>
        <h2 className="text-xl font-semibold text-white select-none">
          Most Reported Users
        </h2>
      </div>

      {users.length === 0 ? (
        <div className="p-6 text-center text-white/60 italic select-none">
          No reported users found.
        </div>
      ) : (
        <table className="w-full text-sm text-white/90">
          <thead className="bg-white/5 text-left uppercase text-white/70 text-xs tracking-wider select-none">
            <tr>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Reports</th>
            </tr>
          </thead>
          <tbody>
            {users.map(({ UserID, FullName, ReportCount }) => (
              <tr
                key={UserID}
                className="border-t border-white/10 hover:bg-white/10 transition-colors duration-200"
              >
                <td className="px-6 py-3">{FullName}</td>
                <td className="px-6 py-3 font-mono tabular-nums">{ReportCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
