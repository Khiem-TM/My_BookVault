package com.khiem.book.controller;

import com.khiem.book.dto.TransactionDto;
import com.khiem.book.service.TransactionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/transactions")
public class TransactionController {
    private final TransactionService service;

    public TransactionController(TransactionService service) { this.service = service; }

    @GetMapping("/by-user/{userId}")
    public List<TransactionDto> byUser(@PathVariable Long userId) { return service.findByUser(userId); }

    @GetMapping
    public List<TransactionDto> all() { return service.all(); }

    @PostMapping("/borrow")
    public ResponseEntity<TransactionDto> borrow(@Valid @RequestBody TransactionDto dto) { return ResponseEntity.ok(service.borrow(dto)); }

    @PostMapping("/return")
    public ResponseEntity<TransactionDto> returnBook(@Valid @RequestBody TransactionDto dto) { return ResponseEntity.ok(service.returnBook(dto)); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
