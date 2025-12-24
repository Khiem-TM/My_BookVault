package com.khiem.payment.service;

import com.khiem.payment.dto.PaymentRequest;
import com.khiem.payment.dto.PaymentResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class WalletPaymentService {

    private static final Logger logger = LoggerFactory.getLogger(WalletPaymentService.class);
    @SuppressWarnings("unused")
    private final RestClient restClient;

    public WalletPaymentService() {
        this.restClient = RestClient.create();
    }

    public PaymentResponse processPayment(PaymentRequest request) {
        logger.info("Initiating online wallet payment for Order ID: {}", request.getOrderId());

        // Logic to integrate with specific wallet can go here
        // For example, switching based on request.getPaymentMethod()
        // if ("MOMO".equalsIgnoreCase(request.getPaymentMethod())) { ... }

        // Simulation of API Call to a Payment Provider
        // Response mockedResponse = restClient.post()
        //     .uri("https://api.payment-provider.com/v1/payments")
        //     .body(request)
        //     .retrieve()
        //     .toEntity(String.class);

        // Mocking a successful payment initiation
        String transactionId = "TXN-" + UUID.randomUUID().toString();
        String paymentUrl = "https://mock-wallet.com/pay?txn=" + transactionId + "&amount=" + request.getAmount();

        logger.info("Payment initiated. Transaction ID: {}", transactionId);

        return new PaymentResponse(
            transactionId,
            "INITIATED",
            "Payment request sent to wallet provider",
            paymentUrl
        );
    }
}
