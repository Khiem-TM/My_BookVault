package com.khiem.book.controller;

import com.khiem.book.dto.PlaylistDto;
import com.khiem.book.service.PlaylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/playlists")
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;

    /**
     * GET /playlists - Lấy tất cả playlists của user hiện tại
     */
    @GetMapping
    public ResponseEntity<List<PlaylistDto>> getUserPlaylists(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(playlistService.getUserPlaylists(userId));
    }

    /**
     * GET /playlists/{id} - Lấy chi tiết một playlist
     */
    @GetMapping("/{id}")
    public ResponseEntity<PlaylistDto> getPlaylistDetail(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(playlistService.getPlaylistDetail(id, userId));
    }

    /**
     * POST /playlists - Tạo playlist mới
     */
    @PostMapping
    public ResponseEntity<PlaylistDto> createPlaylist(
            @Valid @RequestBody PlaylistDto dto,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(playlistService.createPlaylist(userId, dto));
    }

    /**
     * PUT /playlists/{id} - Cập nhật playlist
     */
    @PutMapping("/{id}")
    public ResponseEntity<PlaylistDto> updatePlaylist(
            @PathVariable Long id,
            @Valid @RequestBody PlaylistDto dto,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(playlistService.updatePlaylist(id, userId, dto));
    }

    /**
     * DELETE /playlists/{id} - Xóa playlist
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlaylist(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        playlistService.deletePlaylist(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /playlists/{id}/books/{bookId} - Thêm sách vào playlist
     */
    @PostMapping("/{id}/books/{bookId}")
    public ResponseEntity<PlaylistDto> addBookToPlaylist(
            @PathVariable Long id,
            @PathVariable Long bookId,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(playlistService.addBookToPlaylist(id, userId, bookId));
    }

    /**
     * DELETE /playlists/{id}/books/{bookId} - Xóa sách khỏi playlist
     */
    @DeleteMapping("/{id}/books/{bookId}")
    public ResponseEntity<PlaylistDto> removeBookFromPlaylist(
            @PathVariable Long id,
            @PathVariable Long bookId,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(playlistService.removeBookFromPlaylist(id, userId, bookId));
    }

    /**
     * POST /playlists/{id}/reorder - Sắp xếp lại thứ tự sách
     */
    @PostMapping("/{id}/reorder")
    public ResponseEntity<PlaylistDto> reorderPlaylistBooks(
            @PathVariable Long id,
            @Valid @RequestBody List<Long> bookIds,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(playlistService.reorderPlaylistBooks(id, userId, bookIds));
    }
}
