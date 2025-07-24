import React, { useEffect, useState } from "react";

export default function AdminNews() {
  const [newsList, setNewsList] = useState([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [editing, setEditing] = useState(null);

  const token = localStorage.getItem("token");

  const fetchNews = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/news");
      const data = await res.json();
      setNewsList(data);
    } catch {
      console.error("❌ Неуспешно зареждане на новини");
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `http://localhost:5000/api/news/${editing.NewsID}`
      : "http://localhost:5000/api/news";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ title: "", content: "" });
        setEditing(null);
        fetchNews();
      }
    } catch {
      alert("Грешка при запис на новина.");
    }
  };

  const handleEdit = (item) => {
    setForm({ title: item.Title, content: item.Content });
    setEditing(item);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Сигурен ли си, че искаш да изтриеш тази новина?")) return;
    try {
      await fetch(`http://localhost:5000/api/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNews();
    } catch {
      alert("Грешка при изтриване.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-white p-6 space-y-8">
      <h2 className="text-3xl font-semibold text-center">
        {editing ? "Редактирай новина" : "Добави новина"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Заглавие"
          className="w-full px-4 py-2 rounded bg-gray-700"
        />
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Съдържание"
          rows={5}
          className="w-full px-4 py-2 rounded bg-gray-700"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white font-semibold"
        >
          {editing ? "Запази промените" : "Добави новина"}
        </button>
      </form>

      <h3 className="text-2xl">Списък с новини</h3>
      <ul className="space-y-4">
        {newsList.map((n) => (
          <li
            key={n.NewsID}
            className="bg-gray-800 p-4 rounded flex justify-between items-start"
          >
            <div>
              <h4 className="font-bold text-lg">{n.Title}</h4>
              <p className="text-sm text-gray-300">{n.Content}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(n)}
                className="bg-yellow-400 text-black px-3 py-1 rounded"
              >
                Редактирай
              </button>
              <button
                onClick={() => handleDelete(n.NewsID)}
                className="bg-red-600 px-3 py-1 rounded"
              >
                Изтрий
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
