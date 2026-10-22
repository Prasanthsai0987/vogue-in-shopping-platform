
import { useEffect, useState } from "react";
import {
  getCurrentCustomer,
  updateCustomer,
  logoutCustomer,
} from "../api";
import "./Profile.css";

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  shippingAddress: "",
  city: "",
  state: "",
  pincode: "",
};

export default function Profile({ onLogout }) {
  const [customerId, setCustomerId] = useState(null);
  const [formData, setFormData] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        // Get the customer associated with the server session.
        const response = await getCurrentCustomer();
        const customer = response?.data;

        if (!customer?.id) {
          throw new Error("Customer profile was not returned.");
        }

        if (cancelled) return;

        setCustomerId(customer.id);

        // Retain compatibility with existing components.
        localStorage.setItem("customerId", customer.id);

        setFormData({
          name: customer.name ?? "",
          email: customer.email ?? "",
          phone: customer.phone ?? "",
          shippingAddress: customer.shippingAddress ?? "",
          city: customer.city ?? "",
          state: customer.state ?? "",
          pincode: customer.pincode ?? "",
        });

        } catch (err) {
          const status = err.response?.status;

          if (!cancelled) {
            setCustomerId(null);
            setFormData(emptyProfile);

            if (status === 401 || status === 403) {
              // No valid authenticated session.
              localStorage.removeItem("customerId");
              setError("Please log in to view your profile.");
            } else {
              console.error("Failed to restore customer profile:", err);
              setError(
                err.response?.data?.message ||
                  "Could not load your profile. Please try again."
              );
            }
          }
        }
 finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId) {
      setError("Please log in before updating your profile.");
      return;
    }

    const name = formData.name.trim();

    if (!name) {
      setError("Name cannot be empty.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      // Do not send email or password in the profile update.
      const payload = {
        name,
        phone: formData.phone,
        shippingAddress: formData.shippingAddress,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      };

      const response = await updateCustomer(
        customerId,
        payload
      );

      const customer = response?.data;

      setFormData((previous) => ({
        ...previous,
        name: customer?.name ?? previous.name,
        email: customer?.email ?? previous.email,
        phone: customer?.phone ?? previous.phone,
        shippingAddress:
          customer?.shippingAddress ??
          previous.shippingAddress,
        city: customer?.city ?? previous.city,
        state: customer?.state ?? previous.state,
        pincode: customer?.pincode ?? previous.pincode,
      }));

      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error(
        "PROFILE UPDATE ERROR:",
        err,
        err.response?.data
      );

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to update this profile."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to update your profile. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setError("");

    try {
      // App handles the server logout and navigation.
      // Avoid sending the logout request twice.
      if (onLogout) {
        await onLogout();
      } else {
        await logoutCustomer();
        localStorage.removeItem("customerId");
        setCustomerId(null);
        setFormData(emptyProfile);
      }
    } catch (err) {
      console.error("PROFILE LOGOUT ERROR:", err);
      setError("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!customerId) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-error" role="alert">
            {error || "Please log in to view your profile."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="profile-title">My Profile</h1>

        <p className="profile-subtitle">
          Manage your personal information and shipping address.
          You can update your profile whenever you need.
        </p>

        <div className="profile-actions">
          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>

        {error && (
          <div className="profile-error" role="alert">
            {error}
          </div>
        )}

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              autoComplete="name"
              required
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              type="email"
              name="email"
              value={formData.email}
              readOnly
              autoComplete="email"
            />
            <small>Email cannot be changed from this form.</small>
          </div>

          <div className="form-group">
            <label htmlFor="profile-phone">Phone</label>
            <input
              id="profile-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              autoComplete="tel"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-address">
              Shipping Address
            </label>
            <textarea
              id="profile-address"
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={handleChange}
              placeholder="Enter your shipping address"
              rows={3}
              autoComplete="street-address"
              disabled={saving}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="profile-city">City</label>
              <input
                id="profile-city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                autoComplete="address-level2"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-state">State</label>
              <input
                id="profile-state"
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                autoComplete="address-level1"
                disabled={saving}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="profile-pincode">Pincode</label>
            <input
              id="profile-pincode"
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Enter pincode"
              maxLength={6}
              autoComplete="postal-code"
              disabled={saving}
            />
          </div>

          {message && (
            <div className="profile-success" role="status">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="save-profile-btn"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
