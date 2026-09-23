package com.voguein.dto;

import java.math.BigDecimal;
import java.util.List;

public class Dtos {

    // ══════════════════════════════════════════════════════
    // REQUESTS
    // ══════════════════════════════════════════════════════

    // ──────────────────────────────────────────────────────
    // CREATE ORDER REQUEST
    // ──────────────────────────────────────────────────────

    public static class CreateOrderRequest {

        private List<OrderItemRequest> items;
        private String customerName;
        private String customerEmail;
        private String shippingAddress;
        private String customerId;


        public List<OrderItemRequest> getItems() {
            return items;
        }

        public void setItems(List<OrderItemRequest> items) {
            this.items = items;
        }


        public String getCustomerName() {
            return customerName;
        }

        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }


        public String getCustomerEmail() {
            return customerEmail;
        }

        public void setCustomerEmail(String customerEmail) {
            this.customerEmail = customerEmail;
        }


        public String getShippingAddress() {
            return shippingAddress;
        }

        public void setShippingAddress(String shippingAddress) {
            this.shippingAddress = shippingAddress;
        }


        public String getCustomerId() {
            return customerId;
        }

        public void setCustomerId(String customerId) {
            this.customerId = customerId;
        }
    }


    // ──────────────────────────────────────────────────────
    // ORDER ITEM REQUEST
    // ──────────────────────────────────────────────────────

    public static class OrderItemRequest {

        private String productId;
        private Integer qty;
        private String size;


        public String getProductId() {
            return productId;
        }

        public void setProductId(String productId) {
            this.productId = productId;
        }


        public Integer getQty() {
            return qty;
        }

        public void setQty(Integer qty) {
            this.qty = qty;
        }


        public String getSize() {
            return size;
        }

        public void setSize(String size) {
            this.size = size;
        }
    }


    // ──────────────────────────────────────────────────────
    // INITIATE RAZORPAY PAYMENT REQUEST
    // ──────────────────────────────────────────────────────
    //
    // React sends:
    //
    // {
    //     "orderId": "..."
    // }
    //
    // No UPI app is required because Razorpay Checkout
    // handles UPI, cards, net banking, etc.

    public static class InitiatePaymentRequest {

        private String orderId;


        public String getOrderId() {
            return orderId;
        }

        public void setOrderId(String orderId) {
            this.orderId = orderId;
        }
    }


    // ──────────────────────────────────────────────────────
    // VERIFY RAZORPAY PAYMENT REQUEST
    // ──────────────────────────────────────────────────────
    //
    // React sends these values returned by Razorpay:
    //
    // razorpayPaymentId
    // razorpayOrderId
    // razorpaySignature

    public static class VerifyPaymentRequest {

        private String razorpayPaymentId;
        private String razorpayOrderId;
        private String razorpaySignature;


        public String getRazorpayPaymentId() {
            return razorpayPaymentId;
        }

        public void setRazorpayPaymentId(
                String razorpayPaymentId) {

            this.razorpayPaymentId =
                    razorpayPaymentId;
        }


        public String getRazorpayOrderId() {
            return razorpayOrderId;
        }

        public void setRazorpayOrderId(
                String razorpayOrderId) {

            this.razorpayOrderId =
                    razorpayOrderId;
        }


        public String getRazorpaySignature() {
            return razorpaySignature;
        }

        public void setRazorpaySignature(
                String razorpaySignature) {

            this.razorpaySignature =
                    razorpaySignature;
        }
    }


    // ══════════════════════════════════════════════════════
    // RESPONSES
    // ══════════════════════════════════════════════════════

    // ──────────────────────────────────────────────────────
    // ORDER RESPONSE
    // ──────────────────────────────────────────────────────

    public static class OrderResponse {

        private String id;
        private String orderRef;
        private String status;

        private BigDecimal subtotal;
        private BigDecimal shippingAmount;
        private BigDecimal totalAmount;

        private List<OrderItemResponse> items;


        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }


        public String getOrderRef() {
            return orderRef;
        }

        public void setOrderRef(String orderRef) {
            this.orderRef = orderRef;
        }


        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }


        public BigDecimal getSubtotal() {
            return subtotal;
        }

        public void setSubtotal(BigDecimal subtotal) {
            this.subtotal = subtotal;
        }


        public BigDecimal getShippingAmount() {
            return shippingAmount;
        }

        public void setShippingAmount(
                BigDecimal shippingAmount) {

            this.shippingAmount =
                    shippingAmount;
        }


        public BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(
                BigDecimal totalAmount) {

            this.totalAmount =
                    totalAmount;
        }


        public List<OrderItemResponse> getItems() {
            return items;
        }

        public void setItems(
                List<OrderItemResponse> items) {

            this.items = items;
        }
    }


    // ──────────────────────────────────────────────────────
    // ORDER ITEM RESPONSE
    // ──────────────────────────────────────────────────────

    public static class OrderItemResponse {

        private String productId;
        private String productName;
        private String emoji;
        private String brand;

        private Integer qty;
        private String size;

        private BigDecimal unitPrice;
        private BigDecimal lineTotal;


        public String getProductId() {
            return productId;
        }

        public void setProductId(String productId) {
            this.productId = productId;
        }


        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }


        public String getEmoji() {
            return emoji;
        }

        public void setEmoji(String emoji) {
            this.emoji = emoji;
        }


        public String getBrand() {
            return brand;
        }

        public void setBrand(String brand) {
            this.brand = brand;
        }


        public Integer getQty() {
            return qty;
        }

        public void setQty(Integer qty) {
            this.qty = qty;
        }


        public String getSize() {
            return size;
        }

        public void setSize(String size) {
            this.size = size;
        }


        public BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(
                BigDecimal unitPrice) {

            this.unitPrice = unitPrice;
        }


        public BigDecimal getLineTotal() {
            return lineTotal;
        }

        public void setLineTotal(
                BigDecimal lineTotal) {

            this.lineTotal = lineTotal;
        }
    }


    // ──────────────────────────────────────────────────────
    // PAYMENT RESPONSE
    // ──────────────────────────────────────────────────────
    //
    // Returned by:
    //
    // POST /api/payments/initiate
    //
    // and
    //
    // POST /api/payments/{id}/verify

    public static class PaymentResponse {

        private String id;
        private String paymentRef;
        private String status;

        private BigDecimal amount;

        // Razorpay
        private String razorpayOrderId;
        private String razorpayPaymentId;


        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }


        public String getPaymentRef() {
            return paymentRef;
        }

        public void setPaymentRef(String paymentRef) {
            this.paymentRef = paymentRef;
        }


        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }


        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }


        // ────────────────────────────────────────────────
        // RAZORPAY
        // ────────────────────────────────────────────────

        public String getRazorpayOrderId() {
            return razorpayOrderId;
        }

        public void setRazorpayOrderId(
                String razorpayOrderId) {

            this.razorpayOrderId =
                    razorpayOrderId;
        }


        public String getRazorpayPaymentId() {
            return razorpayPaymentId;
        }

        public void setRazorpayPaymentId(
                String razorpayPaymentId) {

            this.razorpayPaymentId =
                    razorpayPaymentId;
        }
    }
}