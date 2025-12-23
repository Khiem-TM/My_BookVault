import "reflect-metadata";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { AppDataSource } from "./config/data-source";
import { connectMongo } from "./config/mongo";
import { connectRedis } from "./config/redis";
import bookRoutes from "./routes/BookRoutes";
import reviewRoutes from "./routes/ReviewRoutes";
import transactionRoutes from "./routes/TransactionRoutes";
import playlistRoutes from "./routes/PlaylistRoutes";
import orderRoutes from "./routes/OrderRoutes";
import statisticsRoutes from "./routes/StatisticsRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
// app.use(cors()); // CORS is handled by API Gateway
app.use(express.json());

app.use(morgan("dev"));

// Routes
app.use("/api/books", bookRoutes);
app.use("/api", reviewRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/statistics", statisticsRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "UP", timestamp: new Date() });
});

// Database Connection and Server Start
const startServer = async () => {
    try {
        // Connect to MySQL (TypeORM)
        await AppDataSource.initialize();
        console.log("Data Source has been initialized! (MySQL)");

        // Connect to MongoDB
        // Connect to MongoDB
        await connectMongo();
        
        // Connect to Redis
        await connectRedis();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error during Data Source initialization:", error);
        process.exit(1);
    }
};

startServer();

export default app;
