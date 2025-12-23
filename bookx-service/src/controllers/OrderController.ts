import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";
import { z } from "zod";
import { successResponse, errorResponse } from "../utils/response";

const orderService = new OrderService();

const checkoutSchema = z.object({
    bookIds: z.array(z.number().int().positive()).min(1)
});

const isAdmin = (user: any) => {
    if (!user) return false;
    if (user.scope && typeof user.scope === "string") {
        return user.scope.includes("ROLE_ADMIN");
    }
    if (user.roles && Array.isArray(user.roles)) {
        return user.roles.includes("ROLE_ADMIN");
    }
    return false;
};

export class OrderController {

    async checkout(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.sub || (req as any).user?.id || "system"; // JWT standard sub or id
            const { bookIds } = checkoutSchema.parse(req.body);

            const result = await orderService.checkout(userId, bookIds);
            res.status(201).json(successResponse(result));
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json(errorResponse("Validation Error", 400));
            } else if (error.message === "Some books not found") {
                res.status(404).json(errorResponse(error.message, 404));
            } else {
                console.error(error);
                res.status(500).json(errorResponse("Internal Server Error"));
            }
        }
    }
    async getMyOrders(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.sub || (req as any).user?.id;
            if (!userId) return res.status(401).json(errorResponse("Unauthorized", 401));

            const orders = await orderService.getUserOrders(userId);
            res.json(successResponse(orders));
        } catch (error) {
            console.error(error);
            res.status(500).json(errorResponse("Internal Server Error"));
        }
    }

    async manualConfirm(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.sub || (req as any).user?.id || "system";
            const orderId = parseInt(req.params.id);

            const order = await orderService.manualConfirm(orderId, userId);
            res.json(successResponse(order));
        } catch (error: any) {
            if (error.message === "Order not found") {
                res.status(404).json(errorResponse(error.message, 404));
            } else if (error.message === "Unauthorized") {
                res.status(403).json(errorResponse(error.message, 403));
            } else if (error.message === "Order not in pending payment state") {
                res.status(400).json(errorResponse(error.message, 400));
            } else {
                console.error(error);
                res.status(500).json(errorResponse("Internal Server Error"));
            }
        }
    }

    async getPendingOrders(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!isAdmin(user)) {
                return res.status(403).json(errorResponse("Forbidden: Admin access required", 403));
            }
            
            const orders = await orderService.getPendingOrders();
            res.json(successResponse(orders));
        } catch (error) {
            console.error(error);
            res.status(500).json(errorResponse("Internal Server Error"));
        }
    }

    async approveOrder(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!isAdmin(user)) {
                return res.status(403).json(errorResponse("Forbidden: Admin access required", 403));
            }

            const orderId = parseInt(req.params.id);
            const order = await orderService.approveOrder(orderId);
            res.json(successResponse(order));
        } catch (error: any) {
             if (error.message === "Order not found") {
                res.status(404).json(errorResponse(error.message, 404));
            } else if (error.message === "Order not pending approval") {
                res.status(400).json(errorResponse(error.message, 400));
            } else {
                console.error(error);
                res.status(500).json(errorResponse("Internal Server Error"));
            }
        }
    }

    async rejectOrder(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!isAdmin(user)) {
                return res.status(403).json(errorResponse("Forbidden: Admin access required", 403));
            }

            const orderId = parseInt(req.params.id);
            const order = await orderService.rejectOrder(orderId);
            res.json(successResponse(order));
        } catch (error: any) {
            if (error.message === "Order not found") {
                res.status(404).json(errorResponse(error.message, 404));
            } else if (error.message === "Order not pending approval") {
                res.status(400).json(errorResponse(error.message, 400));
            } else {
                console.error(error);
                res.status(500).json(errorResponse("Internal Server Error"));
            }
        }
    }

    async processPaymentWebhook(req: Request, res: Response) {
        try {
            // Simulated webhook payload: { orderId: 123, status: "SUCCESS" }
            const { orderId, status } = req.body;
            
            if (!orderId || !status) {
                return res.status(400).json(errorResponse("Invalid payload", 400));
            }

            const order = await orderService.processPaymentWebhook(orderId, status);
            res.json(successResponse(order));
        } catch (error: any) {
            if (error.message === "Order not found") {
                res.status(404).json(errorResponse(error.message, 404));
            } else {
                console.error(error);
                res.status(500).json(errorResponse("Internal Server Error"));
            }
        }
    }
}
