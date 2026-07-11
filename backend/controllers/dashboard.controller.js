import pool from "../config/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total counts
    const [prodCount] = await pool.query("SELECT COUNT(*) as count FROM products");
    const [orderCount] = await pool.query("SELECT COUNT(*) as count FROM orders");
    
    // Status counts
    const [pendingCount] = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
    const [completedCount] = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'completed'");
    const [cancelledCount] = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'cancelled'");

    // 2. Total revenue (sum of all non-cancelled orders)
    const [revenueQuery] = await pool.query("SELECT SUM(total_price) as sum FROM orders WHERE status != 'cancelled'");
    const totalRevenue = revenueQuery[0].sum || 0;

    // 3. Latest orders (e.g. last 5 orders)
    const [latestOrders] = await pool.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5");
    for (let order of latestOrders) {
      const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
      order.items = items;
    }

    // 4. Top selling products
    const [topProducts] = await pool.query(
      `SELECT oi.product_id as id, oi.product_name as name, SUM(oi.quantity) as soldQty, MAX(oi.image) as image, MAX(oi.price) as price 
       FROM order_items oi 
       JOIN orders o ON oi.order_id = o.id 
       WHERE o.status != 'cancelled' 
       GROUP BY oi.product_id, oi.product_name 
       ORDER BY soldQty DESC 
       LIMIT 5`
    );

    // 5. Daily revenue for the last 7 days
    const [revenueLast7Days] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, SUM(total_price) as total 
       FROM orders 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND status != 'cancelled' 
       GROUP BY DATE(created_at) 
       ORDER BY date ASC`
    );

    // Return exact requested JSON fields
    return res.json({
      totalProducts: prodCount[0].count,
      totalOrders: orderCount[0].count,
      totalRevenue,
      pendingOrders: pendingCount[0].count,
      completedOrders: completedCount[0].count,
      cancelledOrders: cancelledCount[0].count,
      latestOrders,
      topProducts,
      revenueLast7Days
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi tính toán chỉ số thống kê tại máy chủ" });
  }
};
