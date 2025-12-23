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
exports.TransactionService = void 0;
const data_source_1 = require("../config/data-source");
const Transaction_entity_1 = require("../entities/Transaction.entity");
const Book_entity_1 = require("../entities/Book.entity");
class TransactionService {
    constructor() {
        this.transactionRepository = data_source_1.AppDataSource.getRepository(Transaction_entity_1.Transaction);
        this.bookRepository = data_source_1.AppDataSource.getRepository(Book_entity_1.Book);
    }
    borrowBook(userId_1, bookId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, bookId, days = 14) {
            const book = yield this.bookRepository.findOneBy({ id: bookId });
            if (!book) {
                throw new Error("Book not found");
            }
            if (book.availableQuantity <= 0 || book.status !== Book_entity_1.BookStatus.AVAILABLE) {
                throw new Error("Book is not available for borrowing");
            }
            // Check if user already has an active borrow for this book (optional, but good practice)
            const activeTransaction = yield this.transactionRepository.findOne({
                where: {
                    userId,
                    bookId,
                    status: Transaction_entity_1.TransactionStatus.ACTIVE
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
                status: Transaction_entity_1.TransactionStatus.ACTIVE
            });
            // Update book inventory
            book.availableQuantity -= 1;
            if (book.availableQuantity === 0) {
                book.status = Book_entity_1.BookStatus.OUT_OF_STOCK;
            }
            // Execute in transaction to ensure consistency
            return yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                yield transactionalEntityManager.save(book);
                return yield transactionalEntityManager.save(transaction);
            }));
        });
    }
    returnBook(userId, transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield this.transactionRepository.findOne({
                where: { id: transactionId },
                relations: ["book"]
            });
            if (!transaction) {
                throw new Error("Transaction not found");
            }
            if (transaction.userId !== userId) {
                throw new Error("Unauthorized to return this transaction");
            }
            if (transaction.status !== Transaction_entity_1.TransactionStatus.ACTIVE) {
                throw new Error("Transaction is already closed");
            }
            const now = new Date();
            transaction.returnDate = now;
            if (transaction.dueDate && now > transaction.dueDate) {
                transaction.status = Transaction_entity_1.TransactionStatus.RETURNED_OVERDUE;
            }
            else {
                transaction.status = Transaction_entity_1.TransactionStatus.RETURNED;
            }
            // Update book inventory
            const book = transaction.book;
            if (book) {
                book.availableQuantity += 1;
                if (book.status === Book_entity_1.BookStatus.OUT_OF_STOCK) {
                    book.status = Book_entity_1.BookStatus.AVAILABLE;
                }
            }
            return yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                if (book) {
                    yield transactionalEntityManager.save(book);
                }
                return yield transactionalEntityManager.save(transaction);
            }));
        });
    }
    getMyTransactions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.transactionRepository.find({
                where: { userId },
                relations: ["book"],
                order: { createdAt: "DESC" }
            });
        });
    }
}
exports.TransactionService = TransactionService;
