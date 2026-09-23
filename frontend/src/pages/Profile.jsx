import { useEffect, useState } from "react";
import {
  createCustomer,
  getCustomer,
  updateCustomer
} from "../api";
import "./Profile.css";

export default function Profile({ onLogout, onLogin }) {

  const [customerId, setCustomerId] = useState(
    localStorage.getItem("customerId")
  );

  const [isNewProfile, setIsNewProfile] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shippingAddress: "",
    city: "",
    state: "",
    pincode: "",
    passkey: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  // --------------------------------------------------
  // Load logged-in customer's profile
  // --------------------------------------------------

  useEffect(() => {

    const loadProfile = async () => {

      // If user selected New Profile,
      // don't load the old customer
      if (isNewProfile) {
        return;
      }

      // No customer logged in
      if (!customerId) {
        return;
      }

      try {

        const response = await getCustomer(customerId);

        const customer = response?.data ?? response;

        setFormData({
          name: customer.name || "",
          email: customer.email || "",
          phone: customer.phone || "",
          shippingAddress: customer.shippingAddress || "",
          city: customer.city || "",
          state: customer.state || "",
          pincode: customer.pincode || "",
          passkey: customer.passkey || ""
        });

      } catch (err) {

        console.error("Failed to load profile:", err);

        setError("Could not load your profile.");

      }

    };

    loadProfile();

  }, [customerId, isNewProfile]);


  // --------------------------------------------------
  // Handle input changes
  // --------------------------------------------------

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

  };


  // --------------------------------------------------
  // Create NEW profile
  // --------------------------------------------------

  const handleNewProfile = () => {

    // Remove old logged-in customer
    localStorage.removeItem("customerId");

    // Switch to new profile mode
    setIsNewProfile(true);

    setCustomerId(null);

    // Clear form
    setFormData({
      name: "",
      email: "",
      phone: "",
      shippingAddress: "",
      city: "",
      state: "",
      pincode: "",
      passkey: ""
    });

    setMessage("");
    setError("");

  };


  // --------------------------------------------------
  // Save / Update profile
  // --------------------------------------------------

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {

      let response;

      // ----------------------------------------------
      // NEW PROFILE
      // ----------------------------------------------

      if (isNewProfile || !customerId) {

        response = await createCustomer(formData);

      }

      // ----------------------------------------------
      // EXISTING PROFILE
      // ----------------------------------------------

      else {

        response = await updateCustomer(
          customerId,
          formData
        );

      }

      const customer = response?.data ?? response;

      console.log("CUSTOMER RESPONSE:", customer);

      if (!customer?.id) {

        throw new Error(
          "Customer ID was not returned by backend"
        );

      }

      // Save current customer ID
      localStorage.setItem(
        "customerId",
        customer.id
      );

      setCustomerId(customer.id);

      // No longer in new profile mode
      setIsNewProfile(false);

      // Success message
      setMessage(
        isNewProfile || !customerId
          ? "Profile created successfully."
          : "Profile updated successfully."
      );

    } catch (err) {

      console.error("PROFILE ERROR:", err);

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

      setError(
        err.response?.data?.message ||
        "Failed to save profile. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  const handleLogout = () => {

    // Remove logged-in customer
    localStorage.removeItem("customerId");

    setCustomerId(null);

    setIsNewProfile(false);

    // Clear form
    setFormData({
      name: "",
      email: "",
      phone: "",
      shippingAddress: "",
      city: "",
      state: "",
      pincode: "",
      passkey: ""
    });

    setMessage("");
    setError("");

    // Redirect to Login.jsx
    if (onLogout) {
      onLogout();
    }

  };


  // --------------------------------------------------
  // Go to Login for existing account
  // --------------------------------------------------

  const handleExistingLogin = () => {

    // Make sure new-profile state is cleared
    setIsNewProfile(false);

    setCustomerId(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      shippingAddress: "",
      city: "",
      state: "",
      pincode: "",
      passkey: ""
    });

    setMessage("");
    setError("");

    // Redirect to Login.jsx
    if (onLogin) {
      onLogin();
    }

  };


  return (

    <div className="profile-page">

      <div className="profile-container">

        <h1 className="profile-title">
          My Profile
        </h1>

        <p className="profile-subtitle">
          Manage your personal information and shipping address
        </p>


        {/* ------------------------------------------------ */}
        {/* Top buttons                                      */}
        {/* ------------------------------------------------ */}

        <div className="profile-actions">

          {/* New Profile button */}

          <button
            type="button"
            className="new-profile-btn"
            onClick={handleNewProfile}
          >
            + New Profile
          </button>


          {/* Existing Account Login button */}

          {isNewProfile && (

            <button
              type="button"
              className="login-existing-btn"
              onClick={handleExistingLogin}
            >
              Existing Account? Login
            </button>

          )}


          {/* Logout button */}

          {customerId && !isNewProfile && (

            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>

          )}

        </div>


        {/* ------------------------------------------------ */}
        {/* Profile form                                    */}
        {/* ------------------------------------------------ */}

        <form
          className="profile-form"
          onSubmit={handleSubmit}
        >


          {/* Name */}

          <div className="form-group">

            <label>Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />

          </div>


          {/* Email */}

          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

          </div>


          {/* Phone */}

          <div className="form-group">

            <label>Phone</label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />

          </div>


          {/* Shipping Address */}

          <div className="form-group">

            <label>Shipping Address</label>

            <textarea
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={handleChange}
              placeholder="Enter your shipping address"
              rows="3"
              required
            />

          </div>


          {/* City + State */}

          <div className="form-row">

            <div className="form-group">

              <label>City</label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                required
              />

            </div>


            <div className="form-group">

              <label>State</label>

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                required
              />

            </div>

          </div>


          {/* Pincode */}

          <div className="form-group">

            <label>Pincode</label>

            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Enter pincode"
              maxLength="6"
              required
            />

          </div>


          {/* Passkey */}

          <div className="form-group">

            <label>Passkey</label>

            <input
              type="password"
              name="passkey"
              value={formData.passkey}
              onChange={handleChange}
              placeholder="Enter your passkey"
              required={isNewProfile || !customerId}
            />

          </div>


          {/* Messages */}

          {message && (

            <div className="profile-success">
              {message}
            </div>

          )}

          {error && (

            <div className="profile-error">
              {error}
            </div>

          )}


          {/* Save button */}

          <button
            type="submit"
            className="save-profile-btn"
            disabled={loading}
          >

            {loading
              ? "Saving..."
              : isNewProfile || !customerId
              ? "Create Profile"
              : "Update Profile"
            }

          </button>

        </form>

      </div>

    </div>

  );

}