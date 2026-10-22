
package com.voguein.controller;

import com.voguein.dto.CustomerResponse;
import com.voguein.dto.RegisterCustomerRequest;
import com.voguein.model.Customer;
import com.voguein.service.CustomerService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.voguein.dto.ForgotPasswordRequest;
import com.voguein.dto.ResetPasswordRequest;
import com.voguein.service.PasswordResetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService service;

    public CustomerController(
            CustomerService service,
            PasswordResetService passwordResetService) {
        this.service = service;
        this.passwordResetService = passwordResetService;
    }

    private static final Logger log =
            LoggerFactory.getLogger(CustomerController.class);

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        try {
            passwordResetService.requestReset(request.email());
        } catch (Exception ex) {
            // Log the failure server-side without exposing account details.
            log.error("Unable to process password reset email request", ex);
        }

        // Same response whether the account exists or not.
        return ResponseEntity.ok(Map.of(
                "message",
                "If an account exists for that email, a reset link will be sent."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        try {
            passwordResetService.resetPassword(
                    request.token(),
                    request.newPassword()
            );

            return ResponseEntity.ok(Map.of(
                    "message",
                    "Password reset successful. You can now log in."
            ));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message",
                    ex.getMessage()
            ));
        }
    }

    // Register a new customer.
    @PostMapping
    public ResponseEntity<?> create(
            @Valid @RequestBody RegisterCustomerRequest request) {

        try {
            Customer customer = service.createCustomer(request);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(CustomerResponse.from(customer));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    // Get the authenticated customer's profile.
    @GetMapping("/{id}")
    public ResponseEntity<?> get(
            @PathVariable String id,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        Customer current = service
                .getCustomerByEmail(authentication.getName())
                .orElse(null);

        if (current == null || !current.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        return ResponseEntity.ok(CustomerResponse.from(current));
    }

    // Get the authenticated customer's profile by email.
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getByEmail(
            @PathVariable String email,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        if (!authentication.getName().equalsIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        return service.getCustomerByEmail(email)
                .<ResponseEntity<?>>map(customer ->
                        ResponseEntity.ok(CustomerResponse.from(customer)))
                .orElseGet(() ->
                        ResponseEntity.notFound().build());
    }

    // Update the authenticated customer's profile.
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable String id,
            @RequestBody Customer updatedCustomer,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        Customer current = service
                .getCustomerByEmail(authentication.getName())
                .orElse(null);

        if (current == null || !current.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        try {
            Customer updated = service.updateCustomer(id, updatedCustomer);

            return ResponseEntity.ok(CustomerResponse.from(updated));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    // Delete the authenticated customer's account.
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable String id,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        Customer current = service
                .getCustomerByEmail(authentication.getName())
                .orElse(null);

        if (current == null || !current.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        service.deleteCustomer(id);

        return ResponseEntity.noContent().build();
    }
}
