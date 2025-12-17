package com.khiem.book.configuration;

/**
 * Book Service Permissions
 * These permissions should match with Identity Service's Permission entity
 */
public class BookPermissions {
    // Admin permissions
    public static final String CREATE_BOOK = "CREATE_BOOK";
    public static final String UPDATE_BOOK = "UPDATE_BOOK";
    public static final String DELETE_BOOK = "DELETE_BOOK";
    public static final String MANAGE_INVENTORY = "MANAGE_INVENTORY";
    public static final String VIEW_STATISTICS = "VIEW_STATISTICS";
    
    // User permissions
    public static final String BORROW_BOOK = "BORROW_BOOK";
    public static final String RETURN_BOOK = "RETURN_BOOK";
    public static final String RENT_BOOK = "RENT_BOOK";
    public static final String REVIEW_BOOK = "REVIEW_BOOK";
    
    // Public - no auth required
    public static final String VIEW_BOOKS = "VIEW_BOOKS";
}
