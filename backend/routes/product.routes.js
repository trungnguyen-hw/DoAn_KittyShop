import express from "express";
import { getProducts, getProductById, getProductBySlug, addProduct, updateProduct, deleteProduct } from "../controllers/product.controller.js";
import { protect } from "../src/middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
router.post("/", protect, addProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
