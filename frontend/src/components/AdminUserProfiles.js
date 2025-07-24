// frontend/src/components/AdminUserProfiles.js
import React, { useEffect, useState } from "react";

export default function AdminUserProfiles() {
  const [users, setUsers] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterReports, setFilterReports] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const token = localStorage.getItem("token");

useEffect(() => {
  if (!token) {
    alert("Not logged in or missing token.");
    return;
  }

  fetch("http://localhost:5000/api/admin/user-profiles", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP status ${res.status}`);
      return res.json();
    })
    .then((data) => {
      setUsers(data);
      setFilteredUsers(data);
    })
    .catch((err) => {
      console.error("Fetch error:", err.message);
      alert("Error fetching user profiles: " + err.message);
    });
}, [token]);



  useEffect(() => {
    const filtered = users.filter((u) => {
      const matchesName = u.FullName.toLowerCase().includes(filterName.toLowerCase());
      const matchesReports = filterReports ? u.ReportCount >= parseInt(filterReports) : true;
      return matchesName && matchesReports;
    });
    setFilteredUsers(filtered);
  }, [filterName, filterReports, users]);

  const handleBlock = async (id) => {
    if (!window.confirm("Are you sure you want to block this user?")) return;
    await fetch(`http://localhost:5000/api/admin/users/${id}/block`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers((prev) => prev.map((u) => u.UserID === id ? { ...u, IsBlocked: 1 } : u));
  };
        const handleUnblock = async (id) => {
        if (!window.confirm("Are you sure you want to unblock this user?")) return;
        await fetch(`http://localhost:5000/api/admin/users/${id}/unblock`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
        });
        setUsers((prev) => prev.map((u) => u.UserID === id ? { ...u, IsBlocked: 0 } : u));
        };

  const exportCSV = () => {
    const headers = "FullName,Email,Reports,Status\n";
    const rows = filteredUsers
      .map((u) =>
        `${u.FullName},${u.Email},${u.ReportCount},${u.IsBlocked ? "Blocked" : "Active"}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_profiles.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-box w-full max-w-6xl">
      <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
        👤 User Profiles
        <button onClick={exportCSV} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 shadow">
          📤 Export CSV
        </button>
      </h2>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Filter by name"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="px-4 py-2 rounded bg-white/10 border placeholder-white/60"
        />
        <input
          type="number"
          placeholder="Min reports"
          value={filterReports}
          onChange={(e) => setFilterReports(e.target.value)}
          className="px-4 py-2 rounded bg-white/10 border placeholder-white/60"
        />
      </div>

      <table className="w-full text-sm text-white">
        <thead>
          <tr className="bg-white/10">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Reports</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
        {filteredUsers.length === 0 ? (
            <tr>
            <td colSpan={5} className="text-center text-white/70 py-4">No users found</td>
            </tr>
        ) : (
            filteredUsers.map((u) => (
            <tr key={u.UserID} className="border-t border-white/10">
                <td className="px-4 py-2">{u.FullName}</td>
                <td className="px-4 py-2">{u.Email}</td>
                <td className="px-4 py-2">{u.ReportCount}</td>
                <td className="px-4 py-2">{u.IsBlocked ? "Blocked" : "Active"}</td>
                <td className="px-4 py-2">
                {u.IsBlocked ? (
                    <button
                    onClick={() => handleUnblock(u.UserID)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow"
                    >
                    Unblock
                    </button>
                ) : (
                    <button
                    onClick={() => handleBlock(u.UserID)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow"
                    >
                    Block
                    </button>
                )}
                </td>
            </tr>
            ))
        )}
        </tbody>

      </table>
    </div>
  );
}
