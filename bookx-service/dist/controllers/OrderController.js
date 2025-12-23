"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const OrderService_1 = require("../services/OrderService");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
const orderService = new OrderService_1.OrderService();
const checkoutSchema = zod_1.z.object({
    bookIds: zod_1.z.array(zod_1.z.number().int().positive()).min(1)
});
const isAdmin = (user) => {
    if (!user)
        return false;
    if (user.scope && typeof user.scope === "string") {
        return user.scope.includes("ROLE_ADMIN");
    }
    if (user.roles && Array.isArray(user.roles)) {
        return user.roles.includes("ROLE_ADMIN");
    }
    return false;
};
class OrderController {
    checkout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.sub) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || "system"; // JWT standard sub or id
                const { bookIds } = checkoutSchema.parse(req.body);
                const result = yield orderService.checkout(userId, bookIds);
                res.status(201).json((0, response_1.successResponse)(result));
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json((0, response_1.errorResponse)("Validation Error", 400));
                }
                else if (error.message === "Some books not found") {
                    res.status(404).json((0, response_1.errorResponse)(error.message, 404));
                }
                else {
                    console.error(error);
                    res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
                }
            }
        });
    }
    getMyOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.sub) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
                if (!userId)
                    return res.status(401).json((0, response_1.errorResponse)("Unauthorized", 401));
                const orders = yield orderService.getUserOrders(userId);
                res.json((0, response_1.successResponse)(orders));
            }
            catch (error) {
                console.error(error);
                res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
            }
        });
    }
    manualConfirm(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.sub) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || "system";
                const orderId = parseInt(req.params.id);
                const order = yield orderService.manualConfirm(orderId, userId);
                res.json((0, response_1.successResponse)(order));
            }
            catch (error) {
                if (error.message === "Order not found") {
                    res.status(404).json((0, response_1.errorResponse)(error.message, 404));
                }
                else if (error.message === "Unauthorized") {
                    res.status(403).json((0, response_1.errorResponse)(error.message, 403));
                }
                else if (error.message === "Order not in pending payment state") {
                    res.status(400).json((0, response_1.errorResponse)(error.message, 400));
                }
                else {
                    console.error(error);
                    res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
                }
            }
        });
    }
    getPendingOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                if (!isAdmin(user)) {
                    return res.status(403).json((0, response_1.errorResponse)("Forbidden: Admin access required", 403));
                }
                const orders = yield orderService.getPendingOrders();
                res.json((0, response_1.successResponse)(orders));
            }
            catch (error) {
                console.error(error);
                res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
            }
        });
    }
    approveOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                if (!isAdmin(user)) {
                    return res.status(403).json((0, response_1.errorResponse)("Forbidden: Admin access required", 403));
                }
                const orderId = parseInt(req.params.id);
                const order = yield orderService.approveOrder(orderId);
                res.json((0, response_1.successResponse)(order));
            }
            catch (error) {
                if (error.message === "Order not found") {
                    res.status(404).json((0, response_1.errorResponse)(error.message, 404));
                }
                else if (error.message === "Order not pending approval") {
                    res.status(400).json((0, response_1.errorResponse)(error.message, 400));
                }
                else {
                    console.error(error);
                    res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
                }
            }
        });
    }
    rejectOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                if (!isAdmin(user)) {
                    return res.status(403).json((0, response_1.errorResponse)("Forbidden: Admin access required", 403));
                }
                const orderId = parseInt(req.params.id);
                const order = yield orderService.rejectOrder(orderId);
                res.json((0, response_1.successResponse)(order));
            }
            catch (error) {
                if (error.message === "Order not found") {
                    res.status(404).json((0, response_1.errorResponse)(error.message, 404));
                }
                else if (error.message === "Order not pending approval") {
                    res.status(400).json((0, response_1.errorResponse)(error.message, 400));
                }
                else {
                    console.error(error);
                    res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
                }
            }
        });
    }
    processPaymentWebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Simulated webhook payload: { orderId: 123, status: "SUCCESS" }
                const { orderId, status } = req.body;
                if (!orderId || !status) {
                    return res.status(400).json((0, response_1.errorResponse)("Invalid payload", 400));
                }
                const order = yield orderService.processPaymentWebhook(orderId, status);
                res.json((0, response_1.successResponse)(order));
            }
            catch (error) {
                if (error.message === "Order not found") {
                    res.status(404).json((0, response_1.errorResponse)(error.message, 404));
                }
                else {
                    console.error(error);
                    res.status(500).json((0, response_1.errorResponse)("Internal Server Error"));
                }
            }
        });
    }
}
exports.OrderController = OrderController;
