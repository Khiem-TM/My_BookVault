import { Request, Response } from "express";
import { PlaylistService } from "../services/PlaylistService";
import { z } from "zod";
import { successResponse, errorResponse } from "../utils/response";

import { TransactionService } from "../services/TransactionService";

const playlistService = new PlaylistService();
const transactionService = new TransactionService();

const createPlaylistSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    isPublic: z.boolean().optional().default(false)
});

const updatePlaylistSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    isPublic: z.boolean().optional()
});

const addBookSchema = z.object({
    bookId: z.number().int().positive()
});

export class PlaylistController {

    async createPlaylist(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id || "system";
            const validatedData = createPlaylistSchema.parse(req.body);

            const playlist = await playlistService.createPlaylist(
                userId,
                validatedData.name,
                validatedData.description,
                validatedData.isPublic
            );
            res.status(201).json(successResponse(playlist));
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json(errorResponse("Validation Error", 400));
            } else {
                res.status(500).json(errorResponse("Internal Server Error"));
            }
        }
    }

    async addBook(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id || "system";
            const playlistId = parseInt(req.params.id);
            
            // Try to get bookId from params first (client style), then body
            let bookId: number;
            if (req.params.bookId) {
                bookId = parseInt(req.params.bookId);
            } else {
                const body = addBookSchema.parse(req.body);
                bookId = body.bookId;
            }

            const result = await playlistService.addBookToPlaylist(userId, playlistId, bookId);
            res.status(201).json(successResponse(result));
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json(errorResponse("Validation Error", 400));
            } else if (error.message === "Playlist not found") {
                res.status(404).json(errorResponse(error.message, 404));
            } else if (error.message === "Unauthorized") {
                res.status(403).json(errorResponse(error.message, 403));
            } else if (error.message === "Book not found") {
                res.status(404).json(errorResponse(error.message, 404));
            } else if (error.message === "Book already in playlist") {
                res.status(409).json(errorResponse(error.message, 409));
            } else {
                res.status(500).json(errorResponse("Internal Server Error"));
            }
        }
    }

    async removeBook(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id || "system";
            const playlistId = parseInt(req.params.id);
            const bookId = parseInt(req.params.bookId);

            const success = await playlistService.removeBookFromPlaylist(userId, playlistId, bookId);
            if (!success) {
                return res.status(404).json(errorResponse("Book not found in playlist", 404));
            }
            res.status(204).send();
        } catch (error: any) {
            if (error.message === "Playlist not found") {
                res.status(404).json(errorResponse(error.message, 404));
            } else if (error.message === "Unauthorized") {
                res.status(403).json(errorResponse(error.message, 403));
            } else {
                res.status(500).json(errorResponse("Internal Server Error"));
            }
        }
    }

    async getMyPlaylists(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id || "system";
            const playlists = await playlistService.getMyPlaylists(userId);
            res.json(successResponse(playlists));
        } catch (error) {
            res.status(500).json(errorResponse("Internal Server Error"));
        }
    }

    async getPlaylistById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                 return res.status(400).json(errorResponse("Invalid Playlist ID", 400));
            }
            const playlist = await playlistService.getPlaylistById(id);
            
            if (!playlist) {
                return res.status(404).json(errorResponse("Playlist not found", 404));
            }
            
            res.json(successResponse(playlist));
        } catch (error) {
            res.status(500).json(errorResponse("Internal Server Error"));
        }
    }

    async getMyBooks(req: Request, res: Response) {
         try {
            const userId = (req as any).user?.id || "system";
            // Get books from transactions (borrowed)
            // Ideally we also want purchased books if we had order service connected. 
            // For now, rely on active transactions or all transactions history? 
            // Usually "My Books" implies current possession.
            // But let's return all books ever interacted with or just active?
            // "toàn bộ sách cá nhân" -> All personal books.
            
            const transactions = await transactionService.getMyTransactions(userId);
            // Map to books and deduplicate
            const booksMap = new Map();
            transactions.forEach(t => {
                if (t.book) booksMap.set(t.book.id, t.book);
            });
            
            res.json(successResponse(Array.from(booksMap.values())));
        } catch (error) {
            console.error(error);
            res.status(500).json(errorResponse("Internal Server Error"));
        }
    }

    async updatePlaylist(req: Request, res: Response) {
        // Implement update logic if service supports it
        // For now just return 501 Not Implemented or basic success mock
        // Since we didn't add update method to service yet, let's skip or add simple one.
        res.status(501).json(errorResponse("Not Implemented", 501));
    }

    async deletePlaylist(req: Request, res: Response) {
         // Implement delete
         res.status(501).json(errorResponse("Not Implemented", 501));
    }
}
