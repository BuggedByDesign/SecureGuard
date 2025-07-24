import React, { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
      else setUsers([]);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      setUsers([]);
    }
  };

  const onlineCount = users.filter((u) => u.IsOnline).length;
  const offlineCount = users.length - onlineCount;

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("❌ Error deleting user:", err);
    }
  };

  const handleEdit = (u) => {
    setEditingUser(u.UserID);
    setForm({ fullName: u.FullName, email: u.Email, password: "" });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/admin/users/${editingUser}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      setEditingUser(null);
      setForm({ fullName: "", email: "", password: "" });
      fetchUsers();
    } catch (err) {
      console.error("❌ Error saving user:", err);
    }
  };

  const unblockUser = async (userId) => {
    if (!window.confirm("Are you sure you want to unblock this user?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/unblock`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      alert(data.message);
      fetchUsers();
    } catch (err) {
      console.error("❌ Failed to unblock user", err);
    }
  };

  return (
    <div className="bg-white/20 backdrop-blur p-6 rounded-lg shadow-xl mt-12 text-white max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <p className="mb-1">👥 Total registered: {users.length}</p>
      <p className="mb-6">
        🟢 Online: <strong>{onlineCount}</strong> &nbsp; 🔴 Offline: <strong>{offlineCount}</strong>
      </p>

      {editingUser && (
        <div className="mb-6 p-4 bg-white/10 rounded">
          <h3 className="font-semibold mb-2">Editing: {form.fullName}</h3>
          <input
            className="w-full mb-2 px-3 py-2 rounded bg-white/20 text-white"
            value={form.fullName}
            placeholder="Name"
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          />
          <input
            className="w-full mb-2 px-3 py-2 rounded bg-white/20 text-white"
            value={form.email}
            placeholder="Email"
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            type="password"
            className="w-full mb-4 px-3 py-2 rounded bg-white/20 text-white"
            value={form.password}
            placeholder="New password (optional)"
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded">
              Save
            </button>
            <button onClick={() => setEditingUser(null)} className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/10">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-white/70">No users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.UserID} className="border-t border-white/10 hover:bg-white/10 transition">
                  <td className="px-4 py-2">{u.FullName}</td>
                  <td className="px-4 py-2">{u.Email}</td>
                  <td className="px-4 py-2">
                    {u.IsOnline ? <span className="text-green-300">Online</span> : <span className="text-red-300">Offline</span>}
                  </td>
                  <td className="px-4 py-2 flex gap-2 flex-wrap">
                    {editingUser !== u.UserID && (
                      <>
                        <button onClick={() => handleEdit(u)} className="bg-yellow-400 px-3 py-1 rounded">Edit</button>
                        <button onClick={() => handleDelete(u.UserID)} className="bg-red-600 px-3 py-1 rounded text-white">Delete</button>
                        {u.IsBlocked && (
                          <button onClick={() => unblockUser(u.UserID)} className="bg-blue-600 text-white px-3 py-1 rounded">
                            Unblock
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
