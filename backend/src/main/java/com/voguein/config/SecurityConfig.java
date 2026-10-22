
package com.voguein.config;

import com.voguein.model.Customer;
import com.voguein.repository.CustomerRepository;
import com.voguein.security.AdminAuthorizationService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(
            CustomerRepository customerRepository) {

        return email -> {
            Customer customer = customerRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new UsernameNotFoundException(
                                    "Customer not found"
                            )
                    );

            return User.withUsername(customer.getEmail())
                    .password(customer.getPasswordHash())
                    .roles("CUSTOMER")
                    .build();
        };
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();

        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);

        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            DaoAuthenticationProvider authenticationProvider,
            SecurityContextRepository securityContextRepository,
            AdminAuthorizationService adminAuthorizationService)
            throws Exception {

        http
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();

                    config.setAllowedOrigins(List.of(
                            "http://localhost:5173",
                            "http://localhost:3000",
                            "https://vogue-in-shopping-platform-two.vercel.app"
                    ));

                    config.setAllowedMethods(List.of(
                            "GET",
                            "POST",
                            "PUT",
                            "PATCH",
                            "DELETE",
                            "OPTIONS"
                    ));

                    config.setAllowedHeaders(List.of(
                            "Content-Type",
                            "X-CSRF-TOKEN"
                    ));

                    config.setAllowCredentials(true);

                    return config;
                }))

                .authenticationProvider(authenticationProvider)

                .securityContext(context -> context
                        .securityContextRepository(
                                securityContextRepository
                        )
                )

                .sessionManagement(session -> session
                        .sessionFixation(fixation ->
                                fixation.changeSessionId()
                        )
                )

                // Keep CSRF protection enabled.
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                HttpMethod.OPTIONS, "/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET, "/api/csrf"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST, "/api/auth/login"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST, "/api/customers"
                        ).permitAll()

                        // Password recovery: available without login.
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/customers/forgot-password"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/customers/reset-password"
                        ).permitAll()

                        // Public product browsing.
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/products",
                                "/api/products/**"
                        ).permitAll()

                        // Admin routes require admin authorization.
                        .requestMatchers("/api/admin/**")
                        .access((authentication, context) ->
                                new AuthorizationDecision(
                                        adminAuthorizationService.isAdmin(
                                                authentication.get()
                                        )
                                )
                        )

                        // Protect product creation.
                        .requestMatchers(
                                HttpMethod.POST, "/api/products/**"
                        )
                        .access((authentication, context) ->
                                new AuthorizationDecision(
                                        adminAuthorizationService.isAdmin(
                                                authentication.get()
                                        )
                                )
                        )

                        // Protect product updates.
                        .requestMatchers(
                                HttpMethod.PUT, "/api/products/**"
                        )
                        .access((authentication, context) ->
                                new AuthorizationDecision(
                                        adminAuthorizationService.isAdmin(
                                                authentication.get()
                                        )
                                )
                        )

                        .requestMatchers(
                                HttpMethod.PATCH, "/api/products/**"
                        )
                        .access((authentication, context) ->
                                new AuthorizationDecision(
                                        adminAuthorizationService.isAdmin(
                                                authentication.get()
                                        )
                                )
                        )

                        // Protect product deletion.
                        .requestMatchers(
                                HttpMethod.DELETE, "/api/products/**"
                        )
                        .access((authentication, context) ->
                                new AuthorizationDecision(
                                        adminAuthorizationService.isAdmin(
                                                authentication.get()
                                        )
                                )
                        )

                        // All other endpoints require authentication.
                        .anyRequest().authenticated()
                )

                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((request, response,
                                               authentication) -> {
                            response.setStatus(204);
                        })
                );

        return http.build();
    }
}
