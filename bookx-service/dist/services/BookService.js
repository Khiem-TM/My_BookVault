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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookService = void 0;
const data_source_1 = require("../config/data-source");
const Book_entity_1 = require("../entities/Book.entity");
const axios_1 = __importDefault(require("axios"));
const typeorm_1 = require("typeorm");
const redis_1 = __importDefault(require("../config/redis"));
class BookService {
    constructor() {
        this.bookRepository = data_source_1.AppDataSource.getRepository(Book_entity_1.Book);
    }
    createBook(bookData, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const book = this.bookRepository.create(Object.assign(Object.assign({}, bookData), { createdBy: userId, updatedBy: userId }));
            return yield this.bookRepository.save(book);
        });
    }
    getAllBooks() {
        return __awaiter(this, arguments, void 0, function* (page = 0, limit = 10, filters = {}) {
            // Cache key should include filters? Yes.
            const cacheKey = `books:page:${page}:limit:${limit}:filters:${JSON.stringify(filters)}`;
            try {
                if (redis_1.default.isOpen) {
                    const cached = yield redis_1.default.get(cacheKey);
                    if (cached) {
                        return JSON.parse(cached);
                    }
                }
            }
            catch (err) {
                console.error("Redis get error:", err);
            }
            const where = [];
            if (filters.keyword) {
                // Keyword searches across title, author, isbn
                const keyword = `%${filters.keyword}%`;
                where.push({ title: (0, typeorm_1.Like)(keyword) });
                where.push({ author: (0, typeorm_1.Like)(keyword) });
                where.push({ isbn: (0, typeorm_1.Like)(keyword) });
            }
            else {
                // If no keyword, use specific filters combined
                const condition = {};
                if (filters.author)
                    condition.author = (0, typeorm_1.Like)(`%${filters.author}%`);
                if (filters.category)
                    condition.categories = (0, typeorm_1.Like)(`%${filters.category}%`); // simple-array string text search
                if (filters.status)
                    condition.status = filters.status;
                if (Object.keys(condition).length > 0) {
                    where.push(condition);
                }
            }
            // If keyword AND other filters are present, the above logic separates them (OR vs AND).
            // Requirement: usually "keyword" implies generic search. "filters" imply refined search.
            // If keyword is present, TypeORM generic 'OR' logic for title/author/isbn makes it hard to combine with AND Status.
            // Simple approach: If keyword is present, apply keyword ORs. Re-apply Status/Category if needed?
            // TypeORM: [ { title: Like(...) }, { author: Like(...) } ] is (title OR author).
            // If we want (title OR author) AND status=AVAILABLE:
            // [ { title: Like(...), status: ... }, { author: Like(...), status: ... } ]
            let finalWhere = where;
            if (filters.keyword) {
                const keyword = `%${filters.keyword}%`;
                const keywordConditions = [
                    { title: (0, typeorm_1.Like)(keyword) },
                    { author: (0, typeorm_1.Like)(keyword) },
                    { isbn: (0, typeorm_1.Like)(keyword) }
                ];
                // Apply other filters to EACH keyword condition
                finalWhere = keywordConditions.map(cond => (Object.assign(Object.assign(Object.assign(Object.assign({}, cond), (filters.category ? { categories: (0, typeorm_1.Like)(`%${filters.category}%`) } : {})), (filters.status ? { status: filters.status } : {})), (filters.author ? { author: (0, typeorm_1.Like)(`%${filters.author}%`) } : {}))));
            }
            else {
                // No keyword, just AND logic
                const condition = {};
                if (filters.author)
                    condition.author = (0, typeorm_1.Like)(`%${filters.author}%`);
                if (filters.category)
                    condition.categories = (0, typeorm_1.Like)(`%${filters.category}%`);
                if (filters.status)
                    condition.status = filters.status;
                finalWhere = condition;
            }
            const [books, total] = yield this.bookRepository.findAndCount({
                where: finalWhere,
                skip: page * limit,
                take: limit,
                order: { createdAt: "DESC" }
            });
            const result = { books, total };
            try {
                if (redis_1.default.isOpen) {
                    yield redis_1.default.setEx(cacheKey, 60, JSON.stringify(result)); // Cache for 60 seconds
                }
            }
            catch (err) {
                console.error("Redis set error:", err);
            }
            return result;
        });
    }
    getBookById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.bookRepository.findOneBy({ id });
        });
    }
    updateBook(id, bookData, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const book = yield this.bookRepository.findOneBy({ id });
            if (!book)
                return null;
            Object.assign(book, bookData);
            book.updatedBy = userId;
            return yield this.bookRepository.save(book);
        });
    }
    deleteBook(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.bookRepository.delete(id);
            return result.affected !== 0;
        });
    }
    importFromGoogleBooks(query, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const response = yield axios_1.default.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
                const items = response.data.items || [];
                const importedBooks = [];
                for (const item of items) {
                    const info = item.volumeInfo;
                    const book = new Book_entity_1.Book();
                    book.title = info.title || "Unknown Title";
                    book.author = info.authors ? info.authors.join(", ") : "Unknown Author";
                    book.description = info.description;
                    book.isbn = (_b = (_a = info.industryIdentifiers) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.identifier;
                    book.publisher = info.publisher;
                    book.publishedAt = info.publishedDate ? new Date(info.publishedDate) : undefined;
                    book.pageCount = info.pageCount;
                    book.thumbnailUrl = (_c = info.imageLinks) === null || _c === void 0 ? void 0 : _c.thumbnail;
                    book.language = info.language;
                    book.categories = info.categories;
                    book.status = Book_entity_1.BookStatus.AVAILABLE;
                    book.bookType = Book_entity_1.BookType.PHYSICAL_BOOK; // Default
                    book.totalQuantity = 1;
                    book.availableQuantity = 1;
                    book.createdBy = userId;
                    book.updatedBy = userId;
                    const saved = yield this.bookRepository.save(book);
                    importedBooks.push(saved);
                }
                return importedBooks;
            }
            catch (error) {
                console.error("Error importing from Google Books:", error);
                throw new Error("Failed to import books");
            }
        });
    }
    getBookCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            const books = yield this.bookRepository.find({
                select: {
                    id: true,
                    categories: true
                }
            });
            const allCategories = books.flatMap(b => b.categories || []);
            // Check if categories are strings (some might be null/undefined if database is dirty)
            const validCategories = allCategories.filter(c => typeof c === 'string' && c.trim() !== '');
            return Array.from(new Set(validCategories)).sort();
        });
    }
}
exports.BookService = BookService;
