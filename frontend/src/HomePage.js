import React, { useEffect, useState } from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import TopPicks from "./components/TopPicks";
import AntivirusListT from "./components/AntivirusListT";

function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => setProducts([]));
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <TopPicks /> {/* ⬅️ добави го тук */}
      <AntivirusListT products={products} />
    </>
  );
}

export default HomePage;
