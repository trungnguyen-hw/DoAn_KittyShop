import pool from "../config/db.js";

export const getOrders = async (req, res) => {
  try {
    const [orders] = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    for (let order of orders) {
      const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
      order.items = items;
    }
    return res.json(orders);
  } catch (error) {
    console.error("getOrders Error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi lấy danh sách đơn hàng" });
  }
};

export const createOrder = async (req, res) => {
  const { 
    customer_name, 
    name, 
    phone, 
    email, 
    address, 
    payment_method, 
    paymentMethod, 
    note, 
    items, 
    totalPrice,
    total_price 
  } = req.body;

  const finalName = customer_name || name;
  const finalPayment = payment_method || paymentMethod || "cod";

  if (!finalName || !phone || !address || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin đặt hàng" });
  }

  // Securely calculate total_price dynamically from items array
  let finalTotalPrice = 0;
  for (const item of items) {
    finalTotalPrice += Number(item.price) * (Number(item.quantity) || 1);
  }

  const orderCode = "ORD" + Date.now() + Math.floor(100 + Math.random() * 900);

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Insert order
    const [orderResult] = await connection.query(
      "INSERT INTO orders (order_code, customer_name, phone, email, address, note, payment_method, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')",
      [orderCode, finalName.trim(), phone.trim(), email ? email.trim() : null, address.trim(), note || "", finalPayment, finalTotalPrice]
    );

    const insertedOrderId = orderResult.insertId;

    // 2. Insert order items
    for (const item of items) {
      const productId = item.product_id || item.id;
      
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, product_name, price, quantity, image, variant) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          insertedOrderId,
          productId && !isNaN(productId) ? Number(productId) : null,
          item.product_name || item.name || item.title || "Sản phẩm",
          Number(item.price),
          Number(item.quantity) || 1,
          item.image || null,
          item.variant || ""
        ]
      );

      // 3. Deduct stock from products
      if (productId && !isNaN(productId)) {
        await connection.query(
          "UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?",
          [Number(item.quantity) || 1, Number(productId)]
        );
      }
    }

    await connection.commit();
    return res.status(201).json({ success: true, orderId: insertedOrderId, orderCode, message: "Đặt hàng thành công!" });
  } catch (error) {
    await connection.rollback();
    console.error("Order Transaction Error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi xử lý đặt hàng tại máy chủ" });
  } finally {
    connection.release();
  }
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!status) {
    return res.status(400).json({ success: false, message: "Thiếu trạng thái đơn hàng" });
  }

  try {
    const [existing] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    return res.json({ success: true, message: `Đã cập nhật trạng thái đơn hàng sang: ${status}` });
  } catch (error) {
    console.error("updateOrderStatus Error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi cập nhật trạng thái đơn hàng" });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }
    await pool.query("DELETE FROM orders WHERE id = ?", [id]);
    return res.json({ success: true, message: "Xóa đơn hàng thành công" });
  } catch (error) {
    console.error("deleteOrder Error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi xóa đơn hàng" });
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    // Support lookup by integer ID or order_code
    const query = isNaN(id)
      ? "SELECT * FROM orders WHERE order_code = ?"
      : "SELECT * FROM orders WHERE id = ?";

    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    const order = rows[0];
    const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
    order.items = items;

    return res.json(order);
  } catch (error) {
    console.error("getOrderById Error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi lấy thông tin chi tiết đơn hàng" });
  }
};
