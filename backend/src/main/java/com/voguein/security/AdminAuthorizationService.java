package com.voguein.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminAuthorizationService {

    private final Set<String> adminEmails;

    public AdminAuthorizationService(
            @Value("${app.admin.emails}") String configuredEmails) {

        this.adminEmails = Arrays.stream(configuredEmails.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(email -> !email.isBlank())
                .collect(Collectors.toSet());
    }

    public boolean isAdmin(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {
            return false;
        }

        return adminEmails.contains(
                authentication.getName().trim().toLowerCase()
        );
    }
}