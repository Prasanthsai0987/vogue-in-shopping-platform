import "./PaymentSuccess.css";

export default function PaymentSuccess({ onContinue, orderRef }) {
  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>

        <h1 className="success-title">
          Payment Successful!
        </h1>

        <p className="success-sub">
          Your order has been placed and will be delivered in 3–5 business days.
        </p>

        <div className="order-id-chip">
          Order ID: #{orderRef}
        </div>

        <div className="success-meta">
          <div className="meta-row">
            <span>📦</span> Track your order in My Orders
          </div>

          <div className="meta-row">
            <span>📧</span> Confirmation email sent
          </div>
        </div>

        <button
          className="continue-btn"
          onClick={onContinue}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}