package com.khiem.book.service;

import com.khiem.book.dto.BookDto;
import com.khiem.book.dto.PageResponse;
import com.khiem.book.entity.Book;
import com.khiem.book.exception.AppException;
import com.khiem.book.exception.ErrorCode;
import com.khiem.book.mapper.BookMapper;
import com.khiem.book.repository.BookRepository;
import com.khiem.book.repository.BookSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookCrudService {
    private final BookRepository repository;
    private final BookMapper mapper;
    private final GoogleBookImportService googleBookImportService;

    @Transactional(readOnly = true)
    public BookDto findById(Long id) {
        return repository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public PageResponse<BookDto> getBooks(String keyword, String category, Pageable pageable) {
        Specification<Book> spec = Specification.where(null);
        
        if (StringUtils.hasText(keyword)) {
            spec = spec.and(BookSpecification.search(keyword));
        }
        if (StringUtils.hasText(category)) {
            spec = spec.and(BookSpecification.hasCategory(category));
        }

        Page<Book> page = repository.findAll(spec, pageable);
        
        return PageResponse.<BookDto>builder()
                .currentPage(page.getNumber() + 1)
                .totalPages(page.getTotalPages())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .data(page.getContent().stream().map(mapper::toDto).toList())
                .build();
    }

    @Transactional
    @CacheEvict(value = "books", allEntries = true)
    public BookDto create(BookDto dto) {
        if (dto.getIsbn() != null && repository.findByIsbn(dto.getIsbn()).isPresent()) {
            throw new AppException(ErrorCode.ISBN_EXISTED);
        }
        Book saved = repository.save(mapper.toEntity(dto));
        return mapper.toDto(saved);
    }

    @Transactional
    @CacheEvict(value = "books", key = "#id")
    public BookDto update(Long id, BookDto dto) {
        Book existing = repository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        
        Book updated = mapper.toEntity(dto);
        updated.setId(existing.getId());
        // Preserve created info if needed, but for now strict update
        Book saved = repository.save(updated);
        return mapper.toDto(saved);
    }

    @Transactional
    @CacheEvict(value = "books", key = "#id")
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new AppException(ErrorCode.BOOK_NOT_FOUND);
        }
        repository.deleteById(id);
    }

    @Transactional
    @CacheEvict(value = "books", allEntries = true)
    public int provision(int count) {
        List<Book> books = IntStream.range(0, count)
                .mapToObj(i -> {
                    Book b = new Book();
                    b.setTitle("Sample Book " + i);
                    b.setAuthor("Author " + i);
                    b.setIsbn(UUID.randomUUID().toString());
                    b.setDescription("Auto provisioned book " + i);
                    b.setCategories(List.of("General"));
                    b.setPublishedAt(LocalDate.now());
                    b.setStatus(com.khiem.book.entity.BookStatus.AVAILABLE);
                    return b;
                })
                .toList();
        repository.saveAll(books);
        return books.size();
    }

    @Transactional
    @CacheEvict(value = "books", allEntries = true)
    public int importExternal(String query, int limit) {
        return googleBookImportService.importBooks(query, limit);
    }

    public Map<String, Object> getStatistics() {
        return Map.of(
            "totalBooks", repository.count(),
            "availableBooks", repository.count((root, query, cb) -> cb.equal(root.get("status"), "AVAILABLE"))
        );
    }

    @Cacheable(value = "categories")
    public List<String> getCategories() {
        return repository.findDistinctCategories();
    }

    
}
