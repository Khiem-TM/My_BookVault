import { Router } from "express";
import { ReviewController } from "../controllers/ReviewController";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();
const reviewController = new ReviewController();

// Create review for a book
router.post("/books/:bookId/reviews", authenticateJWT, (req, res) => reviewController.addReview(req, res));

// Get reviews for a book
router.get("/books/:bookId/reviews", (req, res) => reviewController.getReviews(req, res));

// Delete a review
router.delete("/reviews/:id", authenticateJWT, (req, res) => reviewController.deleteReview(req, res));

export default router;
