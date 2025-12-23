"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BookController_1 = require("../controllers/BookController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const bookController = new BookController_1.BookController();
// Public routes
router.get("/", (req, res) => bookController.getAllBooks(req, res));
router.get("/categories", (req, res) => bookController.getBookCategories(req, res));
router.get("/:id", (req, res) => bookController.getBookById(req, res));
router.post("/search/google", (req, res) => bookController.searchGoogleBooks(req, res));
// Protected routes
router.post("/", auth_middleware_1.authenticateJWT, (req, res) => bookController.createBook(req, res));
router.put("/:id", auth_middleware_1.authenticateJWT, (req, res) => bookController.updateBook(req, res));
router.delete("/:id", auth_middleware_1.authenticateJWT, (req, res) => bookController.deleteBook(req, res));
exports.default = router;
