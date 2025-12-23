"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TransactionController_1 = require("../controllers/TransactionController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const transactionController = new TransactionController_1.TransactionController();
// Borrow a book
router.post("/borrow", auth_middleware_1.authenticateJWT, (req, res) => transactionController.borrowBook(req, res));
// Return a book
router.post("/return/:id", auth_middleware_1.authenticateJWT, (req, res) => transactionController.returnBook(req, res));
// Get my transactions
router.get("/my-history", auth_middleware_1.authenticateJWT, (req, res) => transactionController.getMyTransactions(req, res));
exports.default = router;
