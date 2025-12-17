package com.khiem.book.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "playlist_books", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"playlist_id", "book_id"})
})
public class PlaylistBook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id", nullable = false)
    private Playlist playlist;

    @Column(nullable = false)
    private Long bookId;

    @Column(nullable = false)
    private Integer position;

    @Column(nullable = false)
    private Instant addedAt;

    // Constructors
    public PlaylistBook() {}

    public PlaylistBook(Playlist playlist, Long bookId, Integer position) {
        this.playlist = playlist;
        this.bookId = bookId;
        this.position = position;
        this.addedAt = Instant.now();
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Playlist getPlaylist() { return playlist; }
    public void setPlaylist(Playlist playlist) { this.playlist = playlist; }

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public Instant getAddedAt() { return addedAt; }
    public void setAddedAt(Instant addedAt) { this.addedAt = addedAt; }
}
