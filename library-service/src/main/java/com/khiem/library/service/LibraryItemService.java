package com.khiem.library.service;

import com.khiem.library.dto.LibraryItemDto;
import com.khiem.library.entity.LibraryItem;
import com.khiem.library.mapper.LibraryItemMapper;
import com.khiem.library.repository.LibraryItemRepository;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LibraryItemService {
    private final LibraryItemRepository repository;
    private final LibraryItemMapper mapper;

    public LibraryItemService(LibraryItemRepository repository, LibraryItemMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<LibraryItemDto> all() {
        return repository.findAll().stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LibraryItemDto one(Long id) {
        return repository.findById(id).map(mapper::toDto).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<LibraryItemDto> byShelf(Long userId, String shelf) {
        return repository.findByUserIdAndShelf(userId, shelf).stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @Transactional
    public LibraryItemDto create(LibraryItemDto dto) {
        LibraryItem entity = mapper.toEntity(dto);
        entity.setCreatedAt(Instant.now());
        return mapper.toDto(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) { repository.deleteById(id); }
}
