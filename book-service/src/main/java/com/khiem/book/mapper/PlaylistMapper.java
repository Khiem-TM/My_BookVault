package com.khiem.book.mapper;

import com.khiem.book.dto.PlaylistDto;
import com.khiem.book.entity.Playlist;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.stream.Collectors;

@Component
public class PlaylistMapper {

    public PlaylistDto toDto(Playlist entity) {
        if (entity == null) return null;

        return PlaylistDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .userId(entity.getUserId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .bookCount(entity.getBooks() != null ? entity.getBooks().size() : 0)
                .books(entity.getBooks() != null ? 
                    entity.getBooks().stream()
                        .map(pb -> PlaylistBookMapper.INSTANCE.toDto(pb))
                        .collect(Collectors.toList())
                    : null)
                .build();
    }

    public Playlist toEntity(PlaylistDto dto) {
        if (dto == null) return null;

        Playlist entity = new Playlist();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setUserId(dto.getUserId());
        entity.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : Instant.now());
        entity.setUpdatedAt(Instant.now());
        return entity;
    }
}
