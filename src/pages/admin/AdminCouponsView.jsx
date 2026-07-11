import { useState } from "react";
import { adminStorageService } from "../../services/adminStorage.js";

export default function AdminCouponsView() {
  const [coupons, setCoupons] = useState(() => adminStorageService.getCoupons());
  
  // Modal/Form States
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  
  const [form, setForm] = useState({
    code: "",
    type: "percent",
    value: "",
    startDate: "",
    endDate: "",
    status: "active"
  });

  const loadData = () => {
    setCoupons(adminStorageService.getCoupons());
  };

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setForm({
        code: coupon.code,
        type: coupon.type || "percent",
        value: coupon.value,
        startDate: coupon.startDate || "",
        endDate: coupon.endDate || "",
        status: coupon.status || "active"
      });
    } else {
      setEditingCoupon(null);
      // set defaults to current date and 30 days from now
      const start = new Date().toISOString().split("T")[0];
      const end = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0];
      setForm({
        code: "",
        type: "percent",
        value: "",
        startDate: start,
        endDate: end,
        status: "active"
      });
    }
    setShowModal(true);
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) {
      alert("Vui lòng điền đầy đủ Mã giảm giá và Giá trị!");
      return;
    }

    const cleanCode = form.code.toUpperCase().replace(/\s+/g, "");
    const couponData = {
      ...form,
      code: cleanCode,
      value: Number(form.value)
    };

    if (editingCoupon) {
      adminStorageService.updateCoupon(editingCoupon.id, couponData);
      if (window.showToast) {
        window.showToast("Cập nhật mã giảm giá thành công", "success", "Mã giảm giá");
      }
    } else {
      adminStorageService.addCoupon(couponData);
      if (window.showToast) {
        window.showToast("Đã tạo mã giảm giá mới", "success", "Mã giảm giá");
      }
    }

    setShowModal(false);
    loadData();
  };

  const handleDeleteCoupon = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này khỏi hệ thống?")) {
      adminStorageService.deleteCoupon(id);
      if (window.showToast) {
        window.showToast("Đã xóa mã giảm giá", "success", "Xóa mã giảm giá");
      }
      loadData();
    }
  };

  const handleToggleStatus = (coupon) => {
    const newStatus = coupon.status === "active" ? "inactive" : "active";
    adminStorageService.updateCoupon(coupon.id, { status: newStatus });
    loadData();
    if (window.showToast) {
      window.showToast(`Đã chuyển trạng thái sang: ${newStatus}`, "info", "Trạng thái mã giảm giá");
    }
  };

  return (
    <div className="admin-coupons-view">
      {/* Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "0.85rem", color: "var(--kidty-text-secondary)", fontWeight: "600" }}>
          Thiết lập mã khuyến mãi áp dụng khi khách hàng đặt đơn tại Giỏ Hàng
        </div>
        <button className="admin-btn" onClick={() => handleOpenModal()}>
          ➕ Tạo mã giảm giá mới
        </button>
      </div>

      {/* Coupons Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã Giảm Giá</th>
              <th>Loại Ưu Đãi</th>
              <th>Mức Ưu Đãi</th>
              <th>Thời Gian Áp Dụng</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: "center" }}>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--kidty-text-secondary)" }}>
                  Chưa có mã giảm giá nào được tạo.
                </td>
              </tr>
            ) : (
              coupons.map(c => {
                const now = new Date().toISOString().split("T")[0];
                const isExpired = c.endDate && c.endDate < now;
                const statusText = isExpired ? "Đã hết hạn" : c.status === "active" ? "Đang chạy" : "Tạm ngưng";
                const badgeClass = isExpired ? "danger" : c.status === "active" ? "success" : "warning";

                return (
                  <tr key={c.id}>
                    <td>
                      <code style={{ fontSize: "1rem", color: "var(--kidty-primary)", fontWeight: "700", border: "1.5px dashed var(--kidty-primary)", padding: "4px 10px", borderRadius: "6px", background: "var(--kidty-primary-light)" }}>
                        {c.code}
                      </code>
                    </td>
                    <td>
                      {c.type === "percent" && "Giảm theo phần trăm (%)"}
                      {c.type === "fixed" && "Giảm số tiền cố định (đ)"}
                      {c.type === "freeship" && "Miễn phí vận chuyển (Freeship)"}
                    </td>
                    <td style={{ fontWeight: "700" }}>
                      {c.type === "percent" && `${c.value}%`}
                      {c.type === "fixed" && `${c.value.toLocaleString("vi-VN")}₫`}
                      {c.type === "freeship" && `Tối đa ${c.value.toLocaleString("vi-VN")}₫`}
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "var(--kidty-text-secondary)" }}>
                      Từ: <strong>{c.startDate}</strong> <br />
                      Đến: <strong>{c.endDate}</strong>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className={`admin-badge ${badgeClass}`}>{statusText}</span>
                        {!isExpired && (
                          <label className="admin-switch">
                            <input 
                              type="checkbox" 
                              checked={c.status === "active"}
                              onChange={() => handleToggleStatus(c)}
                            />
                            <span className="admin-slider"></span>
                          </label>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button 
                          className="admin-btn-outline" 
                          style={{ padding: "5px 10px", fontSize: "0.8rem" }}
                          onClick={() => handleOpenModal(c)}
                        >
                          ✏️ Sửa
                        </button>
                        <button 
                          className="admin-btn-outline" 
                          style={{ padding: "5px 10px", fontSize: "0.8rem", color: "var(--kidty-danger)", borderColor: "var(--kidty-danger)" }}
                          onClick={() => handleDeleteCoupon(c.id)}
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: "500px" }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editingCoupon ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}</h3>
              <button className="admin-modal-close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveCoupon}>
              <div className="admin-modal-body">
                
                <div className="admin-form-group">
                  <label>Mã Code giảm giá *</label>
                  <input 
                    type="text" 
                    className="admin-input" 
                    placeholder="MÃ VIẾT LIỀN KHÔNG DẤU (Ví dụ: SALE30)"
                    required
                    style={{ textTransform: "uppercase" }}
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "15px" }}>
                  <div className="admin-form-group">
                    <label>Loại chương trình giảm</label>
                    <select 
                      className="admin-select"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="percent">Giảm theo % (Phần trăm)</option>
                      <option value="fixed">Giảm số tiền cố định (VNĐ)</option>
                      <option value="freeship">Miễn phí vận chuyển (Freeship)</option>
                    </select>
                  </div>
                  
                  <div className="admin-form-group">
                    <label>Giá trị ưu đãi *</label>
                    <input 
                      type="number" 
                      className="admin-input" 
                      placeholder="Mức giảm"
                      required
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div className="admin-form-group">
                    <label>Ngày bắt đầu áp dụng</label>
                    <input 
                      type="date" 
                      className="admin-input" 
                      required
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label>Ngày hết hạn</label>
                    <input 
                      type="date" 
                      className="admin-input" 
                      required
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {editingCoupon && (
                  <div className="admin-form-group" style={{ marginBottom: "0" }}>
                    <label>Trạng thái kích hoạt</label>
                    <select 
                      className="admin-select"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="active">Đang áp dụng (Active)</option>
                      <option value="inactive">Tạm dừng (Inactive)</option>
                    </select>
                  </div>
                )}

              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="admin-btn">Lưu mã giảm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
