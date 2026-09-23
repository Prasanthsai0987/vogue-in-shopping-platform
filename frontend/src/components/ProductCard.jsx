import "./ProductCard.css";

export default function ProductCard({ product, onClick }) {
  const discount = Math.round((1 - product.price / product.oldPrice) * 100);

  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-img-wrap">
        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}
        <span className="product-emoji">{product.emoji}</span>
      </div>
      <div className="product-info">
        <div className="product-brand">{product.brand}</div>
        <div className="product-name">{product.name}</div>
        <div className="product-price-row">
          <span className="price">₹{product.price.toLocaleString()}</span>
          <span className="price-old">₹{product.oldPrice.toLocaleString()}</span>
          <span className="discount-tag">{discount}% off</span>
        </div>
        <div className="product-rating">
          {"★".repeat(Math.round(product.rating))}
          {"☆".repeat(5 - Math.round(product.rating))}
          <span className="rating-count">({product.reviews})</span>
        </div>
      </div>
    </div>
  );
}
