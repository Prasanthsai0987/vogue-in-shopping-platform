
import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api",
  timeout: 60000,
  withCredentials: true,
});

// ── CSRF Protection ──────────────────────────────────────

let csrfToken = null;
let csrfRequest = null;

export const fetchCsrfToken = async (forceRefresh = false) => {
  if (forceRefresh) {
    csrfToken = null;
    csrfRequest = null;
  }

  if (csrfToken) return csrfToken;
  if (csrfRequest) return csrfRequest;

  csrfRequest = API.get("/csrf")
    .then((response) => {
      const token = response?.data?.token;

      if (!token || typeof token !== "string") {
        throw new Error(
          "CSRF endpoint must return { token: '...' }"
        );
      }

      csrfToken = token;
      return token;
    })
    .finally(() => {
      csrfRequest = null;
    });

  return csrfRequest;
};

const unsafeMethods = new Set(["post", "put", "patch", "delete"]);

API.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase();

  if (unsafeMethods.has(method) && !config.url?.includes("/csrf")) {
    const token = await fetchCsrfToken();

    config.headers = config.headers || {};
    config.headers["X-CSRF-TOKEN"] = token;
  }

  return config;
});

// ── Authentication ───────────────────────────────────────

export const loginCustomer = async (email, password) => {
  await fetchCsrfToken();

  try {
    const response = await API.post("/auth/login", {
      email,
      password,
    });

    // Reset the cached token after login.
    csrfToken = null;
    csrfRequest = null;

    return response;
  } catch (error) {
    csrfToken = null;
    csrfRequest = null;
    throw error;
  }
};

export const getCurrentCustomer = () => API.get("/auth/me");


export const registerCustomer = (customerData) =>
  API.post("/customers", customerData);

export const logoutCustomer = async () => {
  try {
    await API.post("/auth/logout");
  } finally {
    csrfToken = null;
    csrfRequest = null;
    localStorage.removeItem("customerId");
  }
};


// ── Admin image Uploads ───────────────────────────────────────

export const uploadProductImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post("/admin/uploads/images", formData);
};



// Admin product management
export const fetchAdminProducts = () =>
  API.get("/admin/products");

export const createAdminProduct = (product) =>
  API.post("/admin/products", product);

export const updateAdminProduct = (id, product) =>
  API.put(`/admin/products/${id}`, product);

export const deleteAdminProduct = (id) =>
  API.delete(`/admin/products/${id}`);

// ── Cart ──────────────────────────────────────────────────

export const fetchCart = (customerId) =>
  API.get(`/cart/${customerId}`);

export const addCartItem = (customerId, itemData) =>
  API.post(`/cart/${customerId}/items`, itemData);

export const updateCartItem = (customerId, productId, itemData) =>
  API.put(
    `/cart/${customerId}/items/${productId}`,
    itemData
  );

export const removeCartItem = (customerId, productId, size) =>
  API.delete(
    `/cart/${customerId}/items/${productId}`,
    {
      params: size ? { size } : {},
    }
  );

export const clearCustomerCart = (customerId) =>
  API.delete(`/cart/${customerId}`);

// ── Customer Profile ──────────────────────────────────────

// Kept for compatibility with any other existing components.
// Signup should use registerCustomer() from Login.jsx.
export const createCustomer = (customerData) =>
  API.post("/customers", customerData);

export const getCustomer = (customerId) =>
  API.get(`/customers/${customerId}`);

export const getCustomerByEmail = (email) =>
  API.get(
    `/customers/email/${encodeURIComponent(email)}`
  );

// Update the existing customer's profile as often as needed.
export const updateCustomer = (customerId, customerData) =>
  API.put(`/customers/${customerId}`, customerData);

// ── Products ─────────────────────────────────────────────

export const fetchProducts = (category = null) =>
  API.get("/products", {
    params: category ? { category } : {},
  });

export const fetchProduct = (id) =>
  API.get(`/products/${id}`);

// ── Orders ────────────────────────────────────────────────

export const createOrder = (orderData) =>
  API.post("/orders", orderData);

export const fetchOrder = (id) =>
  API.get(`/orders/${id}`);

export const fetchOrdersByCustomer = (customerId) =>
  API.get(`/orders/customer/${customerId}`);

export const shipOrder = (orderId) =>
  API.put(`/orders/${orderId}/ship`);

export const deliverOrder = (orderId) =>
  API.put(`/orders/${orderId}/deliver`);

export const cancelOrder = (orderId) =>
  API.put(`/orders/${orderId}/cancel`);

// ── Razorpay Payments ────────────────────────────────────

export const initiatePayment = (paymentData) =>
  API.post("/payments/initiate", paymentData);

export const verifyPayment = (paymentId, paymentData) =>
  API.post(`/payments/${paymentId}/verify`, paymentData);

export const fetchPaymentStatus = (paymentId) =>
  API.get(`/payments/${paymentId}/status`);

export default API;
