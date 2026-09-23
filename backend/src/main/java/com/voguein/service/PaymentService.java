package com.voguein.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.voguein.dto.Dtos.*;
import com.voguein.model.Payment;
import com.voguein.repository.OrderRepository;
import com.voguein.repository.PaymentRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepo;
    private final OrderRepository orderRepo;

    private final String razorpayKeyId;
    private final String razorpayKeySecret;


    // ─────────────────────────────────────────────────────
    // CONSTRUCTOR
    // ─────────────────────────────────────────────────────

    public PaymentService(
            PaymentRepository paymentRepo,
            OrderRepository orderRepo,
            @Value("${razorpay.key.id}") String razorpayKeyId,
            @Value("${razorpay.key.secret}") String razorpayKeySecret) {

        this.paymentRepo = paymentRepo;
        this.orderRepo = orderRepo;
        this.razorpayKeyId = razorpayKeyId;
        this.razorpayKeySecret = razorpayKeySecret;
    }


    // ─────────────────────────────────────────────────────
    // CREATE RAZORPAY ORDER
    // ─────────────────────────────────────────────────────

    public PaymentResponse initiatePayment(
            InitiatePaymentRequest req) {

        com.voguein.model.Order order =
                orderRepo.findById(req.getOrderId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found: "
                                                + req.getOrderId()
                                )
                        );


        // Do not allow payment for cancelled order
        if (order.getStatus() == com.voguein.model.Order.Status.CANCELLED) {

            throw new RuntimeException(
                    "Cannot make payment for a cancelled order"
            );
        }


        // Do not allow payment for delivered order
        if (order.getStatus() == com.voguein.model.Order.Status.DELIVERED) {

            throw new RuntimeException(
                    "Order has already been delivered"
            );
        }


        // ─────────────────────────────────────────────────
        // CREATE LOCAL PAYMENT
        // ─────────────────────────────────────────────────

        Payment payment = new Payment();

        payment.setOrderId(order.getId());
        payment.setOrderRef(order.getOrderRef());
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(Payment.Status.INITIATED);

        payment.setPaymentRef(
                "PAY-" +
                        UUID.randomUUID()
                                .toString()
                                .replace("-", "")
                                .substring(0, 12)
                                .toUpperCase()
        );


        try {

            // ─────────────────────────────────────────────
            // RAZORPAY CLIENT
            // ─────────────────────────────────────────────

            RazorpayClient razorpayClient =
                    new RazorpayClient(
                            razorpayKeyId,
                            razorpayKeySecret
                    );


            // ─────────────────────────────────────────────
            // CONVERT ₹ TO PAISE
            // ─────────────────────────────────────────────

            long amountInPaise =
                    order.getTotalAmount()
                            .multiply(BigDecimal.valueOf(100))
                            .longValueExact();


            // ─────────────────────────────────────────────
            // RAZORPAY ORDER REQUEST
            // ─────────────────────────────────────────────

            JSONObject orderRequest = new JSONObject();

            orderRequest.put(
                    "amount",
                    amountInPaise
            );

            orderRequest.put(
                    "currency",
                    "INR"
            );

            orderRequest.put(
                    "receipt",
                    order.getOrderRef()
            );


            // ─────────────────────────────────────────────
            // CREATE RAZORPAY ORDER
            // ─────────────────────────────────────────────

            Order razorpayOrder =
                    razorpayClient.orders.create(orderRequest);


            String razorpayOrderId =
                    razorpayOrder.get("id");


            // ─────────────────────────────────────────────
            // SAVE RAZORPAY ORDER ID
            // ─────────────────────────────────────────────

            payment.setRazorpayOrderId(
                    razorpayOrderId
            );

            payment.setStatus(
                    Payment.Status.PENDING
            );


            // Save payment in MongoDB
            Payment savedPayment =
                    paymentRepo.save(payment);


            return toResponse(savedPayment);


        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to create Razorpay order: "
                            + e.getMessage(),
                    e
            );
        }
    }


    // ─────────────────────────────────────────────────────
    // VERIFY RAZORPAY PAYMENT
    // ─────────────────────────────────────────────────────

    public PaymentResponse verifyPayment(
            String paymentId,
            String razorpayPaymentId,
            String razorpayOrderId,
            String razorpaySignature) {


        Payment payment =
                paymentRepo.findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found: "
                                                + paymentId
                                )
                        );


        // Already successful
        if (payment.getStatus() == Payment.Status.SUCCESS) {

            throw new RuntimeException(
                    "Payment has already been verified"
            );
        }


        // ─────────────────────────────────────────────────
        // CHECK RAZORPAY ORDER ID
        // ─────────────────────────────────────────────────

        if (payment.getRazorpayOrderId() == null ||
                !payment.getRazorpayOrderId()
                        .equals(razorpayOrderId)) {

            payment.setStatus(
                    Payment.Status.FAILED
            );

            paymentRepo.save(payment);

            throw new RuntimeException(
                    "Razorpay order ID does not match"
            );
        }


        try {

            // ─────────────────────────────────────────────
            // VERIFY RAZORPAY SIGNATURE
            // ─────────────────────────────────────────────

            JSONObject attributes =
                    new JSONObject();

            attributes.put(
                    "razorpay_order_id",
                    razorpayOrderId
            );

            attributes.put(
                    "razorpay_payment_id",
                    razorpayPaymentId
            );

            attributes.put(
                    "razorpay_signature",
                    razorpaySignature
            );


            boolean valid =
                    Utils.verifyPaymentSignature(
                            attributes,
                            razorpayKeySecret
                    );


            if (!valid) {

                payment.setStatus(
                        Payment.Status.FAILED
                );

                paymentRepo.save(payment);

                throw new RuntimeException(
                        "Invalid Razorpay payment signature"
                );
            }


            // ─────────────────────────────────────────────
            // PAYMENT VERIFIED
            // ─────────────────────────────────────────────

            payment.setRazorpayPaymentId(
                    razorpayPaymentId
            );

            payment.setRazorpaySignature(
                    razorpaySignature
            );

            payment.setStatus(
                    Payment.Status.SUCCESS
            );

            payment.setCompletedAt(
                    LocalDateTime.now()
            );


            // ─────────────────────────────────────────────
            // PAYMENT SUCCESS
            // → ORDER CONFIRMED
            // ─────────────────────────────────────────────

            orderRepo.findById(
                    payment.getOrderId()
            ).ifPresent(order -> {

                if (order.getStatus()
                        == com.voguein.model.Order.Status.PENDING) {

                    order.setStatus(
                            com.voguein.model.Order.Status.CONFIRMED
                    );

                    orderRepo.save(order);
                }
            });


            return toResponse(
                    paymentRepo.save(payment)
            );


        } catch (Exception e) {

            if (payment.getStatus()
                    != Payment.Status.FAILED) {

                payment.setStatus(
                        Payment.Status.FAILED
                );

                paymentRepo.save(payment);
            }

            throw new RuntimeException(
                    "Razorpay payment verification failed: "
                            + e.getMessage(),
                    e
            );
        }
    }


    // ─────────────────────────────────────────────────────
    // GET PAYMENT STATUS
    // ─────────────────────────────────────────────────────

    public Optional<PaymentResponse> getStatus(
            String paymentId) {

        return paymentRepo.findById(paymentId)
                .map(this::toResponse);
    }


    // ─────────────────────────────────────────────────────
    // PAYMENT RESPONSE
    // ─────────────────────────────────────────────────────

    private PaymentResponse toResponse(
            Payment payment) {

        PaymentResponse response =
                new PaymentResponse();

        response.setId(
                payment.getId()
        );

        response.setPaymentRef(
                payment.getPaymentRef()
        );

        response.setStatus(
                payment.getStatus().name()
        );

        response.setAmount(
                payment.getAmount()
        );

        response.setRazorpayOrderId(
                payment.getRazorpayOrderId()
        );

        response.setRazorpayPaymentId(
                payment.getRazorpayPaymentId()
        );

        return response;
    }
}