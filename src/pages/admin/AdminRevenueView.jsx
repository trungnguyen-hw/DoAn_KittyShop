import { useState, useMemo } from "react";

export default function AdminRevenueView() {
  const [orders] = useState(() => {
    const savedOrders = localStorage.getItem("kidty-orders");
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  const stats = useMemo(() => {
    let completedRevenue = 0;
    let pendingRevenue = 0;
    let cancelledRevenue = 0;
    let completedCount = 0;
    let codRevenue = 0;
    let bankRevenue = 0;

    orders.forEach(o => {
      if (o.status === "delivered" || o.status === "shipped") {
        completedRevenue += o.totalPrice;
        completedCount += 1;
        if (o.paymentMethod === "cod") {
          codRevenue += o.totalPrice;
        } else {
          bankRevenue += o.totalPrice;
        }
      } else if (o.status === "cancelled") {
        cancelledRevenue += o.totalPrice;
      } else {
        pendingRevenue += o.totalPrice;
      }
    });

    return {
      completedRevenue,
      pendingRevenue,
      cancelledRevenue,
      completedCount,
      codRevenue,
      bankRevenue
    };
  }, [orders]);

  const completedOrdersList = useMemo(() => {
    return orders
      .filter(o => o.status === "delivered" || o.status === "shipped")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders]);

  return (
    <div className="admin-revenue-view">
      {/* Revenue Grid */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        
        <div style={{ background: "white", border: "1px solid var(--kidty-border)", borderRadius: "16px", padding: "20px" }}>
          <div style={{ color: "var(--kidty-text-secondary)", fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px" }}>💰 DOANH THU ĐÃ THU THỰC TẾ</div>
          <h2 style={{ fontSize: "1.65rem", fontWeight: "800", color: "var(--kidty-success)", margin: "0 0 4px 0" }}>
            {stats.completedRevenue.toLocaleString("vi-VN")}₫
          </h2>
          <span style={{ fontSize: "0.8rem", color: "var(--kidty-text-secondary)" }}>
            Từ {stats.completedCount} đơn hàng hoàn tất
          </span>
        </div>

        <div style={{ background: "white", border: "1px solid var(--kidty-border)", borderRadius: "16px", padding: "20px" }}>
          <div style={{ color: "var(--kidty-text-secondary)", fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px" }}>⏳ DOANH THU ĐANG XỬ LÝ</div>
          <h2 style={{ fontSize: "1.65rem", fontWeight: "800", color: "var(--kidty-warning)", margin: "0 0 4px 0" }}>
            {stats.pendingRevenue.toLocaleString("vi-VN")}₫
          </h2>
          <span style={{ fontSize: "0.8rem", color: "var(--kidty-text-secondary)" }}>
            Đơn hàng đang giao/chờ xử lý
          </span>
        </div>

        <div style={{ background: "white", border: "1px solid var(--kidty-border)", borderRadius: "16px", padding: "20px" }}>
          <div style={{ color: "var(--kidty-text-secondary)", fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px" }}>❌ DOANH THU BỊ HỦY</div>
          <h2 style={{ fontSize: "1.65rem", fontWeight: "800", color: "var(--kidty-danger)", margin: "0 0 4px 0" }}>
            {stats.cancelledRevenue.toLocaleString("vi-VN")}₫
          </h2>
          <span style={{ fontSize: "0.8rem", color: "var(--kidty-text-secondary)" }}>
            Giá trị của các đơn bị khách hủy
          </span>
        </div>

        <div style={{ background: "white", border: "1px solid var(--kidty-border)", borderRadius: "16px", padding: "20px" }}>
          <div style={{ color: "var(--kidty-text-secondary)", fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px" }}>🛒 ĐƠN THÀNH CÔNG</div>
          <h2 style={{ fontSize: "1.65rem", fontWeight: "800", color: "var(--kidty-info)", margin: "0 0 4px 0" }}>
            {stats.completedCount} Đơn
          </h2>
          <span style={{ fontSize: "0.8rem", color: "var(--kidty-text-secondary)" }}>
            Đã thanh toán & nhận hàng
          </span>
        </div>

      </section>

      {/* Payment methods and statistics detail */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "25px", marginBottom: "30px" }}>
        
        {/* Payment Methods card */}
        <div style={{ background: "white", border: "1px solid var(--kidty-border)", borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "1.05rem", fontWeight: "700" }}>💳 Phương thức thanh toán</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            
            <div style={{ padding: "15px", border: "1px solid var(--kidty-border)", borderRadius: "12px", background: "rgba(99, 102, 241, 0.02)" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--kidty-text-secondary)", marginBottom: "4px" }}>Chuyển khoản Ngân hàng (Bank)</div>
              <strong style={{ fontSize: "1.2rem", color: "var(--kidty-primary)" }}>{stats.bankRevenue.toLocaleString("vi-VN")}₫</strong>
              <div style={{ fontSize: "0.75rem", color: "var(--kidty-text-secondary)", marginTop: "4px" }}>
                Chiếm {stats.completedRevenue > 0 ? Math.round((stats.bankRevenue / stats.completedRevenue) * 100) : 0}% doanh thu
              </div>
            </div>

            <div style={{ padding: "15px", border: "1px solid var(--kidty-border)", borderRadius: "12px", background: "rgba(46, 196, 182, 0.02)" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--kidty-text-secondary)", marginBottom: "4px" }}>Thanh toán khi nhận hàng (COD)</div>
              <strong style={{ fontSize: "1.2rem", color: "#0096c7" }}>{stats.codRevenue.toLocaleString("vi-VN")}₫</strong>
              <div style={{ fontSize: "0.75rem", color: "var(--kidty-text-secondary)", marginTop: "4px" }}>
                Chiếm {stats.completedRevenue > 0 ? Math.round((stats.codRevenue / stats.completedRevenue) * 100) : 0}% doanh thu
              </div>
            </div>

          </div>
        </div>

        {/* List of completed transactions */}
        <div style={{ background: "white", border: "1px solid var(--kidty-border)", borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ margin: "0 0 15px 0", fontSize: "1.05rem", fontWeight: "700" }}>📝 Danh sách đơn giao dịch thực tế</h3>
          
          <div className="admin-table-container" style={{ maxHeight: "300px", overflowY: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Thanh toán</th>
                  <th>Ngày hoàn tất</th>
                  <th>Tổng tiền</th>
                </tr>
              </thead>
              <tbody>
                {completedOrdersList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "var(--kidty-text-secondary)" }}>
                      Chưa ghi nhận giao dịch thành công nào.
                    </td>
                  </tr>
                ) : (
                  completedOrdersList.map(o => (
                    <tr key={o.id}>
                      <td><strong style={{ color: "var(--kidty-primary)" }}>{o.id}</strong></td>
                      <td>
                        <div>{o.name}</div>
                        <span style={{ fontSize: "0.8rem", color: "var(--kidty-text-secondary)" }}>{o.phone}</span>
                      </td>
                      <td>
                        <span className={`admin-badge ${o.paymentMethod === "cod" ? "info" : "success"}`}>
                          {o.paymentMethod === "cod" ? "COD" : "Bank"}
                        </span>
                      </td>
                      <td>{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td style={{ fontWeight: 600, color: "var(--kidty-success)" }}>
                        +{o.totalPrice.toLocaleString("vi-VN")}₫
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
