package com.voguein.controller;

import com.voguein.dto.Dtos.*;
import com.voguein.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://localhost:3000",
                "https://vogue-in-shopping-platform-ef8y54uvj-prasanthsai0987s-projects.vercel.app"
        },
        methods = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PUT,
                RequestMethod.OPTIONS
        },
        allowedHeaders = "*"
)
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    // =====================================================
    // CREATE ORDER
    // POST /api/orders
    // =====================================================

    @PostMapping
    public ResponseEntity<OrderResponse> create(
            @RequestBody CreateOrderRequest req) {

        return ResponseEntity.ok(
                service.createOrder(req)
        );
    }


    // =====================================================
    // GET ORDERS BY CUSTOMER
    // GET /api/orders/customer/{customerId}
    // =====================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByCustomer(
            @PathVariable String customerId) {

        return ResponseEntity.ok(
                service.getOrdersByCustomerId(customerId)
        );
    }


    // =====================================================
    // GET SINGLE ORDER
    // GET /api/orders/{id}
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> get(
            @PathVariable String id) {

        return service.getOrder(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // =====================================================
    // SHIP ORDER
    // PUT /api/orders/{id}/ship
    // =====================================================

    @PutMapping("/{id}/ship")
    public ResponseEntity<OrderResponse> ship(
            @PathVariable String id) {

        return ResponseEntity.ok(
                service.shipOrder(id)
        );
    }


    // =====================================================
    // DELIVER ORDER
    // PUT /api/orders/{id}/deliver
    // =====================================================

    @PutMapping("/{id}/deliver")
    public ResponseEntity<OrderResponse> deliver(
            @PathVariable String id) {

        return ResponseEntity.ok(
                service.deliverOrder(id)
        );
    }


    // =====================================================
    // CANCEL ORDER
    // PUT /api/orders/{id}/cancel
    // =====================================================

    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancel(
            @PathVariable String id) {

        return ResponseEntity.ok(
                service.cancelOrder(id)
        );
    }
}