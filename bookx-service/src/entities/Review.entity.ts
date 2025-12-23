import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Book } from "./Book.entity";

@Entity("reviews")
export class Review {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id!: number;

    @Column({ length: 36 })
    userId!: string;

    @Column({ length: 255, nullable: true })
    userName?: string; // Optional: store simpler user name for display

    @Column("int")
    rating!: number; // 1-5

    @Column("text", { nullable: true })
    comment?: string;

    @ManyToOne(() => Book, book => book.reviews, { onDelete: "CASCADE" })
    @JoinColumn({ name: "bookId" })
    book!: Book;

    @Column({ type: "bigint" })
    bookId!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
