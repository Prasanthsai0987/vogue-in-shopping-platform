import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../api";
import "./ProductListing.css";

// Fallback mock data (used until backend is connected)
// const MOCK_PRODUCTS = [
//   { id: 1, name: "Floral Wrap Dress", brand: "Zara", price: 2499, oldPrice: 3999, emoji: "👗", category: "Dresses", rating: 4.5, reviews: 128, badge: "New" },
//   { id: 2, name: "High-Rise Slim Jeans", brand: "H&M", price: 1799, oldPrice: 2499, emoji: "👖", category: "Bottoms", rating: 4.2, reviews: 96 },
//   { id: 3, name: "Oversized Blazer", brand: "Mango", price: 3299, oldPrice: 4999, emoji: "🧥", category: "Tops", rating: 4.7, reviews: 72, badge: "Trending" },
//   { id: 4, name: "Linen Palazzo Pants", brand: "AND", price: 1599, oldPrice: 2199, emoji: "👘", category: "Bottoms", rating: 4.0, reviews: 55 },
//   { id: 5, name: "Crop Knit Sweater", brand: "Marks & Spencer", price: 1999, oldPrice: 2799, emoji: "🧶", category: "Tops", rating: 4.4, reviews: 88 },
//   { id: 6, name: "Boho Maxi Skirt", brand: "Global Desi", price: 1299, oldPrice: 1799, emoji: "👗", category: "Skirts", rating: 4.3, reviews: 61, badge: "Sale" },
// ];

const CATEGORIES = ["All", "Dresses", "Tops", "Bottoms", "Skirts"];

export default function ProductListing({ onProductClick }) {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    setLoading(true);
    fetchProducts(activeCategory !== "All" ? activeCategory : null)
      .then((res) => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="listing-page">
      <div className="listing-header">
        <div>
          <h1 className="listing-title">Women's Fashion</h1>
          <p className="listing-sub">{filtered.length} products</p>
        </div>
      </div>

      <div className="filter-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-chip ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="products-grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
