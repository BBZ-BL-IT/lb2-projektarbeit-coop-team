import { Request, Response, Router } from "express";
import {
  getAllUserStats,
  getUserStatsByEmail,
} from "../services/StatsRepository";

const router = Router();

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const stats = await getAllUserStats();
    res.json(stats);
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    res.status(500).json({ message: "Failed to fetch stats." });
  }
});

router.get("/stats/:email", async (req: Request, res: Response) => {
  try {
    const stat = await getUserStatsByEmail(req.params.email);
    if (!stat) {
      res.status(404).json({ message: "Stats not found for this user." });
      return;
    }

    res.json(stat);
  } catch (error) {
    console.error("Failed to fetch stats by email:", error);
    res.status(500).json({ message: "Failed to fetch stats for this user." });
  }
});

export default router;
