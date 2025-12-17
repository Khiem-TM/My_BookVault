package com.khiem.book.service;

import com.khiem.book.dto.request.BorrowBookRequest;
import com.khiem.book.dto.response.BorrowResponse;
import com.khiem.book.entity.Book;
import com.khiem.book.entity.BookType;
import com.khiem.book.entity.Transaction;
import com.khiem.book.exception.AppException;
import com.khiem.book.exception.ErrorCode;
import com.khiem.book.repository.BookRepository;
import com.khiem.book.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * USER SERVICE - Physical Book Borrowing
 * 
 * Responsibilities:
 * - Borrow physical books
 * - Return borrowed books
 * - Track borrow history
 * - Handle overdue books
 * 
 * Business Rules:
 * - Only PHYSICAL_BOOK can be borrowed
 * - User can borrow max 5 books at a time
 * - Book must have availableQuantity > 0
 * - Borrow duration: 1-90 days (default 14)
 * - Overdue books incur penalties
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookBorrowService {
    
    private final BookRepository bookRepository;
    private final TransactionRepository transactionRepository;
    
    private static final int MAX_ACTIVE_BORROWS = 5;
    private static final int DEFAULT_BORROW_DAYS = 14;

    /**
     * User: Borrow a physical book
     * 
     * @param request Borrow request with book ID, user ID, duration
     * @return Borrow transaction response
     * @throws AppException if book not borrowable or user limit exceeded
     */
    @Transactional
    public BorrowResponse borrowBook(BorrowBookRequest request) {
        log.info("📚 User {} borrowing book ID: {}", request.getUserId(), request.getBookId());
        
        // 1. Validate book exists and is borrowable
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        
        if (book.getBookType() != BookType.PHYSICAL_BOOK) {
            throw new AppException(ErrorCode.BOOK_NOT_BORROWABLE);
        }
        
        if (!book.isAvailableForBorrowing()) {
            throw new AppException(ErrorCode.BOOK_OUT_OF_STOCK);
        }
        
        // 2. Check user borrow limit
        long activeBorrows = transactionRepository.countByUserIdAndStatusAndReturnDateIsNull(
                request.getUserId(), Transaction.TransactionStatus.ACTIVE);
        
        if (activeBorrows >= MAX_ACTIVE_BORROWS) {
            log.warn("⚠️ User {} exceeded borrow limit: {}/{}", 
                    request.getUserId(), activeBorrows, MAX_ACTIVE_BORROWS);
            throw new AppException(ErrorCode.BORROW_LIMIT_EXCEEDED);
        }
        
        // 3. Check if user already borrowed this book
        boolean alreadyBorrowed = transactionRepository.existsByUserIdAndBookIdAndStatusAndReturnDateIsNull(
                request.getUserId(), request.getBookId(), Transaction.TransactionStatus.ACTIVE);
        
        if (alreadyBorrowed) {
            throw new AppException(ErrorCode.ALREADY_BORROWED);
        }
        
        // 4. Create borrow transaction
        int borrowDays = request.getBorrowDurationDays() != null 
                ? request.getBorrowDurationDays() 
                : DEFAULT_BORROW_DAYS;
        
        Instant now = Instant.now();
        Instant dueDate = now.plus(borrowDays, ChronoUnit.DAYS);
        
        Transaction transaction = Transaction.builder()
                .userId(request.getUserId())
                .bookId(book.getId())
                .borrowDate(now)
                .dueDate(dueDate)
                .status(Transaction.TransactionStatus.ACTIVE)
                .build();
        
        transaction = transactionRepository.save(transaction);
        
        // 5. Decrease book available quantity
        book.decreaseQuantity();
        bookRepository.save(book);
        
        log.info("✅ Book borrowed successfully - Transaction ID: {}, Due: {}", 
                transaction.getId(), dueDate);
        
        return BorrowResponse.builder()
                .id(transaction.getId())
                .bookId(book.getId())
                .bookTitle(book.getTitle())
                .userId(request.getUserId())
                .borrowedAt(now)
                .dueDate(dueDate)
                .status("ACTIVE")
                .notes(request.getNotes())
                .build();
    }

    /**
     * User: Return a borrowed book
     * 
     * @param transactionId Transaction ID
     * @param userId User ID (for validation)
     * @return Updated borrow response
     * @throws AppException if transaction not found or already returned
     */
    @Transactional
    public BorrowResponse returnBook(Long transactionId, Long userId) {
        log.info("📖 User {} returning book - Transaction ID: {}", userId, transactionId);
        
        // 1. Validate transaction
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new AppException(ErrorCode.BORROW_NOT_FOUND));
        
        if (!transaction.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        if (transaction.getReturnDate() != null) {
            throw new AppException(ErrorCode.CANNOT_RETURN_BOOK);
        }
        
        // 2. Update transaction
        Instant now = Instant.now();
        transaction.setReturnDate(now);
        
        // Check if overdue
        if (transaction.getDueDate() != null && now.isAfter(transaction.getDueDate())) {
            transaction.setStatus(Transaction.TransactionStatus.RETURNED_OVERDUE);
            log.warn("⚠️ Book returned overdue - Transaction ID: {}", transactionId);
        } else {
            transaction.setStatus(Transaction.TransactionStatus.RETURNED);
        }
        
        transaction = transactionRepository.save(transaction);
        
        // 3. Increase book available quantity
        Book book = bookRepository.findById(transaction.getBookId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        
        book.increaseQuantity();
        bookRepository.save(book);
        
        log.info("✅ Book returned successfully - Transaction ID: {}", transactionId);
        
        return BorrowResponse.builder()
                .id(transaction.getId())
                .bookId(book.getId())
                .bookTitle(book.getTitle())
                .userId(transaction.getUserId())
                .borrowedAt(transaction.getBorrowDate())
                .dueDate(transaction.getDueDate())
                .returnedAt(now)
                .status(transaction.getStatus() != null ? transaction.getStatus().name() : "UNKNOWN")
                .build();
    }

    /**
     * User: Get borrow history (paginated)
     * 
     * @param userId User ID
     * @param pageable Pagination info
     * @return Page of borrow transactions
     */
    @Transactional(readOnly = true)
    public Page<BorrowResponse> getUserBorrowHistory(Long userId, Pageable pageable) {
        log.info("📋 Fetching borrow history for user: {}", userId);
        
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByBorrowDateDesc(userId, pageable);
        return new PageImpl<>(
                transactions.stream().map(this::mapToResponse).toList(),
                pageable,
                transactions.size()
        );
    }

    /**
     * User: Get active borrows
     * 
     * @param userId User ID
     * @return List of active borrows
     */
    @Transactional(readOnly = true)
    public List<BorrowResponse> getActiveBorrows(Long userId) {
        log.info("📚 Fetching active borrows for user: {}", userId);
        
        return transactionRepository.findByUserIdAndStatusAndReturnDateIsNull(userId, Transaction.TransactionStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Admin: Get all active borrows (paginated)
     * 
     * @param pageable Pagination info
     * @return Page of active borrows
     */
    @Transactional(readOnly = true)
    public Page<BorrowResponse> getAllActiveBorrows(Pageable pageable) {
        log.info("📚 Admin fetching all active borrows");
        
        List<Transaction> transactions = transactionRepository.findByStatusAndReturnDateIsNull(
                Transaction.TransactionStatus.ACTIVE, pageable);
        return new PageImpl<>(
                transactions.stream().map(this::mapToResponse).toList(),
                pageable,
                transactions.size()
        );
    }

    /**
     * Admin: Get overdue borrows
     * 
     * @param pageable Pagination info
     * @return Page of overdue borrows
     */
    @Transactional(readOnly = true)
    public Page<BorrowResponse> getOverdueBorrows(Pageable pageable) {
        log.info("⚠️ Admin fetching overdue borrows");
        
        Instant now = Instant.now();
        List<Transaction> transactions = transactionRepository.findByStatusAndReturnDateIsNullAndDueDateBefore(
                Transaction.TransactionStatus.ACTIVE, now, pageable);
        return new PageImpl<>(
                transactions.stream().map(this::mapToResponse).toList(),
                pageable,
                transactions.size()
        );
    }

    /**
     * System: Mark overdue borrows (scheduled job)
     * Updates status of borrows past due date
     * 
     * @return Number of borrows marked as overdue
     */
    @Transactional
    public int markOverdueBorrows() {
        log.info("🔄 Checking for overdue borrows...");
        
        Instant now = Instant.now();
        List<Transaction> overdueTransactions = transactionRepository
                .findByStatusAndReturnDateIsNullAndDueDateBefore(Transaction.TransactionStatus.ACTIVE, now);
        
        if (overdueTransactions.isEmpty()) {
            log.info("✅ No overdue borrows found");
            return 0;
        }
        
        overdueTransactions.forEach(t -> t.setStatus(Transaction.TransactionStatus.OVERDUE));
        transactionRepository.saveAll(overdueTransactions);
        
        log.warn("⚠️ Marked {} borrows as overdue", overdueTransactions.size());
        return overdueTransactions.size();
    }

    // === Helper Methods ===

    private BorrowResponse mapToResponse(Transaction transaction) {
        Book book = bookRepository.findById(transaction.getBookId()).orElse(null);
        String bookTitle = book != null ? book.getTitle() : "Unknown Book";
        
        return BorrowResponse.builder()
                .id(transaction.getId())
                .bookId(transaction.getBookId())
                .bookTitle(bookTitle)
                .userId(transaction.getUserId())
                .borrowedAt(transaction.getBorrowDate())
                .dueDate(transaction.getDueDate())
                .returnedAt(transaction.getReturnDate())
                .status(transaction.getStatus() != null ? transaction.getStatus().name() : "UNKNOWN")
                .build();
    }
}
