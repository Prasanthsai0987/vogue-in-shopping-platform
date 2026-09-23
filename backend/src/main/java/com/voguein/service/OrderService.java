package com.voguein.service;

import com.voguein.dto.Dtos.*;
import com.voguein.model.*;
import com.voguein.repository.OrderRepository;
import com.voguein.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("2999");
    private static final BigDecimal SHIPPING_COST = BigDecimal.ZERO;

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;

    public OrderService(OrderRepository orderRepo, ProductRepository productRepo) {
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
    }

    // ─────────────────────────────────────────────────────
    // CREATE ORDER
    // ─────────────────────────────────────────────────────

    public OrderResponse createOrder(CreateOrderRequest req) {

        Order order = new Order();

        order.setOrderRef(generateRef());
        order.setCustomerName(req.getCustomerName());
        order.setCustomerEmail(req.getCustomerEmail());
        order.setShippingAddress(req.getShippingAddress());
        order.setCustomerId(req.getCustomerId());

        // New order always starts as PENDING
        order.setStatus(Order.Status.PENDING);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest ir : req.getItems()) {

            Product p = productRepo.findById(ir.getProductId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found: " + ir.getProductId()
                            )
                    );

            // Embed a snapshot of the product into the order
            OrderItem item = new OrderItem(
                    p.getId(),
                    p.getName(),
                    p.getEmoji(),
                    p.getBrand(),
                    ir.getQty(),
                    ir.getSize(),
                    p.getPrice()
            );

            order.getItems().add(item);

            subtotal = subtotal.add(
                    p.getPrice().multiply(
                            BigDecimal.valueOf(ir.getQty())
                    )
            );
        }

        BigDecimal shipping =
                subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
                        ? BigDecimal.ZERO
                        : SHIPPING_COST;

        order.setSubtotal(subtotal);
        order.setShippingAmount(shipping);
        order.setTotalAmount(subtotal.add(shipping));

        return toResponse(orderRepo.save(order));
    }


    // ─────────────────────────────────────────────────────
    // GET ORDER
    // ─────────────────────────────────────────────────────

    public Optional<OrderResponse> getOrder(String id) {

        return orderRepo.findById(id)
                .map(this::toResponse);
    }


    // ─────────────────────────────────────────────────────
    // SHIP ORDER
    // PENDING / CONFIRMED → SHIPPED
    // ─────────────────────────────────────────────────────

    public OrderResponse shipOrder(String id) {

        Order order = orderRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found: " + id)
                );

        if (order.getStatus() != Order.Status.CONFIRMED) {
            throw new RuntimeException(
                    "Only CONFIRMED orders can be shipped"
            );
        }

        order.setStatus(Order.Status.SHIPPED);

        return toResponse(orderRepo.save(order));
    }


    // ─────────────────────────────────────────────────────
    // DELIVER ORDER
    // SHIPPED → DELIVERED
    // ─────────────────────────────────────────────────────

    public OrderResponse deliverOrder(String id) {

        Order order = orderRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found: " + id)
                );

        if (order.getStatus() != Order.Status.SHIPPED) {
            throw new RuntimeException(
                    "Only SHIPPED orders can be marked as DELIVERED"
            );
        }

        order.setStatus(Order.Status.DELIVERED);

        return toResponse(orderRepo.save(order));
    }


    // ─────────────────────────────────────────────────────
    // CANCEL ORDER
    // PENDING / CONFIRMED → CANCELLED
    // ─────────────────────────────────────────────────────

    public OrderResponse cancelOrder(String id) {

        Order order = orderRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found: " + id)
                );

        if (order.getStatus() != Order.Status.PENDING &&
                order.getStatus() != Order.Status.CONFIRMED) {

            throw new RuntimeException(
                    "Only PENDING or CONFIRMED orders can be cancelled"
            );
        }

        order.setStatus(Order.Status.CANCELLED);

        return toResponse(orderRepo.save(order));
    }


    // ─────────────────────────────────────────────────────
    // RESPONSE MAPPER
    // ─────────────────────────────────────────────────────

    private OrderResponse toResponse(Order order) {

        OrderResponse res = new OrderResponse();

        res.setId(order.getId());
        res.setOrderRef(order.getOrderRef());
        res.setStatus(order.getStatus().name());
        res.setSubtotal(order.getSubtotal());
        res.setShippingAmount(order.getShippingAmount());
        res.setTotalAmount(order.getTotalAmount());

        List<OrderItemResponse> itemResponses =
                order.getItems()
                        .stream()
                        .map(i -> {

                            OrderItemResponse ir = new OrderItemResponse();

                            ir.setProductId(i.getProductId());
                            ir.setProductName(i.getProductName());
                            ir.setEmoji(i.getEmoji());
                            ir.setBrand(i.getBrand());
                            ir.setQty(i.getQty());
                            ir.setSize(i.getSize());
                            ir.setUnitPrice(i.getUnitPrice());
                            ir.setLineTotal(i.getLineTotal());

                            return ir;

                        })
                        .collect(Collectors.toList());

        res.setItems(itemResponses);

        return res;
    }


    // ─────────────────────────────────────────────────────
    // ORDER REFERENCE GENERATOR
    // ─────────────────────────────────────────────────────

    private String generateRef() {

        return "ORD" +
                LocalDateTime.now()
                        .format(
                                DateTimeFormatter.ofPattern(
                                        "yyyyMMddHHmmss"
                                )
                        );
    }

    public List<OrderResponse> getOrdersByCustomerId(String customerId) {
        return orderRepo.findByCustomerId(customerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

}

