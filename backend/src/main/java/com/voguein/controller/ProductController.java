package com.voguein.controller;

import com.voguein.model.Product;
import com.voguein.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "https://vogue-in-shopping-platform-two.vercel.app",
        "https://vogue-in-shopping-platform-59hh92uvy-prasanthsai0987s-projects.vercel.app"
})
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Product>> list(
            @RequestParam(required = false) String category) {

        List<Product> products =
                category != null && !category.isBlank()
                        ? service.getByCategory(category)
                        : service.getAll();

        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> get(@PathVariable String id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}