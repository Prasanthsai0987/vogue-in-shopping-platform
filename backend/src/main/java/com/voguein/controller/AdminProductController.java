package com.voguein.controller;

import com.voguein.model.Product;
import com.voguein.security.AdminAuthorizationService;
import com.voguein.service.ProductService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "https://vogue-in-shopping-platform-two.vercel.app",
        "https://vogue-in-shopping-platform-59hh92uvy-prasanthsai0987s-projects.vercel.app"
})
public class AdminProductController {

    private final ProductService service;
    private final AdminAuthorizationService authorization;

    public AdminProductController(
            ProductService service,
            AdminAuthorizationService authorization) {
        this.service = service;
        this.authorization = authorization;
    }

    private boolean isAdmin(Authentication auth) {
        return authorization.isAdmin(auth);
    }

    // GET /api/admin/products
    @GetMapping
    public ResponseEntity<?> list(Authentication auth) {
        if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Administrator access required");
        }

        return ResponseEntity.ok(service.getAll());
    }

    // POST /api/admin/products
    @PostMapping
    public ResponseEntity<?> create(
            Authentication auth,
            @Valid @RequestBody Product product) {

        if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Administrator access required");
        }

        if (!isValid(product)) {
            return ResponseEntity.badRequest()
                    .body("Name, category, and a non-negative price are required");
        }

        // Never accept a client-supplied MongoDB ID for a new product.
        product.setId(null);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.save(product));
    }

    // PUT /api/admin/products/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            Authentication auth,
            @PathVariable String id,
            @Valid @RequestBody Product updated) {

        if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Administrator access required");
        }

        if (!isValid(updated)) {
            return ResponseEntity.badRequest()
                    .body("Name, category, and a non-negative price are required");
        }

        return service.getById(id)
                .map(existing -> {
                    updated.setId(id);
                    return ResponseEntity.ok(service.save(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/admin/products/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            Authentication auth,
            @PathVariable String id) {

        if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Administrator access required");
        }

        if (service.getById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isValid(Product product) {
        BigDecimal price = product.getPrice();

        return product.getName() != null
                && !product.getName().isBlank()
                && product.getCategory() != null
                && !product.getCategory().isBlank()
                && price != null
                && price.compareTo(BigDecimal.ZERO) >= 0
                && (product.getStockQty() == null
                || product.getStockQty() >= 0);
    }
}