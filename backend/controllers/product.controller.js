import pool from "../config/db.js";

// Generate clean URL slug from string
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export const getProducts = async (req, res) => {
  const { search, category, sort, limit } = req.query;

  let query = "SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1";
  const queryParams = [];

  // Filter by search query
  if (search) {
    query += " AND (p.name LIKE ? OR p.slug LIKE ?)";
    const searchVal = `%${search}%`;
    queryParams.push(searchVal, searchVal);
  }

  // Filter by category slug or name
  if (category) {
    query += " AND (c.slug = ? OR c.name = ?)";
    queryParams.push(category, category);
  }

  // Sorting
  if (sort) {
    if (sort === "price_asc") {
      query += " ORDER BY p.price ASC";
    } else if (sort === "price_desc") {
      query += " ORDER BY p.price DESC";
    } else if (sort === "newest") {
      query += " ORDER BY p.created_at DESC";
    } else {
      query += " ORDER BY p.created_at DESC";
    }
  } else {
    query += " ORDER BY p.created_at DESC";
  }

  // Limit results count
  if (limit) {
    const parsedLimit = parseInt(limit);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      query += " LIMIT ?";
      queryParams.push(parsedLimit);
    }
  }

  try {
    const [rows] = await pool.query(query, queryParams);
    return res.json(rows);
  } catch (error) {
    console.error("getProducts Error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi lấy danh sách sản phẩm" });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?",
      [Number(id)]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error("getProductById Error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi lấy thông tin sản phẩm" });
  }
};

export const getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ?",
      [slug]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error("getProductBySlug Error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi lấy thông tin sản phẩm theo slug" });
  }
};

export const addProduct = async (req, res) => {
  const { name, slug, price, old_price, image, category_id, stock, status } = req.body;

  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({ success: false, message: "Vui lòng điền đủ Tên, Giá bán và Số lượng tồn kho" });
  }

  const finalSlug = slug ? generateSlug(slug) : generateSlug(name);

  try {
    const [result] = await pool.query(
      "INSERT INTO products (name, slug, price, old_price, image, category_id, stock, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        finalSlug,
        Number(price),
        old_price ? Number(old_price) : null,
        image || "/Sản Phẩm – Kidty Shop_files/pro-16_master.jpg",
        category_id ? Number(category_id) : null,
        Number(stock),
        status || "active"
      ]
    );

    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [result.insertId]);
    return res.status(201).json({ success: true, product: rows[0] });
  } catch (error) {
    console.error("addProduct Error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi thêm sản phẩm mới (Slug có thể đã tồn tại)" });
  }
};

export const updateProduct = async (req, res) => {
  const { name, slug, price, old_price, image, category_id, stock, status } = req.body;
  const { id } = req.params;

  try {
    const [existing] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm cần cập nhật" });
    }

    const curr = existing[0];
    const finalSlug = slug !== undefined ? (slug ? generateSlug(slug) : generateSlug(name || curr.name)) : curr.slug;

    await pool.query(
      "UPDATE products SET name = ?, slug = ?, price = ?, old_price = ?, image = ?, category_id = ?, stock = ?, status = ? WHERE id = ?",
      [
        name !== undefined ? name : curr.name,
        finalSlug,
        price !== undefined ? Number(price) : curr.price,
        old_price !== undefined ? (old_price ? Number(old_price) : null) : curr.old_price,
        image !== undefined ? image : curr.image,
        category_id !== undefined ? (category_id ? Number(category_id) : null) : curr.category_id,
        stock !== undefined ? Number(stock) : curr.stock,
        status !== undefined ? status : curr.status,
        id
      ]
    );

    const [updated] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    return res.json({ success: true, product: updated[0] });
  } catch (error) {
    console.error("updateProduct Error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi cập nhật sản phẩm (Slug có thể bị trùng)" });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm để xóa" });
    }
    await pool.query("DELETE FROM products WHERE id = ?", [id]);
    return res.json({ success: true, message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("deleteProduct Error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi xóa sản phẩm" });
  }
};
