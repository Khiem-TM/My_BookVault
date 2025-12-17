package com.khiem.book.controller;

import com.khiem.book.dto.ApiResponse;
import com.khiem.book.dto.request.BookManagementRequest;
import com.khiem.book.dto.response.BookResponse;
import com.khiem.book.entity.BookStatus;
import com.khiem.book.service.BookManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * Admin Book Management Controller
 * 
 * Responsibilities:
 * - Create/Update/Delete books (Admin only)
 * - Manage book inventory (physical books)
 * - Configure rental pricing (digital licensed books)
 * - Enable/Disable books
 * 
 * Security: Requires ADMIN role for all endpoints
 * 
 * @author Clean Architecture Refactoring
 * @version 2.0
 */
@RestController
@RequestMapping("/api/admin/books")
@RequiredArgsConstructor
@Slf4j
public class BookManagementController {

    private final BookManagementService bookManagementService;
    private final com.khiem.book.service.BookQueryService bookQueryService;
    
    /**
     * Helper method to get current admin user ID
     * TODO: Extract from JWT token in production
     */
    private Long getCurrentAdminUserId() {
        // For testing, return a default admin ID
        // In production, extract from SecurityContext/JWT token
        return 1L; // Admin user ID
    }

    /**
     * Create a new book
     * 
     * POST /api/admin/books
     * 
     * @param request Book creation request
     * @return Created book details
     * 
     * Security: Requires ROLE_ADMIN or CREATE_BOOK permission
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('CREATE_BOOK')")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BookResponse> createBook(
            @Valid @RequestBody BookManagementRequest request) {
        
        log.info("📚 Admin creating new book: {}", request.getTitle());
        
        Long adminUserId = getCurrentAdminUserId();
        BookResponse response = bookManagementService.createBook(request, adminUserId);
        
        return ApiResponse.<BookResponse>builder()
                .code(201)
                .message("Book created successfully")
                .result(response)
                .build();
    }

    /**
     * Update an existing book
     * 
     * PUT /api/admin/books/{id}
     * 
     * @param id Book ID
     * @param request Book update request
     * @return Updated book details
     * 
     * Security: Requires ROLE_ADMIN or UPDATE_BOOK permission
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('UPDATE_BOOK')")
    public ApiResponse<BookResponse> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookManagementRequest request) {
        
        log.info("📝 Admin updating book {}: {}", id, request.getTitle());
        
        Long adminUserId = getCurrentAdminUserId();
        BookResponse response = bookManagementService.updateBook(id, request, adminUserId);
        
        return ApiResponse.<BookResponse>builder()
                .code(200)
                .message("Book updated successfully")
                .result(response)
                .build();
    }

    /**
     * Update book inventory (Physical books only)
     * 
     * PATCH /api/admin/books/{id}/inventory
     * 
     * @param id Book ID
     * @param newQuantity New total quantity
     * @return Updated book details
     * 
     * Security: Requires ROLE_ADMIN or MANAGE_INVENTORY permission
     */
    @PatchMapping("/{id}/inventory")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('MANAGE_INVENTORY')")
    public ApiResponse<BookResponse> updateInventory(
            @PathVariable Long id,
            @RequestParam Integer newQuantity) {
        
        log.info("📦 Admin updating inventory for book {}: quantity={}", id, newQuantity);
        
        Long adminUserId = getCurrentAdminUserId();
        BookResponse response = bookManagementService.updateInventory(id, newQuantity, adminUserId);
        
        return ApiResponse.<BookResponse>builder()
                .code(200)
                .message("Inventory updated successfully")
                .result(response)
                .build();
    }

    /**
     * Configure rental pricing (Digital licensed books only)
     * 
     * PATCH /api/admin/books/{id}/rental-config
     * 
     * @param id Book ID
     * @param rentalPrice Rental price per period
     * @param rentalDurationDays Duration in days per period
     * @return Updated book details
     * 
     * Security: Requires ROLE_ADMIN or UPDATE_BOOK permission
     */
    @PatchMapping("/{id}/rental-config")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('UPDATE_BOOK')")
    public ApiResponse<BookResponse> updateRentalConfig(
            @PathVariable Long id,
            @RequestParam BigDecimal rentalPrice,
            @RequestParam Integer rentalDurationDays) {
        
        log.info("💰 Admin updating rental config for book {}: price={}, duration={} days", 
                id, rentalPrice, rentalDurationDays);
        
        Long adminUserId = getCurrentAdminUserId();
        BookResponse response = bookManagementService.updateRentalConfig(
                id, rentalPrice, rentalDurationDays, adminUserId);
        
        return ApiResponse.<BookResponse>builder()
                .code(200)
                .message("Rental configuration updated successfully")
                .result(response)
                .build();
    }

    /**
     * Set book status (Enable/Disable)
     * 
     * PATCH /api/admin/books/{id}/status
     * 
     * @param id Book ID
     * @param status New status (AVAILABLE or DISABLED)
     * @return Updated book details
     * 
     * Security: Requires ROLE_ADMIN or UPDATE_BOOK permission
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('UPDATE_BOOK')")
    public ApiResponse<BookResponse> setBookStatus(
            @PathVariable Long id,
            @RequestParam BookStatus status) {
        
        log.info("🔄 Admin changing book {} status to: {}", id, status);
        
        Long adminUserId = getCurrentAdminUserId();
        boolean isActive = (status == BookStatus.AVAILABLE);
        BookResponse response = bookManagementService.setBookStatus(id, isActive, adminUserId);
        
        return ApiResponse.<BookResponse>builder()
                .code(200)
                .message("Book status updated successfully")
                .result(response)
                .build();
    }

    /**
     * Delete a book (Soft delete - sets status to DISABLED)
     * 
     * DELETE /api/admin/books/{id}
     * 
     * @param id Book ID
     * @return Success message
     * 
     * Security: Requires ROLE_ADMIN or DELETE_BOOK permission
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('DELETE_BOOK')")
    public ApiResponse<Void> deleteBook(@PathVariable Long id) {
        
        log.info("🗑️ Admin deleting book {}", id);
        
        Long adminUserId = getCurrentAdminUserId();
        bookManagementService.deleteBook(id, adminUserId);
        
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Book deleted successfully")
                .build();
    }

    /**
     * Get book details (Admin view - all statuses)
     * 
     * GET /api/admin/books/{id}
     * 
     * @param id Book ID
     * @return Book details
     * 
     * Security: Requires ROLE_ADMIN or VIEW_STATISTICS permission
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('VIEW_STATISTICS')")
    public ApiResponse<BookResponse> getBook(@PathVariable Long id) {
        
        log.info("📖 Admin viewing book {}", id);
        
        // Use BookQueryService.getBookByIdAdmin for admin view (can see any status)
        BookResponse response = bookQueryService.getBookByIdAdmin(id);
        
        return ApiResponse.<BookResponse>builder()
                .code(200)
                .result(response)
                .build();
    }
}
