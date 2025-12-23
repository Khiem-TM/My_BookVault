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
exports.PlaylistController = void 0;
const PlaylistService_1 = require("../services/PlaylistService");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
const TransactionService_1 = require("../services/TransactionService");
const playlistService = new PlaylistService_1.PlaylistService();
const transactionService = new TransactionService_1.TransactionService();
const createPlaylistSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    isPublic: zod_1.z.boolean().optional().default(false)
});
const updatePlaylistSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    isPublic: zod_1.z.boolean().optional()
});
const addBookSchema = zod_1.z.object({
    bookId: zod_1.z.number().int().positive()
});
class PlaylistController {
    createPlaylist(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "system";
                const validatedData = createPlaylistSchema.parse(req.body);
                const playlist = yield playlistService.createPlaylist(userId, validatedData.name, validatedData.description, validatedData.isPublic);
                res.status(201).json((0, response_1.successResponse)(playlist));
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json((0, response_1.errorResponse)("Validation Error", 400));
                }
                else {
                    res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
                }
            }
        });
    }
    addBook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "system";
                const playlistId = parseInt(req.params.id);
                // Try to get bookId from params first (client style), then body
                let bookId;
                if (req.params.bookId) {
                    bookId = parseInt(req.params.bookId);
                }
                else {
                    const body = addBookSchema.parse(req.body);
                    bookId = body.bookId;
                }
                const result = yield playlistService.addBookToPlaylist(userId, playlistId, bookId);
                res.status(201).json((0, response_1.successResponse)(result));
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json((0, response_1.errorResponse)("Validation Error", 400));
                }
                else if (error.message === "Playlist not found") {
                    res.status(404).json((0, response_1.errorResponse)(error.message, 404));
                }
                else if (error.message === "Unauthorized") {
                    res.status(403).json((0, response_1.errorResponse)(error.message, 403));
                }
                else if (error.message === "Book not found") {
                    res.status(404).json((0, response_1.errorResponse)(error.message, 404));
                }
                else if (error.message === "Book already in playlist") {
                    res.status(409).json((0, response_1.errorResponse)(error.message, 409));
                }
                else {
                    res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
                }
            }
        });
    }
    removeBook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "system";
                const playlistId = parseInt(req.params.id);
                const bookId = parseInt(req.params.bookId);
                const success = yield playlistService.removeBookFromPlaylist(userId, playlistId, bookId);
                if (!success) {
                    return res.status(404).json((0, response_1.errorResponse)("Book not found in playlist", 404));
                }
                res.status(204).send();
            }
            catch (error) {
                if (error.message === "Playlist not found") {
                    res.status(404).json((0, response_1.errorResponse)(error.message, 404));
                }
                else if (error.message === "Unauthorized") {
                    res.status(403).json((0, response_1.errorResponse)(error.message, 403));
                }
                else {
                    res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
                }
            }
        });
    }
    getMyPlaylists(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "system";
                const playlists = yield playlistService.getMyPlaylists(userId);
                res.json((0, response_1.successResponse)(playlists));
            }
            catch (error) {
                res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
            }
        });
    }
    getPlaylistById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id)) {
                    return res.status(400).json((0, response_1.errorResponse)("Invalid Playlist ID", 400));
                }
                const playlist = yield playlistService.getPlaylistById(id);
                if (!playlist) {
                    return res.status(404).json((0, response_1.errorResponse)("Playlist not found", 404));
                }
                res.json((0, response_1.successResponse)(playlist));
            }
            catch (error) {
                res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
            }
        });
    }
    getMyBooks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "system";
                // Get books from transactions (borrowed)
                // Ideally we also want purchased books if we had order service connected. 
                // For now, rely on active transactions or all transactions history? 
                // Usually "My Books" implies current possession.
                // But let's return all books ever interacted with or just active?
                // "toàn bộ sách cá nhân" -> All personal books.
                const transactions = yield transactionService.getMyTransactions(userId);
                // Map to books and deduplicate
                const booksMap = new Map();
                transactions.forEach(t => {
                    if (t.book)
                        booksMap.set(t.book.id, t.book);
                });
                res.json((0, response_1.successResponse)(Array.from(booksMap.values())));
            }
            catch (error) {
                console.error(error);
                res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
            }
        });
    }
    updatePlaylist(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implement update logic if service supports it
            // For now just return 501 Not Implemented or basic success mock
            // Since we didn't add update method to service yet, let's skip or add simple one.
            res.status(501).json((0, response_1.errorResponse)("Not Implemented", 501));
        });
    }
    deletePlaylist(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implement delete
            res.status(501).json((0, response_1.errorResponse)("Not Implemented", 501));
        });
    }
}
exports.PlaylistController = PlaylistController;
