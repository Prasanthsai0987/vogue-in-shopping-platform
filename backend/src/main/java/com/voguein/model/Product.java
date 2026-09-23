package com.voguein.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "Product")
public class Product {

    @Id
    private String id;

    private String name;
    private String brand;

    private BigDecimal price;
    private BigDecimal oldPrice;

    private String emoji;

    @Indexed
    private String category;

    private String description;
    private String badge;

    private List<String> sizes;   // ["XS","S","M","L","XL"]

    private Double rating;
    private Integer reviews;
    private Integer stockQty;

    @CreatedDate
    private LocalDateTime createdAt;

    // ── Constructors ──────────────────────────────────────

    public Product() {}

    public Product(String name, String brand, BigDecimal price, BigDecimal oldPrice,
                   String emoji, String category, String description, String badge,
                   List<String> sizes, Double rating, Integer reviews, Integer stockQty) {
        this.name        = name;
        this.brand       = brand;
        this.price       = price;
        this.oldPrice    = oldPrice;
        this.emoji       = emoji;
        this.category    = category;
        this.description = description;
        this.badge       = badge;
        this.sizes       = sizes;
        this.rating      = rating;
        this.reviews     = reviews;
        this.stockQty    = stockQty;
    }

    // ── Getters & Setters ─────────────────────────────────

    public String getId()                        { return id; }
    public void   setId(String id)               { this.id = id; }

    public String getName()                      { return name; }
    public void   setName(String name)           { this.name = name; }

    public String getBrand()                     { return brand; }
    public void   setBrand(String brand)         { this.brand = brand; }

    public BigDecimal getPrice()                 { return price; }
    public void       setPrice(BigDecimal p)     { this.price = p; }

    public BigDecimal getOldPrice()              { return oldPrice; }
    public void       setOldPrice(BigDecimal p)  { this.oldPrice = p; }

    public String getEmoji()                     { return emoji; }
    public void   setEmoji(String emoji)         { this.emoji = emoji; }

    public String getCategory()                  { return category; }
    public void   setCategory(String c)          { this.category = c; }

    public String getDescription()               { return description; }
    public void   setDescription(String d)       { this.description = d; }

    public String getBadge()                     { return badge; }
    public void   setBadge(String badge)         { this.badge = badge; }

    public List<String> getSizes()               { return sizes; }
    public void         setSizes(List<String> s) { this.sizes = s; }

    public Double getRating()                    { return rating; }
    public void   setRating(Double rating)       { this.rating = rating; }

    public Integer getReviews()                  { return reviews; }
    public void    setReviews(Integer reviews)   { this.reviews = reviews; }

    public Integer getStockQty()                 { return stockQty; }
    public void    setStockQty(Integer qty)      { this.stockQty = qty; }

    public LocalDateTime getCreatedAt()          { return createdAt; }
    public void          setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
