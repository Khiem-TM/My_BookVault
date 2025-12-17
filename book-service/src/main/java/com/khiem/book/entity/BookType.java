package com.khiem.book.entity;

/**
 * Book Type Enumeration
 * Defines the three types of books in the system
 */
public enum BookType {
    /**
     * Physical book with limited quantity that can be borrowed
     */
    PHYSICAL_BOOK,
    
    /**
     * Digital book with unlimited access, no rental required
     */
    DIGITAL_FREE_BOOK,
    
    /**
     * Digital book requiring rental or license payment with time-based access
     */
    DIGITAL_LICENSED_BOOK
}
