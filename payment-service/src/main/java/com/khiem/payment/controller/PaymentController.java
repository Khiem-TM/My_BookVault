package com.khiem.payment.controller;

import com.khiem.payment.dto.PaymentRequest;
import com.khiem.payment.dto.PaymentResponse;
import com.khiem.payment.service.WalletPaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final WalletPaymentService walletPaymentService;

    public PaymentController(WalletPaymentService walletPaymentService) {
        this.walletPaymentService = walletPaymentService;
    }

    @PostMapping("/charge")
    public ResponseEntity<PaymentResponse> charge(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = walletPaymentService.processPayment(request);
        return ResponseEntity.ok(response);
    }
}

