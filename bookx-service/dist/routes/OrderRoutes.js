"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const OrderController_1 = require("../controllers/OrderController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const orderController = new OrderController_1.OrderController();
// Checkout (User)
router.post("/checkout", auth_middleware_1.authenticateJWT, (req, res) => orderController.checkout(req, res));
// My Orders (User)
router.get("/my-orders", auth_middleware_1.authenticateJWT, (req, res) => orderController.getMyOrders(req, res));
// Manual Confirm Payment (User)
router.post("/:id/manual-confirm", auth_middleware_1.authenticateJWT, (req, res) => orderController.manualConfirm(req, res));
// Admin: Get Pending Orders
router.get("/admin/orders", auth_middleware_1.authenticateJWT, (req, res) => orderController.getPendingOrders(req, res));
// Admin: Approve Order
router.post("/admin/orders/:id/approve", auth_middleware_1.authenticateJWT, (req, res) => orderController.approveOrder(req, res));
// Admin: Reject Order
router.post("/admin/orders/:id/reject", auth_middleware_1.authenticateJWT, (req, res) => orderController.rejectOrder(req, res));
// Webhook (Public)
router.post("/webhook/payment-confirm", (req, res) => orderController.processPaymentWebhook(req, res));
exports.default = router;
