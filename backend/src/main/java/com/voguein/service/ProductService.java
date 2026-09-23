package com.voguein.service;

import com.voguein.model.Product;
import com.voguein.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public List<Product> getAll() {
        return repo.findAll();
    }

    public List<Product> getByCategory(String category) {
        return repo.findByCategory(category);
    }

    // Get one product by ID
    public Optional<Product> getById(String id) {
        return repo.findById(id);
    }

    public Product save(Product product) {
        return repo.save(product);
    }

    public void delete(String id) {
        repo.deleteById(id);
    }
}