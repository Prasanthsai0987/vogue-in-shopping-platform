import { useCart } from "../pages/CartContext";
import "./Navbar.css";

export default function Navbar({
  onHomeClick,
  onOrdersClick,
  onCartClick,
  onProfileClick
}) {
  const { totalItems } = useCart();

  return (
    <nav className="navbar">

      {/* Logo */}
      <div
        className="nav-logo"
        onClick={onHomeClick}
        style={{ cursor: "pointer" }}
      >
        VOGUE<span className="accent">.</span>IN
      </div>

      <div className="nav-right">

        {/* Home */}
        <button
          className="home-btn"
          onClick={onHomeClick}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9v11h14V9" />
            <path d="M9 20v-6h6v6" />
          </svg>

          Home
        </button>


        {/* Orders */}
        <button
          className="orders-btn"
          onClick={onOrdersClick}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 3h12v18H6z" />
            <path d="M9 7h6" />
            <path d="M9 11h6" />
            <path d="M9 15h4" />
          </svg>

          Orders
        </button>


        {/* Profile */}
        <button
          className="profile-btn"
          onClick={onProfileClick}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
          </svg>

          Profile
        </button>


        {/* Cart */}
        <button
          className="cart-btn"
          onClick={onCartClick}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>

          Cart

          {totalItems > 0 && (
            <span className="cart-badge">
              {totalItems}
            </span>
          )}
        </button>

      </div>
    </nav>
  );
}