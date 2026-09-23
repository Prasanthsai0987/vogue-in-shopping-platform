import { useEffect, useState } from "react";
import API from "../api";
import "./Orders.css";

export default function Orders() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // --------------------------------------------------
  // Load customer's orders
  // --------------------------------------------------

  useEffect(() => {

    const loadOrders = async () => {

      const customerId = localStorage.getItem("customerId");

      if (!customerId) {
        setError("Please login to view your orders.");
        setLoading(false);
        return;
      }

      try {

        const response = await API.get(
          `/orders/customer/${customerId}`
        );

        const data = response?.data ?? response;

        setOrders(Array.isArray(data) ? data : []);

      } catch (err) {

        console.error("ORDERS ERROR:", err);

        if (err.response) {
          console.error(
            "Backend status:",
            err.response.status
          );

          console.error(
            "Backend data:",
            err.response.data
          );
        }

        setError("Failed to load your orders.");

      } finally {

        setLoading(false);

      }

    };

    loadOrders();

  }, []);


  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

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


  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {

    return (
      <div className="orders-page">
        <div className="orders-container">

          <h1 className="orders-title">
            My Orders
          </h1>

          <div className="orders-error">
            {error}
          </div>

        </div>
      </div>
    );

  }


  // --------------------------------------------------
  // No orders
  // --------------------------------------------------

  if (orders.length === 0) {

    return (
      <div className="orders-page">
        <div className="orders-container">

          <h1 className="orders-title">
            My Orders
          </h1>

          <div className="no-orders">

            <div className="no-orders-icon">
              📦
            </div>

            <h2>No orders yet</h2>

            <p>
              You haven't placed any orders yet.
            </p>

          </div>

        </div>
      </div>
    );

  }


  // --------------------------------------------------
  // Orders
  // --------------------------------------------------

  return (

    <div className="orders-page">

      <div className="orders-container">

        <h1 className="orders-title">
          My Orders
        </h1>

        <p className="orders-subtitle">
          View your order history and order status
        </p>


        <div className="orders-list">

          {orders.map((order) => (

            <div
              className="order-card"
              key={order.id}
            >

              {/* Order Header */}

              <div className="order-header">

                <div>

                  <h2>
                    Order #{order.orderRef}
                  </h2>

                  <p>
                    Order ID: {order.id}
                  </p>

                </div>


                <div
                  className={`order-status ${String(
                    order.status || ""
                  ).toLowerCase()}`}
                >
                  {order.status}
                </div>

              </div>


              {/* Order Items */}

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

                      <h3>
                        {item.productName}
                      </h3>

                      <p>
                        Brand: {item.brand || "N/A"}
                      </p>

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


              {/* Shipping Address */}

              {order.shippingAddress && (

                <div className="order-address">

                  <strong>
                    Shipping Address
                  </strong>

                  <p>
                    {order.shippingAddress}
                  </p>

                </div>

              )}


              {/* Order Total */}

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