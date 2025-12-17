package com.khiem.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest
@AutoConfigureWebTestClient
class GatewayApplicationTests {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    void testWelcomeEndpoint() {
        webTestClient.get().uri("/api/v1")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.code").isEqualTo(1000)
                .jsonPath("$.message").isEqualTo("Welcome to MyBook API Gateway")
                .jsonPath("$.result.status").isEqualTo("UP");
    }

    @Test
    void testNotFoundEndpoint() {
        webTestClient.get().uri("/api/v1/non-existent-endpoint")
                .exchange()
                .expectStatus().isNotFound()
                .expectBody()
                .jsonPath("$.code").isEqualTo(404)
                .jsonPath("$.message").isEqualTo("Endpoint not found");
    }
}
