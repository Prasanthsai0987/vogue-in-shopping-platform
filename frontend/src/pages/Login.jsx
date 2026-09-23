import { useState } from "react";
import { loginCustomer } from "../api";
import "./Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [passkey, setPasskey] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await loginCustomer(email, passkey);

      const customer = response?.data ?? response;

      if (!customer?.id) {
        throw new Error("Customer ID not returned");
      }

      // Store logged-in customer's ID
      localStorage.setItem("customerId", customer.id);

      // Notify App that login was successful
      if (onLogin) {
        onLogin(customer);
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      if (err.response) {
        console.error("Backend status:", err.response.status);
        console.error("Backend data:", err.response.data);
      }

      setError("Invalid email or passkey.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

        <h1 className="login-title">
          Welcome Back
        </h1>

        <p className="login-subtitle">
          Login to access your VogueIn profile
        </p>

        <form className="login-form" onSubmit={handleLogin}>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Passkey */}
          <div className="form-group">
            <label>Passkey</label>

            <input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Enter your passkey"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* Login */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}