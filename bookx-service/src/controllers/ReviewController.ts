import { Request, Response } from "express";
import { ReviewService } from "../services/ReviewService";
import { z } from "zod";
import { successResponse, errorResponse } from "../utils/response";

const reviewService = new ReviewService();

const addReviewSchema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
    userName: z.string().optional()
});

export class ReviewController {

    async addReview(req: Request, res: Response) {
        try {
            const bookId = parseInt(req.params.bookId);
            const userId = (req as any).user?.id || "system";
            const validatedData = addReviewSchema.parse(req.body);

            const review = await reviewService.addReview(
                bookId,
                userId,
                validatedData.rating,
                validatedData.comment,
                validatedData.userName
            );

            res.status(201).json(successResponse(review));
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json(errorResponse("Validation Error", 400));
            } else if (error.message === "Book not found") {
                res.status(404).json(errorResponse(error.message, 404));
            } else if (error.message === "User has already reviewed this book") {
                res.status(409).json(errorResponse(error.message, 409));
            } else {
                res.status(500).json(errorResponse("Internal Server Error"));
            }
        }
    }

    async getReviews(req: Request, res: Response) {
        try {
            const bookId = parseInt(req.params.bookId);
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await reviewService.getReviewsByBook(bookId, page, limit);
            // Assuming frontend handles raw { reviews, total } or wrapped result
            res.json(successResponse(result)); 
        } catch (error) {
            res.status(500).json(errorResponse("Internal Server Error"));
        }
    }

    async deleteReview(req: Request, res: Response) {
        try {
            const reviewId = parseInt(req.params.id);
            const userId = (req as any).user?.id || "system";

            const success = await reviewService.deleteReview(reviewId, userId);
            if (!success) {
                return res.status(404).json(errorResponse("Review not found", 404));
            }
            res.status(204).send();
        } catch (error: any) {
            if (error.message === "Not authorized to delete this review") {
                res.status(403).json(errorResponse(error.message, 403));
            } else {
                res.status(500).json(errorResponse("Internal Server Error"));
            }
        }
    }
}
