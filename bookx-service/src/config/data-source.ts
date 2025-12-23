import "reflect-metadata";
import { DataSource } from "typeorm";
import { Book } from "../entities/Book.entity";
import { Review } from "../entities/Review.entity";
import { Transaction } from "../entities/Transaction.entity";
import { Playlist } from "../entities/Playlist.entity";
import { PlaylistBook } from "../entities/PlaylistBook.entity";
import { Order } from "../entities/Order.entity";
import { OrderItem } from "../entities/OrderItem.entity";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    username: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "root",
    database: process.env.MYSQL_DATABASE || "bookx_db",
    synchronize: true, // Use migrations in production
    logging: false,
    entities: [Book, Review, Transaction, Playlist, PlaylistBook, Order, OrderItem],
    migrations: [],
    subscribers: [],
});
