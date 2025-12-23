import { BookService } from "./src/services/BookService";
import { AppDataSource } from "./src/config/data-source";
import { connectRedis } from "./src/config/redis";
import dotenv from "dotenv";

dotenv.config();

const queries = [
    "Clean Code",
    "Refactoring",
    "Design Patterns",
    "Algorithm",
    "Data Structures",
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "React",
    "Docker",
    "Microservices",
    "System Design",
    "Machine Learning",
    "Artificial Intelligence",
    "DevOps",
    "Software Architecture",
    "Web Development",
    "Database Systems",
    "Computer Networking"
];

const populateBooks = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database connected");
        
        await connectRedis();
        console.log("Redis connected");

        const bookService = new BookService();

        console.log("Starting population...");

        for (const query of queries) {
            console.log(`Importing books for query: ${query}`);
            try {
                // BookService creates duplicates if same book found?
                // The current implementation creates duplicates if titles match roughly, but let's assume it's fine for test data.
                // Ideally, importFromGoogleBooks should verify duplication.
                const books = await bookService.importFromGoogleBooks(query, "system");
                console.log(`Imported ${books.length} books for query: ${query}`);
            } catch (err) {
                console.error(`Failed to import for query: ${query}`, err);
            }
            // Wait a bit to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log("Population complete!");
        process.exit(0);

    } catch (error) {
        console.error("Error connecting to database", error);
        process.exit(1);
    }
};

populateBooks();
