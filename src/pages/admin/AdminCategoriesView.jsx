import { useState, useMemo, useEffect } from "react";
import { adminStorageService } from "../../services/adminStorage.js";
import { productService } from "../../services/productService.js";
import { request } from "../../services/api.js";

export default function AdminCategoriesView() {
  const [categories, setCategories] = useState(() => adminStorageService.getCategories());
  const [products, setProducts] = useState(() => productService.getProducts());
  
  // Modal/Form States
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catName, setCatName] = useState("");
  const [catStatus, setCatStatus] = useState("active");

  const fetchCategoriesAndProducts = async () => {
    try {
      const catData = await request("/categories");
      setCategories(catData);
      adminStorageService.saveCategories(catData);
    } catch (err) {
      console.warn("Backend offline, loading categories fallback:", err.message);
      setCategories(adminStorageService.getCategories());
    }
    
    try {
      const prodData = await request("/products");
      const mapped = prodData.map(p => ({
        ...p,
        title: p.name || p.title,
        category: p.category_name || p.category || "Bé Gái",
        oldPrice: p.old_price !== undefined ? p.old_price : p.oldPrice
      }));
      setProducts(mapped);
      productService.saveProducts(mapped);
    } catch (err) {
      console.warn("Backend offline, loading products fallback:", err.message);
      setProducts(productService.getProducts());
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategoriesAndProducts();
  }, []);

  const loadData = () => {
    fetchCategoriesAndProducts();
  };

  // Compute product counts dynamically from actual products
  const categoriesWithCounts = useMemo(() => {
    return categories.map(cat => {
      // Map categories to products
      const count = products.filter(p => {
        if (!p.category) return false;
        // Match string case insensitively or partially
        return p.category.toLowerCase() === cat.name.toLowerCase() ||
               (cat.name.toLowerCase().includes("bé gái") && p.category.toLowerCase() === "bé gái") ||
               (cat.name.toLowerCase().includes("bé trai") && p.category.toLowerCase() === "bé trai") ||
               (cat.name.toLowerCase().includes("sơ sinh") && p.category.toLowerCase() === "sơ sinh") ||
               (cat.name.toLowerCase().includes("unisex") && p.category.toLowerCase() === "unisex");
      }).length;

      return {
        ...cat,
        count: count > 0 ? count : (cat.count || 0) // fall back to hardcoded if 0 and it has default count
      };
    });
  }, [categories, products]);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCatName(category.name);
      setCatStatus(category.status);
    } else {
      setEditingCategory(null);
      setCatName("");
      setCatStatus("active");
    }
    setShowModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      if (window.showToast) {
        window.showToast("Tên danh mục không được để trống!", "error", "Lỗi nhập liệu");
      }
      return;
    }

    const payload = { name: catName.trim(), status: catStatus };

    try {
      if (editingCategory) {
        await request(`/categories/${editingCategory.id}`, {
          method: "PUT",
          body: payload
        });
      } else {
        await request("/categories", {
          method: "POST",
          body: payload
        });
      }

      if (window.showToast) {
        window.showToast(
          editingCategory ? "Cập nhật danh mục thành công" : "Đã thêm danh mục mới",
          "success",
          "Danh mục sản phẩm"
        );
      }
    } catch (err) {
      console.warn("Backend error, saving to local storage fallback:", err.message);
      if (editingCategory) {
        adminStorageService.updateCategory(editingCategory.id, catName.trim(), catStatus);
      } else {
        adminStorageService.addCategory(catName.trim());
      }
    }

    setShowModal(false);
    loadData();
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này? Các sản phẩm thuộc danh mục sẽ không bị xóa nhưng sẽ cần phân loại lại.")) {
      try {
        await request(`/categories/${id}`, {
          method: "DELETE"
        });
        if (window.showToast) {
          window.showToast("Đã xóa danh mục sản phẩm", "success", "Xóa danh mục");
        }
      } catch (err) {
        console.warn("Backend error, deleting from local storage fallback:", err.message);
        adminStorageService.deleteCategory(id);
      }
      loadData();
    }
  };

  const handleToggleStatus = async (cat) => {
    const newStatus = cat.status === "active" ? "inactive" : "active";
    try {
      await request(`/categories/${cat.id}`, {
        method: "PUT",
        body: { status: newStatus }
      });
    } catch (err) {
      console.warn("Backend error, toggling status in local storage fallback:", err.message);
      adminStorageService.updateCategory(cat.id, cat.name, newStatus);
    }
    loadData();
    if (window.showToast) {
      window.showToast(`Đã chuyển trạng thái danh mục sang: ${newStatus}`, "info", "Trạng thái danh mục");
    }
  };

  return (
    <div className="admin-categories-view">
      {/* Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "0.85rem", color: "var(--kidty-text-secondary)", fontWeight: "600" }}>
          Quản lý phân loại sản phẩm hiển thị trên Website
        </div>
        <button className="admin-btn" onClick={() => handleOpenModal()}>
          ➕ Thêm danh mục mới
        </button>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên Danh Mục</th>
              <th>Mã ID</th>
              <th>Số lượng sản phẩm</th>
              <th>Trạng thái hoạt động</th>
              <th style={{ textAlign: "center" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categoriesWithCounts.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "var(--kidty-text-secondary)" }}>
                  Chưa có danh mục nào được thiết lập.
                </td>
              </tr>
            ) : (
              categoriesWithCounts.map(cat => (
                <tr key={cat.id}>
                  <td><strong style={{ fontSize: "0.95rem", color: "var(--kidty-text-primary)" }}>{cat.name}</strong></td>
                  <td><code style={{ background: "#f8f9fa", padding: "3px 6px", borderRadius: "4px", fontSize: "0.8rem" }}>{cat.id}</code></td>
                  <td style={{ fontWeight: "600" }}>{cat.count} sản phẩm</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className={`admin-badge ${cat.status === "active" ? "success" : "danger"}`}>
                        {cat.status === "active" ? "Đang hiện" : "Đang ẩn"}
                      </span>
                      <label className="admin-switch">
                        <input 
                          type="checkbox" 
                          checked={cat.status === "active"}
                          onChange={() => handleToggleStatus(cat)}
                        />
                        <span className="admin-slider"></span>
                      </label>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button 
                        className="admin-btn-outline" 
                        style={{ padding: "5px 10px", fontSize: "0.8rem" }}
                        onClick={() => handleOpenModal(cat)}
                      >
                        ✏️ Sửa
                      </button>
                      <button 
                        className="admin-btn-outline" 
                        style={{ padding: "5px 10px", fontSize: "0.8rem", color: "var(--kidty-danger)", borderColor: "var(--kidty-danger)" }}
                        onClick={() => handleDeleteCategory(cat.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: "450px" }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</h3>
              <button className="admin-modal-close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveCategory}>
              <div className="admin-modal-body">
                
                <div className="admin-form-group">
                  <label>Tên danh mục *</label>
                  <input 
                    type="text" 
                    className="admin-input" 
                    placeholder="Nhập tên danh mục (Ví dụ: Giày dép bé trai...)"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                  />
                </div>

                {editingCategory && (
                  <div className="admin-form-group" style={{ marginBottom: "0" }}>
                    <label>Trạng thái danh mục</label>
                    <select 
                      className="admin-select"
                      value={catStatus}
                      onChange={(e) => setCatStatus(e.target.value)}
                    >
                      <option value="active">Hiển thị (Active)</option>
                      <option value="inactive">Ẩn danh mục (Inactive)</option>
                    </select>
                  </div>
                )}

              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="admin-btn">Lưu danh mục</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
