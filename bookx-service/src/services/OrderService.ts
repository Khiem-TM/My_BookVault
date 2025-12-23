import { AppDataSource } from "../config/data-source";
import { Order, OrderStatus, PaymentMethod } from "../entities/Order.entity";
import { OrderItem, ItemType } from "../entities/OrderItem.entity";
import { Book } from "../entities/Book.entity";
import { Repository, In } from "typeorm";
import { PlaylistService } from "./PlaylistService";

const playlistService = new PlaylistService();

export class OrderService {
    private orderRepository: Repository<Order>;
    private bookRepository: Repository<Book>;

    constructor() {
        this.orderRepository = AppDataSource.getRepository(Order);
        this.bookRepository = AppDataSource.getRepository(Book);
    }

    async checkout(userId: string, bookIds: number[]): Promise<{ order: Order, isCompleted: boolean }> {
        // Fetch books
        const books = await this.bookRepository.findBy({ id: In(bookIds) });
        if (books.length !== bookIds.length) {
            throw new Error("Some books not found");
        }

        let totalPrice = 0;
        const orderItems: OrderItem[] = [];

        // Calculate total and classify items
        for (const book of books) {
            const isFree = !book.price || book.price <= 0;
            const price = book.price || 0;
            
            totalPrice += Number(price);
            
            const item = new OrderItem();
            item.bookId = book.id;
            item.bookType = isFree ? ItemType.FREE : ItemType.PAID;
            item.price = price;
            // item.order will be set by Cascade or manually if needed
            orderItems.push(item);
        }

        // Create Order
        const order = new Order();
        order.userId = userId;
        order.totalPrice = totalPrice;
        order.items = orderItems;

        // If total price is 0, auto-complete
        if (totalPrice === 0) {
            order.status = OrderStatus.COMPLETED;
            order.paymentMethod = PaymentMethod.NONE;
            
            // Add to My Books automatically
            await this.addBooksToUserLibrary(userId, bookIds);
        } else {
            order.status = OrderStatus.PENDING_PAYMENT;
            // Payment method to be selected later or assume manual for flow start?
            // User can update payment method in next step
        }

        const savedOrder = await this.orderRepository.save(order);
        
        return { 
            order: savedOrder, 
            isCompleted: savedOrder.status === OrderStatus.COMPLETED 
        };
    }

    async manualConfirm(orderId: number, userId: string): Promise<Order> {
        const order = await this.orderRepository.findOneBy({ id: orderId });
        if (!order) throw new Error("Order not found");

        if (order.userId !== userId) throw new Error("Unauthorized");
        
        if (order.status !== OrderStatus.PENDING_PAYMENT) {
            throw new Error("Order not in pending payment state");
        }

        order.status = OrderStatus.PENDING_APPROVAL;
        order.paymentMethod = PaymentMethod.MANUAL_TRANSFER;
        
        return await this.orderRepository.save(order);
    }

    async getPendingOrders(): Promise<Order[]> {
        return await this.orderRepository.find({
            where: { status: OrderStatus.PENDING_APPROVAL },
            relations: ["items", "items.book"],
            order: { createdAt: "DESC" }
        });
    }

    async approveOrder(orderId: number): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ["items"]
        });
        
        if (!order) throw new Error("Order not found");

        if (order.status !== OrderStatus.PENDING_APPROVAL) {
            throw new Error("Order not pending approval");
        }

        order.status = OrderStatus.COMPLETED;
        const savedOrder = await this.orderRepository.save(order);

        // Add books to user playlist/library
        const bookIds = order.items.map(i => i.bookId);
        await this.addBooksToUserLibrary(order.userId, bookIds);

        return savedOrder;
    }

    async rejectOrder(orderId: number): Promise<Order> {
        const order = await this.orderRepository.findOneBy({ id: orderId });
        if (!order) throw new Error("Order not found");
        
        if (order.status !== OrderStatus.PENDING_APPROVAL) {
             throw new Error("Order not pending approval");
        }

        order.status = OrderStatus.CANCELLED;
        return await this.orderRepository.save(order);
    }

    async getUserOrders(userId: string): Promise<Order[]> {
        return await this.orderRepository.find({
            where: { userId },
            relations: ["items", "items.book"],
            order: { createdAt: "DESC" }
        });
    }

    private async addBooksToUserLibrary(userId: string, bookIds: number[]) {
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
        
        let myPlaylists = await playlistService.getMyPlaylists(userId);
        let purchasePlaylist = myPlaylists.find(p => p.name === "My Purchases");
        
        if (!purchasePlaylist) {
            purchasePlaylist = await playlistService.createPlaylist(userId, "My Purchases", "Books I have purchased", false);
        }

        for (const bookId of bookIds) {
            try {
                await playlistService.addBookToPlaylist(userId, purchasePlaylist.id, bookId);
            } catch (e: any) {
                // Ignore if already exists
                if (e.message !== "Book already in playlist") {
                    console.error(`Failed to add book ${bookId} to playlist`, e);
                }
            }
        }
    }
    
    async processPaymentWebhook(orderId: number, status: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ["items"]
        });
        if (!order) throw new Error("Order not found");

        if (status === "SUCCESS") {
            if (order.status === OrderStatus.COMPLETED) return order; // Idempotency
            
            order.status = OrderStatus.COMPLETED;
            order.paymentMethod = PaymentMethod.ONLINE_GATEWAY;
            const savedOrder = await this.orderRepository.save(order);
            
            // Add books
            const bookIds = order.items.map(i => i.bookId);
            await this.addBooksToUserLibrary(order.userId, bookIds);
            
            return savedOrder;
        } else if (status === "FAILED") {
             order.status = OrderStatus.CANCELLED;
             return await this.orderRepository.save(order);
        }
        return order;
    }
}
