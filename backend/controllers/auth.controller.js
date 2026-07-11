import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
  }

  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim();

  try {
    const [rows] = await pool.query("SELECT * FROM admins WHERE username = ? AND role = 'admin'", [cleanUser]);
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Sai tài khoản hoặc mật khẩu"
      });
    }

    const admin = rows[0];

    const isMatch = await bcrypt.compare(cleanPass, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Sai tài khoản hoặc mật khẩu"
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({ success: false, message: "Máy chủ chưa được cấu hình xác thực" });
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
      }
    });
  } catch (error) {
    console.error("Auth Controller Error:", error.message);
    return res.status(500).json({ message: "Lỗi xử lý đăng nhập tại Server" });
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
      admin: rows[0]
    });
  } catch (error) {
    console.error("GetMe Controller Error:", error.message);
    return res.status(500).json({ message: "Lỗi lấy thông tin tài khoản tại Server" });
  }
};
