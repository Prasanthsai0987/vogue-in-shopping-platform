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
        "https://vogue-in-shopping-platform-ef8y54uvj-prasanthsai0987s-projects.vercel.app"
})
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    // GET /api/products
    // GET /api/products?category=Dresses
    @GetMapping
    public ResponseEntity<List<Product>> list(
            @RequestParam(required = false) String category) {

        List<Product> result =
                (category != null && !category.isBlank())
                        ? service.getByCategory(category)
                        : service.getAll();

        return ResponseEntity.ok(result);
    }

    // GET /api/products/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Product> get(
            @PathVariable String id) {

        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/products
    @PostMapping
    public ResponseEntity<Product> create(
            @RequestBody Product product) {

        return ResponseEntity.ok(
                service.save(product)
        );
    }

    // PUT /api/products/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Product> update(
            @PathVariable String id,
            @RequestBody Product updated) {

        return service.getById(id)
                .map(existing -> {

                    updated.setId(id);

                    return ResponseEntity.ok(
                            service.save(updated)
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/products/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id) {

        service.delete(id);

        return ResponseEntity.noContent().build();
    }
}