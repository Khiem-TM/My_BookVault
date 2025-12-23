import { Router } from "express";
import { StatisticsController } from "../controllers/StatisticsController";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();
const statisticsController = new StatisticsController();

// Admin Stats
router.get("/summary", (req, res) => statisticsController.getSummaryStats(req, res));

export default router;
