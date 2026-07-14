import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import orderRoutes from "./routes/order.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();

const configuredOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");
    if (configuredOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== "production" && localOriginPattern.test(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS block: Origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Kidty Shop API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Không tìm thấy đường dẫn API" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err.message);
  const isCorsError = err.message?.startsWith("CORS block:");
  res.status(isCorsError ? 403 : 500).json({
    success: false,
    message: isCorsError ? "Origin không được phép truy cập API" : "Lỗi máy chủ nội bộ"
  });
});

export default app;
