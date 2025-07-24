import React, { useEffect, useState } from "react";
import "./index.css";

import AdminUsers from "./components/AdminUsers";
import AdminReportedReviews from "./components/AdminReportedReviews";
import AdminNews from "./components/AdminNews";
import AdminStats from "./components/AdminStats";
import AdminReportAbuse from "./components/AdminReportAbuse";
import MostReportedUsers from "./components/MostReportedUsers";
import AdminUserProfiles from "./components/AdminUserProfiles";

export default function AdminPageT() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    image: "",
  });

  const [fileName, setFileName] = useState("");
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState("products");

  const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin", {
        headers: { "Content-Type": "application/json", ...authHeader() },
      });
      if (!res.ok) throw new Error("Error loading products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("❌ Error loading products:", err.message);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "price") {
      // Позволява само цифри и максимум една точка
      if (/^\d*\.?\d*$/.test(value) || value === "") {
        value = value.replace(",", ".");
        setForm((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imagePath = `/assets/products/${file.name}`;
    setForm((prev) => ({ ...prev, image: imagePath }));
    setFileName(file.name);
  };

  const generateDescriptionAI = async () => {
    if (!form.name.trim()) {
      alert("Please enter a product name to generate description.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ productName: form.name }),
      });
      if (!res.ok) throw new Error("Failed to generate description.");
      const data = await res.json();
      setForm((prev) => ({ ...prev, description: data.description || "" }));
    } catch (err) {
      alert(err.message || "Error generating description.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image) return alert("Please add an image.");
    if (!form.price) return alert("Please enter a price.");

    const priceValue = parseFloat(form.price);
    if (
      isNaN(priceValue) ||
      !/^\d+(\.\d+)?$/.test(form.price)
    ) {
      return alert("Price must be a valid number.");
    }

    const confirmText = editing
      ? "Are you sure you want to update this product?"
      : "Are you sure you want to add this product?";
    if (!window.confirm(confirmText)) return;

    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `http://localhost:5000/api/admin/${editing.ProductID}`
      : "http://localhost:5000/api/admin/";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          ProductName: form.name,
          Description: form.description,
           Price: form.price,
          Discount: form.discount || "",
          ImageURL: form.image,
        }),
      });

      if (!res.ok) throw new Error("Error saving product.");

      setForm({ name: "", description: "", price: "", discount: "", image: "" });
      setFileName("");
      setEditing(null);
      fetchProducts();
    } catch (err) {
      alert(err.message || "Error saving product.");
    }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.ProductName,
      description: p.Description,
      price: p.Price.toString(),
      discount: p.Discount || "",
      image: p.ImageURL,
    });
    setFileName("(existing image)");
    setEditing(p);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/${id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      if (!res.ok) throw new Error("Error deleting.");
      fetchProducts();
    } catch (err) {
      alert(err.message || "Error deleting.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex flex-col items-center text-white pt-28 px-6 pb-20">
      <div className="sticky top-4 z-20 flex gap-4 mb-8">
        {["products", "users", "reports", "news", "stats", "profiles"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold border shadow-md transition-all duration-300 ${
              activeTab === tab
                ? "bg-white text-black scale-105"
                : "bg-white/10 hover:bg-white/20 text-white/80"
            }`}
          >
            {{
              products: "🛍️ Products",
              users: "👥 Users",
              reports: "🚩 Reports",
              news: "📰 News",
              stats: "📊 Stats",
              profiles: "👤 User Profiles",
            }[tab]}
          </button>
        ))}
      </div>

      {activeTab === "products" && (
        <>
          {/* Form for adding/editing products */}
          <div className="admin-box max-w-2xl w-full mb-12">
            <h2 className="text-3xl font-semibold text-center mb-6 drop-shadow">
              {editing ? "Edit Product" : "New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {["name", "description", "price", "discount"].map((field) => (
                <div key={field}>
                  {field === "description" ? (
                    <>
                      <textarea
                        name="description"
                        placeholder="Description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border bg-white/10 placeholder-white/60 resize-y"
                        rows={4}
                      />
                      <button
                        type="button"
                        onClick={generateDescriptionAI}
                        className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md"
                      >
                        Generate Description with AI
                      </button>
                    </>
                  ) : (
                    <input
                      name={field}
                      placeholder={
                        field === "name"
                          ? "Name"
                          : field === "price"
                          ? "Price"
                          : "Discount"
                      }
                      value={form[field]}
                      onChange={handleChange}
                      type="text"
                      required={field !== "discount"}
                      className="w-full px-4 py-3 rounded-lg border bg-white/10 placeholder-white/60"
                    />
                  )}
                </div>
              ))}
              <label
                htmlFor="image-upload"
                className="block w-full bg-white/10 text-white border px-4 py-3 rounded-lg text-center cursor-pointer"
              >
                📷 Upload Image (from assets folder)
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {fileName && form.image && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={form.image}
                    alt="preview"
                    className="w-16 h-16 object-contain rounded border shadow"
                  />
                  <span className="text-green-300 text-sm">{fileName}</span>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 transition text-white font-semibold py-2 rounded-lg shadow-md"
              >
                {editing ? "Update Product" : "Add Product"}
              </button>
            </form>
          </div>

          {/* Table of existing products */}
          <div className="admin-box max-w-6xl w-full overflow-x-auto">
            <table className="min-w-full text-sm text-white divide-y divide-white/10">
              <thead className="bg-white/10 text-left">
                <tr>
                  <th className="px-6 py-3">Image</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Discount</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-center text-white/70">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr
                      key={p.ProductID}
                      className="border-t border-white/10 hover:bg-white/10 transition"
                    >
                      <td className="px-6 py-4">
                        <img
                          src={p.ImageURL}
                          alt={p.ProductName}
                          className="w-10 h-10 object-contain rounded"
                        />
                      </td>
                      <td className="px-6 py-4">{p.ProductName}</td>
                      <td className="px-6 py-4">{p.Description}</td>
                      <td className="px-6 py-4">{p.Price}</td>
                      <td className="px-6 py-4">{p.Discount || "-"}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-1 rounded-lg font-semibold shadow"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.ProductID)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg font-semibold shadow"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === "profiles" && <AdminUserProfiles />}
      {activeTab === "users" && <AdminUsers />}
      {activeTab === "reports" && <AdminReportedReviews />}
      {activeTab === "news" && <AdminNews />}
      {activeTab === "stats" && (
        <>
          <AdminStats />
          <MostReportedUsers />
        </>
      )}
    </div>
  );
}
