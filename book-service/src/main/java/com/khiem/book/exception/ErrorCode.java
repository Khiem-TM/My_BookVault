package com.khiem.book.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    
    // Book errors
    BOOK_NOT_FOUND(2001, "Book not found", HttpStatus.NOT_FOUND),
    BOOK_ALREADY_EXISTS(2002, "Book with this ISBN already exists", HttpStatus.BAD_REQUEST),
    ISBN_EXISTED(2003, "ISBN already exists", HttpStatus.BAD_REQUEST),
    BOOK_NOT_AVAILABLE(2003, "Book is not available", HttpStatus.BAD_REQUEST),
    INVALID_BOOK_TYPE(2004, "Invalid book type for this operation", HttpStatus.BAD_REQUEST),
    BOOK_OUT_OF_STOCK(2005, "Book is out of stock", HttpStatus.BAD_REQUEST),
    
    // Borrow errors
    BOOK_NOT_BORROWABLE(2101, "This book cannot be borrowed", HttpStatus.BAD_REQUEST),
    BORROW_LIMIT_EXCEEDED(2102, "User has exceeded borrow limit", HttpStatus.BAD_REQUEST),
    ALREADY_BORROWED(2103, "User has already borrowed this book", HttpStatus.BAD_REQUEST),
    BORROW_NOT_FOUND(2104, "Borrow record not found", HttpStatus.NOT_FOUND),
    CANNOT_RETURN_BOOK(2105, "Cannot return book", HttpStatus.BAD_REQUEST),
    
    // Rental errors
    BOOK_NOT_RENTABLE(2201, "This book cannot be rented", HttpStatus.BAD_REQUEST),
    RENTAL_NOT_FOUND(2202, "Rental record not found", HttpStatus.NOT_FOUND),
    RENTAL_ALREADY_EXISTS(2203, "User already has an active rental for this book", HttpStatus.BAD_REQUEST),
    RENTAL_EXPIRED(2204, "Rental has expired", HttpStatus.BAD_REQUEST),
    RENTAL_CONFIG_MISSING(2205, "Book rental configuration is missing", HttpStatus.BAD_REQUEST),
    RENTAL_CANNOT_BE_CANCELLED(2206, "Rental cannot be cancelled", HttpStatus.BAD_REQUEST),
    
    // Review errors
    REVIEW_NOT_FOUND(2301, "Review not found", HttpStatus.NOT_FOUND),
    REVIEW_NOT_ALLOWED(2302, "You must borrow or rent the book before reviewing", HttpStatus.BAD_REQUEST),
    REVIEW_ALREADY_EXISTS(2303, "You have already reviewed this book", HttpStatus.BAD_REQUEST),
    INVALID_RATING(2304, "Rating must be between 1 and 5", HttpStatus.BAD_REQUEST),
    
    // Transaction errors
    TRANSACTION_NOT_FOUND(2401, "Transaction not found", HttpStatus.NOT_FOUND),
    INVALID_TRANSACTION_STATUS(2402, "Invalid transaction status", HttpStatus.BAD_REQUEST),
    
    // Order errors
    ORDER_NOT_FOUND(2501, "Order not found", HttpStatus.NOT_FOUND),
    INVALID_ORDER_TYPE(2502, "Invalid order type", HttpStatus.BAD_REQUEST),
    
    // Authorization errors
    UNAUTHORIZED_ACCESS(3001, "You do not have permission to access this resource", HttpStatus.FORBIDDEN),
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
