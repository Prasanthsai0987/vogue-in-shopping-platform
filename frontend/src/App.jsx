
import { useState, useEffect } from "react";

import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";

import Navbar from "./components/Navbar";
import { CartProvider } from "./pages/CartContext";
import { getCurrentCustomer, logoutCustomer } from "./api";

import "./styles/global.css";

function getPageFromUrl() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  if (path === "/admin") return "admin";
  if (path === "/reset-password") return "reset-password";
  if (path === "/forgot-password") return "forgot-password";
  if (path === "/login") return "login";

  return "listing";
}

export default function App() {
  const [page, setPage] = useState(getPageFromUrl);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [completedOrderRef, setCompletedOrderRef] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logoutError, setLogoutError] = useState("");

  // Support direct URLs and browser back/forward navigation.
  useEffect(() => {
    const handlePopState = () => {
      setPage(getPageFromUrl());
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Restore the authenticated customer after refresh.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const response = await getCurrentCustomer();
        const currentCustomer = response?.data;

        if (!currentCustomer?.id) {
          throw new Error(
            "Authenticated customer details were not returned."
          );
        }

        if (!cancelled) {
          setCustomer(currentCustomer);
          localStorage.setItem(
            "customerId",
            currentCustomer.id
          );
        }
      } catch (error) {
        if (!cancelled) {
          setCustomer(null);

          const status = error.response?.status;

          if (status === 401 || status === 403) {
            localStorage.removeItem("customerId");
          } else {
            console.error("SESSION RESTORE ERROR:", error);
          }
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const navigate = (to, product = null) => {
    if (product) {
      setSelectedProduct(product);
    }

    setPage(to);

    let path = "/";

    if (to === "admin") {
      path = "/admin";
    } else if (to === "login") {
      path = "/login";
    } else if (to === "forgot-password") {
      path = "/forgot-password";
    } else if (to === "reset-password") {
      path = "/reset-password";
    } else if (to === "listing") {
      path = "/";
    }

    window.history.pushState({}, "", path);
    window.scrollTo(0, 0);
  };

  const handleLogin = (loggedInCustomer) => {
    setCustomer(loggedInCustomer);
    setLogoutError("");
    navigate("profile");
  };

  const handleLogout = async () => {
    setLogoutError("");

    try {
      await logoutCustomer();

      setCustomer(null);
      localStorage.removeItem("customerId");
      navigate("login");
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
      setLogoutError("Logout failed. Please try again.");
      throw error;
    }
  };

  return (
    <CartProvider>
      <div className="app">
        <Navbar
          onHomeClick={() => navigate("listing")}
          onOrdersClick={() => navigate("orders")}
          onCartClick={() => navigate("cart")}
          onProfileClick={() => {
            if (authLoading) {
              navigate("profile");
            } else {
              navigate(customer ? "profile" : "login");
            }
          }}
        />

        <main className="main-content">
          {logoutError && (
            <p role="alert" className="login-error">
              {logoutError}
            </p>
          )}

          {/* Login and Signup */}
          {page === "login" && (
            <Login
              key="login"
              onLogin={handleLogin}
              onNavigate={navigate}
            />
          )}

          {/* Forgot Password */}
          {page === "forgot-password" && (
            <ForgotPassword
              key="forgot-password"
              onNavigate={navigate}
            />
          )}

          {/* Reset Password */}
          {page === "reset-password" && (
            <ResetPassword
              key="reset-password"
              onNavigate={navigate}
            />
          )}

          {/* Product Listing */}
          {page === "listing" && (
            <ProductListing
              onProductClick={(product) =>
                navigate("detail", product)
              }
            />
          )}

          {/* Product Details */}
          {page === "detail" && (
            <ProductDetail
              product={selectedProduct}
              onBack={() => navigate("listing")}
              onPayNow={() => navigate("payment")}
              onGoToCart={() => navigate("cart")}
            />
          )}

          {/* Cart */}
          {page === "cart" && (
            <Cart
              onBack={() => navigate("listing")}
              onCheckout={() => navigate("payment")}
            />
          )}

          {/* Payment */}
          {page === "payment" && (
            <Payment
              onBack={() => navigate("cart")}
              onSuccess={(orderRef) => {
                setCompletedOrderRef(orderRef);
                navigate("success");
              }}
            />
          )}

          {/* Payment Success */}
          {page === "success" && (
            <PaymentSuccess
              orderRef={completedOrderRef}
              onContinue={() => navigate("listing")}
            />
          )}

          {/* Customer Profile */}
          {page === "profile" && (
            authLoading ? (
              <div className="profile-page">
                <div className="profile-container">
                  <p>Restoring your session...</p>
                </div>
              </div>
            ) : customer ? (
              <Profile onLogout={handleLogout} />
            ) : (
              <Login
                key="profile-login"
                onLogin={handleLogin}
                onNavigate={navigate}
              />
            )
          )}

          {/* Orders */}
          {page === "orders" && (
            <Orders
              onLoginRequired={() => navigate("login")}
            />
          )}

          {/* Admin */}
          {page === "admin" && <Admin />}
        </main>
      </div>
    </CartProvider>
  );
}
