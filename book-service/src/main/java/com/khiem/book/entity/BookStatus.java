package com.khiem.book.entity;

/**
 * Book Availability Status
 */
public enum BookStatus {
    /**
     * Book is available for borrowing or rental
     */
    AVAILABLE,
    
    /**
     * Book is currently borrowed or rented
     */
    BORROWED,
    
    /**
     * Book is out of stock (physical books only)
     */
    OUT_OF_STOCK,
    
    /**
     * Book is disabled by admin
     */
    DISABLED
}
