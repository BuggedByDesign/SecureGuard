import React, { useEffect, useState } from "react";

export default function AdminReportAbuse() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/admin/most-reported-users", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("❌ Error fetching report abuse data:", err));
  }, []);

  return (
    <div className="admin-box max-w-3xl w-full">
      <h2 className="text-2xl font-semibold text-center mb-6">🛑 Most Reported Users</h2>
      <table className="min-w-full text-sm text-white divide-y divide-white/10">
        <thead className="bg-white/10">
          <tr>
            <th className="px-6 py-3">User</th>
            <th className="px-6 py-3">Reports</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.UserID} className="border-t border-white/10">
              <td className="px-6 py-4">{u.FullName}</td>
              <td className="px-6 py-4">{u.ReportCount}</td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={2} className="px-6 py-6 text-center text-white/60">No reported users.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
