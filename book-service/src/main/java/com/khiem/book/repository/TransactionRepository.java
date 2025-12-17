package com.khiem.book.repository;

import com.khiem.book.entity.Transaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);
    boolean existsByUserIdAndBookId(Long userId, Long bookId);
    
    // Query methods for BookBorrowService
    long countByUserIdAndStatusAndReturnDateIsNull(Long userId, Transaction.TransactionStatus status);
    boolean existsByUserIdAndBookIdAndStatusAndReturnDateIsNull(Long userId, Long bookId, Transaction.TransactionStatus status);
    java.util.List<Transaction> findByUserIdOrderByBorrowDateDesc(Long userId, org.springframework.data.domain.Pageable pageable);
    java.util.List<Transaction> findByUserIdAndStatusAndReturnDateIsNull(Long userId, Transaction.TransactionStatus status);
    java.util.List<Transaction> findByStatusAndReturnDateIsNull(Transaction.TransactionStatus status, org.springframework.data.domain.Pageable pageable);
    java.util.List<Transaction> findByStatusAndReturnDateIsNullAndDueDateBefore(Transaction.TransactionStatus status, java.time.Instant dueDate, org.springframework.data.domain.Pageable pageable);
    java.util.List<Transaction> findByStatusAndReturnDateIsNullAndDueDateBefore(Transaction.TransactionStatus status, java.time.Instant dueDate);
}

