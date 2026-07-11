import { useState, useMemo, useEffect } from "react";
import { request } from "../../services/api.js";

export default function AdminCustomersView() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    request("/orders")
      .then((data) => setOrders(data.map((order) => ({
        ...order,
        name: order.customer_name || order.name,
        totalPrice: Number(order.total_price || order.totalPrice || 0),
        createdAt: order.created_at || order.createdAt
      }))))
      .catch((error) => {
        console.error("Unable to load customers from backend:", error.message);
      });
  }, []);

  const customerList = useMemo(() => {
    const custMap = {};
    orders.forEach(o => {
      // Use phone or name as key
      const key = o.phone ? o.phone.trim() : o.name.trim();
      if (!custMap[key]) {
        custMap[key] = {
          name: o.name,
          phone: o.phone || "Không có",
          address: o.address,
          ordersCount: 0,
          totalSpent: 0,
          lastOrder: o.createdAt
        };
      }
      
      custMap[key].ordersCount += 1;
      
      if (o.status !== "cancelled") {
        custMap[key].totalSpent += o.totalPrice;
      }
      
      // Update with the latest order details
      if (new Date(o.createdAt) > new Date(custMap[key].lastOrder)) {
        custMap[key].lastOrder = o.createdAt;
        custMap[key].address = o.address;
        custMap[key].name = o.name; // Keep name updated
      }
    });

    return Object.values(custMap)
      .filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.phone.includes(searchQuery) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.totalSpent - a.totalSpent); // Sort by total spent desc
  }, [orders, searchQuery]);

  return (
    <div className="admin-customers-view">
      {/* Action Bar */}
      <div className="admin-action-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        
        {/* Search */}
        <div className="admin-search-box" style={{ position: "relative", width: "320px" }}>
          <span className="admin-search-icon" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--kidty-text-secondary)" }}>🔍</span>
          <input 
            type="text" 
            className="admin-search-input" 
            placeholder="Tìm theo tên, SĐT, địa chỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", paddingLeft: "35px" }}
          />
        </div>

        <div style={{ fontSize: "0.85rem", color: "var(--kidty-text-secondary)", fontWeight: "600" }}>
          Hiển thị {customerList.length} khách hàng đã giao dịch
        </div>
      </div>

      {/* Customers Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Khách Hàng</th>
              <th>Số Điện Thoại</th>
              <th>Địa Chỉ Nhận Hàng Cuối</th>
              <th>Đơn Đã Đặt</th>
              <th>Tổng Chi Tiêu</th>
              <th>Giao Dịch Gần Nhất</th>
            </tr>
          </thead>
          <tbody>
            {customerList.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--kidty-text-secondary)" }}>
                  Không tìm thấy khách hàng nào.
                </td>
              </tr>
            ) : (
              customerList.map((c, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "35px",
                        height: "35px",
                        borderRadius: "50%",
                        background: "var(--kidty-primary-light)",
                        color: "var(--kidty-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "0.95rem"
                      }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <strong>{c.name}</strong>
                    </div>
                  </td>
                  <td>{c.phone}</td>
                  <td style={{ fontSize: "0.825rem", color: "var(--kidty-text-secondary)", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.address}>
                    {c.address}
                  </td>
                  <td style={{ fontWeight: "600" }}>{c.ordersCount} đơn</td>
                  <td style={{ fontWeight: "700", color: "var(--kidty-primary)" }}>
                    {c.totalSpent.toLocaleString("vi-VN")}₫
                  </td>
                  <td style={{ fontSize: "0.85rem", color: "var(--kidty-text-secondary)" }}>
                    {new Date(c.lastOrder).toLocaleDateString("vi-VN")} {new Date(c.lastOrder).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
