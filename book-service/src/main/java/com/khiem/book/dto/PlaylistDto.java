package com.khiem.book.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistDto {
    private Long id;

    @NotBlank(message = "Playlist name is required")
    private String name;

    private String description;
    private String userId;
    private Instant createdAt;
    private Instant updatedAt;
    private List<PlaylistBookDto> books;
    private Integer bookCount;
}
