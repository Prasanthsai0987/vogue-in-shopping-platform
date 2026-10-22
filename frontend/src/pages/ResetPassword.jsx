
import { useState } from "react";
import "./ResetPassword.css";
import { resetPassword } from "../api";

export default function ResetPassword({ onNavigate }) {
  const token = new URLSearchParams(
    window.location.search
  ).get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSuccessful, setResetSuccessful] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError(
        "Your reset link is invalid. Please request a new one."
      );
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      setError("Your password must contain 8–128 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(token, newPassword);

      setResetSuccessful(true);
      setNewPassword("");
      setConfirmPassword("");
      setMessage(
        response.data?.message ||
          "Your password has been reset successfully. You can now log in."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to reset your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="password-page">
      <section className="password-card">
        <div className="password-icon" aria-hidden="true">
          {resetSuccessful ? "✓" : "🔒"}
        </div>

        <h1 className="password-title">
          {resetSuccessful ? "Password Updated" : "Set New Password"}
        </h1>

        <p className="password-description">
          {resetSuccessful
            ? "Your account password has been updated. You can sign in using your new password."
            : "Choose a strong password to keep your VOGUE.IN account secure."}
        </p>

        {!resetSuccessful && (
          <form className="password-form" onSubmit={handleSubmit}>
            <div className="password-field">
              <label htmlFor="new-password">New Password</label>

              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                maxLength={128}
                required
                disabled={loading || !token}
              />
            </div>

            <div className="password-field">
              <label htmlFor="confirm-new-password">
                Confirm New Password
              </label>

              <input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                maxLength={128}
                required
                disabled={loading || !token}
              />
            </div>

            {!token && (
              <p className="password-message error" role="alert">
                Reset token missing. Please request a new reset link.
              </p>
            )}

            {error && (
              <p className="password-message error" role="alert">
                {error}
              </p>
            )}

            <button
              className="password-submit"
              type="submit"
              disabled={loading || !token}
            >
              {loading ? "Updating Password..." : "Reset Password"}
            </button>
          </form>
        )}

        {message && (
          <p className="password-message success" role="status">
            {message}
          </p>
        )}

        <button
          className="password-back"
          type="button"
          onClick={() => onNavigate?.("login")}
        >
          ← Go to Login
        </button>

        {!resetSuccessful && (
          <button
            className="password-back"
            type="button"
            onClick={() => onNavigate?.("forgot-password")}
          >
            Request Another Reset Link
          </button>
        )}

        <p className="password-footer">
          VOGUE.IN · Your style, your story.
        </p>
      </section>
    </main>
  );
}
