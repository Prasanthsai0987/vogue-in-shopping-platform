import { useCart } from "./CartContext";
import "./Cart.css";

export default function Cart({
  onBack,
  onCheckout
}) {

  const {
    items,
    removeItem,
    updateItem,
    subtotal,
    shipping,
    total,
    loading
  } = useCart();


  // =====================================================
  // EMPTY CART
  // =====================================================

  if (items.length === 0) {

    return (
      <div className="cart-page">

        <div className="cart-empty">

          <div className="empty-icon">
            🛍️
          </div>

          <h2>
            Your cart is empty
          </h2>

          <p>
            Looks like you haven't added anything yet.
          </p>

          <button
            className="btn-primary"
            onClick={onBack}
          >
            Start shopping
          </button>

        </div>

      </div>
    );
  }


  return (
    <div className="cart-page">


      {/* =================================================
          CONTINUE SHOPPING
      ================================================= */}

      <button
        className="back-btn"
        onClick={onBack}
      >
        ← Continue shopping
      </button>


      <h1 className="cart-title">
        Your Cart
      </h1>


      <div className="cart-layout">


        {/* =================================================
            CART ITEMS
        ================================================= */}

        <div className="cart-items">

          {items.map((item, i) => (

            <div
              className="cart-item"
              key={`${item.productId}-${item.size}-${i}`}
            >


              {/* PRODUCT IMAGE */}

              <div className="cart-item-img">
                {item.emoji}
              </div>


              {/* PRODUCT INFORMATION */}

              <div className="cart-item-info">

                <div className="cart-item-brand">
                  {item.brand}
                </div>

                <div className="cart-item-name">
                  {item.name}
                </div>

                <div className="cart-item-meta">
                  Size: {item.size || "N/A"}
                </div>


                {/* QUANTITY */}

                <div className="cart-quantity">

                  <button
                    className="cart-qty-btn"
                    onClick={() =>
                      updateItem(
                        i,
                        Number(item.qty) - 1
                      )
                    }
                    disabled={loading}
                  >
                    −
                  </button>

                  <span className="cart-qty-value">
                    {item.qty}
                  </span>

                  <button
                    className="cart-qty-btn"
                    onClick={() =>
                      updateItem(
                        i,
                        Number(item.qty) + 1
                      )
                    }
                    disabled={loading}
                  >
                    +
                  </button>

                </div>

              </div>


              {/* PRICE + REMOVE */}

              <div className="cart-item-right">

                <div className="cart-item-price">

                  ₹
                  {(
                    Number(item.price || 0) *
                    Number(item.qty || 0)
                  ).toLocaleString("en-IN")}

                </div>


                <button
                  className="remove-btn"
                  onClick={() =>
                    removeItem(i)
                  }
                  disabled={loading}
                  title="Remove"
                >
                  ✕
                </button>

              </div>

            </div>

          ))}

        </div>


        {/* =================================================
            ORDER SUMMARY
        ================================================= */}

        <div className="order-summary">

          <h2 className="summary-title">
            Order Summary
          </h2>


          <div className="summary-rows">


            {/* SUBTOTAL */}

            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <span>
                ₹{subtotal.toLocaleString("en-IN")}
              </span>

            </div>


            {/* SHIPPING */}

            <div className="summary-row">

              <span>
                Shipping
              </span>

              <span
                className={
                  shipping === 0
                    ? "free-tag"
                    : ""
                }
              >
                {shipping === 0
                  ? "FREE"
                  : `₹${shipping}`}
              </span>

            </div>


            {/* FREE SHIPPING MESSAGE */}

            {subtotal < 2999 && subtotal > 0 && (

              <div className="free-ship-hint">

                Add ₹
                {(2999 - subtotal).toLocaleString("en-IN")}
                {" "}more for free shipping

              </div>

            )}

          </div>


          {/* TOTAL */}

          <div className="summary-total">

            <span>
              Total
            </span>

            <span>
              ₹{total.toLocaleString("en-IN")}
            </span>

          </div>


          {/* CHECKOUT */}

          <button
            className="btn-primary checkout-btn"
            onClick={onCheckout}
            disabled={loading}
          >
            Proceed to Payment
          </button>


          <div className="secure-note">
            🔒 Secure checkout · UPI / QR
          </div>

        </div>

      </div>

    </div>
  );
}