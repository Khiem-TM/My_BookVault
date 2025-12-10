package com.khiem.library.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistBookDto {
    private Long id;
    private Long bookId;
    private Integer position;
    private Instant addedAt;
    // Additional book info can be fetched separately
    private String title;
    private String author;
    private String thumbnailUrl;
}
