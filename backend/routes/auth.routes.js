import express from "express";
import { loginAdmin, getMe, debugDatabase } from "../controllers/auth.controller.js";
import { protect } from "../src/middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/debug-db", debugDatabase);
router.get("/me", protect, getMe);

export default router;
