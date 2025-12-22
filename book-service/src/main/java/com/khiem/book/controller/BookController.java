package com.khiem.book.controller;

import com.khiem.book.dto.ApiResponse;
import com.khiem.book.dto.BookDto;
import com.khiem.book.dto.PageResponse;
import com.khiem.book.service.BookCrudService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {
    private final BookCrudService service;

    @GetMapping("/categories")
    // @PreAuthorize("hasAuthority('book:read')")
    public ApiResponse<List<String>> getCategories() {
        return ApiResponse.<List<String>>builder()
                .result(service.getCategories())
                .build();
    }

    @GetMapping
    // @PreAuthorize("hasAuthority('book:read')")
    public ApiResponse<PageResponse<BookDto>> getBooks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 10) Pageable pageable) {
        return ApiResponse.<PageResponse<BookDto>>builder()
                .result(service.getBooks(keyword, category, pageable))
                .build();
    }

    @GetMapping("/{id}")
    // @PreAuthorize("hasAuthority('book:read')")
    public ApiResponse<BookDto> getOne(@PathVariable Long id) {
        return ApiResponse.<BookDto>builder()
                .result(service.findById(id))
                .build();
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('VIEW_STATISTICS') or hasAuthority('book:read')")
    public ApiResponse<Map<String, Object>> getStatistics() {
        return ApiResponse.<Map<String, Object>>builder()
                .result(service.getStatistics())
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BookDto> create(@Valid @RequestBody BookDto dto) {
        return ApiResponse.<BookDto>builder()
                .result(service.create(dto))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BookDto> update(@PathVariable Long id, @Valid @RequestBody BookDto dto) {
        return ApiResponse.<BookDto>builder()
                .result(service.update(id, dto))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.<Void>builder()
                .message("Book deleted successfully")
                .build();
    }

    @PostMapping("/provision")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Integer> provision(@RequestParam(defaultValue = "20") int count) {
        return ApiResponse.<Integer>builder()
                .result(service.provision(count))
                .build();
    }

    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Integer> importExternal(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.<Integer>builder()
                .result(service.importExternal(query, limit))
                .build();
    }
}
