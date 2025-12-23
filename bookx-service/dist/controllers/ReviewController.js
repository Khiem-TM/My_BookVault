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
exports.ReviewController = void 0;
const ReviewService_1 = require("../services/ReviewService");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
const reviewService = new ReviewService_1.ReviewService();
const addReviewSchema = zod_1.z.object({
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().optional(),
    userName: zod_1.z.string().optional()
});
class ReviewController {
    addReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const bookId = parseInt(req.params.bookId);
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "system";
                const validatedData = addReviewSchema.parse(req.body);
                const review = yield reviewService.addReview(bookId, userId, validatedData.rating, validatedData.comment, validatedData.userName);
                res.status(201).json((0, response_1.successResponse)(review));
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json((0, response_1.errorResponse)("Validation Error", 400));
                }
                else if (error.message === "Book not found") {
                    res.status(404).json((0, response_1.errorResponse)(error.message, 404));
                }
                else if (error.message === "User has already reviewed this book") {
                    res.status(409).json((0, response_1.errorResponse)(error.message, 409));
                }
                else {
                    res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
                }
            }
        });
    }
    getReviews(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookId = parseInt(req.params.bookId);
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const result = yield reviewService.getReviewsByBook(bookId, page, limit);
                // Assuming frontend handles raw { reviews, total } or wrapped result
                res.json((0, response_1.successResponse)(result));
            }
            catch (error) {
                res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
            }
        });
    }
    deleteReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const reviewId = parseInt(req.params.id);
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "system";
                const success = yield reviewService.deleteReview(reviewId, userId);
                if (!success) {
                    return res.status(404).json((0, response_1.errorResponse)("Review not found", 404));
                }
                res.status(204).send();
            }
            catch (error) {
                if (error.message === "Not authorized to delete this review") {
                    res.status(403).json((0, response_1.errorResponse)(error.message, 403));
                }
                else {
                    res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
                }
            }
        });
    }
}
exports.ReviewController = ReviewController;
