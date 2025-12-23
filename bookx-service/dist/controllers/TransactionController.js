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
exports.TransactionController = void 0;
const TransactionService_1 = require("../services/TransactionService");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
const transactionService = new TransactionService_1.TransactionService();
const borrowSchema = zod_1.z.object({
    bookId: zod_1.z.number().int().positive(),
    days: zod_1.z.number().int().positive().max(30).optional().default(14)
});
class TransactionController {
    borrowBook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "system";
                const { bookId, days } = borrowSchema.parse(req.body);
                const transaction = yield transactionService.borrowBook(userId, bookId, days);
                res.status(201).json((0, response_1.successResponse)(transaction));
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json((0, response_1.errorResponse)("Validation Error", 400));
                }
                else if (error.message === "Book not found") {
                    res.status(404).json((0, response_1.errorResponse)(error.message, 404));
                }
                else if (error.message === "Book is not available for borrowing" || error.message === "User already has this book borrowed") {
                    res.status(409).json((0, response_1.errorResponse)(error.message, 409));
                }
                else {
                    res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
                }
            }
        });
    }
    returnBook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "system";
                const transactionId = parseInt(req.params.id);
                const transaction = yield transactionService.returnBook(userId, transactionId);
                res.json((0, response_1.successResponse)(transaction));
            }
            catch (error) {
                if (error.message === "Transaction not found") {
                    res.status(404).json((0, response_1.errorResponse)(error.message, 404));
                }
                else if (error.message === "Unauthorized to return this transaction") {
                    res.status(403).json((0, response_1.errorResponse)(error.message, 403));
                }
                else if (error.message === "Transaction is already closed") {
                    res.status(400).json((0, response_1.errorResponse)(error.message, 400));
                }
                else {
                    res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
                }
            }
        });
    }
    getMyTransactions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "system";
                const transactions = yield transactionService.getMyTransactions(userId);
                res.json((0, response_1.successResponse)(transactions));
            }
            catch (error) {
                res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
            }
        });
    }
}
exports.TransactionController = TransactionController;
