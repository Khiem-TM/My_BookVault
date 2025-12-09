package com.khiem.payment.dto;

import jakarta.validation.constraints.NotNull;

public class PaymentRequest {
    @NotNull
    private Long orderId;
    @NotNull
    private Long userId;
    @NotNull
    private Long amount;

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }
}

