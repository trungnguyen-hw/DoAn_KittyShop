import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { productService } from "../../services/productService.js";
import { request } from "../../services/api.js";

// Helper to seed sample orders if none exist
const seedMockOrders = () => {
  const existing = localStorage.getItem("kidty-orders");
  if (!existing || JSON.parse(existing).length === 0) {
    const samples = [
      {
        id: "ORD-948201",
        name: "Nguyễn Văn Bình",
        phone: "0903112233",
        address: "15 Thảo Điền, Quận 2, TP. Hồ Chí Minh",
        paymentMethod: "cod",
        note: "Giao giờ hành chính giúp em ạ.",
        createdAt: new Date().toISOString(), // today
        items: [
          {
            key: "Đầm Hoa Công Chúa FM-45-default",
            title: "Đầm Hoa Công Chúa FM-45",
            price: 389000,
            image: "/Đầm Hoa Công Chúa FM-45 – Kidty Shop - KIểu hiển thị 1_files/pro-16_master.jpg",
            quantity: 1
          }
        ],
        totalPrice: 389000,
        status: "processing"
      },
      {
        id: "ORD-108472",
        name: "Trần Thị Hoa",
        phone: "0987654321",
        address: "120 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
        paymentMethod: "bank",
        note: "Đã chuyển khoản qua Vietcombank.",
        createdAt: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString(), // 1.5 days ago
        items: [
          {
            key: "Áo vest bé trai FM V5-default",
            title: "Áo vest bé trai FM V5",
            price: 450000,
            image: "/Sản Phẩm – Kidty Shop_files/pro-12_master.jpg",
            quantity: 2
          }
        ],
        totalPrice: 900000,
        status: "delivered"
      },
      {
        id: "ORD-305829",
        name: "Phạm Minh Tuấn",
        phone: "0918273645",
        address: "78 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội",
        paymentMethod: "cod",
        note: "",
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
        items: [
          {
            key: "Body dài cho bé dễ thương-default",
            title: "Body dài cho bé dễ thương",
            price: 199000,
            image: "/Sản Phẩm – Kidty Shop_files/pro-8_master.jpg",
            quantity: 1
          },
          {
            key: "Body bé trai hình siêu nhân-default",
            title: "Body bé trai hình siêu nhân",
            price: 189000,
            image: "/Sản Phẩm – Kidty Shop_files/pro-10_master.jpg",
            quantity: 1
          }
        ],
        totalPrice: 388000,
        status: "delivered"
      },
      {
        id: "ORD-859203",
        name: "Lê Hoàng Nam",
        phone: "0933445566",
        address: "456 Trần Hưng Đạo, Quận Hải Châu, Đà Nẵng",
        paymentMethod: "cod",
        note: "Gọi trước khi giao 30 phút.",
        createdAt: new Date().toISOString(), // today
        items: [
          {
            key: "Set áo rời quần DM A2-default",
            title: "Set áo rời quần DM A2",
            price: 270000,
            image: "/Sản Phẩm – Kidty Shop_files/pro-1_master.jpg",
            quantity: 1
          }
        ],
        totalPrice: 270000,
        status: "pending"
      },
      {
        id: "ORD-759201",
        name: "Vũ Thị Mai",
        phone: "0966778899",
        address: "92 Lê Hồng Phong, TP. Vũng Tàu",
        paymentMethod: "bank",
        note: "Hủy đơn hộ mình để đặt lại bộ khác.",
        createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(), // 6 days ago
        items: [
          {
            key: "Đầm công chúa cho bé gái M003-default",
            title: "Đầm công chúa cho bé gái M003",
            price: 320000,
            image: "/Sản Phẩm – Kidty Shop_files/pro-3_master.jpg",
            quantity: 1
          }
        ],
        totalPrice: 320000,
        status: "cancelled"
      }
    ];
    localStorage.setItem("kidty-orders", JSON.stringify(samples));
  }
};

export default function AdminDashboardView() {
  const [products, setProducts] = useState(() => productService.getProducts());
  const [orders, setOrders] = useState(() => {
    seedMockOrders();
    const savedOrders = localStorage.getItem("kidty-orders");
    return savedOrders ? JSON.parse(savedOrders) : [];
  });
  const [stats, setStats] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Stats
        const statsData = await request("/dashboard/stats");
        setStats(statsData);
        if (statsData.latestOrders) {
          const mappedOrders = statsData.latestOrders.map(o => ({
            ...o,
            name: o.customer_name || o.name,
            totalPrice: o.total_price || o.totalPrice
          }));
          setOrders(mappedOrders);
        }
      } catch (err) {
        console.warn("Backend API stats offline, falling back to local storage:", err.message);
      }
      
      try {
        // 2. Fetch Products
        const prodData = await request("/products");
        const mappedProds = prodData.map(p => ({
          ...p,
          title: p.name || p.title,
          category: p.category_name || p.category || "Bé Gái",
          oldPrice: p.old_price !== undefined ? p.old_price : p.oldPrice
        }));
        setProducts(mappedProds);
      } catch (err) {
        console.warn("Backend API products offline, falling back to local storage:", err.message);
      }
    };
    fetchDashboardData();
  }, []);

  // Metrics calculation
  const metrics = useMemo(() => {
    if (stats) {
      return {
        totalProducts: stats.totalProducts,
        totalOrders: stats.totalOrders,
        revenueToday: stats.totalRevenue,
        pendingOrdersCount: stats.pendingOrders,
        totalCustomers: stats.totalOrders, // approximation or count
        lowStockCount: stats.lowStockProducts || 0
      };
    }

    const totalProducts = products.length;
    const totalOrders = orders.length;

    // Revenue today (orders created today with status !== cancelled)
    const todayStr = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.createdAt || o.created_at).toDateString() === todayStr && o.status !== "cancelled");
    const revenueToday = todayOrders.reduce((sum, o) => sum + (Number(o.totalPrice || o.total_price) || 0), 0);

    // Pending orders count
    const pendingOrdersCount = orders.filter(o => o.status === "pending").length;

    // Unique customers count (New/Total customers)
    const custSet = new Set();
    orders.forEach(o => custSet.add(o.phone ? o.phone.trim() : o.name ? o.name.trim() : ""));
    const totalCustomers = custSet.size;

    // Low stock count (stock <= 10)
    const lowStockCount = products.filter(p => p.stock <= 10).length;

    return { 
      totalProducts, 
      totalOrders, 
      revenueToday, 
      pendingOrdersCount, 
      totalCustomers, 
      lowStockCount 
    };
  }, [orders, products, stats]);

  // Chart Data calculation (Sales in last 7 days)
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateVal = String(d.getDate()).padStart(2, '0');
      const keyDateStr = `${year}-${month}-${dateVal}`;

      days.push({
        label: d.toLocaleDateString("vi-VN", { weekday: "short" }) + " " + d.getDate() + "/" + (d.getMonth() + 1),
        dateStr: d.toDateString(),
        keyDateStr,
        value: 0
      });
    }

    if (stats && stats.revenueLast7Days) {
      stats.revenueLast7Days.forEach(item => {
        const found = days.find(day => day.keyDateStr === item.date || item.date.startsWith(day.keyDateStr));
        if (found) {
          found.value = Number(item.total) || 0;
        }
      });
    } else {
      orders.forEach(order => {
        if (order.status !== "cancelled") {
          const orderDateStr = new Date(order.createdAt || order.created_at).toDateString();
          const found = days.find(day => day.dateStr === orderDateStr);
          if (found) {
            found.value += Number(order.totalPrice || order.total_price) || 0;
          }
        }
      });
    }

    const maxValue = Math.max(...days.map(d => d.value), 100000);
    return days.map(d => ({
      ...d,
      heightPercent: Math.min(100, Math.max(5, (d.value / maxValue) * 100))
    }));
  }, [orders, stats]);

  const recentOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  }, [orders]);

  // Compute Top Selling Products based on actual sold quantities
  const topSellingProducts = useMemo(() => {
    if (stats && stats.topProducts) {
      return stats.topProducts.map(p => ({
        ...p,
        title: p.name || p.title
      }));
    }

    const qtyMap = {};
    orders.forEach(o => {
      if (o.status !== "cancelled") {
        o.items?.forEach(item => {
          const key = item.key || item.product_name || item.title;
          if (!qtyMap[key]) {
            qtyMap[key] = {
              title: item.product_name || item.title,
              image: item.image,
              price: item.price,
              soldQty: 0
            };
          }
          qtyMap[key].soldQty += item.quantity || 0;
        });
      }
    });

    // In case no orders or sold items, populate with default first products
    if (Object.keys(qtyMap).length === 0 && products.length > 0) {
      return products.slice(0, 4).map((p, index) => ({
        title: p.name || p.title,
        image: p.image,
        price: p.price,
        soldQty: 12 - index // mock count
      }));
    }

    return Object.values(qtyMap)
      .sort((a, b) => b.soldQty - a.soldQty)
      .slice(0, 4);
  }, [orders, products, stats]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await request(`/orders/${orderId}/status`, {
        method: "PUT",
        body: { status: newStatus }
      });
    } catch (err) {
      console.warn("Backend error, updating dashboard order status:", err.message);
    }

    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    localStorage.setItem("kidty-orders", JSON.stringify(updated));
    setOrders(updated);
    if (viewingOrder && viewingOrder.id === orderId) {
      setViewingOrder({ ...viewingOrder, status: newStatus });
    }
    if (window.showToast) {
      window.showToast(`Đã cập nhật trạng thái đơn sang: ${newStatus}`, "success", "Cập nhật đơn hàng");
    }
  };

  return (
    <div className="admin-dashboard-overview admin-view-fadeup">
      {/* 6 Stats Cards */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        
        {/* Card 1: Tổng sản phẩm */}
        <div style={{
          background: "linear-gradient(135deg, #eef5fc, #d0e1f9)",
          border: "1px solid rgba(78, 168, 222, 0.2)",
          borderRadius: "16px",
          padding: "20px",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
        }} className="admin-stat-card-hoverable">
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--kidty-text-secondary)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", marginBottom: "10px" }}>
            <span>Tổng sản phẩm</span>
            <span style={{ fontSize: "1.25rem" }}>👕</span>
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#2d3142", margin: "0 0 6px 0" }}>
            {metrics.totalProducts} Mẫu
          </h2>
          <span style={{ fontSize: "0.8rem", color: "var(--kidty-text-secondary)" }}>
            Sản phẩm đang kinh doanh
          </span>
        </div>

        {/* Card 2: Tổng đơn hàng */}
        <div style={{
          background: "linear-gradient(135deg, #e6f9f7, #cbf3f0)",
          border: "1px solid rgba(46, 196, 182, 0.2)",
          borderRadius: "16px",
          padding: "20px",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
        }} className="admin-stat-card-hoverable">
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--kidty-text-secondary)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", marginBottom: "10px" }}>
            <span>Tổng đơn hàng</span>
            <span style={{ fontSize: "1.25rem" }}>📦</span>
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f4c5c", margin: "0 0 6px 0" }}>
            {metrics.totalOrders} Đơn
          </h2>
          <span style={{ fontSize: "0.8rem", color: "var(--kidty-success)", fontWeight: "600" }}>
            Đơn hàng trong hệ thống
          </span>
        </div>

        {/* Card 3: Doanh thu hôm nay */}
        <div style={{
          background: "linear-gradient(135deg, #fff5f7, #ffe3e8)",
          border: "1px solid rgba(255, 94, 141, 0.25)",
          borderRadius: "16px",
          padding: "20px",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
        }} className="admin-stat-card-hoverable">
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--kidty-text-secondary)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", marginBottom: "10px" }}>
            <span>Doanh thu hôm nay</span>
            <span style={{ fontSize: "1.25rem" }}>💰</span>
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--kidty-primary)", margin: "0 0 6px 0" }}>
            {metrics.revenueToday.toLocaleString("vi-VN")}₫
          </h2>
          <span style={{ fontSize: "0.8rem", color: "var(--kidty-primary)", fontWeight: "600" }}>
            Phát sinh trong ngày
          </span>
        </div>

        {/* Card 4: Đơn hàng chờ xử lý */}
        <div style={{
          background: "linear-gradient(135deg, #fffbf0, #fef2cc)",
          border: "1px solid rgba(255, 183, 3, 0.25)",
          borderRadius: "16px",
          padding: "20px",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
        }} className="admin-stat-card-hoverable">
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--kidty-text-secondary)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", marginBottom: "10px" }}>
            <span>Đơn chờ xử lý</span>
            <span style={{ fontSize: "1.25rem" }}>⏳</span>
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#fb8500", margin: "0 0 6px 0" }}>
            {metrics.pendingOrdersCount} Đơn
          </h2>
          <span style={{ fontSize: "0.8rem", color: metrics.pendingOrdersCount > 0 ? "#fb8500" : "var(--kidty-text-secondary)", fontWeight: metrics.pendingOrdersCount > 0 ? "600" : "normal" }}>
            {metrics.pendingOrdersCount > 0 ? "Cần xử lý phê duyệt ngay" : "Không có đơn tồn đọng"}
          </span>
        </div>

        {/* Card 5: Khách hàng mới */}
        <div style={{
          background: "linear-gradient(135deg, #f3f0fc, #e5dbff)",
          border: "1px solid rgba(132, 94, 255, 0.2)",
          borderRadius: "16px",
          padding: "20px",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
        }} className="admin-stat-card-hoverable">
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--kidty-text-secondary)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", marginBottom: "10px" }}>
            <span>Khách hàng</span>
            <span style={{ fontSize: "1.25rem" }}>👥</span>
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#5f3dc4", margin: "0 0 6px 0" }}>
            {metrics.totalCustomers} Người
          </h2>
          <span style={{ fontSize: "0.8rem", color: "var(--kidty-text-secondary)" }}>
            Đã đăng ký / Mua hàng
          </span>
        </div>

        {/* Card 6: Sản phẩm sắp hết hàng */}
        <div style={{
          background: "linear-gradient(135deg, #fff0f0, #ffdddd)",
          border: "1px solid rgba(255, 77, 109, 0.25)",
          borderRadius: "16px",
          padding: "20px",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
        }} className="admin-stat-card-hoverable">
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--kidty-text-secondary)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", marginBottom: "10px" }}>
            <span>Sắp hết hàng</span>
            <span style={{ fontSize: "1.25rem" }}>⚠️</span>
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--kidty-danger)", margin: "0 0 6px 0" }}>
            {metrics.lowStockCount} Mẫu
          </h2>
          <span style={{ fontSize: "0.8rem", color: metrics.lowStockCount > 0 ? "var(--kidty-danger)" : "var(--kidty-text-secondary)", fontWeight: metrics.lowStockCount > 0 ? "600" : "normal" }}>
            {metrics.lowStockCount > 0 ? "Số lượng kho còn dưới 10" : "Hàng trong kho dồi dào"}
          </span>
        </div>

      </section>

      {/* Row containing Chart and Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "25px", marginBottom: "30px" }} className="admin-view-fadeup">
        
        {/* Sales Chart Card */}
        <div style={{
          background: "white",
          border: "1px solid var(--kidty-border)",
          borderRadius: "16px",
          padding: "24px"
        }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "1.05rem", fontWeight: "700" }}>📈 Doanh thu 7 ngày vừa qua</h3>
          
          <div className="admin-visual-chart">
            {chartData.map((d, idx) => (
              <div key={idx} className="admin-visual-bar-wrapper">
                <div 
                  className="admin-visual-bar" 
                  style={{ height: `${d.heightPercent}%` }}
                >
                  <div className="admin-visual-bar-tooltip">
                    {d.value.toLocaleString("vi-VN")}₫
                  </div>
                </div>
                <span className="admin-visual-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Suggestion & Alerts */}
        <div style={{
          background: "white",
          border: "1px solid var(--kidty-border)",
          borderRadius: "16px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "15px"
        }}>
          <h3 style={{ margin: "0 0 5px 0", fontSize: "1.05rem", fontWeight: "700" }}>💡 Gợi ý vận hành</h3>
          
          {metrics.pendingOrdersCount > 0 ? (
            <div style={{
              background: "rgba(255, 94, 141, 0.06)",
              border: "1px solid rgba(255, 94, 141, 0.2)",
              borderRadius: "12px",
              padding: "16px"
            }}>
              <strong style={{ color: "var(--kidty-primary)", display: "block", marginBottom: "4px", fontSize: "0.9rem" }}>🛍️ Đơn hàng chưa duyệt</strong>
              <span style={{ fontSize: "0.85rem", color: "var(--kidty-text-secondary)" }}>
                Có <strong>{metrics.pendingOrdersCount}</strong> đơn hàng đang chờ bạn phê duyệt và giao vận.
              </span>
              <Link to="/admin/orders" style={{ display: "block", marginTop: "8px", fontSize: "0.8rem", color: "var(--kidty-primary)", fontWeight: "600", textDecoration: "none" }}>
                Xử lý đơn hàng ngay →
              </Link>
            </div>
          ) : (
            <div style={{
              background: "rgba(46, 196, 182, 0.06)",
              border: "1px solid rgba(46, 196, 182, 0.2)",
              borderRadius: "12px",
              padding: "16px"
            }}>
              <strong style={{ color: "var(--kidty-success)", display: "block", marginBottom: "4px", fontSize: "0.9rem" }}>✅ Mọi thứ ổn định</strong>
              <span style={{ fontSize: "0.85rem", color: "var(--kidty-text-secondary)" }}>
                Không có đơn hàng nào tồn đọng chưa được phê duyệt.
              </span>
            </div>
          )}

          {metrics.lowStockCount > 0 && (
            <div style={{
              background: "rgba(255, 183, 3, 0.06)",
              border: "1px solid rgba(255, 183, 3, 0.2)",
              borderRadius: "12px",
              padding: "16px"
            }}>
              <strong style={{ color: "var(--kidty-warning)", display: "block", marginBottom: "4px", fontSize: "0.9rem" }}>⚠️ Sắp hết hàng trong kho</strong>
              <span style={{ fontSize: "0.85rem", color: "var(--kidty-text-secondary)" }}>
                Có <strong>{metrics.lowStockCount}</strong> sản phẩm còn ít hơn 10 chiếc trong kho.
              </span>
              <Link to="/admin/products" style={{ display: "block", marginTop: "8px", fontSize: "0.8rem", color: "var(--kidty-warning)", fontWeight: "600", textDecoration: "none" }}>
                Xem chi tiết kho hàng →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Row containing Recent Orders and Top Selling Products */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr", gap: "25px" }} className="admin-view-fadeup">
        
        {/* Recent Orders Card */}
        <div style={{
          background: "white",
          border: "1px solid var(--kidty-border)",
          borderRadius: "16px",
          padding: "24px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: "0", fontSize: "1.05rem", fontWeight: "700" }}>🛒 Đơn hàng mới phát sinh</h3>
            <Link to="/admin/orders" className="admin-btn-outline" style={{ textDecoration: "none" }}>
              Tất cả đơn hàng
            </Link>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã Đơn</th>
                  <th>Khách Hàng</th>
                  <th>Thời Gian Đặt</th>
                  <th>Tổng Tiền</th>
                  <th>Trạng Thái</th>
                  <th>Chi Tiết</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "var(--kidty-text-secondary)" }}>
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  recentOrders.map(o => (
                    <tr key={o.id}>
                      <td><strong style={{ color: "var(--kidty-primary)" }}>{o.id}</strong></td>
                      <td>
                        <div>{o.name}</div>
                        <span style={{ fontSize: "0.8rem", color: "var(--kidty-text-secondary)" }}>{o.phone}</span>
                      </td>
                      <td>{new Date(o.createdAt).toLocaleString("vi-VN")}</td>
                      <td style={{ fontWeight: 600 }}>{o.totalPrice.toLocaleString("vi-VN")}₫</td>
                      <td>
                        <span className={`admin-badge ${
                          o.status === "delivered" ? "success" : 
                          o.status === "cancelled" ? "danger" : 
                          o.status === "pending" ? "warning" : "info"
                        }`}>
                          {o.status === "pending" && "Chờ duyệt"}
                          {o.status === "processing" && "Đang xử lý"}
                          {o.status === "shipped" && "Đang giao"}
                          {o.status === "delivered" && "Đã giao"}
                          {o.status === "cancelled" && "Đã hủy"}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="admin-btn-outline" 
                          style={{ padding: "5px 10px", fontSize: "0.8rem" }}
                          onClick={() => {
                            setViewingOrder(o);
                            setShowOrderDetailModal(true);
                          }}
                        >
                          👁️ Xem
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products Card */}
        <div style={{
          background: "white",
          border: "1px solid var(--kidty-border)",
          borderRadius: "16px",
          padding: "24px"
        }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "1.05rem", fontWeight: "700" }}>🏆 Top sản phẩm bán chạy</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {topSellingProducts.map((p, idx) => (
              <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center", borderBottom: idx < topSellingProducts.length - 1 ? "1px solid var(--kidty-border)" : "none", paddingBottom: idx < topSellingProducts.length - 1 ? "12px" : "0" }}>
                <img 
                  src={p.image} 
                  alt={p.title} 
                  style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--kidty-border)" }} 
                />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--kidty-text-primary)", display: "-webkit-box", WebkitLineClamp: "1", WebkitBoxOrient: "vertical", overflow: "hidden" }} title={p.title}>
                    {p.title}
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--kidty-primary)", fontWeight: "600" }}>
                    {p.price.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--kidty-text-secondary)", display: "block" }}>Đã bán</span>
                  <strong style={{ fontSize: "0.95rem", color: "var(--kidty-success)" }}>{p.soldQty} cái</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Order Detail Modal */}
      {showOrderDetailModal && viewingOrder && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: "700px" }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Chi tiết đơn hàng {viewingOrder.id}</h3>
              <button className="admin-modal-close-btn" onClick={() => setShowOrderDetailModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
                <div>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", color: "var(--kidty-primary)" }}>Thông tin nhận hàng</h4>
                  <div style={{ fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div><strong>Họ tên:</strong> {viewingOrder.name}</div>
                    <div><strong>Số điện thoại:</strong> {viewingOrder.phone}</div>
                    <div><strong>Địa chỉ giao hàng:</strong> {viewingOrder.address}</div>
                    <div><strong>Ghi chú:</strong> {viewingOrder.note || "(Không có)"}</div>
                    <div><strong>Phương thức thanh toán:</strong> {viewingOrder.paymentMethod === "cod" ? "COD - Thu tiền tận nơi" : "Chuyển khoản ngân hàng"}</div>
                    <div><strong>Thời gian đặt:</strong> {new Date(viewingOrder.createdAt).toLocaleString("vi-VN")}</div>
                  </div>
                  
                  <h4 style={{ margin: "20px 0 10px 0", fontSize: "0.95rem", color: "var(--kidty-primary)" }}>Cập nhật trạng thái</h4>
                  <select 
                    className="admin-select"
                    value={viewingOrder.status}
                    onChange={(e) => handleUpdateOrderStatus(viewingOrder.id, e.target.value)}
                  >
                    <option value="pending">Chờ duyệt (Pending)</option>
                    <option value="processing">Đang chuẩn bị hàng (Processing)</option>
                    <option value="shipped">Đang vận chuyển (Shipped)</option>
                    <option value="delivered">Đã giao hàng (Delivered)</option>
                    <option value="cancelled">Hủy đơn hàng (Cancelled)</option>
                  </select>
                </div>

                <div>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", color: "var(--kidty-primary)" }}>Mặt hàng đã mua</h4>
                  <div style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "5px" }}>
                    {viewingOrder.items?.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center", borderBottom: "1px solid var(--kidty-border)", paddingBottom: "10px" }}>
                        <img src={item.image} alt={item.title} style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "8px" }} />
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ fontSize: "0.85rem", fontWeight: "600", display: "-webkit-box", WebkitLineClamp: "1", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.title}</div>
                          <span style={{ fontSize: "0.8rem", color: "var(--kidty-text-secondary)" }}>
                            {item.price.toLocaleString("vi-VN")}₫ x {item.quantity}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                          {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid var(--kidty-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                      <span>Phí giao hàng:</span>
                      <span style={{ color: "var(--kidty-success)", fontWeight: "600" }}>Miễn phí</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: "700" }}>
                      <span>Tổng tiền thanh toán:</span>
                      <span style={{ color: "var(--kidty-primary)", fontSize: "1.1rem" }}>{viewingOrder.totalPrice.toLocaleString("vi-VN")}₫</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" onClick={() => setShowOrderDetailModal(false)}>Hoàn tất</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
