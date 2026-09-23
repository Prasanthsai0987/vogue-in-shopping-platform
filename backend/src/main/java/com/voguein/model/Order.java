package com.voguein.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "Orders")
public class Order {

    public enum Status {
        PENDING,
        CONFIRMED,
        SHIPPED,
        DELIVERED,
        CANCELLED
    }

    @Id
    private String id;

    @Indexed(unique = true)
    private String orderRef;

    // Link to Customer
    private String customerId;

    // Customer details at the time of order
    private String customerName;
    private String customerEmail;
    private String shippingAddress;

    private Status status = Status.PENDING;

    // Embedded — no JOIN needed in MongoDB
    private List<OrderItem> items = new ArrayList<>();

    private BigDecimal subtotal;
    private BigDecimal shippingAmount;
    private BigDecimal totalAmount;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // ── Getters & Setters ─────────────────────────────────

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderRef() {
        return orderRef;
    }

    public void setOrderRef(String ref) {
        this.orderRef = ref;
    }

    // Customer ID
    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String n) {
        this.customerName = n;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String e) {
        this.customerEmail = e;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String a) {
        this.shippingAddress = a;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal s) {
        this.subtotal = s;
    }

    public BigDecimal getShippingAmount() {
        return shippingAmount;
    }

    public void setShippingAmount(BigDecimal s) {
        this.shippingAmount = s;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal t) {
        this.totalAmount = t;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime t) {
        this.createdAt = t;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime t) {
        this.updatedAt = t;
    }
}