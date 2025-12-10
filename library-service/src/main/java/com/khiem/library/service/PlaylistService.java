package com.khiem.library.service;

import com.khiem.library.dto.PlaylistDto;
import com.khiem.library.dto.PlaylistBookDto;
import com.khiem.library.entity.Playlist;
import com.khiem.library.entity.PlaylistBook;
import com.khiem.library.mapper.PlaylistMapper;
import com.khiem.library.repository.PlaylistRepository;
import com.khiem.library.repository.PlaylistBookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistBookRepository playlistBookRepository;
    private final PlaylistMapper playlistMapper;

    /**
     * Lấy tất cả playlists của user
     */
    @Transactional(readOnly = true)
    public List<PlaylistDto> getUserPlaylists(Long userId) {
        log.info("Fetching playlists for user: {}", userId);
        return playlistRepository.findByUserId(userId).stream()
                .map(playlistMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết một playlist
     */
    @Transactional(readOnly = true)
    public PlaylistDto getPlaylistDetail(Long playlistId, Long userId) {
        log.info("Fetching playlist {} for user {}", playlistId, userId);
        return playlistRepository.findByIdAndUserId(playlistId, userId)
                .map(playlistMapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found or unauthorized"));
    }

    /**
     * Tạo playlist mới
     */
    @Transactional
    public PlaylistDto createPlaylist(Long userId, PlaylistDto dto) {
        log.info("Creating playlist for user: {}", userId);
        Playlist playlist = new Playlist(userId, dto.getName());
        playlist.setDescription(dto.getDescription());
        playlist.setCreatedAt(Instant.now());
        playlist.setUpdatedAt(Instant.now());

        Playlist saved = playlistRepository.save(playlist);
        log.info("Playlist created with id: {}", saved.getId());
        return playlistMapper.toDto(saved);
    }

    /**
     * Cập nhật playlist
     */
    @Transactional
    public PlaylistDto updatePlaylist(Long playlistId, Long userId, PlaylistDto dto) {
        log.info("Updating playlist {} for user {}", playlistId, userId);
        Playlist playlist = playlistRepository.findByIdAndUserId(playlistId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found or unauthorized"));

        playlist.setName(dto.getName());
        playlist.setDescription(dto.getDescription());
        playlist.setUpdatedAt(Instant.now());

        Playlist updated = playlistRepository.save(playlist);
        return playlistMapper.toDto(updated);
    }

    /**
     * Xóa playlist
     */
    @Transactional
    public void deletePlaylist(Long playlistId, Long userId) {
        log.info("Deleting playlist {} for user {}", playlistId, userId);
        Playlist playlist = playlistRepository.findByIdAndUserId(playlistId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found or unauthorized"));
        playlistRepository.delete(playlist);
    }

    /**
     * Thêm sách vào playlist
     */
    @Transactional
    public PlaylistDto addBookToPlaylist(Long playlistId, Long userId, Long bookId) {
        log.info("Adding book {} to playlist {} for user {}", bookId, playlistId, userId);

        Playlist playlist = playlistRepository.findByIdAndUserId(playlistId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found or unauthorized"));

        // Check if book already exists
        if (playlistBookRepository.findByPlaylistIdAndBookId(playlistId, bookId).isPresent()) {
            throw new IllegalArgumentException("Book already exists in playlist");
        }

        int position = playlist.getBooks().size();
        PlaylistBook playlistBook = new PlaylistBook(playlist, bookId, position);
        playlistBookRepository.save(playlistBook);
        playlist.getBooks().add(playlistBook);

        playlist.setUpdatedAt(Instant.now());
        Playlist updated = playlistRepository.save(playlist);
        
        log.info("Book added to playlist successfully");
        return playlistMapper.toDto(updated);
    }

    /**
     * Xóa sách khỏi playlist
     */
    @Transactional
    public PlaylistDto removeBookFromPlaylist(Long playlistId, Long userId, Long bookId) {
        log.info("Removing book {} from playlist {} for user {}", bookId, playlistId, userId);

        Playlist playlist = playlistRepository.findByIdAndUserId(playlistId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found or unauthorized"));

        playlistBookRepository.deleteByPlaylistIdAndBookId(playlistId, bookId);
        
        // Reorder positions
        List<PlaylistBook> books = playlistBookRepository.findByPlaylistIdOrderByPosition(playlistId);
        for (int i = 0; i < books.size(); i++) {
            books.get(i).setPosition(i);
            playlistBookRepository.save(books.get(i));
        }

        playlist.setUpdatedAt(Instant.now());
        Playlist updated = playlistRepository.save(playlist);
        
        log.info("Book removed from playlist successfully");
        return playlistMapper.toDto(updated);
    }

    /**
     * Sắp xếp lại vị trí sách trong playlist
     */
    @Transactional
    public PlaylistDto reorderPlaylistBooks(Long playlistId, Long userId, List<Long> bookIds) {
        log.info("Reordering books in playlist {} for user {}", playlistId, userId);

        Playlist playlist = playlistRepository.findByIdAndUserId(playlistId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found or unauthorized"));

        for (int i = 0; i < bookIds.size(); i++) {
            PlaylistBook pb = playlistBookRepository.findByPlaylistIdAndBookId(playlistId, bookIds.get(i))
                    .orElseThrow(() -> new IllegalArgumentException("Book not found in playlist"));
            pb.setPosition(i);
            playlistBookRepository.save(pb);
        }

        playlist.setUpdatedAt(Instant.now());
        Playlist updated = playlistRepository.save(playlist);
        
        log.info("Playlist books reordered successfully");
        return playlistMapper.toDto(updated);
    }
}
