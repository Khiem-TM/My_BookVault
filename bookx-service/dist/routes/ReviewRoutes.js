"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ReviewController_1 = require("../controllers/ReviewController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const reviewController = new ReviewController_1.ReviewController();
// Create review for a book
router.post("/books/:bookId/reviews", auth_middleware_1.authenticateJWT, (req, res) => reviewController.addReview(req, res));
// Get reviews for a book
router.get("/books/:bookId/reviews", (req, res) => reviewController.getReviews(req, res));
// Delete a review
router.delete("/reviews/:id", auth_middleware_1.authenticateJWT, (req, res) => reviewController.deleteReview(req, res));
exports.default = router;
