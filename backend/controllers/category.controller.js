import pool from "../config/db.js";

// Helper to generate clean URL slug
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    return res.json(rows);
  } catch (error) {
    console.error("getCategories Error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi lấy danh sách danh mục" });
  }
};

export const addCategory = async (req, res) => {
  const { name, slug, status } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Tên danh mục không được để trống" });
  }

  const finalSlug = slug ? generateSlug(slug) : generateSlug(name);

  try {
    const [result] = await pool.query(
      "INSERT INTO categories (name, slug, status) VALUES (?, ?, ?)",
      [name.trim(), finalSlug, status || "active"]
    );
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [result.insertId]);
    return res.status(201).json({ success: true, category: rows[0] });
  } catch (error) {
    console.error("addCategory Error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi thêm danh mục mới (Tên hoặc Slug có thể đã trùng)" });
  }
};

export const updateCategory = async (req, res) => {
  const { name, slug, status } = req.body;
  const { id } = req.params;

  try {
    const [existing] = await pool.query("SELECT * FROM categories WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
    }

    const curr = existing[0];
    const finalSlug = slug !== undefined ? (slug ? generateSlug(slug) : generateSlug(name || curr.name)) : curr.slug;

    await pool.query(
      "UPDATE categories SET name = ?, slug = ?, status = ? WHERE id = ?",
      [
        name !== undefined ? name.trim() : curr.name,
        finalSlug,
        status !== undefined ? status : curr.status,
        id
      ]
    );

    const [updated] = await pool.query("SELECT * FROM categories WHERE id = ?", [id]);
    return res.json({ success: true, category: updated[0] });
  } catch (error) {
    console.error("updateCategory Error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi cập nhật danh mục" });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.query("SELECT * FROM categories WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
    }

    await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    return res.json({ success: true, message: "Xóa danh mục thành công" });
  } catch (error) {
    console.error("deleteCategory Error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi xóa danh mục" });
  }
};
