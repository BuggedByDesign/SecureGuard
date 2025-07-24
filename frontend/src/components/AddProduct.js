import React, { useState } from "react";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [imageBase64, setImageBase64] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImageBase64(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:5000/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        price,
        image: imageBase64,
        discount: discount || 0
      })
    });

    if (res.ok) alert("Продуктът е добавен!");
    else alert("Грешка при добавяне.");
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded shadow-md max-w-md mx-auto">
      <h2 className="text-2xl mb-4 text-center">Нов продукт</h2>
      <input placeholder="Име" value={name} onChange={(e) => setName(e.target.value)} className="input mb-2" />
      <input placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} className="input mb-2" />
      <input placeholder="Цена" value={price} onChange={(e) => setPrice(e.target.value)} className="input mb-2" />
      <input placeholder="Намаление (%)" type="number" min="0" max="100" value={discount} onChange={(e) => setDiscount(e.target.value)} className="input mb-2" />
      <input type="file" onChange={handleImageChange} className="input mb-2" />
      <button onClick={handleSubmit} className="bg-blue-600 w-full py-2 rounded">Добави продукт</button>
    </div>
  );
}
