import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { OrderItem } from "./OrderItem.entity";

export enum OrderStatus {
    DRAFT = "DRAFT",
    PENDING_PAYMENT = "PENDING_PAYMENT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

export enum PaymentMethod {
    ONLINE_BANKING = "ONLINE_BANKING",
    MANUAL_TRANSFER = "MANUAL_TRANSFER",
    NONE = "NONE",
    ONLINE_GATEWAY = "ONLINE_GATEWAY"
}

@Entity("orders")
export class Order {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id!: number;

    @Column({ length: 36 })
    userId!: string;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    totalPrice!: number;

    @Column({
        type: "enum",
        enum: OrderStatus,
        default: OrderStatus.DRAFT
    })
    status!: OrderStatus;

    @Column({
        type: "enum",
        enum: PaymentMethod,
        default: PaymentMethod.NONE
    })
    paymentMethod!: PaymentMethod;

    @OneToMany(() => OrderItem, item => item.order, { cascade: true })
    items!: OrderItem[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
