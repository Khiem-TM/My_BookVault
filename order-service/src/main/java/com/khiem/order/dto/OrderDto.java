package com.khiem.order.dto;

import com.khiem.order.entity.Order.Status;
import com.khiem.order.entity.Order.OrderType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Book ID is required")
    private Long bookId;
    
    @NotNull(message = "Order type is required")
    private OrderType orderType;
    
    private Status status;
    private Instant createdAt;
    private Instant updatedAt;
    
    // For rental
    private LocalDate rentalStartDate;
    private LocalDate rentalEndDate;
    private Integer rentalDays;
    private Double rentalPrice;
    
    // Payment info
    private String paymentMethod;
    private Double totalPrice;
    private String notes;
    
    // Book info (populated from book service)
    private String bookTitle;
    private String bookAuthor;
    private String bookThumbnailUrl;
    
    // Builder pattern implemented manually
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private Long id;
        private Long userId;
        private Long bookId;
        private OrderType orderType;
        private Status status;
        private Instant createdAt;
        private Instant updatedAt;
        private LocalDate rentalStartDate;
        private LocalDate rentalEndDate;
        private Integer rentalDays;
        private Double rentalPrice;
        private String paymentMethod;
        private Double totalPrice;
        private String notes;
        private String bookTitle;
        private String bookAuthor;
        private String bookThumbnailUrl;
        
        public Builder id(Long id) { this.id = id; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder bookId(Long bookId) { this.bookId = bookId; return this; }
        public Builder orderType(OrderType orderType) { this.orderType = orderType; return this; }
        public Builder status(Status status) { this.status = status; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder rentalStartDate(LocalDate rentalStartDate) { this.rentalStartDate = rentalStartDate; return this; }
        public Builder rentalEndDate(LocalDate rentalEndDate) { this.rentalEndDate = rentalEndDate; return this; }
        public Builder rentalDays(Integer rentalDays) { this.rentalDays = rentalDays; return this; }
        public Builder rentalPrice(Double rentalPrice) { this.rentalPrice = rentalPrice; return this; }
        public Builder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public Builder totalPrice(Double totalPrice) { this.totalPrice = totalPrice; return this; }
        public Builder notes(String notes) { this.notes = notes; return this; }
        public Builder bookTitle(String bookTitle) { this.bookTitle = bookTitle; return this; }
        public Builder bookAuthor(String bookAuthor) { this.bookAuthor = bookAuthor; return this; }
        public Builder bookThumbnailUrl(String bookThumbnailUrl) { this.bookThumbnailUrl = bookThumbnailUrl; return this; }
        
        public OrderDto build() {
            OrderDto dto = new OrderDto();
            dto.id = this.id;
            dto.userId = this.userId;
            dto.bookId = this.bookId;
            dto.orderType = this.orderType;
            dto.status = this.status;
            dto.createdAt = this.createdAt;
            dto.updatedAt = this.updatedAt;
            dto.rentalStartDate = this.rentalStartDate;
            dto.rentalEndDate = this.rentalEndDate;
            dto.rentalDays = this.rentalDays;
            dto.rentalPrice = this.rentalPrice;
            dto.paymentMethod = this.paymentMethod;
            dto.totalPrice = this.totalPrice;
            dto.notes = this.notes;
            dto.bookTitle = this.bookTitle;
            dto.bookAuthor = this.bookAuthor;
            dto.bookThumbnailUrl = this.bookThumbnailUrl;
            return dto;
        }
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    
    public OrderType getOrderType() { return orderType; }
    public void setOrderType(OrderType orderType) { this.orderType = orderType; }
    
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDate getRentalStartDate() { return rentalStartDate; }
    public void setRentalStartDate(LocalDate rentalStartDate) { this.rentalStartDate = rentalStartDate; }
    
    public LocalDate getRentalEndDate() { return rentalEndDate; }
    public void setRentalEndDate(LocalDate rentalEndDate) { this.rentalEndDate = rentalEndDate; }
    
    public Integer getRentalDays() { return rentalDays; }
    public void setRentalDays(Integer rentalDays) { this.rentalDays = rentalDays; }
    
    public Double getRentalPrice() { return rentalPrice; }
    public void setRentalPrice(Double rentalPrice) { this.rentalPrice = rentalPrice; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }
    
    public String getBookAuthor() { return bookAuthor; }
    public void setBookAuthor(String bookAuthor) { this.bookAuthor = bookAuthor; }
    
    public String getBookThumbnailUrl() { return bookThumbnailUrl; }
    public void setBookThumbnailUrl(String bookThumbnailUrl) { this.bookThumbnailUrl = bookThumbnailUrl; }
}

