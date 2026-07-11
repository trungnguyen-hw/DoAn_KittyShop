import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Decode and verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "kidty_shop_secret_key");

      req.user = decoded;
      return next();
    } catch (error) {
      console.error("JWT verification failed:", error.message);
      return res.status(401).json({
        success: false,
        message: "Không được ủy quyền, token không hợp lệ"
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Không được ủy quyền, thiếu token xác thực"
    });
  }
};
