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
exports.ReviewService = void 0;
const data_source_1 = require("../config/data-source");
const Review_entity_1 = require("../entities/Review.entity");
const Book_entity_1 = require("../entities/Book.entity");
class ReviewService {
    constructor() {
        this.reviewRepository = data_source_1.AppDataSource.getRepository(Review_entity_1.Review);
        this.bookRepository = data_source_1.AppDataSource.getRepository(Book_entity_1.Book);
    }
    addReview(bookId, userId, rating, comment, userName) {
        return __awaiter(this, void 0, void 0, function* () {
            const book = yield this.bookRepository.findOneBy({ id: bookId });
            if (!book) {
                throw new Error("Book not found");
            }
            // Check if user already reviewed
            const existingReview = yield this.reviewRepository.findOne({
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
            const savedReview = yield this.reviewRepository.save(review);
            yield this.updateBookRating(bookId);
            return savedReview;
        });
    }
    getReviewsByBook(bookId_1) {
        return __awaiter(this, arguments, void 0, function* (bookId, page = 1, limit = 10) {
            const [reviews, total] = yield this.reviewRepository.findAndCount({
                where: { bookId },
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: "DESC" }
            });
            return { reviews, total };
        });
    }
    deleteReview(reviewId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const review = yield this.reviewRepository.findOneBy({ id: reviewId });
            if (!review)
                return false;
            if (review.userId !== userId) {
                throw new Error("Not authorized to delete this review");
            }
            yield this.reviewRepository.remove(review);
            yield this.updateBookRating(review.bookId);
            return true;
        });
    }
    updateBookRating(bookId) {
        return __awaiter(this, void 0, void 0, function* () {
            const book = yield this.bookRepository.findOne({
                where: { id: bookId },
                relations: ["reviews"]
            });
            if (!book)
                return;
            // If we didn't load relations, we might need a query builder to aggregate.
            // But let's use query builder for efficiency instead of loading all reviews.
            const { avg, count } = yield this.reviewRepository
                .createQueryBuilder("review")
                .select("AVG(review.rating)", "avg")
                .addSelect("COUNT(review.id)", "count")
                .where("review.bookId = :bookId", { bookId })
                .getRawOne();
            book.averageRating = parseFloat(avg) || 0;
            book.ratingsCount = parseInt(count) || 0;
            yield this.bookRepository.save(book);
        });
    }
}
exports.ReviewService = ReviewService;
