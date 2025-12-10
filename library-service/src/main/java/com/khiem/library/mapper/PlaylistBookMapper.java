package com.khiem.library.mapper;

import com.khiem.library.dto.PlaylistBookDto;
import com.khiem.library.entity.PlaylistBook;
import org.springframework.stereotype.Component;

@Component
public class PlaylistBookMapper {
    public static final PlaylistBookMapper INSTANCE = new PlaylistBookMapper();

    public PlaylistBookDto toDto(PlaylistBook entity) {
        if (entity == null) return null;

        return PlaylistBookDto.builder()
                .id(entity.getId())
                .bookId(entity.getBookId())
                .position(entity.getPosition())
                .addedAt(entity.getAddedAt())
                .build();
    }

    public PlaylistBook toEntity(PlaylistBookDto dto) {
        if (dto == null) return null;

        PlaylistBook entity = new PlaylistBook();
        entity.setId(dto.getId());
        entity.setBookId(dto.getBookId());
        entity.setPosition(dto.getPosition());
        entity.setAddedAt(dto.getAddedAt());
        return entity;
    }
}
