import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();
const orderController = new OrderController();

// Checkout (User)
router.post("/checkout", authenticateJWT, (req, res) => orderController.checkout(req, res));

// My Orders (User)
router.get("/my-orders", authenticateJWT, (req, res) => orderController.getMyOrders(req, res));

// Manual Confirm Payment (User)
router.post("/:id/manual-confirm", authenticateJWT, (req, res) => orderController.manualConfirm(req, res));

// Admin: Get Pending Orders
router.get("/admin/orders", authenticateJWT, (req, res) => orderController.getPendingOrders(req, res));

// Admin: Approve Order
router.post("/admin/orders/:id/approve", authenticateJWT, (req, res) => orderController.approveOrder(req, res));

// Admin: Reject Order
router.post("/admin/orders/:id/reject", authenticateJWT, (req, res) => orderController.rejectOrder(req, res));

// Webhook (Public)
router.post("/webhook/payment-confirm", (req, res) => orderController.processPaymentWebhook(req, res));

export default router;
