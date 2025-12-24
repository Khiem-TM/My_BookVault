package com.khiem.payment.dto;

public class PaymentResponse {
    private String transactionId;
    private String status;
    private String message;
    private String paymentUrl;

    public PaymentResponse(String transactionId, String status, String message, String paymentUrl) {
        this.transactionId = transactionId;
        this.status = status;
        this.message = message;
        this.paymentUrl = paymentUrl;
    }

    // Getters and Setters
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getPaymentUrl() { return paymentUrl; }
    public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }
}
