
import { useEffect, useState } from "react";
import { fetchOrdersByCustomer } from "../api";
import "./Orders.css";

export default function Orders({ onLoginRequired }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      setLoading(true);
      setError("");

      const customerId = localStorage.getItem("customerId");

      if (!customerId) {
        if (active) {
          setError("Please login to view your orders.");
          setLoading(false);
        }
        return;
      }

      try {
        const response =
          await fetchOrdersByCustomer(customerId);

        if (!active) return;

        const data = response?.data;
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!active) return;

        console.error("ORDERS ERROR:", err);

        if (err.response?.status === 401) {
          setError("Your session has expired. Please login again.");
          localStorage.removeItem("customerId");
          onLoginRequired?.();
        } else if (err.response?.status === 403) {
          setError(
            "You are not authorized to access these orders."
          );
        } else {
          setError("Failed to load your orders. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      active = false;
    };
  }, [onLoginRequired]);

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <h1 className="orders-title">My Orders</h1>
          <div className="orders-loading">
            Loading your orders...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <h1 className="orders-title">My Orders</h1>
          <div className="orders-error" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <h1 className="orders-title">My Orders</h1>

          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h2>No orders yet</h2>
            <p>You haven't placed any orders yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1 className="orders-title">My Orders</h1>

        <p className="orders-subtitle">
          View your order history and order status
        </p>

        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-header">
                <div>
                  <h2>Order #{order.orderRef}</h2>
                  <p>Order ID: {order.id}</p>
                </div>

                <div
                  className={`order-status ${String(
                    order.status || ""
                  ).toLowerCase()}`}
                >
                  {order.status}
                </div>
              </div>

              <div className="order-items">
                {order.items?.map((item, index) => (
                  <div
                    className="order-item"
                    key={`${item.productId}-${index}`}
                  >
                    <div className="order-item-emoji">
                      {item.emoji || "🛍️"}
                    </div>

                    <div className="order-item-details">
                      <h3>{item.productName}</h3>
                      <p>Brand: {item.brand || "N/A"}</p>
                      <p>
                        Size: {item.size || "N/A"}
                        {" • "}
                        Qty: {item.qty}
                      </p>
                    </div>

                    <div className="order-item-price">
                      ₹
                      {Number(
                        item.lineTotal || 0
                      ).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>

              {order.shippingAddress && (
                <div className="order-address">
                  <strong>Shipping Address</strong>
                  <p>{order.shippingAddress}</p>
                </div>
              )}

              <div className="order-footer">
                <div className="order-summary">
                  <div>
                    Subtotal
                    <span>
                      ₹
                      {Number(
                        order.subtotal || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div>
                    Shipping
                    <span>
                      ₹
                      {Number(
                        order.shippingAmount || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="order-total">
                    Total
                    <span>
                      ₹
                      {Number(
                        order.totalAmount || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
