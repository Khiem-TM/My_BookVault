package com.khiem.book.service;

import com.khiem.book.dto.BookDto;
import com.khiem.book.entity.Book;
import com.khiem.book.mapper.BookMapper;
import com.khiem.book.repository.BookRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookCrudService {
    private final BookRepository repository;
    private final BookMapper mapper;

    @Transactional(readOnly = true)
    public List<BookDto> findAll() {
        return repository.findAll().stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookDto findById(Long id) {
        return repository.findById(id).map(mapper::toDto).orElse(null);
    }

    @Transactional
    public BookDto create(BookDto dto) {
        Book saved = repository.save(mapper.toEntity(dto));
        return mapper.toDto(saved);
    }

    @Transactional
    public BookDto update(Long id, BookDto dto) {
        Book existing = repository.findById(id).orElseThrow();
        Book updated = mapper.toEntity(dto);
        updated.setId(existing.getId());
        Book saved = repository.save(updated);
        return mapper.toDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}

