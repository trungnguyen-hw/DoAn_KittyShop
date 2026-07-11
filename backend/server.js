import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { seedDatabase } from "./src/database/seedAdmin.js";
import { testConnection } from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import orderRoutes from "./routes/order.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error("CORS block: Origin not allowed"));
  },
  credentials: true
}));
app.use(express.json());

// Database connection and seeding check
try {
  await testConnection();
  console.log("Database connected successfully");
  
  // Seed database only after connection is successful
  await seedDatabase();
  console.log("Database seeding check completed.");
} catch (err) {
  console.error("Database connection failed!");
  if (err.code === "ECONNREFUSED") {
    console.error("Vui lòng bật MySQL trong XAMPP trước.");
  } else if (err.code === "ER_BAD_DB_ERROR") {
    console.error("Vui lòng tạo database kidty_shop và import schema.sql.");
  } else {
    console.error("Error Detail:", err.message || err);
  }
}

// Mount APIs
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health test route
app.get("/api/health", (req, res) => {
  res.json({ message: "Kidty Shop API is running" });
});

// 404 Route
app.use((req, res) => {
  res.status(404).json({ message: "Không tìm thấy đường dẫn API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandle Server Error:", err.stack);
  res.status(500).json({
    message: "Lỗi máy chủ nội bộ",
    error: process.env.NODE_ENV === "development" ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
