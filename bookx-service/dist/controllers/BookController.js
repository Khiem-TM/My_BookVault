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
exports.BookController = void 0;
const BookService_1 = require("../services/BookService");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
const bookService = new BookService_1.BookService();
// Validation Schemas
const createBookSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    author: zod_1.z.string().min(1),
    isbn: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    totalQuantity: zod_1.z.number().int().nonnegative().optional(),
    availableQuantity: zod_1.z.number().int().nonnegative().optional(),
    price: zod_1.z.number().nonnegative().optional()
});
const updateBookSchema = createBookSchema.partial();
class BookController {
    createBook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "system";
                const validatedData = createBookSchema.parse(req.body);
                const book = yield bookService.createBook(validatedData, userId);
                res.status(201).json((0, response_1.successResponse)(book));
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
    getAllBooks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Frontend uses 0-based indexing for pages
                const page = parseInt(req.query.page);
                const pageNumber = isNaN(page) ? 0 : page;
                // Support 'limit' or 'size' (Spring Style)
                let limit = parseInt(req.query.limit);
                if (isNaN(limit)) {
                    limit = parseInt(req.query.size) || 10;
                }
                const filters = {
                    keyword: req.query.keyword,
                    category: req.query.category,
                    author: req.query.author,
                    status: req.query.status
                };
                const result = yield bookService.getAllBooks(pageNumber, limit, filters);
                res.json((0, response_1.successResponse)({
                    data: result.books,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(result.total / limit),
                    pageSize: limit,
                    totalElements: result.total
                }));
            }
            catch (error) {
                console.error(error);
                res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
            }
        });
    }
    getBookCategories(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield bookService.getBookCategories();
                res.json((0, response_1.successResponse)(categories));
            }
            catch (error) {
                console.error(error);
                res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
            }
        });
    }
    getBookById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const book = yield bookService.getBookById(id);
                if (!book) {
                    return res.status(404).json((0, response_1.errorResponse)("Book not found", 404));
                }
                res.json((0, response_1.successResponse)(book));
            }
            catch (error) {
                res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
            }
        });
    }
    updateBook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = parseInt(req.params.id);
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "system";
                const validatedData = updateBookSchema.parse(req.body);
                const updatedBook = yield bookService.updateBook(id, validatedData, userId);
                if (!updatedBook) {
                    return res.status(404).json((0, response_1.errorResponse)("Book not found", 404));
                }
                res.json((0, response_1.successResponse)(updatedBook));
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
    deleteBook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const success = yield bookService.deleteBook(id);
                if (!success) {
                    return res.status(404).json((0, response_1.errorResponse)("Book not found", 404));
                }
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
            }
        });
    }
    searchGoogleBooks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "system";
                const query = req.query.q;
                if (!query)
                    return res.status(400).json((0, response_1.errorResponse)("Query 'q' is required", 400));
                const books = yield bookService.importFromGoogleBooks(query, userId);
                res.json((0, response_1.successResponse)(books));
            }
            catch (error) {
                res.status(500).json((0, response_1.errorResponse)("Import failed"));
            }
        });
    }
}
exports.BookController = BookController;
