package com.voguein.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Service
public class ResendEmailService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${resend.api-key}")
    private String apiKey;

    @Value("${resend.from-email}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public ResendEmailService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void sendPasswordResetEmail(
            String recipient,
            String token) throws Exception {

        String baseUrl = frontendUrl.replaceAll("/+$", "");
        String resetUrl = baseUrl
                + "/reset-password?token=" + token;

        String html = """
                <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
                  <h2>Reset your VOGUE.IN password</h2>
                  <p>We received a request to reset your password.</p>
                  <p>
                    <a href="%s"
                       style="display:inline-block;padding:12px 20px;
                       background:#111;color:#fff;text-decoration:none">
                      Reset Password
                    </a>
                  </p>
                  <p>This link expires in 15 minutes and can only be used once.</p>
                  <p>If you did not request this, you can ignore this email.</p>
                </div>
                """.formatted(resetUrl);

        Map<String, Object> payload = Map.of(
                "from", fromEmail,
                "to", new String[]{recipient},
                "subject", "Reset your VOGUE.IN password",
                "html", html
        );

        String json = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() < 200
                || response.statusCode() >= 300) {
            throw new IllegalStateException(
                    "Resend email request failed with HTTP "
                            + response.statusCode()
            );
        }
    }
}