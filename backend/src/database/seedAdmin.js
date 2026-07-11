import pool, { testConnection } from "../../config/db.js";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD are required to seed an admin");
  }

  try {
    // Check if admin user already exists in 'admins' table
    const [rows] = await pool.query("SELECT * FROM admins WHERE username = ?", [adminUsername]);
    
    if (rows.length === 0) {
      // Username does not exist, safe to create
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      await pool.query(
        "INSERT INTO admins (username, password, role) VALUES (?, ?, ?)",
        [adminUsername, hashedPassword, "admin"]
      );
      console.log(`Admin user '${adminUsername}' created successfully with bcrypt hash!`);
    } else {
      // Username already exists, skip to prevent duplicates
      console.log(`Admin user '${adminUsername}' already exists in the database. Seeding skipped.`);
    }
  } catch (error) {
    console.error("Error seeding admin in MySQL database:", error.message || (error.errors && error.errors[0]?.message) || error);
  }
}

// Self-invoking execution check if run directly via node command line
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('seedAdmin.js')) {
  console.log("Running standalone admin seeder...");
  testConnection().then(async () => {
    await seedDatabase();
    // Close the pool connections so the CLI process can exit cleanly
    await pool.end();
    console.log("Seeding process completed. Connection closed.");
    process.exit(0);
  }).catch(async (err) => {
    console.error("Database connection failed!");
    if (err.code === "ECONNREFUSED") {
      console.error("Vui lòng bật MySQL trong XAMPP trước.");
    } else if (err.code === "ER_BAD_DB_ERROR") {
      console.error("Vui lòng tạo database kidty_shop và import schema.sql.");
    } else {
      console.error("Error Detail:", err.message || err);
    }
    await pool.end();
    process.exit(1);
  });
}
