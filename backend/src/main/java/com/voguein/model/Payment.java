package com.voguein.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "Payments")
public class Payment {

    // ─────────────────────────────────────────────────────
    // PAYMENT STATUS
    // ─────────────────────────────────────────────────────

    public enum Status {
        INITIATED,
        PENDING,
        SUCCESS,
        FAILED,
        REFUNDED
    }

    // Keep this for compatibility with your existing code.
    // It can be removed later after the old UPI flow is fully removed.
    public enum UpiApp {
        GPAY,
        PHONEPE,
        PAYTM,
        OTHER
    }


    // ─────────────────────────────────────────────────────
    // BASIC PAYMENT INFORMATION
    // ─────────────────────────────────────────────────────

    @Id
    private String id;

    @Indexed(unique = true)
    private String paymentRef;

    @Indexed
    private String orderId;

    private String orderRef;

    private BigDecimal amount;

    private Status status = Status.INITIATED;


    // ─────────────────────────────────────────────────────
    // OLD DEMO UPI FIELDS
    // ─────────────────────────────────────────────────────
    // Kept temporarily so your existing code can compile.
    // We will remove these from PaymentService in the
    // Razorpay integration step.

    private UpiApp upiApp;

    private String upiTxnId;

    private String upiDeepLink;


    // ─────────────────────────────────────────────────────
    // RAZORPAY FIELDS
    // ─────────────────────────────────────────────────────

    /**
     * Razorpay Order ID created by the backend.
     *
     * Example:
     * order_R1AbCdEf123456
     */
    @Indexed
    private String razorpayOrderId;

    /**
     * Razorpay Payment ID returned after successful payment.
     *
     * Example:
     * pay_R1AbCdEf123456
     */
    @Indexed
    private String razorpayPaymentId;

    /**
     * Signature returned by Razorpay.
     *
     * This is verified by the backend using the Razorpay
     * secret key before marking the payment as SUCCESS.
     */
    private String razorpaySignature;


    // ─────────────────────────────────────────────────────
    // TIMESTAMPS
    // ─────────────────────────────────────────────────────

    @CreatedDate
    private LocalDateTime initiatedAt;

    private LocalDateTime completedAt;


    // ─────────────────────────────────────────────────────
    // GETTERS & SETTERS
    // ─────────────────────────────────────────────────────

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


    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }


    public String getOrderRef() {
        return orderRef;
    }

    public void setOrderRef(String orderRef) {
        this.orderRef = orderRef;
    }


    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }


    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }


    // ─────────────────────────────────────────────────────
    // OLD UPI GETTERS & SETTERS
    // ─────────────────────────────────────────────────────

    public UpiApp getUpiApp() {
        return upiApp;
    }

    public void setUpiApp(UpiApp upiApp) {
        this.upiApp = upiApp;
    }


    public String getUpiTxnId() {
        return upiTxnId;
    }

    public void setUpiTxnId(String upiTxnId) {
        this.upiTxnId = upiTxnId;
    }


    public String getUpiDeepLink() {
        return upiDeepLink;
    }

    public void setUpiDeepLink(String upiDeepLink) {
        this.upiDeepLink = upiDeepLink;
    }


    // ─────────────────────────────────────────────────────
    // RAZORPAY GETTERS & SETTERS
    // ─────────────────────────────────────────────────────

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }


    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }


    public String getRazorpaySignature() {
        return razorpaySignature;
    }

    public void setRazorpaySignature(String razorpaySignature) {
        this.razorpaySignature = razorpaySignature;
    }


    // ─────────────────────────────────────────────────────
    // TIMESTAMP GETTERS & SETTERS
    // ─────────────────────────────────────────────────────

    public LocalDateTime getInitiatedAt() {
        return initiatedAt;
    }

    public void setInitiatedAt(LocalDateTime initiatedAt) {
        this.initiatedAt = initiatedAt;
    }


    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}