import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Review } from "./Review.entity";

export enum BookType {
    PHYSICAL_BOOK = "PHYSICAL_BOOK",
    EBOOK = "EBOOK",
    AUDIO_BOOK = "AUDIO_BOOK"
}

export enum BookStatus {
    AVAILABLE = "AVAILABLE",
    OUT_OF_STOCK = "OUT_OF_STOCK",
    DISCONTINUED = "DISCONTINUED"
}

@Entity("books")
export class Book {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id!: number;

    @Column({ length: 255 })
    title!: string;

    @Column({ length: 255 })
    author!: string;

    @Column({ length: 20, nullable: true })
    isbn?: string;

    @Column("text", { nullable: true })
    description?: string;

    @Column("simple-array", { nullable: true })
    categories?: string[];

    @Column({ type: "date", nullable: true })
    publishedAt?: Date;

    @Column({
        type: "enum",
        enum: BookType,
        default: BookType.PHYSICAL_BOOK
    })
    bookType!: BookType;

    @Column({
        type: "enum",
        enum: BookStatus,
        default: BookStatus.AVAILABLE
    })
    status!: BookStatus;

    @Column({ type: "int", default: 0 })
    totalQuantity!: number;

    @Column({ type: "int", default: 0 })
    availableQuantity!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    price?: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    rentalPrice?: number;

    @Column({ type: "int", nullable: true })
    rentalDurationDays?: number;

    @Column({ length: 255, nullable: true })
    publisher?: string;

    @Column({ length: 500, nullable: true })
    thumbnailUrl?: string;

    @Column({ type: "int", nullable: true })
    pageCount?: number;

    @Column({ type: "double", default: 0.0 })
    averageRating!: number;

    @Column({ type: "int", default: 0 })
    ratingsCount!: number;

    @Column({ length: 50, nullable: true })
    language?: string;

    @Column({ length: 36, nullable: true }) // UUID string
    createdBy?: string;

    @Column({ length: 36, nullable: true }) // UUID string
    updatedBy?: string;

    @OneToMany(() => Review, review => review.book)
    reviews?: Review[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
