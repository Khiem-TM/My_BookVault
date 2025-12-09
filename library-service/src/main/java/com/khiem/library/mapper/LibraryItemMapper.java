package com.khiem.library.mapper;

import com.khiem.library.dto.LibraryItemDto;
import com.khiem.library.entity.LibraryItem;
import org.springframework.stereotype.Component;

@Component
public class LibraryItemMapper {
    public LibraryItemDto toDto(LibraryItem item) {
        if (item == null) return null;
        LibraryItemDto dto = new LibraryItemDto();
        dto.setId(item.getId());
        dto.setUserId(item.getUserId());
        dto.setBookId(item.getBookId());
        dto.setShelf(item.getShelf());
        dto.setCreatedAt(item.getCreatedAt());
        return dto;
    }

    public LibraryItem toEntity(LibraryItemDto dto) {
        if (dto == null) return null;
        LibraryItem item = new LibraryItem();
        item.setId(dto.getId());
        item.setUserId(dto.getUserId());
        item.setBookId(dto.getBookId());
        item.setShelf(dto.getShelf());
        item.setCreatedAt(dto.getCreatedAt());
        return item;
    }
}
