
package com.voguein.controller;

import com.voguein.dto.Dtos.*;
import com.voguein.model.Customer;
import com.voguein.repository.CustomerRepository;
import com.voguein.service.OrderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService service;
    private final CustomerRepository customerRepository;

    public OrderController(
            OrderService service,
            CustomerRepository customerRepository) {
        this.service = service;
        this.customerRepository = customerRepository;
    }

    private Customer currentCustomer(Authentication authentication) {
        return customerRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Authenticated customer not found"
                        ));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody CreateOrderRequest request,
            Authentication authentication) {

        Customer customer = currentCustomer(authentication);

        if (request.getCustomerId() == null
                || !request.getCustomerId().equals(customer.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Invalid customer ID"));
        }

        return ResponseEntity.ok(service.createOrder(request));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getOrdersByCustomer(
            @PathVariable String customerId,
            Authentication authentication) {

        Customer customer = currentCustomer(authentication);

        if (!customer.getId().equals(customerId)
                && !isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        List<OrderResponse> orders =
                service.getOrdersByCustomerId(customerId);

        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(
            @PathVariable String id,
            Authentication authentication) {

        Customer customer = currentCustomer(authentication);

        if (!isAdmin(authentication)
                && !service.isOrderOwnedByCustomer(
                id, customer.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        return service.getOrder(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/ship")
    public ResponseEntity<?> ship(
            @PathVariable String id,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Administrator access required"));
        }

        return ResponseEntity.ok(service.shipOrder(id));
    }

    @PutMapping("/{id}/deliver")
    public ResponseEntity<?> deliver(
            @PathVariable String id,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Administrator access required"));
        }

        return ResponseEntity.ok(service.deliverOrder(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(
            @PathVariable String id,
            Authentication authentication) {

        Customer customer = currentCustomer(authentication);

        if (!isAdmin(authentication)
                && !service.isOrderOwnedByCustomer(
                id, customer.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        return ResponseEntity.ok(service.cancelOrder(id));
    }
}
