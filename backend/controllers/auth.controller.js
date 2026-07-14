import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });
  }

  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim();

  try {
    // Check if we need to auto-seed from environment variables
    if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
      try {
        const [allAdmins] = await pool.query("SELECT id FROM admins LIMIT 1");
        if (allAdmins.length === 0) {
          console.log("No admins found in database. Auto-seeding admin user from env...");
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD.trim(), salt);
          await pool.query(
            "INSERT INTO admins (username, password, role) VALUES (?, ?, ?)",
            [process.env.ADMIN_USERNAME.trim().toLowerCase(), hashedPassword, "admin"]
          );
          console.log(`Admin user '${process.env.ADMIN_USERNAME}' auto-seeded successfully.`);
        }
      } catch (dbInitErr) {
        console.error("Failed to check or auto-seed admins table:", dbInitErr.message);
      }
    }

    const [rows] = await pool.query("SELECT * FROM admins WHERE username = ?", [cleanUser]);
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản hoặc mật khẩu không chính xác"
      });
    }

    const admin = rows[0];

    const isMatch = await bcrypt.compare(cleanPass, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản hoặc mật khẩu không chính xác"
      });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản không có quyền truy cập trang quản trị"
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET configuration is missing on the server.");
      return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ nội bộ (thiếu cấu hình xác thực)"
      });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      },
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Auth Controller Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau hoặc liên hệ quản trị viên."
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, username, role FROM admins WHERE id = ?", [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản quản trị" });
    }
    return res.json({
      success: true,
      admin: rows[0],
      user: rows[0] // Return both user and admin for maximum compatibility
    });
  } catch (error) {
    console.error("GetMe Controller Error:", error.message);
    return res.status(500).json({ message: "Lỗi lấy thông tin tài khoản tại Server" });
  }
};

export const debugDatabase = async (req, res) => {
  const { secretKey } = req.body;
  if (secretKey !== "temp_secure_key_1903") {
    return res.status(403).json({ success: false, message: "Unauthorized debug request" });
  }

  try {
    // 1. Check if admins table exists and list columns
    let tableName = "admins";
    let columns = [];
    try {
      const [desc] = await pool.query("DESCRIBE admins");
      columns = desc.map(c => c.Field);
    } catch (err) {
      // If admins doesn't exist, maybe it is 'users'
      try {
        const [desc] = await pool.query("DESCRIBE users");
        tableName = "users";
        columns = desc.map(c => c.Field);
      } catch (err2) {
        return res.status(500).json({
          success: false,
          message: `Neither 'admins' nor 'users' table exists. Error admins: ${err.message}. Error users: ${err2.message}`
        });
      }
    }

    // 2. Check if admin user exists in the identified table
    const [rows] = await pool.query(`SELECT * FROM ${tableName} WHERE username = ?`, ["trungngo1903"]);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Trunglove123", salt);

    let actionTaken = "";
    if (rows.length > 0) {
      // Update password and role
      await pool.query(
        `UPDATE ${tableName} SET password = ?, role = ? WHERE username = ?`,
        [hashedPassword, "admin", "trungngo1903"]
      );
      actionTaken = "updated";
    } else {
      // Insert new
      await pool.query(
        `INSERT INTO ${tableName} (username, password, role) VALUES (?, ?, ?)`,
        ["trungngo1903", hashedPassword, "admin"]
      );
      actionTaken = "created";
    }

    return res.json({
      success: true,
      tableName,
      columns,
      actionTaken,
      message: `Successfully ${actionTaken} admin account 'trungngo1903' in table '${tableName}'.`
    });
  } catch (error) {
    console.error("Debug DB Error:", error.message);
    return res.status(500).json({
      success: false,
      message: `Database debug failed: ${error.message}`
    });
  }
};
