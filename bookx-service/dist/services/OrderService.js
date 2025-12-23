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
exports.OrderService = void 0;
const data_source_1 = require("../config/data-source");
const Order_entity_1 = require("../entities/Order.entity");
const OrderItem_entity_1 = require("../entities/OrderItem.entity");
const Book_entity_1 = require("../entities/Book.entity");
const typeorm_1 = require("typeorm");
const PlaylistService_1 = require("./PlaylistService");
const playlistService = new PlaylistService_1.PlaylistService();
class OrderService {
    constructor() {
        this.orderRepository = data_source_1.AppDataSource.getRepository(Order_entity_1.Order);
        this.bookRepository = data_source_1.AppDataSource.getRepository(Book_entity_1.Book);
    }
    checkout(userId, bookIds) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch books
            const books = yield this.bookRepository.findBy({ id: (0, typeorm_1.In)(bookIds) });
            if (books.length !== bookIds.length) {
                throw new Error("Some books not found");
            }
            let totalPrice = 0;
            const orderItems = [];
            // Calculate total and classify items
            for (const book of books) {
                const isFree = !book.price || book.price <= 0;
                const price = book.price || 0;
                totalPrice += Number(price);
                const item = new OrderItem_entity_1.OrderItem();
                item.bookId = book.id;
                item.bookType = isFree ? OrderItem_entity_1.ItemType.FREE : OrderItem_entity_1.ItemType.PAID;
                item.price = price;
                // item.order will be set by Cascade or manually if needed
                orderItems.push(item);
            }
            // Create Order
            const order = new Order_entity_1.Order();
            order.userId = userId;
            order.totalPrice = totalPrice;
            order.items = orderItems;
            // If total price is 0, auto-complete
            if (totalPrice === 0) {
                order.status = Order_entity_1.OrderStatus.COMPLETED;
                order.paymentMethod = Order_entity_1.PaymentMethod.NONE;
                // Add to My Books automatically
                yield this.addBooksToUserLibrary(userId, bookIds);
            }
            else {
                order.status = Order_entity_1.OrderStatus.PENDING_PAYMENT;
                // Payment method to be selected later or assume manual for flow start?
                // User can update payment method in next step
            }
            const savedOrder = yield this.orderRepository.save(order);
            return {
                order: savedOrder,
                isCompleted: savedOrder.status === Order_entity_1.OrderStatus.COMPLETED
            };
        });
    }
    manualConfirm(orderId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.orderRepository.findOneBy({ id: orderId });
            if (!order)
                throw new Error("Order not found");
            if (order.userId !== userId)
                throw new Error("Unauthorized");
            if (order.status !== Order_entity_1.OrderStatus.PENDING_PAYMENT) {
                throw new Error("Order not in pending payment state");
            }
            order.status = Order_entity_1.OrderStatus.PENDING_APPROVAL;
            order.paymentMethod = Order_entity_1.PaymentMethod.MANUAL_TRANSFER;
            return yield this.orderRepository.save(order);
        });
    }
    getPendingOrders() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.orderRepository.find({
                where: { status: Order_entity_1.OrderStatus.PENDING_APPROVAL },
                relations: ["items", "items.book"],
                order: { createdAt: "DESC" }
            });
        });
    }
    approveOrder(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.orderRepository.findOne({
                where: { id: orderId },
                relations: ["items"]
            });
            if (!order)
                throw new Error("Order not found");
            if (order.status !== Order_entity_1.OrderStatus.PENDING_APPROVAL) {
                throw new Error("Order not pending approval");
            }
            order.status = Order_entity_1.OrderStatus.COMPLETED;
            const savedOrder = yield this.orderRepository.save(order);
            // Add books to user playlist/library
            const bookIds = order.items.map(i => i.bookId);
            yield this.addBooksToUserLibrary(order.userId, bookIds);
            return savedOrder;
        });
    }
    rejectOrder(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.orderRepository.findOneBy({ id: orderId });
            if (!order)
                throw new Error("Order not found");
            if (order.status !== Order_entity_1.OrderStatus.PENDING_APPROVAL) {
                throw new Error("Order not pending approval");
            }
            order.status = Order_entity_1.OrderStatus.CANCELLED;
            return yield this.orderRepository.save(order);
        });
    }
    getUserOrders(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.orderRepository.find({
                where: { userId },
                relations: ["items", "items.book"],
                order: { createdAt: "DESC" }
            });
        });
    }
    addBooksToUserLibrary(userId, bookIds) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implementation logic:
            // We can either:
            // 1. Just rely on `TransactionService` (borrowing) -> But this is Buying/Permanent.
            // 2. Add to a "My Books" playlist.
            // 3. Or relying on `getMyBooks` in PlaylistController which currently only checks transactions.
            // For this specific Requirement: "Activates adding books to user's Playlist".
            // Let's create or find "My Books" playlist? Or logic says "system automatically adds to myPlaylist".
            // PlaylistService has `addToPlaylist`. We might need a default "Purchased" playlist or just rely on the existing "My Books" concept if we had one.
            // Since `getMyBooks` in controller fetches from Transactions, we might implement a `Purchase` entity or just fake a transaction with infinite duration?
            // BETTER: The prompt says "System automatically adds to user's myPlaylist".
            // Let's assume there is a playlist named "Purchased Books" or we add to a system-default list.
            // Or simply, we create a Transaction with very long duration? 
            // Or just create a new `UserBook` entity?
            // Given complexity constraints, let's look at `PlaylistService`. It has `addBookToPlaylist`.
            // We can create a playlist called "My Purchases" if it doesn't exist, and add books there.
            let myPlaylists = yield playlistService.getMyPlaylists(userId);
            let purchasePlaylist = myPlaylists.find(p => p.name === "My Purchases");
            if (!purchasePlaylist) {
                purchasePlaylist = yield playlistService.createPlaylist(userId, "My Purchases", "Books I have purchased", false);
            }
            for (const bookId of bookIds) {
                try {
                    yield playlistService.addBookToPlaylist(userId, purchasePlaylist.id, bookId);
                }
                catch (e) {
                    // Ignore if already exists
                    if (e.message !== "Book already in playlist") {
                        console.error(`Failed to add book ${bookId} to playlist`, e);
                    }
                }
            }
        });
    }
    processPaymentWebhook(orderId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.orderRepository.findOne({
                where: { id: orderId },
                relations: ["items"]
            });
            if (!order)
                throw new Error("Order not found");
            if (status === "SUCCESS") {
                if (order.status === Order_entity_1.OrderStatus.COMPLETED)
                    return order; // Idempotency
                order.status = Order_entity_1.OrderStatus.COMPLETED;
                order.paymentMethod = Order_entity_1.PaymentMethod.ONLINE_GATEWAY;
                const savedOrder = yield this.orderRepository.save(order);
                // Add books
                const bookIds = order.items.map(i => i.bookId);
                yield this.addBooksToUserLibrary(order.userId, bookIds);
                return savedOrder;
            }
            else if (status === "FAILED") {
                order.status = Order_entity_1.OrderStatus.CANCELLED;
                return yield this.orderRepository.save(order);
            }
            return order;
        });
    }
}
exports.OrderService = OrderService;
