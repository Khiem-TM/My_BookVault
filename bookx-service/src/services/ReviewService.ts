import { AppDataSource } from "../config/data-source";
import { Review } from "../entities/Review.entity";
import { Book } from "../entities/Book.entity";
import { Repository } from "typeorm";

export class ReviewService {
    private reviewRepository: Repository<Review>;
    private bookRepository: Repository<Book>;

    constructor() {
        this.reviewRepository = AppDataSource.getRepository(Review);
        this.bookRepository = AppDataSource.getRepository(Book);
    }

    async addReview(bookId: number, userId: string, rating: number, comment?: string, userName?: string): Promise<Review> {
        const book = await this.bookRepository.findOneBy({ id: bookId });
        if (!book) {
            throw new Error("Book not found");
        }

        // Check if user already reviewed
        const existingReview = await this.reviewRepository.findOne({
            where: { bookId, userId }
        });

        if (existingReview) {
            throw new Error("User has already reviewed this book");
        }

        const review = this.reviewRepository.create({
            bookId,
            userId,
            rating,
            comment,
            userName
        });

        const savedReview = await this.reviewRepository.save(review);
        await this.updateBookRating(bookId);
        
        return savedReview;
    }

    async getReviewsByBook(bookId: number, page: number = 1, limit: number = 10): Promise<{ reviews: Review[], total: number }> {
        const [reviews, total] = await this.reviewRepository.findAndCount({
            where: { bookId },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: "DESC" }
        });
        return { reviews, total };
    }

    async deleteReview(reviewId: number, userId: string): Promise<boolean> {
        const review = await this.reviewRepository.findOneBy({ id: reviewId });
        if (!review) return false;

        if (review.userId !== userId) {
            throw new Error("Not authorized to delete this review");
        }

        await this.reviewRepository.remove(review);
        await this.updateBookRating(review.bookId);
        return true;
    }

    private async updateBookRating(bookId: number) {
        const book = await this.bookRepository.findOne({ 
            where: { id: bookId },
            relations: ["reviews"]
        });
        
        if (!book) return;

        // If we didn't load relations, we might need a query builder to aggregate.
        // But let's use query builder for efficiency instead of loading all reviews.
        const { avg, count } = await this.reviewRepository
            .createQueryBuilder("review")
            .select("AVG(review.rating)", "avg")
            .addSelect("COUNT(review.id)", "count")
            .where("review.bookId = :bookId", { bookId })
            .getRawOne();

        book.averageRating = parseFloat(avg) || 0;
        book.ratingsCount = parseInt(count) || 0;

        await this.bookRepository.save(book);
    }
}
