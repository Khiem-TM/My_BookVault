package com.khiem.book.controller;

import com.khiem.book.dto.LibraryItemDto;
import com.khiem.book.service.LibraryItemService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/library/items")
@RequiredArgsConstructor
public class LibraryController {
    private final LibraryItemService service;

    @GetMapping
    public List<LibraryItemDto> all() { return service.all(); }

    @GetMapping("/{id}")
    public ResponseEntity<LibraryItemDto> one(@PathVariable Long id) {
        LibraryItemDto dto = service.one(id);
        return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
    }

    @GetMapping("/by-shelf")
    public List<LibraryItemDto> byShelf(@RequestParam Long userId, @RequestParam String shelf) {
        return service.byShelf(userId, shelf);
    }

    @PostMapping
    public ResponseEntity<LibraryItemDto> create(@Valid @RequestBody LibraryItemDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}

