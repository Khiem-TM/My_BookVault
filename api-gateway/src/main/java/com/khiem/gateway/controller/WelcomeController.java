package com.khiem.gateway.controller;

import com.khiem.gateway.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class WelcomeController {

    @GetMapping
    public ApiResponse<Map<String, String>> welcome() {
        return ApiResponse.<Map<String, String>>builder()
                .code(1000)
                .message("Welcome to MyBook API Gateway")
                .result(Map.of(
                        "status", "UP",
                        "version", "1.0.0",
                        "service", "api-gateway"
                ))
                .build();
    }
}
