import { useState } from "react";
import { adminStorageService } from "../../services/adminStorage.js";

export default function AdminSettingsView() {
  const [form, setForm] = useState(() => adminStorageService.getSettings());

  const handleSaveSettings = (e) => {
    e.preventDefault();
    adminStorageService.saveSettings(form);
    
    // Custom Event or update styling if needed, otherwise trigger a toast
    if (window.showToast) {
      window.showToast("Cài đặt cửa hàng đã được lưu lại thành công", "success", "Cấu hình cửa hàng");
    } else {
      alert("Đã lưu cài đặt cửa hàng thành công!");
    }
  };

  return (
    <div className="admin-settings-view" style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{
        background: "white",
        border: "1px solid var(--kidty-border)",
        borderRadius: "16px",
        padding: "30px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.01)"
      }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "1.15rem", fontWeight: "800", color: "var(--kidty-primary)" }}>⚙️ Cấu hình hệ thống</h3>
        <p style={{ margin: "0 0 25px 0", fontSize: "0.85rem", color: "var(--kidty-text-secondary)" }}>
          Chỉnh sửa các thông tin hiển thị chính trên website Kidty Shop và các thiết lập tính toán đơn hàng.
        </p>

        <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div className="admin-form-group">
            <label>Tên cửa hàng (Shop Name) *</label>
            <input 
              type="text" 
              className="admin-input" 
              required
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label>Slogan / Tagline của cửa hàng</label>
            <input 
              type="text" 
              className="admin-input" 
              value={form.slogan}
              onChange={(e) => setForm({ ...form, slogan: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div className="admin-form-group">
              <label>Số điện thoại liên hệ (Hotline) *</label>
              <input 
                type="text" 
                className="admin-input" 
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            
            <div className="admin-form-group">
              <label>Địa chỉ Email liên hệ</label>
              <input 
                type="email" 
                className="admin-input" 
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Địa chỉ cửa hàng / Trụ sở chính *</label>
            <textarea 
              className="admin-textarea" 
              rows="2"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div style={{ borderTop: "1px solid var(--kidty-border)", paddingTop: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0", fontSize: "0.95rem", color: "var(--kidty-primary)" }}>🚚 Cấu hình Vận Chuyển</h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div className="admin-form-group">
                <label>Phí vận chuyển mặc định (VNĐ)</label>
                <input 
                  type="number" 
                  className="admin-input" 
                  value={form.shippingFee}
                  onChange={(e) => setForm({ ...form, shippingFee: Number(e.target.value) })}
                />
              </div>
              
              <div className="admin-form-group">
                <label>Ngưỡng miễn phí vận chuyển (VNĐ)</label>
                <input 
                  type="number" 
                  className="admin-input" 
                  value={form.freeShippingThreshold}
                  onChange={(e) => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--kidty-border)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong style={{ display: "block", fontSize: "0.9rem", color: "var(--kidty-text-primary)" }}>Bật thông báo trạng thái đơn hàng</strong>
              <span style={{ fontSize: "0.8rem", color: "var(--kidty-text-secondary)" }}>Nhận thông báo tự động mỗi khi có đơn hàng mới phát sinh</span>
            </div>
            <label className="admin-switch">
              <input 
                type="checkbox" 
                checked={form.notificationEnabled}
                onChange={(e) => setForm({ ...form, notificationEnabled: e.target.checked })}
              />
              <span className="admin-slider"></span>
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
            <button type="submit" className="admin-btn" style={{ padding: "12px 30px" }}>
              💾 Lưu cấu hình
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
