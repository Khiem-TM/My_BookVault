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

        // Check if user already has an active or pending borrow for this book
        const activeTransaction = await this.transactionRepository.findOne({
            where: [
                { userId, bookId, status: TransactionStatus.ACTIVE },
                { userId, bookId, status: TransactionStatus.PENDING }
            ]
        });

        if (activeTransaction) {
            throw new Error("User already has this book borrowed or pending approval");
        }

        // Create transaction
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + days);

        const transaction = this.transactionRepository.create({
            userId,
            bookId,
            borrowDate: new Date(),
            dueDate,
            status: TransactionStatus.PENDING
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

    async getAllTransactions(): Promise<Transaction[]> {
        return await this.transactionRepository.find({
            relations: ["book"],
            order: { createdAt: "DESC" }
        });
    }

    async approveTransaction(id: number): Promise<Transaction> {
        const transaction = await this.transactionRepository.findOne({ where: { id } });
        if (!transaction) throw new Error("Transaction not found");
        
        if (transaction.status !== TransactionStatus.PENDING) {
            throw new Error("Transaction is not pending");
        }

        transaction.status = TransactionStatus.ACTIVE;
        return await this.transactionRepository.save(transaction);
    }

    async rejectTransaction(id: number): Promise<void> {
        const transaction = await this.transactionRepository.findOne({ where: { id }, relations: ["book"] });
        if (!transaction) throw new Error("Transaction not found");

        // If pending, we can reject (and restore stock)
        // If active, we might not want to reject easily, but let's allow it for admin power (treat as cancel)
        
        const book = transaction.book;
        
        // Restore stock
        if (book) {
            book.availableQuantity += 1;
            if (book.status === BookStatus.OUT_OF_STOCK) {
                book.status = BookStatus.AVAILABLE;
            }
        }

        transaction.status = TransactionStatus.REJECTED;

        await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
            if (book) {
                await transactionalEntityManager.save(book);
            }
            // await transactionalEntityManager.save(transaction); // Save as REJECTED
            // Or delete? The prompt implies "View... and approve". If rejected, maybe we keep it or delete it.
            // Frontend 'reject' uses DELETE method, implying removal. 
            // Let's delete it for now to keep it simple and clean for "requests".
             await transactionalEntityManager.remove(transaction);
        });
    }
    async countTransactions(): Promise<number> {
        return await this.transactionRepository.count();
    }

    async countActiveBorrows(): Promise<number> {
        return await this.transactionRepository.count({
            where: { status: TransactionStatus.ACTIVE }
        });
    }
}
