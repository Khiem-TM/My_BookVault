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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./config/data-source");
const mongo_1 = require("./config/mongo");
const redis_1 = require("./config/redis");
const BookRoutes_1 = __importDefault(require("./routes/BookRoutes"));
const ReviewRoutes_1 = __importDefault(require("./routes/ReviewRoutes"));
const TransactionRoutes_1 = __importDefault(require("./routes/TransactionRoutes"));
const PlaylistRoutes_1 = __importDefault(require("./routes/PlaylistRoutes"));
const OrderRoutes_1 = __importDefault(require("./routes/OrderRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middlewares
// app.use(cors()); // CORS is handled by API Gateway
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
// Routes
app.use("/api/books", BookRoutes_1.default);
app.use("/api", ReviewRoutes_1.default);
app.use("/api/transactions", TransactionRoutes_1.default);
app.use("/api/playlists", PlaylistRoutes_1.default);
app.use("/api/orders", OrderRoutes_1.default);
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "UP", timestamp: new Date() });
});
// Database Connection and Server Start
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MySQL (TypeORM)
        yield data_source_1.AppDataSource.initialize();
        console.log("Data Source has been initialized! (MySQL)");
        // Connect to MongoDB
        // Connect to MongoDB
        yield (0, mongo_1.connectMongo)();
        // Connect to Redis
        yield (0, redis_1.connectRedis)();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Error during Data Source initialization:", error);
        process.exit(1);
    }
});
startServer();
exports.default = app;
