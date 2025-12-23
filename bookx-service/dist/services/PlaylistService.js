"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaylistService = void 0;
const data_source_1 = require("../config/data-source");
const Playlist_entity_1 = require("../entities/Playlist.entity");
const PlaylistBook_entity_1 = require("../entities/PlaylistBook.entity");
const Book_entity_1 = require("../entities/Book.entity");
class PlaylistService {
    constructor() {
        this.playlistRepository = data_source_1.AppDataSource.getRepository(Playlist_entity_1.Playlist);
        this.playlistBookRepository = data_source_1.AppDataSource.getRepository(PlaylistBook_entity_1.PlaylistBook);
        this.bookRepository = data_source_1.AppDataSource.getRepository(Book_entity_1.Book);
    }
    createPlaylist(userId_1, name_1, description_1) {
        return __awaiter(this, arguments, void 0, function* (userId, name, description, isPublic = false) {
            const playlist = this.playlistRepository.create({
                userId,
                name,
                description,
                isPublic
            });
            return yield this.playlistRepository.save(playlist);
        });
    }
    addBookToPlaylist(userId, playlistId, bookId) {
        return __awaiter(this, void 0, void 0, function* () {
            const playlist = yield this.playlistRepository.findOneBy({ id: playlistId });
            if (!playlist) {
                throw new Error("Playlist not found");
            }
            if (playlist.userId !== userId) {
                throw new Error("Unauthorized");
            }
            const book = yield this.bookRepository.findOneBy({ id: bookId });
            if (!book) {
                throw new Error("Book not found");
            }
            // Check if book already in playlist
            const existing = yield this.playlistBookRepository.findOne({
                where: { playlistId, bookId }
            });
            if (existing) {
                throw new Error("Book already in playlist");
            }
            // Determine position (append to end)
            const count = yield this.playlistBookRepository.count({ where: { playlistId } });
            const playlistBook = this.playlistBookRepository.create({
                playlistId,
                bookId,
                position: count + 1
            });
            return yield this.playlistBookRepository.save(playlistBook);
        });
    }
    removeBookFromPlaylist(userId, playlistId, bookId) {
        return __awaiter(this, void 0, void 0, function* () {
            const playlist = yield this.playlistRepository.findOneBy({ id: playlistId });
            if (!playlist) {
                throw new Error("Playlist not found");
            }
            if (playlist.userId !== userId) {
                throw new Error("Unauthorized");
            }
            const playlistBook = yield this.playlistBookRepository.findOne({
                where: { playlistId, bookId }
            });
            if (!playlistBook) {
                return false;
            }
            yield this.playlistBookRepository.remove(playlistBook);
            return true;
        });
    }
    getMyPlaylists(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.playlistRepository.find({
                where: { userId },
                order: { createdAt: "DESC" }
            });
        });
    }
    getPlaylistById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.playlistRepository.findOne({
                where: { id },
                relations: ["books", "books.book"]
            });
        });
    }
    getPublicPlaylists(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const [playlists, total] = yield this.playlistRepository.findAndCount({
                where: { isPublic: true },
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: "DESC" }
            });
            return { playlists, total };
        });
    }
}
exports.PlaylistService = PlaylistService;
