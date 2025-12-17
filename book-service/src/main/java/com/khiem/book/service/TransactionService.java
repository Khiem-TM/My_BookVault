package com.khiem.book.service;

import com.khiem.book.dto.TransactionDto;
import com.khiem.book.entity.Transaction;
import com.khiem.book.repository.TransactionRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class TransactionService {
    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) { this.repository = repository; }

    public List<TransactionDto> findByUser(Long userId) {
        return repository.findByUserId(userId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<TransactionDto> all() {
        return repository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public TransactionDto borrow(TransactionDto dto) {
        Transaction tx = toEntity(dto);
        tx.setStatus(Transaction.TransactionStatus.ACTIVE);
        tx.setBorrowDate(Instant.now());
        tx.setCreatedAt(Instant.now());
        tx.setDueDate(Instant.now().plus(14, ChronoUnit.DAYS));
        return toDto(repository.save(tx));
    }

    public TransactionDto returnBook(TransactionDto dto) {
        Transaction tx = toEntity(dto);
        tx.setStatus(Transaction.TransactionStatus.RETURNED);
        tx.setReturnDate(Instant.now());
        tx.setCreatedAt(Instant.now());
        return toDto(repository.save(tx));
    }

    public void delete(Long id) { repository.deleteById(id); }

    private TransactionDto toDto(Transaction tx) {
        TransactionDto d = new TransactionDto();
        d.setId(tx.getId());
        d.setUserId(tx.getUserId());
        d.setBookId(tx.getBookId());
        d.setStatus(tx.getStatus());
        d.setBorrowDate(tx.getBorrowDate());
        d.setDueDate(tx.getDueDate());
        d.setReturnDate(tx.getReturnDate());
        d.setCreatedAt(tx.getCreatedAt());
        return d;
    }

    private Transaction toEntity(TransactionDto d) {
        Transaction tx = new Transaction();
        tx.setId(d.getId());
        tx.setUserId(d.getUserId());
        tx.setBookId(d.getBookId());
        tx.setStatus(d.getStatus());
        tx.setBorrowDate(d.getBorrowDate());
        tx.setDueDate(d.getDueDate());
        tx.setReturnDate(d.getReturnDate());
        tx.setCreatedAt(d.getCreatedAt());
        return tx;
    }
}
