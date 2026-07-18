import express from "express";
import { getEvents, getEventById, createEvent, submitResult } from "../controllers/events.js";
import { authWallet, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);

// Admin routes
router.post("/", authWallet, requireAdmin, createEvent);
router.post("/result", authWallet, requireAdmin, submitResult);

export default router;
