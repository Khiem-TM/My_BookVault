import { Request, Response } from "express";
import { BookService, BookFilters } from "../services/BookService";
import { z } from "zod";
import { successResponse, errorResponse } from "../utils/response";
import { BookStatus } from "../entities/Book.entity";

const bookService = new BookService();

// Validation Schemas
const createBookSchema = z.object({
    title: z.string().min(1),
    author: z.string().min(1),
    isbn: z.string().optional(),
    description: z.string().optional(),
    totalQuantity: z.number().int().nonnegative().optional(),
    availableQuantity: z.number().int().nonnegative().optional(),
    price: z.number().nonnegative().optional(),
    rentalPrice: z.number().nonnegative().optional(),
    rentalDurationDays: z.number().int().positive().optional()
});

const updateBookSchema = createBookSchema.partial();

export class BookController {
    
    async createBook(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id || "system"; 
            
            const validatedData = createBookSchema.parse(req.body);
            const book = await bookService.createBook(validatedData, userId);
            res.status(201).json(successResponse(book));
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json(errorResponse("Validation Error", 400));
            } else {
                res.status(500).json(errorResponse("Internal Server Error"));
            }
        }
    }

    async getAllBooks(req: Request, res: Response) {
        try {
            // Frontend uses 0-based indexing for pages
            const page = parseInt(req.query.page as string);
            const pageNumber = isNaN(page) ? 0 : page; 
            
            // Support 'limit' or 'size' (Spring Style)
            let limit = parseInt(req.query.limit as string);
            if (isNaN(limit)) {
                limit = parseInt(req.query.size as string) || 10;
            }

            const filters: BookFilters = {
                keyword: req.query.keyword as string,
                category: req.query.category as string,
                author: req.query.author as string,
                status: req.query.status as BookStatus
            };

            const result = await bookService.getAllBooks(pageNumber, limit, filters);
            
            res.json(successResponse({
                data: result.books,
                currentPage: pageNumber,
                totalPages: Math.ceil(result.total / limit),
                pageSize: limit,
                totalElements: result.total
            }));
        } catch (error) {
            console.error(error);
            res.status(500).json(errorResponse("Internal Server Error"));
        }
    }

    async getBookCategories(req: Request, res: Response) {
        try {
            const categories = await bookService.getBookCategories();
            res.json(successResponse(categories));
        } catch (error) {
            console.error(error);
            res.status(500).json(errorResponse("Internal Server Error"));
        }
    }

    async getBookById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const book = await bookService.getBookById(id);
            if (!book) {
                return res.status(404).json(errorResponse("Book not found", 404));
            }
            res.json(successResponse(book));
        } catch (error) {
            res.status(500).json(errorResponse("Internal Server Error"));
        }
    }

    async updateBook(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const userId = (req as any).user?.id || "system";
            const validatedData = updateBookSchema.parse(req.body);
            
            const updatedBook = await bookService.updateBook(id, validatedData, userId);
            if (!updatedBook) {
                return res.status(404).json(errorResponse("Book not found", 404));
            }
            res.json(successResponse(updatedBook));
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json(errorResponse("Validation Error", 400));
            } else {
                res.status(500).json(errorResponse("Internal Server Error"));
            }
        }
    }

    async deleteBook(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const success = await bookService.deleteBook(id);
            if (!success) {
                return res.status(404).json(errorResponse("Book not found", 404));
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json(errorResponse("Internal Server Error"));
        }
    }

    async searchGoogleBooks(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id || "system";
            const query = req.query.q as string;
            if (!query) return res.status(400).json(errorResponse("Query 'q' is required", 400));

            const books = await bookService.importFromGoogleBooks(query, userId);
            res.json(successResponse(books));
        } catch (error) {
            res.status(500).json(errorResponse("Import failed"));
        }
    }
}
