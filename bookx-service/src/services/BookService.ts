import { AppDataSource } from "../config/data-source";
import { Book, BookStatus, BookType } from "../entities/Book.entity";
import axios from "axios";
import { Repository, Like, FindOptionsWhere } from "typeorm";
import redisClient from "../config/redis";

export interface BookFilters {
    keyword?: string;
    category?: string;
    author?: string;
    status?: BookStatus;
}

export class BookService {
    private bookRepository: Repository<Book>;

    constructor() {
        this.bookRepository = AppDataSource.getRepository(Book);
    }

    async createBook(bookData: Partial<Book>, userId: string): Promise<Book> {
        const book = this.bookRepository.create({
            ...bookData,
            createdBy: userId,
            updatedBy: userId
        });
        return await this.bookRepository.save(book);
    }

    async getAllBooks(page: number = 0, limit: number = 10, filters: BookFilters = {}): Promise<{ books: Book[], total: number }> {
        // Cache key should include filters? Yes.
        const cacheKey = `books:page:${page}:limit:${limit}:filters:${JSON.stringify(filters)}`;
        
        try {
            if (redisClient.isOpen) {
                const cached = await redisClient.get(cacheKey);
                if (cached) {
                    return JSON.parse(cached);
                }
            }
        } catch (err) {
            console.error("Redis get error:", err);
        }

        const where: FindOptionsWhere<Book> | FindOptionsWhere<Book>[] = [];

        if (filters.keyword) {
            // Keyword searches across title, author, isbn
            const keyword = `%${filters.keyword}%`;
            where.push({ title: Like(keyword) });
            where.push({ author: Like(keyword) });
            where.push({ isbn: Like(keyword) });
        } else {
            // If no keyword, use specific filters combined
            const condition: FindOptionsWhere<Book> = {};
            if (filters.author) condition.author = Like(`%${filters.author}%`);
            if (filters.category) condition.categories = Like(`%${filters.category}%`); // simple-array string text search
            if (filters.status) condition.status = filters.status;
            
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
        
        let finalWhere: FindOptionsWhere<Book> | FindOptionsWhere<Book>[] = where;

        if (filters.keyword) {
             const keyword = `%${filters.keyword}%`;
             const keywordConditions = [
                { title: Like(keyword) },
                { author: Like(keyword) },
                { isbn: Like(keyword) }
             ];
             
             // Apply other filters to EACH keyword condition
             finalWhere = keywordConditions.map(cond => ({
                 ...cond,
                 ...(filters.category ? { categories: Like(`%${filters.category}%`) } : {}),
                 ...(filters.status ? { status: filters.status } : {}),
                  // Author filter might conflict with keyword author, but generally keyword overrides specific author field unless we want both.
                  // Assume 'filters' structure implies AND.
                  ...(filters.author ? { author: Like(`%${filters.author}%`) } : {})
             }));
        } else {
             // No keyword, just AND logic
             const condition: FindOptionsWhere<Book> = {};
             if (filters.author) condition.author = Like(`%${filters.author}%`);
            if (filters.category) condition.categories = Like(`%${filters.category}%`);
            if (filters.status) condition.status = filters.status;
            finalWhere = condition;
        }

        const [books, total] = await this.bookRepository.findAndCount({
            where: finalWhere,
            skip: page * limit,
            take: limit,
            order: { createdAt: "DESC" }
        });
        
        const result = { books, total };

        try {
            if (redisClient.isOpen) {
                await redisClient.setEx(cacheKey, 60, JSON.stringify(result)); // Cache for 60 seconds
            }
        } catch (err) {
            console.error("Redis set error:", err);
        }

        return result;
    }

    async getBookById(id: number): Promise<Book | null> {
        return await this.bookRepository.findOneBy({ id });
    }

    async updateBook(id: number, bookData: Partial<Book>, userId: string): Promise<Book | null> {
        const book = await this.bookRepository.findOneBy({ id });
        if (!book) return null;

        Object.assign(book, bookData);
        book.updatedBy = userId;
        return await this.bookRepository.save(book);
    }

    async deleteBook(id: number): Promise<boolean> {
        const result = await this.bookRepository.delete(id);
        return result.affected !== 0;
    }

    async importFromGoogleBooks(query: string, userId: string): Promise<Book[]> {
        try {
            const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
            const items = response.data.items || [];
            
            const importedBooks: Book[] = [];

            for (const item of items) {
                const info = item.volumeInfo;
                const book = new Book();
                book.title = info.title || "Unknown Title";
                book.author = info.authors ? info.authors.join(", ") : "Unknown Author";
                book.description = info.description;
                book.isbn = info.industryIdentifiers?.[0]?.identifier;
                book.publisher = info.publisher;
                book.publishedAt = info.publishedDate ? new Date(info.publishedDate) : undefined;
                book.pageCount = info.pageCount;
                book.thumbnailUrl = info.imageLinks?.thumbnail;
                book.language = info.language;
                book.categories = info.categories;
                book.status = BookStatus.AVAILABLE;
                book.bookType = BookType.PHYSICAL_BOOK; // Default
                book.totalQuantity = 1;
                book.availableQuantity = 1;
                book.createdBy = userId;
                book.updatedBy = userId;

                const saved = await this.bookRepository.save(book);
                importedBooks.push(saved);
            }
            return importedBooks;
        } catch (error) {
            console.error("Error importing from Google Books:", error);
            throw new Error("Failed to import books");
        }
    }
    async getBookCategories(): Promise<string[]> {
        const books = await this.bookRepository.find({ 
            select: {
                id: true,
                categories: true
            }
        });
        const allCategories = books.flatMap(b => b.categories || []);
        // Check if categories are strings (some might be null/undefined if database is dirty)
        const validCategories = allCategories.filter(c => typeof c === 'string' && c.trim() !== '');
        return Array.from(new Set(validCategories)).sort();
    }

    async countBooks(): Promise<number> {
        return await this.bookRepository.count();
    }
}
