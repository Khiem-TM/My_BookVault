import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Book } from "./Book.entity";

export enum TransactionStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    OVERDUE = "OVERDUE",
    RETURNED = "RETURNED",
    RETURNED_OVERDUE = "RETURNED_OVERDUE",
    REJECTED = "REJECTED"
}

@Entity("transactions")
export class Transaction {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id!: number;

    @Column({ length: 36 })
    userId!: string;

    @Column({ type: "bigint" })
    bookId!: number;

    @ManyToOne(() => Book)
    @JoinColumn({ name: "bookId" })
    book?: Book;

    @Column()
    borrowDate!: Date;

    @Column({ nullable: true })
    dueDate?: Date;

    @Column({ nullable: true })
    returnDate?: Date;

    @Column({
        type: "enum",
        enum: TransactionStatus,
        default: TransactionStatus.ACTIVE
    })
    status!: TransactionStatus;

    @CreateDateColumn()
    createdAt!: Date;
}
