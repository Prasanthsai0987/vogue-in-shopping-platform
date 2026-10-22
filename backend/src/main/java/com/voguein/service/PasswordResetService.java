package com.voguein.service;

import com.voguein.model.Customer;
import com.voguein.model.PasswordResetToken;
import com.voguein.repository.CustomerRepository;
import com.voguein.repository.PasswordResetTokenRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class PasswordResetService {

    private final CustomerRepository customerRepo;
    private final PasswordResetTokenRepository tokenRepo;
    private final PasswordEncoder passwordEncoder;
    private final ResendEmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetService(
            CustomerRepository customerRepo,
            PasswordResetTokenRepository tokenRepo,
            PasswordEncoder passwordEncoder,
            ResendEmailService emailService) {
        this.customerRepo = customerRepo;
        this.tokenRepo = tokenRepo;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public void requestReset(String email) throws Exception {
        if (email == null || email.isBlank()) {
            return;
        }

        String normalizedEmail = email.trim().toLowerCase();

        Optional<Customer> customerOpt =
                customerRepo.findByEmail(normalizedEmail);

        // Do not disclose whether an account exists.
        if (customerOpt.isEmpty()) {
            return;
        }

        Customer customer = customerOpt.get();

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        String rawToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        String tokenHash = sha256(rawToken);

        // Invalidate any previously issued reset links.
        tokenRepo.deleteByEmail(normalizedEmail);

        PasswordResetToken resetToken = new PasswordResetToken(
                normalizedEmail,
                tokenHash,
                Instant.now().plus(15, ChronoUnit.MINUTES)
        );

        tokenRepo.save(resetToken);

        try {
            emailService.sendPasswordResetEmail(
                    customer.getEmail(),
                    rawToken
            );
        } catch (Exception ex) {
            // Do not leave a valid token behind if email delivery fails.
            tokenRepo.deleteByTokenHash(tokenHash);
            throw ex;
        }
    }

    public void resetPassword(
            String rawToken,
            String newPassword) {

        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalArgumentException(
                    "Invalid or expired reset link"
            );
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException(
                    "Password must be at least 8 characters"
            );
        }

        if (newPassword.length() > 128) {
            throw new IllegalArgumentException(
                    "Password is too long"
            );
        }

        String tokenHash = sha256(rawToken);

        PasswordResetToken resetToken = tokenRepo
                .findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid or expired reset link"
                ));

        if (resetToken.getExpiresAt() == null
                || !resetToken.getExpiresAt().isAfter(Instant.now())) {
            tokenRepo.deleteByTokenHash(tokenHash);

            throw new IllegalArgumentException(
                    "Invalid or expired reset link"
            );
        }

        Customer customer = customerRepo
                .findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid or expired reset link"
                ));

        // Preserve the existing customer record and authentication model.
        customer.setPasswordHash(passwordEncoder.encode(newPassword));
        customerRepo.save(customer);

        // A successful reset consumes the token.
        tokenRepo.deleteByEmail(resetToken.getEmail());
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    value.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);
        } catch (Exception ex) {
            throw new IllegalStateException(
                    "Unable to process reset token",
                    ex
            );
        }
    }
}