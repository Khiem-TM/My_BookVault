import { Request, Response } from "express";
import { BookService } from "../services/BookService";
import { TransactionService } from "../services/TransactionService";
import { successResponse, errorResponse } from "../utils/response";

const bookService = new BookService();
const transactionService = new TransactionService();

export class StatisticsController {
    
    async getSummaryStats(req: Request, res: Response) {
        try {
            // Count books
            const totalBooks = await bookService.countBooks();
            
            // Count transactions (total borrows)
            const totalBorrows = await transactionService.countTransactions();
            
            // Total Revenue (mock or calculated)
            // For now, let's just count completed orders if we had access, or just paid borrows
            const revenue = 0; // Placeholder until we integrate Order service or calculate from transactions

            // Active Borrows
            const activeBorrows = await transactionService.countActiveBorrows();

            // Total Users (Mock or Service-to-Service call)
            // Ideally call Identity Service, but for now mock or return 0
            const totalUsers = 0; 

            res.json(successResponse({
                totalBooks,
                totalUsers,
                totalBorrows,
                activeBorrows,
                revenue
            }));
        } catch (error) {
            console.error("Stats Error:", error);
            res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
}
