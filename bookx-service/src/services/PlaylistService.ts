import { AppDataSource } from "../config/data-source";
import { Playlist } from "../entities/Playlist.entity";
import { PlaylistBook } from "../entities/PlaylistBook.entity";
import { Book } from "../entities/Book.entity";
import { Repository } from "typeorm";

export class PlaylistService {
    private playlistRepository: Repository<Playlist>;
    private playlistBookRepository: Repository<PlaylistBook>;
    private bookRepository: Repository<Book>;

    constructor() {
        this.playlistRepository = AppDataSource.getRepository(Playlist);
        this.playlistBookRepository = AppDataSource.getRepository(PlaylistBook);
        this.bookRepository = AppDataSource.getRepository(Book);
    }

    async createPlaylist(userId: string, name: string, description?: string, isPublic: boolean = false): Promise<Playlist> {
        const playlist = this.playlistRepository.create({
            userId,
            name,
            description,
            isPublic
        });
        return await this.playlistRepository.save(playlist);
    }

    async addBookToPlaylist(userId: string, playlistId: number, bookId: number): Promise<PlaylistBook> {
        const playlist = await this.playlistRepository.findOneBy({ id: playlistId });
        if (!playlist) {
            throw new Error("Playlist not found");
        }

        if (playlist.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const book = await this.bookRepository.findOneBy({ id: bookId });
        if (!book) {
            throw new Error("Book not found");
        }

        // Check if book already in playlist
        const existing = await this.playlistBookRepository.findOne({
            where: { playlistId, bookId }
        });

        if (existing) {
            throw new Error("Book already in playlist");
        }

        // Determine position (append to end)
        const count = await this.playlistBookRepository.count({ where: { playlistId } });

        const playlistBook = this.playlistBookRepository.create({
            playlistId,
            bookId,
            position: count + 1
        });

        return await this.playlistBookRepository.save(playlistBook);
    }

    async removeBookFromPlaylist(userId: string, playlistId: number, bookId: number): Promise<boolean> {
        const playlist = await this.playlistRepository.findOneBy({ id: playlistId });
        if (!playlist) {
            throw new Error("Playlist not found");
        }

        if (playlist.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const playlistBook = await this.playlistBookRepository.findOne({
            where: { playlistId, bookId }
        });

        if (!playlistBook) {
            return false;
        }

        await this.playlistBookRepository.remove(playlistBook);
        return true;
    }

    async getMyPlaylists(userId: string): Promise<Playlist[]> {
        return await this.playlistRepository.find({
            where: { userId },
            order: { createdAt: "DESC" }
        });
    }

    async getPlaylistById(id: number): Promise<Playlist | null> {
        return await this.playlistRepository.findOne({
            where: { id },
            relations: ["books", "books.book"]
        });
    }

    async getPublicPlaylists(page: number, limit: number): Promise<{ playlists: Playlist[], total: number }> {
        const [playlists, total] = await this.playlistRepository.findAndCount({
            where: { isPublic: true },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: "DESC" }
        });
        return { playlists, total };
    }
}
