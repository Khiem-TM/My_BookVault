import { Router } from "express";
import { TransactionController } from "../controllers/TransactionController";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();
const transactionController = new TransactionController();

// Borrow a book
router.post("/borrow", authenticateJWT, (req, res) => transactionController.borrowBook(req, res));

// Return a book
router.post("/return/:id", authenticateJWT, (req, res) => transactionController.returnBook(req, res));

// Get my transactions
router.get("/my-history", authenticateJWT, (req, res) => transactionController.getMyTransactions(req, res));

export default router;
