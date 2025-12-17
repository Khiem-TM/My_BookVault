package com.khiem.book.controller;

import com.khiem.book.dto.ReviewDto;
import com.khiem.book.service.ReviewCrudService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
public class ReviewController {
    private final ReviewCrudService service;

    public ReviewController(ReviewCrudService service) { this.service = service; }

    @GetMapping
    public List<ReviewDto> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewDto> getOne(@PathVariable String id) {
        ReviewDto dto = service.findById(id);
        return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
    }

    @GetMapping("/by-book/{bookId}")
    public List<ReviewDto> byBook(@PathVariable Long bookId) { return service.findByBookId(bookId); }

    @PostMapping
    public ResponseEntity<ReviewDto> create(@Valid @RequestBody ReviewDto dto) { return ResponseEntity.ok(service.create(dto)); }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewDto> update(@PathVariable String id, @Valid @RequestBody ReviewDto dto) { return ResponseEntity.ok(service.update(id, dto)); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
