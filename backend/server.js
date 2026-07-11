import dotenv from "dotenv";

dotenv.config();

const { default: app } = await import("./app.js");
const { testConnection } = await import("./config/db.js");
const PORT = process.env.PORT || 5000;

try {
  await testConnection();
  console.log("Database connected successfully");
} catch (err) {
  console.error("Database connection failed:", err.message);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
