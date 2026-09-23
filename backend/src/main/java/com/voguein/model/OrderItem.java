package com.voguein.model;

import java.math.BigDecimal;

/**
 * Embedded subdocument inside Order.
 * In MongoDB this is stored inside the orders collection — no separate collection needed.
 */
public class OrderItem {

    private String productId;
    private String productName;
    private String emoji;
    private String brand;
    private Integer qty;
    private String size;
    private BigDecimal unitPrice;   // price snapshot at time of order

    public OrderItem() {}

    public OrderItem(String productId, String productName, String emoji,
                     String brand, Integer qty, String size, BigDecimal unitPrice) {
        this.productId   = productId;
        this.productName = productName;
        this.emoji       = emoji;
        this.brand       = brand;
        this.qty         = qty;
        this.size        = size;
        this.unitPrice   = unitPrice;
    }

    // ── Computed ──────────────────────────────────────────

    public BigDecimal getLineTotal() {
        return unitPrice.multiply(BigDecimal.valueOf(qty));
    }

    // ── Getters & Setters ─────────────────────────────────

    public String getProductId()               { return productId; }
    public void   setProductId(String id)      { this.productId = id; }

    public String getProductName()             { return productName; }
    public void   setProductName(String n)     { this.productName = n; }

    public String getEmoji()                   { return emoji; }
    public void   setEmoji(String e)           { this.emoji = e; }

    public String getBrand()                   { return brand; }
    public void   setBrand(String b)           { this.brand = b; }

    public Integer getQty()                    { return qty; }
    public void    setQty(Integer qty)         { this.qty = qty; }

    public String getSize()                    { return size; }
    public void   setSize(String size)         { this.size = size; }

    public BigDecimal getUnitPrice()           { return unitPrice; }
    public void       setUnitPrice(BigDecimal p) { this.unitPrice = p; }
}
