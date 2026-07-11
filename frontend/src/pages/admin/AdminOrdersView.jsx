import { useState, useMemo, useEffect } from "react";
import { request } from "../../services/api.js";

export default function AdminOrdersView() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const data = await request("/orders");
      const mapped = data.map(o => ({
        ...o,
        name: o.customer_name || o.name,
        totalPrice: Number(o.total_price || o.totalPrice || 0),
        createdAt: o.created_at || o.createdAt,
        items: (o.items || []).map(item => ({ ...item, title: item.product_name || item.title }))
      }));
      setOrders(mapped);
    } catch (err) {
      console.error("Unable to load orders from backend:", err.message);
      if (window.showToast) {
        window.showToast(err.message, "error", "Không tải được đơn hàng");
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);


  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [viewingOrder, setViewingOrder] = useState(null);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders
      .filter(o => {
        const matchSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            o.phone.includes(searchQuery) ||
                            String(o.id || o.order_code || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === "all" || o.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
  }, [orders, searchQuery, statusFilter]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await request(`/orders/${orderId}/status`, {
        method: "PUT",
        body: { status: newStatus }
      });
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.message, "error", "Cập nhật thất bại");
      }
      return;
    }

    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    setOrders(updated);
    if (viewingOrder && viewingOrder.id === orderId) {
      setViewingOrder({ ...viewingOrder, status: newStatus });
    }
    if (window.showToast) {
      window.showToast(`Đã cập nhật trạng thái đơn sang: ${newStatus}`, "success", "Cập nhật đơn hàng");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này khỏi hệ thống quản lý? Hành động này không thể hoàn tác.")) {
      try {
        await request(`/orders/${orderId}`, {
          method: "DELETE"
        });
      } catch (err) {
        if (window.showToast) {
          window.showToast(err.message, "error", "Xóa đơn thất bại");
        }
        return;
      }

      const updated = orders.filter(o => o.id !== orderId);
      setOrders(updated);
      if (window.showToast) {
        window.showToast("Đã xóa đơn hàng thành công", "success", "Xóa đơn hàng");
      }
    }
  };

  return (
    <div className="admin-orders-view">
      {/* Action Bar */}
      <div className="admin-action-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
        
        {/* Search */}
        <div className="admin-search-box" style={{ position: "relative", width: "300px" }}>
          <span className="admin-search-icon" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--kidty-text-secondary)" }}>🔍</span>
          <input 
            type="text" 
            className="admin-search-input" 
            placeholder="Tìm theo tên, SĐT, mã đơn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", paddingLeft: "35px" }}
          />
        </div>

        {/* Filter */}
        <div className="admin-filter-group">
          <select 
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: "180px" }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt (Pending)</option>
            <option value="processing">Đang chuẩn bị (Processing)</option>
            <option value="shipped">Đang giao (Shipped)</option>
            <option value="delivered">Đã giao (Delivered)</option>
            <option value="cancelled">Đã hủy (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã Đơn Hàng</th>
              <th>Khách Hàng</th>
              <th>Sản Phẩm</th>
              <th>Ngày Đặt</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: "center" }}>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--kidty-text-secondary)" }}>
                  Không tìm thấy đơn hàng nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredOrders.map(o => (
                <tr key={o.id}>
                  <td><strong style={{ color: "var(--kidty-primary)" }}>{o.id}</strong></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.name}</div>
                    <span style={{ fontSize: "0.8rem", color: "var(--kidty-text-secondary)" }}>{o.phone}</span>
                  </td>
                  <td style={{ fontSize: "0.85rem", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {o.items?.map(it => `${it.title} x${it.quantity}`).join(", ") || "Không có mặt hàng"}
                  </td>
                  <td>{new Date(o.createdAt).toLocaleString("vi-VN")}</td>
                  <td style={{ fontWeight: 600, color: "var(--kidty-text-primary)" }}>
                    {o.totalPrice.toLocaleString("vi-VN")}₫
                  </td>
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
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button 
                        className="admin-btn-outline" 
                        style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        onClick={async () => {
                          try {
                            const detail = await request(`/orders/${o.id}`);
                            const mappedDetail = {
                              ...detail,
                              name: detail.customer_name || detail.name,
                              totalPrice: Number(detail.total_price || detail.totalPrice || 0),
                              createdAt: detail.created_at || detail.createdAt,
                              items: (detail.items || []).map(item => ({ ...item, title: item.product_name || item.title }))
                            };
                            setViewingOrder(mappedDetail);
                          } catch (err) {
                            if (window.showToast) {
                              window.showToast(err.message, "error", "Không tải được chi tiết đơn");
                            }
                            return;
                          }
                          setShowOrderDetailModal(true);
                        }}
                      >
                        👁️ Chi tiết
                      </button>
                      <button 
                        className="admin-btn-outline" 
                        style={{ padding: "6px 12px", fontSize: "0.8rem", color: "var(--kidty-danger)", borderColor: "var(--kidty-danger)" }}
                        onClick={() => handleDeleteOrder(o.id)}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {showOrderDetailModal && viewingOrder && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: "720px" }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Chi tiết đơn hàng {viewingOrder.id}</h3>
              <button className="admin-modal-close-btn" onClick={() => setShowOrderDetailModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "25px" }}>
                
                {/* Delivery Information & Status Update */}
                <div>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", color: "var(--kidty-primary)", borderBottom: "1px solid var(--kidty-border)", paddingBottom: "6px" }}>Thông tin giao nhận</h4>
                  
                  <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: "6px 0", color: "var(--kidty-text-secondary)", width: "110px" }}>Khách hàng:</td>
                        <td style={{ padding: "6px 0", fontWeight: "600" }}>{viewingOrder.name}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "6px 0", color: "var(--kidty-text-secondary)" }}>Số điện thoại:</td>
                        <td style={{ padding: "6px 0" }}>{viewingOrder.phone}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "6px 0", color: "var(--kidty-text-secondary)", verticalAlign: "top" }}>Địa chỉ giao:</td>
                        <td style={{ padding: "6px 0", lineHeight: "1.4" }}>{viewingOrder.address}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "6px 0", color: "var(--kidty-text-secondary)" }}>Phương thức:</td>
                        <td style={{ padding: "6px 0" }}>{viewingOrder.paymentMethod === "cod" ? "COD (Nhận hàng trả tiền)" : "Chuyển khoản Vietcombank"}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "6px 0", color: "var(--kidty-text-secondary)" }}>Ngày đặt:</td>
                        <td style={{ padding: "6px 0" }}>{new Date(viewingOrder.createdAt).toLocaleString("vi-VN")}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "6px 0", color: "var(--kidty-text-secondary)" }}>Ghi chú đơn:</td>
                        <td style={{ padding: "6px 0", fontStyle: "italic", color: viewingOrder.note ? "inherit" : "var(--kidty-text-secondary)" }}>
                          {viewingOrder.note || "Không có ghi chú"}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <h4 style={{ margin: "20px 0 12px 0", fontSize: "0.95rem", color: "var(--kidty-primary)", borderBottom: "1px solid var(--kidty-border)", paddingBottom: "6px" }}>Cập nhật trạng thái</h4>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <select 
                      className="admin-select"
                      value={viewingOrder.status}
                      onChange={(e) => handleUpdateOrderStatus(viewingOrder.id, e.target.value)}
                      style={{ flexGrow: 1 }}
                    >
                      <option value="pending">Chờ duyệt (Pending)</option>
                      <option value="processing">Đang chuẩn bị hàng (Processing)</option>
                      <option value="shipped">Đang vận chuyển (Shipped)</option>
                      <option value="delivered">Đã giao hàng (Delivered)</option>
                      <option value="cancelled">Hủy đơn hàng (Cancelled)</option>
                    </select>
                  </div>
                </div>

                {/* Items and Totals */}
                <div>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", color: "var(--kidty-primary)", borderBottom: "1px solid var(--kidty-border)", paddingBottom: "6px" }}>Mặt hàng đã mua</h4>
                  
                  <div style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "5px" }}>
                    {viewingOrder.items?.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center", borderBottom: "1px solid var(--kidty-border)", paddingBottom: "10px" }}>
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--kidty-border)" }} 
                        />
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--kidty-text-primary)" }}>{item.title}</div>
                          <span style={{ fontSize: "0.75rem", color: "var(--kidty-text-secondary)" }}>
                            {item.price.toLocaleString("vi-VN")}₫ x {item.quantity}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                          {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: "20px", borderTop: "1px solid var(--kidty-border)", paddingTop: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem" }}>
                      <span style={{ color: "var(--kidty-text-secondary)" }}>Phí giao hàng:</span>
                      <strong style={{ color: "var(--kidty-success)" }}>Miễn phí</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: "700" }}>
                      <span>Tổng thanh toán:</span>
                      <span style={{ color: "var(--kidty-primary)", fontSize: "1.15rem" }}>
                        {viewingOrder.totalPrice.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" onClick={() => setShowOrderDetailModal(false)}>Đóng lại</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
