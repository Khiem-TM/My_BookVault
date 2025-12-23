import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Order } from "./Order.entity";
import { Book } from "./Book.entity";

export enum ItemType {
    FREE = "FREE",
    PAID = "PAID"
}

@Entity("order_items")
export class OrderItem {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id!: number;

    @Column({ type: "bigint" })
    orderId!: number;

    @Column({ type: "bigint" })
    bookId!: number;

    @Column({
        type: "enum",
        enum: ItemType,
        default: ItemType.PAID
    })
    bookType!: ItemType;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    price!: number;

    @ManyToOne(() => Order, order => order.items)
    @JoinColumn({ name: "orderId" })
    order!: Order;

    @ManyToOne(() => Book)
    @JoinColumn({ name: "bookId" })
    book!: Book;
}
