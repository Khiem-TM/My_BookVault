import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Playlist } from "./Playlist.entity";
import { Book } from "./Book.entity";

@Entity("playlist_books")
export class PlaylistBook {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id!: number;

    @Column({ type: "bigint" })
    playlistId!: number;

    @Column({ type: "bigint" })
    bookId!: number;

    @ManyToOne(() => Playlist, playlist => playlist.books, { onDelete: "CASCADE" })
    @JoinColumn({ name: "playlistId" })
    playlist!: Playlist;

    @ManyToOne(() => Book, { onDelete: "CASCADE" })
    @JoinColumn({ name: "bookId" })
    book!: Book;

    @Column("int")
    position!: number;

    @CreateDateColumn()
    addedAt!: Date;
}
