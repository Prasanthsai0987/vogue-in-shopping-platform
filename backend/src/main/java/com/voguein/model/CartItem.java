package com.voguein.model;

public class CartItem {

    private String productId;
    private Integer qty;
    private String size;

    public CartItem() {
    }

    public CartItem(String productId, Integer qty, String size) {
        this.productId = productId;
        this.qty = qty;
        this.size = size;
    }

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