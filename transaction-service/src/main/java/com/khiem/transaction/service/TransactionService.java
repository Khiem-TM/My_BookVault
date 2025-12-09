package com.khiem.transaction.service;

import com.khiem.transaction.dto.TransactionDto;
import com.khiem.transaction.entity.Transaction;
import com.khiem.transaction.repository.TransactionRepository;
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
        tx.setType(Transaction.Type.BORROW);
        tx.setStatus(Transaction.Status.ACTIVE);
        tx.setCreatedAt(Instant.now());
        tx.setDueDate(Instant.now().plus(14, ChronoUnit.DAYS));
        return toDto(repository.save(tx));
    }

    public TransactionDto returnBook(TransactionDto dto) {
        Transaction tx = toEntity(dto);
        tx.setType(Transaction.Type.RETURN);
        tx.setStatus(Transaction.Status.CLOSED);
        tx.setCreatedAt(Instant.now());
        tx.setDueDate(null);
        return toDto(repository.save(tx));
    }

    public void delete(Long id) { repository.deleteById(id); }

    private TransactionDto toDto(Transaction tx) {
        TransactionDto d = new TransactionDto();
        d.setId(tx.getId());
        d.setUserId(tx.getUserId());
        d.setBookId(tx.getBookId());
        d.setType(tx.getType());
        d.setStatus(tx.getStatus());
        d.setCreatedAt(tx.getCreatedAt());
        d.setDueDate(tx.getDueDate());
        return d;
    }

    private Transaction toEntity(TransactionDto d) {
        Transaction tx = new Transaction();
        tx.setId(d.getId());
        tx.setUserId(d.getUserId());
        tx.setBookId(d.getBookId());
        tx.setType(d.getType());
        tx.setStatus(d.getStatus());
        tx.setCreatedAt(d.getCreatedAt());
        tx.setDueDate(d.getDueDate());
        return tx;
    }
}
