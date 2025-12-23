import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { PlaylistBook } from "./PlaylistBook.entity";

@Entity("playlists")
export class Playlist {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id!: number;

    @Column({ length: 255 })
    name!: string;

    @Column("text", { nullable: true })
    description?: string;

    @Column({ length: 36 })
    userId!: string;

    @Column({ default: false })
    isPublic!: boolean;

    @OneToMany(() => PlaylistBook, playlistBook => playlistBook.playlist)
    books?: PlaylistBook[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
