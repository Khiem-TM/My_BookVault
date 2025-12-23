import { Router } from "express";
import { TransactionController } from "../controllers/TransactionController";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();
const transactionController = new TransactionController();

// Borrow a book
router.post("/borrow", (req, res) => transactionController.borrowBook(req, res));

// Return a book
router.post("/return/:id", (req, res) => transactionController.returnBook(req, res));

// Get my transactions
router.get("/my-history", (req, res) => transactionController.getMyTransactions(req, res));

// Admin Routes
router.get("/", (req, res) => transactionController.getAllTransactions(req, res)); // GET /api/transactions
router.post("/approve/:id", (req, res) => transactionController.approveTransaction(req, res));
router.delete("/:id", (req, res) => transactionController.rejectTransaction(req, res));

export default router;
