
import { useState } from "react";
import { loginCustomer, registerCustomer } from "../api";
import "./Login.css";

export default function Login({
  onLogin,
  initialMode = "login",
  onNavigate,
}) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "signup") {
        if (password.length < 8) {
          setError("Password must be at least 8 characters.");
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        await registerCustomer({
          name: name.trim(),
          email: email.trim(),
          password,
        });

        setMode("login");
        setPassword("");
        setConfirmPassword("");
        setName("");
        setSuccess(
          "Account created successfully. Please log in."
        );
        return;
      }

      const response = await loginCustomer(
        email.trim(),
        password
      );

      const customer = response?.data;

      if (!customer?.id) {
        throw new Error(
          "The login response did not contain a customer ID."
        );
      }

      // Preserve the existing session-cookie authentication.
      localStorage.setItem("customerId", customer.id);
      onLogin?.(customer);
    } catch (err) {
      console.error(
        "AUTHENTICATION ERROR:",
        err,
        err.response?.data
      );

      const backendMessage = err.response?.data?.message;

      if (backendMessage === "Email already registered") {
        setError("An account with this email already exists.");
      } else if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err.response?.status === 403) {
        setError(
          "Security verification failed. Refresh the page and try again."
        );
      } else if (err.response?.status === 400) {
        setError(
          backendMessage ||
            "Please check your details and try again."
        );
      } else {
        setError(
          mode === "signup"
            ? "Unable to create your account. Please try again."
            : err.message ||
              "Unable to log in. Check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>

        <p className="login-subtitle">
          {mode === "login"
            ? "Login to access your VogueIn profile"
            : "Join VogueIn and start shopping"}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              minLength={8}
              maxLength={128}
              required
              disabled={loading}
            />
          </div>

          {mode === "signup" && (
            <div className="form-group">
              <label htmlFor="confirm-password">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Re-enter your password"
                minLength={8}
                maxLength={128}
                required
                disabled={loading}
              />
            </div>
          )}

          {mode === "login" && (
            <p className="auth-switch">
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() =>
                  onNavigate?.("forgot-password")
                }
              >
                Forgot Password?
              </button>
            </p>
          )}

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <p className="signup-success" role="status">
              {success}
            </p>
          )}

          <button
            className="login-btn"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            className="auth-switch-btn"
            onClick={() =>
              switchMode(
                mode === "login" ? "signup" : "login"
              )
            }
            disabled={loading}
          >
            {mode === "login" ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
