package com.voguein.config;

import com.voguein.model.Product;
import com.voguein.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Seeds the products collection on first startup.
 * Runs only if the collection is empty — safe to leave in production.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository repo;

    public DataSeeder(ProductRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;   // already seeded

        List<Product> products = List.of(
            new Product(
                "Floral Wrap Dress", "Zara",
                new BigDecimal("2499"), new BigDecimal("3999"),
                "👗", "Dresses",
                "A beautiful floral wrap dress perfect for casual outings. Lightweight fabric with a flattering fit.",
                "New", List.of("XS","S","M","L","XL"), 4.5, 128, 50
            ),
            new Product(
                "High-Rise Slim Jeans", "H&M",
                new BigDecimal("1799"), new BigDecimal("2499"),
                "👖", "Bottoms",
                "Classic high-rise slim fit jeans with stretch fabric for all-day comfort. A wardrobe essential.",
                null, List.of("28","30","32","34","36"), 4.2, 96, 80
            ),
            new Product(
                "Oversized Blazer", "Mango",
                new BigDecimal("3299"), new BigDecimal("4999"),
                "🧥", "Tops",
                "A chic oversized blazer that works for both formal and casual looks. Structured shoulders with a relaxed silhouette.",
                "Trending", List.of("S","M","L","XL"), 4.7, 72, 30
            ),
            new Product(
                "Linen Palazzo Pants", "AND",
                new BigDecimal("1599"), new BigDecimal("2199"),
                "👘", "Bottoms",
                "Breathable linen palazzo pants, perfect for warm weather. Flowy silhouette with an elasticated waist.",
                null, List.of("XS","S","M","L","XL"), 4.0, 55, 60
            ),
            new Product(
                "Crop Knit Sweater", "Marks & Spencer",
                new BigDecimal("1999"), new BigDecimal("2799"),
                "🧶", "Tops",
                "A cozy cropped knit sweater in a relaxed fit. Great for layering over high-waisted bottoms.",
                null, List.of("S","M","L"), 4.4, 88, 45
            ),
            new Product(
                "Boho Maxi Skirt", "Global Desi",
                new BigDecimal("1299"), new BigDecimal("1799"),
                "👗", "Skirts",
                "A gorgeous boho-inspired maxi skirt with tiered layers and a vibrant print. Effortlessly stylish.",
                "Sale", List.of("S","M","L","XL"), 4.3, 61, 40
            )
        );

        repo.saveAll(products);
        System.out.println("✓ Seeded " + products.size() + " products into MongoDB.");
    }
}
