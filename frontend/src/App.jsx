
import { useState, useEffect } from "react";

import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Orders from "./pages/Orders";

import Navbar from "./components/Navbar";
import { CartProvider } from "./pages/CartContext";
import { getCurrentCustomer, logoutCustomer } from "./api";
import Admin from "./pages/Admin";

import "./styles/global.css";

export default function App() {
  const getPageFromUrl = () => {
  const path = window.location.pathname.replace(/\/+$/, "");

  if (path === "/admin") return "admin";

  return "listing";
};

const [page, setPage] = useState(getPageFromUrl);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [completedOrderRef, setCompletedOrderRef] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logoutError, setLogoutError] = useState("");

  // Restore the authenticated customer after refresh.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const response = await getCurrentCustomer();
        const currentCustomer = response?.data;

        if (!currentCustomer?.id) {
          throw new Error("Authenticated customer details were not returned.");
        }

        if (!cancelled) {
          setCustomer(currentCustomer);

          // Compatibility for existing cart/profile components.
          localStorage.setItem("customerId", currentCustomer.id);
        }
      
    } catch (error) {
      if (!cancelled) {
        setCustomer(null);

        const status = error.response?.status;

        if (status === 401 || status === 403) {
          // Session is missing, expired, or not accepted.
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

    const path = to === "admin" ? "/admin" : "/";
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

          {page === "login" && (
            <Login onLogin={handleLogin} />
          )}

          {page === "listing" && (
            <ProductListing
              onProductClick={(product) =>
                navigate("detail", product)
              }
            />
          )}

          {page === "detail" && (
            <ProductDetail
              product={selectedProduct}
              onBack={() => navigate("listing")}
              onPayNow={() => navigate("payment")}
              onGoToCart={() => navigate("cart")}
            />
          )}

          {page === "cart" && (
            <Cart
              onBack={() => navigate("listing")}
              onCheckout={() => navigate("payment")}
            />
          )}

          {page === "payment" && (
            <Payment
              onBack={() => navigate("cart")}
              onSuccess={(orderRef) => {
                setCompletedOrderRef(orderRef);
                navigate("success");
              }}
            />
          )}

          {page === "success" && (
            <PaymentSuccess
              orderRef={completedOrderRef}
              onContinue={() => navigate("listing")}
            />
          )}

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
              <Login onLogin={handleLogin} />
            )
          )}

          {page === "orders" && (
            <Orders
              onLoginRequired={() => navigate("login")}
            />
          )}

          {page === "admin" && (
            <Admin />
          )}
        </main>
      </div>
    </CartProvider>
  );
}
