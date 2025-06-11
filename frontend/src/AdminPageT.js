import React, { useEffect, useState } from "react";
import "./index.css";

function AdminPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", image: "" });
  const [fileName, setFileName] = useState("");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch("http://localhost:5000/api/admin");
    const data = await res.json();
    setProducts(data);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setForm({ ...form, image: base64 });
      setFileName(file.name);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image) {
      alert("Please upload an image.");
      return;
    }

    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `http://localhost:5000/api/admin/${editing.ProductID}`
      : "http://localhost:5000/api/admin";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ name: "", description: "", price: "", image: "" });
      setFileName("");
      setEditing(null);
      fetchProducts();
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.ProductName,
      description: product.Description,
      price: product.Price,
      image: product.ImageURL,
    });
    setEditing(product);
    setFileName("(existing image)");
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/admin/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-red-500 p-6 flex flex-col items-center">
      <div className="backdrop-blur-lg bg-white/30 border border-white/10 shadow-2xl rounded-2xl max-w-2xl w-full p-8 mb-12 animate-fade-in">
        <h2 className="text-3xl font-semibold text-white text-center mb-6 drop-shadow">
          {editing ? "Edit Product" : "Add New Product"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

         <label
                htmlFor="image-upload"
                className="block w-full bg-white/10 text-white border border-white/20 px-4 py-3 rounded-lg cursor-pointer text-center hover:bg-white/20 transition"
              >
                📷 Upload image (required)
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

         {fileName && form.image ? (
          <div className="mt-2 flex items-center gap-3">
            <img
              src={form.image}
              alt="Preview"
              className="w-16 h-16 object-contain rounded border border-white/20 shadow"
            />
            <span className="text-green-300 text-sm">{fileName}</span>
          </div>
        ) : (
          <p className="text-sm text-red-300 mt-1 italic">⚠ Image is required</p>
        )}


          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 transition text-white font-semibold py-2 rounded-lg shadow-md"
          >
            {editing ? "Update Product" : "Add Product"}
          </button>
        </form>
      </div>

      <div className="max-w-6xl w-full bg-white/30 backdrop-blur-lg border border-white/10 shadow-xl rounded-2xl overflow-hidden animate-fade-in">
        <table className="min-w-full text-sm text-white backdrop-blur">
          <thead className="bg-white/20">
            <tr>
              <th className="px-6 py-3 text-left">Image</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.ProductID} className="border-t border-white/10 hover:bg-white/10 transition">
                <td className="px-6 py-4">
                  <img
                    src={product.ImageURL}
                    alt={product.ProductName}
                    className="w-10 h-10 object-contain rounded"
                  />
                </td>
                <td className="px-6 py-4 font-medium">{product.ProductName}</td>
                <td className="px-6 py-4">{product.Description}</td>
                <td className="px-6 py-4">{product.Price}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-1 rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.ProductID)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-6 text-center text-white/70">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPage;
