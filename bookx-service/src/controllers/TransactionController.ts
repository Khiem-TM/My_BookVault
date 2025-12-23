import { Request, Response } from "express";
import { TransactionService } from "../services/TransactionService";
import { z } from "zod";
import { successResponse, errorResponse } from "../utils/response";

const transactionService = new TransactionService();

const borrowSchema = z.object({
    bookId: z.number().int().positive(),
    days: z.number().int().positive().max(30).optional().default(14)
});

export class TransactionController {
    
    async borrowBook(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id || "system";
            const { bookId, days } = borrowSchema.parse(req.body);

            const transaction = await transactionService.borrowBook(userId, bookId, days);
            res.status(201).json(successResponse(transaction));
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json(errorResponse("Validation Error", 400));
            } else if (error.message === "Book not found") {
                res.status(404).json(errorResponse(error.message, 404));
            } else if (error.message === "Book is not available for borrowing" || error.message === "User already has this book borrowed") {
                res.status(409).json(errorResponse(error.message, 409));
            } else {
                res.status(500).json(errorResponse("Internal Server Error"));
            }
        }
    }

    async returnBook(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id || "system";
            const transactionId = parseInt(req.params.id);

            const transaction = await transactionService.returnBook(userId, transactionId);
            res.json(successResponse(transaction));
        } catch (error: any) {
            if (error.message === "Transaction not found") {
                res.status(404).json(errorResponse(error.message, 404));
            } else if (error.message === "Unauthorized to return this transaction") {
                res.status(403).json(errorResponse(error.message, 403));
            } else if (error.message === "Transaction is already closed") {
                res.status(400).json(errorResponse(error.message, 400));
            } else {
                res.status(500).json(errorResponse("Internal Server Error"));
            }
        }
    }

    async getMyTransactions(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id || "system";
            const transactions = await transactionService.getMyTransactions(userId);
            res.json(successResponse(transactions));
        } catch (error) {
            res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
}
