package com.khiem.book.controller;

import com.khiem.book.dto.ApiResponse;
import com.khiem.book.dto.PageResponse;
import com.khiem.book.dto.request.BorrowBookRequest;
import com.khiem.book.dto.response.BorrowResponse;
import com.khiem.book.service.BookBorrowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Book Borrow Controller
 * 
 * Responsibilities:
 * - Borrow physical books (User)
 * - Return borrowed books (User)
 * - View active borrows (User)
 * - View borrow history (User)
 * - Admin: View all borrows, overdue borrows
 * 
 * Business Rules:
 * - Max 5 active borrows per user
 * - Borrow duration: 1-90 days (default 14)
 * - Automatic overdue detection
 * 
 * @author Clean Architecture Refactoring
 * @version 2.0
 */
@RestController
@RequestMapping("/api/borrows")
@RequiredArgsConstructor
@Slf4j
public class BookBorrowController {

    private final BookBorrowService bookBorrowService;

    /**
     * Borrow a physical book
     * 
     * POST /api/borrows
     * 
     * @param request Borrow request
     * @param authentication User authentication
     * @return Borrow transaction details
     * 
     * Security: Requires authentication and BORROW_BOOK permission
     */
    @PostMapping
    @PreAuthorize("isAuthenticated() and (hasAuthority('BORROW_BOOK') or hasRole('USER'))")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BorrowResponse> borrowBook(
            @Valid @RequestBody BorrowBookRequest request,
            Authentication authentication) {
        
        // Get userId from authentication
        Long userId = getUserIdFromAuth(authentication);
        request.setUserId(userId);
        
        log.info("📚 User {} borrowing book {}", userId, request.getBookId());
        
        BorrowResponse response = bookBorrowService.borrowBook(request);
        
        return ApiResponse.<BorrowResponse>builder()
                .code(201)
                .message("Book borrowed successfully")
                .result(response)
                .build();
    }

    /**
     * Return a borrowed book
     * 
     * POST /api/borrows/{transactionId}/return
     * 
     * @param transactionId Transaction ID
     * @param authentication User authentication
     * @return Return transaction details
     * 
     * Security: Requires authentication and RETURN_BOOK permission
     */
    @PostMapping("/{transactionId}/return")
    @PreAuthorize("isAuthenticated() and (hasAuthority('RETURN_BOOK') or hasRole('USER'))")
    public ApiResponse<BorrowResponse> returnBook(
            @PathVariable Long transactionId,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        
        log.info("📖 User {} returning book (transaction {})", userId, transactionId);
        
        BorrowResponse response = bookBorrowService.returnBook(userId, transactionId);
        
        return ApiResponse.<BorrowResponse>builder()
                .code(200)
                .message(response.isOverdue() 
                        ? "Book returned (was overdue)" 
                        : "Book returned successfully")
                .result(response)
                .build();
    }

    /**
     * Get user's active borrows
     * 
     * GET /api/borrows/active
     * 
     * @param authentication User authentication
     * @return List of active borrows
     */
    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<BorrowResponse>> getActiveBorrows(
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        
        log.debug("📚 User {} fetching active borrows", userId);
        
        List<BorrowResponse> borrows = bookBorrowService.getActiveBorrows(userId);
        
        return ApiResponse.<List<BorrowResponse>>builder()
                .code(200)
                .result(borrows)
                .build();
    }

    /**
     * Get user's borrow history (paginated)
     * 
     * GET /api/borrows/history
     * 
     * @param page Page number
     * @param size Page size
     * @param authentication User authentication
     * @return Paginated borrow history
     */
    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PageResponse<BorrowResponse>> getBorrowHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        
        log.debug("📋 User {} fetching borrow history: page={}, size={}", userId, page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<BorrowResponse> borrowsPage = bookBorrowService.getUserBorrowHistory(userId, pageable);
        
        PageResponse<BorrowResponse> pageResponse = PageResponse.<BorrowResponse>builder()
                .currentPage(borrowsPage.getNumber())
                .totalPages(borrowsPage.getTotalPages())
                .pageSize(borrowsPage.getSize())
                .totalElements(borrowsPage.getTotalElements())
                .data(borrowsPage.getContent())
                .build();
        
        return ApiResponse.<PageResponse<BorrowResponse>>builder()
                .code(200)
                .result(pageResponse)
                .build();
    }

    /**
     * Admin: Get all active borrows (paginated)
     * 
     * GET /api/borrows/admin/active
     * 
     * @param page Page number
     * @param size Page size
     * @return All active borrows
     */
    @GetMapping("/admin/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<BorrowResponse>> getAllActiveBorrows(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.debug("📚 Admin fetching all active borrows: page={}, size={}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<BorrowResponse> borrowsPage = bookBorrowService.getAllActiveBorrows(pageable);
        
        PageResponse<BorrowResponse> pageResponse = PageResponse.<BorrowResponse>builder()
                .currentPage(borrowsPage.getNumber())
                .totalPages(borrowsPage.getTotalPages())
                .pageSize(borrowsPage.getSize())
                .totalElements(borrowsPage.getTotalElements())
                .data(borrowsPage.getContent())
                .build();
        
        return ApiResponse.<PageResponse<BorrowResponse>>builder()
                .code(200)
                .result(pageResponse)
                .build();
    }

    /**
     * Admin: Get overdue borrows (paginated)
     * 
     * GET /api/borrows/admin/overdue
     * 
     * @param page Page number
     * @param size Page size
     * @return Overdue borrows
     */
    @GetMapping("/admin/overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<BorrowResponse>> getOverdueBorrows(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.debug("⚠️ Admin fetching overdue borrows: page={}, size={}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<BorrowResponse> borrowsPage = bookBorrowService.getOverdueBorrows(pageable);
        
        PageResponse<BorrowResponse> pageResponse = PageResponse.<BorrowResponse>builder()
                .currentPage(borrowsPage.getNumber())
                .totalPages(borrowsPage.getTotalPages())
                .pageSize(borrowsPage.getSize())
                .totalElements(borrowsPage.getTotalElements())
                .data(borrowsPage.getContent())
                .build();
        
        return ApiResponse.<PageResponse<BorrowResponse>>builder()
                .code(200)
                .message(borrowsPage.getTotalElements() + " overdue borrow(s) found")
                .result(pageResponse)
                .build();
    }

    /**
     * Admin: Trigger manual overdue check
     * 
     * POST /api/borrows/admin/check-overdue
     * 
     * @return Number of borrows marked as overdue
     */
    @PostMapping("/admin/check-overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Integer> checkOverdueBorrows() {
        
        log.info("🔄 Admin triggering manual overdue check");
        
        int count = bookBorrowService.markOverdueBorrows();
        
        return ApiResponse.<Integer>builder()
                .code(200)
                .message(count + " borrow(s) marked as overdue")
                .result(count)
                .build();
    }

    // Helper method to extract userId from authentication
    private Long getUserIdFromAuth(Authentication authentication) {
        // This assumes the authentication principal contains userId
        // Adjust based on your actual authentication setup
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            // If authentication.getName() is not a Long, implement custom logic
            // For example, extract from JWT claims or custom UserDetails
            log.warn("Could not parse userId from authentication: {}", authentication.getName());
            throw new RuntimeException("Invalid user authentication");
        }
    }
}
