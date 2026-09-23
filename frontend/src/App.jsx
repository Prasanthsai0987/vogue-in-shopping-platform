import { useState } from "react";

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

import "./styles/global.css";

export default function App() {
  const [page, setPage] = useState("listing");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [completedOrderRef, setCompletedOrderRef] = useState(null);

  const navigate = (to, product = null) => {
    if (product) {
      setSelectedProduct(product);
    }

    setPage(to);

    window.scrollTo(0, 0);
  };

  return (
    <CartProvider>
      <div className="app">

        <Navbar
          onHomeClick={() => navigate("listing")}
          onOrdersClick={() => navigate("orders")}
          onCartClick={() => navigate("cart")}
          onProfileClick={() => navigate("profile")}
        />

        <main className="main-content">

          {page === "login" && (
            <Login
              onLogin={() => navigate("profile")}
            />
          )}

          {page === "listing" && (
            <ProductListing
              onProductClick={(p) => navigate("detail", p)}
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
            <Profile
              onLogout={() => navigate("login")}
              onLogin={() => navigate("login")}
            />
          )}

          {page === "orders" && (
            <Orders />
          )}

        </main>
      </div>
    </CartProvider>
  );
}

