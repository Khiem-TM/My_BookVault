"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Book_entity_1 = require("../entities/Book.entity");
const Review_entity_1 = require("../entities/Review.entity");
const Transaction_entity_1 = require("../entities/Transaction.entity");
const Playlist_entity_1 = require("../entities/Playlist.entity");
const PlaylistBook_entity_1 = require("../entities/PlaylistBook.entity");
const Order_entity_1 = require("../entities/Order.entity");
const OrderItem_entity_1 = require("../entities/OrderItem.entity");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    username: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "root",
    database: process.env.MYSQL_DATABASE || "bookx_db",
    synchronize: true, // Use migrations in production
    logging: false,
    entities: [Book_entity_1.Book, Review_entity_1.Review, Transaction_entity_1.Transaction, Playlist_entity_1.Playlist, PlaylistBook_entity_1.PlaylistBook, Order_entity_1.Order, OrderItem_entity_1.OrderItem],
    migrations: [],
    subscribers: [],
});
