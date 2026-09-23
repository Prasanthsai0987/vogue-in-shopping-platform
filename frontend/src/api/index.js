import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api",
  timeout: 10000,
});


// ── Cart ──────────────────────────────────────────────────

export const fetchCart = (customerId) => {
  console.log("Fetching cart for customer:", customerId);

  return API.get(`/cart/${customerId}`);
};


export const addCartItem = (customerId, itemData) => {
  console.log("Adding cart item:", {
    customerId,
    itemData,
  });

  return API.post(
    `/cart/${customerId}/items`,
    itemData
  );
};


export const updateCartItem = (
  customerId,
  productId,
  itemData
) => {
  console.log("Updating cart item:", {
    customerId,
    productId,
    itemData,
  });

  return API.put(
    `/cart/${customerId}/items/${productId}`,
    itemData
  );
};


export const removeCartItem = (
  customerId,
  productId,
  size
) => {
  console.log("Removing cart item:", {
    customerId,
    productId,
    size,
  });

  return API.delete(
    `/cart/${customerId}/items/${productId}`,
    {
      params: size ? { size } : {},
    }
  );
};


export const clearCustomerCart = (customerId) => {
  console.log(
    "Clearing cart for customer:",
    customerId
  );

  return API.delete(
    `/cart/${customerId}`
  );
};


// ── Customer Profile ──────────────────────────────────────

export const createCustomer = (customerData) =>
  API.post(
    "/customers",
    customerData
  );


export const getCustomer = (customerId) =>
  API.get(
    `/customers/${customerId}`
  );


export const getCustomerByEmail = (email) =>
  API.get(
    `/customers/email/${encodeURIComponent(email)}`
  );


export const updateCustomer = (
  customerId,
  customerData
) =>
  API.put(
    `/customers/${customerId}`,
    customerData
  );


// ── Customer Login ────────────────────────────────────────

export const loginCustomer = (
  email,
  passkey
) =>
  API.post(
    "/customers/login",
    {
      email,
      passkey,
    }
  );


// ── Products ───────────────────────────────────────────────

export const fetchProducts = (
  category = null
) =>
  API.get(
    "/products",
    {
      params: category
        ? { category }
        : {},
    }
  );


export const fetchProduct = (id) =>
  API.get(
    `/products/${id}`
  );


// ── Orders ────────────────────────────────────────────────

export const createOrder = (orderData) => {
  console.log(
    "Creating order:",
    orderData
  );

  return API.post(
    "/orders",
    orderData
  );
};


export const fetchOrder = (id) =>
  API.get(
    `/orders/${id}`
  );


// ── Order Status ──────────────────────────────────────────

export const shipOrder = (orderId) => {
  console.log(
    "Shipping order:",
    orderId
  );

  return API.put(
    `/orders/${orderId}/ship`
  );
};


export const deliverOrder = (orderId) => {
  console.log(
    "Delivering order:",
    orderId
  );

  return API.put(
    `/orders/${orderId}/deliver`
  );
};


export const cancelOrder = (orderId) => {
  console.log(
    "Cancelling order:",
    orderId
  );

  return API.put(
    `/orders/${orderId}/cancel`
  );
};


// ── Razorpay Payments ─────────────────────────────────────

export const initiatePayment = (paymentData) => {
  console.log(
    "Payment initiated:",
    paymentData
  );

  return API.post(
    "/payments/initiate",
    paymentData
  );
};


export const verifyPayment = (
  paymentId,
  paymentData
) => {
  console.log(
    "Verifying Razorpay payment:",
    paymentId,
    paymentData
  );

  return API.post(
    `/payments/${paymentId}/verify`,
    paymentData
  );
};


export const fetchPaymentStatus = (
  paymentId
) => {
  console.log(
    "Fetching payment status for:",
    paymentId
  );

  return API.get(
    `/payments/${paymentId}/status`
  );
};


export default API;