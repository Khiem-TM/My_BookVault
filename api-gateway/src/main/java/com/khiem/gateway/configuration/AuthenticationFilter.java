package com.khiem.gateway.configuration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.regex.Pattern;

@Component
@Slf4j
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final WebClient.Builder webClientBuilder;

    @Value("${app.services.identity:http://identity-service:8080}")
    private String identityServiceUrl;

    // Public endpoints that don't need authentication
    private static final List<Pattern> PUBLIC_ENDPOINTS = Arrays.asList(
            Pattern.compile("^/api/v1/identity/auth/token$"),
            Pattern.compile("^/api/v1/identity/auth/register$"),
            Pattern.compile("^/api/v1/identity/auth/introspect$"),
            Pattern.compile("^/api/v1/identity/auth/logout$"),
            Pattern.compile("^/api/v1/identity/auth/refresh$"),
            Pattern.compile("^/api/v1/identity/auth/verify-email$"),
            Pattern.compile("^/api/v1/identity/auth/resend-verification-email$"),
            Pattern.compile("^/api/v1/identity/auth/forgot-password$"),
            Pattern.compile("^/api/v1/identity/auth/reset-password$"),
            Pattern.compile("^/api/v1/identity/auth/validate-reset-token$"),
            Pattern.compile("^/api/v1/identity/users/registration$"),
            Pattern.compile("^/api/v1/books.*"),
            Pattern.compile("^/api/v1/?$"),
            Pattern.compile("^/actuator.*")
    );

    public AuthenticationFilter(WebClient.Builder webClientBuilder) {
        super(Config.class);
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();
            
            log.info("🔍 Processing request: {}", path);

            // Check if endpoint is public
            if (isPublicEndpoint(path)) {
                log.info("✅ Public endpoint: {}", path);
                return chain.filter(exchange);
            }

            // Get Authorization header
            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            String token = null;

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
                log.info("🔐 Token found: {}...{}", token.substring(0, 30), token.substring(token.length() - 10));
            } else {
                log.warn("❌ No Authorization header found");
                return buildErrorResponse(exchange, HttpStatus.UNAUTHORIZED, "Missing Authorization header");
            }

            // Validate token with identity service
            return validateToken(token)
                    .flatMap(isValid -> {
                        if (isValid) {
                            log.info("✅ Token validated successfully");
                            return chain.filter(exchange);
                        } else {
                            log.warn("❌ Token validation failed");
                            return buildErrorResponse(exchange, HttpStatus.UNAUTHORIZED, "Invalid token");
                        }
                    })
                    .onErrorResume(error -> {
                        log.error("⚠️  Token validation error: {}", error.getMessage());
                        return buildErrorResponse(exchange, HttpStatus.UNAUTHORIZED, "Token validation failed");
                    });
        };
    }

    /**
     * Check if endpoint is public (doesn't need authentication)
     */
    private boolean isPublicEndpoint(String path) {
        return PUBLIC_ENDPOINTS.stream()
                .anyMatch(pattern -> pattern.matcher(path).matches());
    }

    /**
     * Validate token with Identity Service
     */
    private Mono<Boolean> validateToken(String token) {
        log.info("🔄 Validating token with identity service: {}", identityServiceUrl);

        return webClientBuilder.build()
                .post()
                .uri(identityServiceUrl + "/auth/introspect")
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .bodyValue("{\"token\":\"" + token + "\"}")
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    log.debug("Token validation response: {}", response);
                    // Check if response contains "valid": true
                    return response.contains("\"valid\":true");
                })
                .doOnNext(valid -> {
                    if (valid) {
                        log.info("✅ Token is VALID");
                    } else {
                        log.warn("⚠️  Token is INVALID");
                    }
                })
                .doOnError(error -> log.error("❌ Validation error: {}", error.getMessage()));
    }

    /**
     * Build error response
     */
    private Mono<Void> buildErrorResponse(ServerWebExchange exchange, HttpStatus status, String message) {
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

        String body = String.format(
                "{\"code\":%d,\"message\":\"%s\"}",
                status.value(),
                message
        );

        return exchange.getResponse().writeWith(
                Mono.just(exchange.getResponse().bufferFactory().wrap(body.getBytes()))
        );
    }

    public static class Config {
        // Configuration class for the filter
    }
}
