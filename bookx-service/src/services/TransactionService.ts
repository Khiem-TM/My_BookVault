import { AppDataSource } from "../config/data-source";
import { Transaction, TransactionStatus } from "../entities/Transaction.entity";
import { Book, BookStatus } from "../entities/Book.entity";
import { Repository } from "typeorm";

export class TransactionService {
    private transactionRepository: Repository<Transaction>;
    private bookRepository: Repository<Book>;

    constructor() {
        this.transactionRepository = AppDataSource.getRepository(Transaction);
        this.bookRepository = AppDataSource.getRepository(Book);
    }

    async borrowBook(userId: string, bookId: number, days: number = 14): Promise<Transaction> {
        const book = await this.bookRepository.findOneBy({ id: bookId });
        
        if (!book) {
            throw new Error("Book not found");
        }

        if (book.availableQuantity <= 0 || book.status !== BookStatus.AVAILABLE) {
            throw new Error("Book is not available for borrowing");
        }

        // Check if user already has an active borrow for this book (optional, but good practice)
        const activeTransaction = await this.transactionRepository.findOne({
            where: {
                userId,
                bookId,
                status: TransactionStatus.ACTIVE
            }
        });

        if (activeTransaction) {
            throw new Error("User already has this book borrowed");
        }

        // Create transaction
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + days);

        const transaction = this.transactionRepository.create({
            userId,
            bookId,
            borrowDate: new Date(),
            dueDate,
            status: TransactionStatus.ACTIVE
        });

        // Update book inventory
        book.availableQuantity -= 1;
        if (book.availableQuantity === 0) {
            book.status = BookStatus.OUT_OF_STOCK;
        }

        // Execute in transaction to ensure consistency
        return await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.save(book);
            return await transactionalEntityManager.save(transaction);
        });
    }

    async returnBook(userId: string, transactionId: number): Promise<Transaction> {
        const transaction = await this.transactionRepository.findOne({
            where: { id: transactionId },
            relations: ["book"]
        });

        if (!transaction) {
            throw new Error("Transaction not found");
        }

        if (transaction.userId !== userId) {
            throw new Error("Unauthorized to return this transaction");
        }

        if (transaction.status !== TransactionStatus.ACTIVE) {
            throw new Error("Transaction is already closed");
        }

        const now = new Date();
        transaction.returnDate = now;
        
        if (transaction.dueDate && now > transaction.dueDate) {
            transaction.status = TransactionStatus.RETURNED_OVERDUE;
        } else {
            transaction.status = TransactionStatus.RETURNED;
        }

        // Update book inventory
        const book = transaction.book;
        if (book) {
            book.availableQuantity += 1;
            if (book.status === BookStatus.OUT_OF_STOCK) {
                book.status = BookStatus.AVAILABLE;
            }
        }

        return await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
            if (book) {
                await transactionalEntityManager.save(book);
            }
            return await transactionalEntityManager.save(transaction);
        });
    }

    async getMyTransactions(userId: string): Promise<Transaction[]> {
        return await this.transactionRepository.find({
            where: { userId },
            relations: ["book"],
            order: { createdAt: "DESC" }
        });
    }
}
