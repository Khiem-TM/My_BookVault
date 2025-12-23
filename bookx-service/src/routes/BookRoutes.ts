import { Router } from "express";
import { BookController } from "../controllers/BookController";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();
const bookController = new BookController();

// Public routes
router.get("/", (req, res) => bookController.getAllBooks(req, res));
router.get("/categories", (req, res) => bookController.getBookCategories(req, res));
router.get("/:id", (req, res) => bookController.getBookById(req, res));
router.post("/search/google", (req, res) => bookController.searchGoogleBooks(req, res));

// Protected routes
router.post("/", authenticateJWT, (req, res) => bookController.createBook(req, res));
router.put("/:id", authenticateJWT, (req, res) => bookController.updateBook(req, res));
router.delete("/:id", authenticateJWT, (req, res) => bookController.deleteBook(req, res));

export default router;
