import express from "express";
import { loginAdmin, getMe } from "../controllers/auth.controller.js";
import { protect } from "../src/middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/me", protect, getMe);

export default router;
