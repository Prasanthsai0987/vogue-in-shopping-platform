import { useState } from "react";
import { useCart } from "./CartContext";

import {
  createOrder,
  initiatePayment,
  verifyPayment,
  getCustomer
} from "../api";

import "./Payment.css";


export default function Payment({ onBack, onSuccess }) {

  // ─────────────────────────────────────────────────────
  // CART
  // ─────────────────────────────────────────────────────

  const {
    items,
    buyNowItem,
    clearCart
  } = useCart();


  // If Buy Now was used:
  // checkout only the Buy Now product.
  //
  // Otherwise:
  // checkout the normal cart.

  const checkoutItems =
    buyNowItem
      ? [buyNowItem]
      : items;


  // ─────────────────────────────────────────────────────
  // CHECKOUT TOTAL
  // ─────────────────────────────────────────────────────

  const checkoutSubtotal =
    checkoutItems.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
        Number(item.qty || 0),
      0
    );


const checkoutShipping = 0;

  const checkoutTotal =
    checkoutSubtotal +
    checkoutShipping;


  // ─────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────

  const [loading, setLoading] =
    useState(false);


  // ─────────────────────────────────────────────────────
  // PAY WITH RAZORPAY
  // ─────────────────────────────────────────────────────

  const handlePay = async () => {

    if (checkoutItems.length === 0) {

      alert("No items available for payment.");

      return;
    }


    try {

      setLoading(true);


      // ────────────────────────────────────────────────
      // 1. GET CUSTOMER
      // ────────────────────────────────────────────────

      const customerId =
        localStorage.getItem("customerId");


      if (!customerId) {

        alert(
          "Customer information not found. Please login again."
        );

        return;
      }


const customerResponse =
  await getCustomer(customerId);

const customer =
  customerResponse?.data || customerResponse;

console.log(
  "CUSTOMER RESPONSE:",
  customerResponse
);

console.log(
  "CUSTOMER DATA:",
  customer
);

if (!customer || !customer.id) {

  alert(
    "Customer information not found."
  );

  setLoading(false);

  return;
}


      // ────────────────────────────────────────────────
      // 2. CREATE VOGUE.IN ORDER
      // ────────────────────────────────────────────────

      const order =
        await createOrder({

          items: checkoutItems.map(
            (item) => ({

              productId:
                item.id ||
                item.productId,

              qty:
                Number(item.qty),

              size:
                item.size

            })
          ),

          customerId:
            customer.id,

          customerName:
            customer.name,

          customerEmail:
            customer.email,

          shippingAddress:
            customer.shippingAddress

        });


      console.log(
        "VOGUE.IN ORDER RESPONSE:",
        order
      );


      const orderData =
        order?.data || order;


      if (!orderData?.id) {

        throw new Error(
          "Order creation failed."
        );
      }


      // ────────────────────────────────────────────────
      // 3. CREATE RAZORPAY ORDER
      // ────────────────────────────────────────────────

      const payment =
        await initiatePayment({

          orderId:
            orderData.id

        });


      console.log(
        "RAZORPAY ORDER RESPONSE:",
        payment
      );


      const paymentData =
        payment?.data || payment;


      if (!paymentData?.id) {

        throw new Error(
          "Payment initiation failed."
        );
      }


      if (!paymentData?.razorpayOrderId) {

        throw new Error(
          "Razorpay Order ID was not returned by the server."
        );
      }


      // ────────────────────────────────────────────────
      // 4. CHECK RAZORPAY SCRIPT
      // ────────────────────────────────────────────────

      if (!window.Razorpay) {

        throw new Error(
          "Razorpay Checkout failed to load. Please refresh the page."
        );
      }


      // ────────────────────────────────────────────────
      // 5. RAZORPAY CHECKOUT OPTIONS
      // ────────────────────────────────────────────────

      const options = {

        key:
          import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount:
          Math.round(checkoutTotal * 100),

        currency:
          "INR",

        name:
          "VOGUE.IN",

        description:
          `Payment for ${orderData.orderRef}`,

        order_id:
          paymentData.razorpayOrderId,


        // Customer information
        prefill: {

          name:
            customer.name || "",

          email:
            customer.email || "",

          contact:
            customer.phone || ""

        },


        // Theme
        theme: {

          color:
            "#111111"

        },


        // ────────────────────────────────────────────
        // 6. RAZORPAY SUCCESS HANDLER
        // ────────────────────────────────────────────

        handler:
          async function (response) {

            console.log(
              "RAZORPAY RESPONSE:",
              response
            );


            try {

              // ──────────────────────────────────────
              // 7. VERIFY PAYMENT WITH BACKEND
              // ──────────────────────────────────────

              const verification =
                await verifyPayment(

                  paymentData.id,

                  {

                    razorpayPaymentId:
                      response.razorpay_payment_id,

                    razorpayOrderId:
                      response.razorpay_order_id,

                    razorpaySignature:
                      response.razorpay_signature

                  }

                );


              console.log(
                "PAYMENT VERIFICATION:",
                verification
              );


              const verificationData =
                verification?.data ||
                verification;


              // ──────────────────────────────────────
              // 8. CHECK SUCCESS
              // ──────────────────────────────────────

              if (
                verificationData?.status !==
                "SUCCESS"
              ) {

                throw new Error(
                  "Payment verification failed."
                );
              }


              // ──────────────────────────────────────
              // 9. CLEAR CART
              // ──────────────────────────────────────
              //
              // Normal cart checkout:
              // clear the backend cart.
              //
              // Buy Now:
              // DO NOT clear the existing cart.

              if (!buyNowItem) {

                await clearCart();

              }


              // ──────────────────────────────────────
              // 10. SUCCESS PAGE
              // ──────────────────────────────────────

              onSuccess(
                orderData.orderRef
              );


            } catch (error) {

              console.error(
                "PAYMENT VERIFICATION ERROR:",
                error
              );


              const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                error?.message ||
                "Payment verification failed.";


              alert(message);
            }
          },


        // ────────────────────────────────────────────
        // PAYMENT MODAL CLOSED
        // ────────────────────────────────────────────

        modal: {

          ondismiss:
            function () {

              console.log(
                "Razorpay Checkout closed."
              );

              setLoading(false);

            }

        }

      };


      // ────────────────────────────────────────────────
      // 11. OPEN RAZORPAY
      // ────────────────────────────────────────────────

      const razorpay =
        new window.Razorpay(options);


      razorpay.on(
        "payment.failed",
        function (response) {

          console.error(
            "RAZORPAY PAYMENT FAILED:",
            response
          );


          alert(
            response?.error?.description ||
            "Payment failed. Please try again."
          );


          setLoading(false);

        }
      );


      razorpay.open();


    } catch (error) {

      console.error(
        "PAYMENT ERROR:",
        error
      );


      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Payment failed. Please try again.";


      alert(message);

      setLoading(false);
    }

  };


  // ─────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────

  return (

    <div className="payment-page">


      {/* Header */}

      <div className="payment-header">

        <button
          className="back-button"
          onClick={onBack}
          disabled={loading}
        >
          ← Back
        </button>


        <h1>
          VOGUE.IN
        </h1>


        <div className="secure-payment">
          🔒 Secure Payment
        </div>

      </div>


      <div className="payment-container">


        {/* ─────────────────────────────────────────────
            LEFT SIDE
        ───────────────────────────────────────────── */}

        <div className="payment-left">

          <h2>
            Payment
          </h2>


          <div className="razorpay-payment-box">

            <div className="razorpay-icon">
              💳
            </div>


            <h3>
              Pay securely with Razorpay
            </h3>


            <p>
              Pay using UPI, Credit Card,
              Debit Card, Net Banking and
              other supported payment methods.
            </p>


            <div className="razorpay-test-mode">

              🧪 Razorpay Test Mode

            </div>

          </div>


          {/* Pay Button */}

          <button
            className="pay-button"
            onClick={handlePay}
            disabled={
              loading ||
              checkoutItems.length === 0
            }
          >

            {loading
              ? "Opening Razorpay..."
              : `Pay ₹${checkoutTotal.toFixed(2)}`
            }

          </button>

        </div>


        {/* ─────────────────────────────────────────────
            RIGHT SIDE
        ───────────────────────────────────────────── */}

        <div className="payment-right">

          <div className="order-summary">

            <h2>
              Order Summary
            </h2>


            <div className="summary-items">

              {checkoutItems.map(
                (item, index) => (

                  <div
                    className="summary-item"
                    key={
                      `${item.productId || item.id}-${item.size}-${index}`
                    }
                  >


                    <div className="summary-image">

                      {item.emoji || "👕"}

                    </div>


                    <div className="summary-details">

                      <h3>
                        {item.name}
                      </h3>


                      {item.brand && (

                        <p>
                          {item.brand}
                        </p>

                      )}


                      <p>
                        Size: {item.size}
                      </p>


                      <p>
                        Qty: {item.qty}
                      </p>

                    </div>


                    <div className="summary-price">

                      ₹
                      {(
                        Number(item.price || 0) *
                        Number(item.qty || 0)
                      ).toFixed(2)}

                    </div>

                  </div>

                )
              )}

            </div>


            <div className="summary-divider" />


            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <span>
                ₹{checkoutSubtotal.toFixed(2)}
              </span>

            </div>


            <div className="summary-row">

              <span>
                Shipping
              </span>

              <span>

                {checkoutShipping === 0
                  ? "FREE"
                  : `₹${checkoutShipping.toFixed(2)}`
                }

              </span>

            </div>


            {checkoutSubtotal > 0 &&
              checkoutSubtotal < 2999 && (

                <p className="shipping-note">

                  Add ₹
                  {(2999 - checkoutSubtotal).toFixed(2)}
                  {" "}
                  more for FREE shipping.

                </p>

              )
            }


            <div className="summary-divider" />


            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                ₹{checkoutTotal.toFixed(2)}
              </strong>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}