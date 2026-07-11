import express from "express";
import { getOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder } from "../controllers/order.controller.js";
import { protect } from "../src/middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);
router.post("/", createOrder);
router.put("/:id/status", protect, updateOrderStatus);
router.delete("/:id", protect, deleteOrder);

export default router;
