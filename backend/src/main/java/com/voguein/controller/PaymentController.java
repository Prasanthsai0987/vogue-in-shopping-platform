package com.voguein.controller;

import com.voguein.dto.Dtos.*;
import com.voguein.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://localhost:3000",
                "https://vogue-in-shopping-platform-ef8y54uvj-prasanthsai0987s-projects.vercel.app"
        }
)
public class PaymentController {

    private final PaymentService service;


    public PaymentController(
            PaymentService service) {

        this.service = service;
    }


    // ─────────────────────────────────────────────────────
    // CREATE RAZORPAY ORDER
    // ─────────────────────────────────────────────────────
    //
    // POST /api/payments/initiate
    //
    // Request:
    // {
    //     "orderId": "..."
    // }
    //
    // Response contains:
    // razorpayOrderId
    //
    // React will use that ID to open Razorpay Checkout.

    @PostMapping("/initiate")
    public ResponseEntity<PaymentResponse> initiate(
            @RequestBody InitiatePaymentRequest req) {

        return ResponseEntity.ok(
                service.initiatePayment(req)
        );
    }


    // ─────────────────────────────────────────────────────
    // VERIFY RAZORPAY PAYMENT
    // ─────────────────────────────────────────────────────
    //
    // POST /api/payments/{id}/verify
    //
    // Request:
    // {
    //     "razorpayPaymentId": "...",
    //     "razorpayOrderId": "...",
    //     "razorpaySignature": "..."
    // }

    @PostMapping("/{id}/verify")
    public ResponseEntity<PaymentResponse> verify(
            @PathVariable String id,
            @RequestBody VerifyPaymentRequest req) {

        return ResponseEntity.ok(
                service.verifyPayment(
                        id,
                        req.getRazorpayPaymentId(),
                        req.getRazorpayOrderId(),
                        req.getRazorpaySignature()
                )
        );
    }


    // ─────────────────────────────────────────────────────
    // GET PAYMENT STATUS
    // ─────────────────────────────────────────────────────

    // GET /api/payments/{id}/status

    @GetMapping("/{id}/status")
    public ResponseEntity<PaymentResponse> status(
            @PathVariable String id) {

        return service.getStatus(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }
}