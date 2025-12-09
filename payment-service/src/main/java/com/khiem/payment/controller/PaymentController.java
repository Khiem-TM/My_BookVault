package com.khiem.payment.controller;

import com.khiem.payment.dto.PaymentRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments")
public class PaymentController {
    @PostMapping("/charge")
    public ResponseEntity<String> charge(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok("charged");
    }
}

