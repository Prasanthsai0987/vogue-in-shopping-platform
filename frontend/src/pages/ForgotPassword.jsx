
import { useState } from "react";
import "./ForgotPassword.css";
import { forgotPassword } from "../api";

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await forgotPassword(email.trim());

      setMessage(
        response.data?.message ||
          "If an account exists for that email, a reset link will be sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to connect. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="password-page">
      <section className="password-card">
        <div className="password-icon" aria-hidden="true">
          ✉
        </div>

        <h1 className="password-title">Forgot Password?</h1>

        <p className="password-description">
          No worries! Enter your registered email address and
          we'll send you a link to reset your password.
        </p>

        <form className="password-form" onSubmit={handleSubmit}>
          <div className="password-field">
            <label htmlFor="forgot-email">Email Address</label>

            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p className="password-message error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="password-message success" role="status">
              {message}
            </p>
          )}

          <button
            className="password-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending reset link..." : "Send Reset Link"}
          </button>
        </form>

        <button
          className="password-back"
          type="button"
          onClick={() => onNavigate?.("login")}
          disabled={loading}
        >
          <span aria-hidden="true">←</span> Back to Login
        </button>

        <p className="password-footer">
          VOGUE.IN · Your style, your story.
        </p>
      </section>
    </main>
  );
}
