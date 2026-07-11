import express from "express";
import { getCategories, addCategory, updateCategory, deleteCategory } from "../controllers/category.controller.js";
import { protect } from "../src/middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, addCategory);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

export default router;
