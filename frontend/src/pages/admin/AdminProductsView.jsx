import { useState, useMemo, useEffect } from "react";
import { request } from "../../services/api.js";

export default function AdminProductsView() {
  const [products, setProducts] = useState([]);
  
  // Search, Filter & Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");

  // Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: "",
    price: "",
    oldPrice: "",
    category: "Bé Gái",
    stock: "",
    colors: "",
    sizes: "",
    status: "active",
    description: "",
    image: ""
  });

  const fetchProducts = async () => {
    try {
      const data = await request("/products");
      const mapped = data.map(p => ({
        ...p,
        title: p.name || p.title,
        category: p.category_name || p.category || "Bé Gái",
        oldPrice: p.old_price !== undefined ? p.old_price : p.oldPrice
      }));
      setProducts(mapped);
    } catch (err) {
      console.error("Unable to load products from backend:", err.message);
      if (window.showToast) {
        window.showToast(err.message, "error", "Không tải được sản phẩm");
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, []);

  const loadData = () => {
    fetchProducts();
  };

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          String(p.id).toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchCat;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name-asc") return a.title.localeCompare(b.title);
      if (sortBy === "name-desc") return b.title.localeCompare(a.title);
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "stock-asc") return (a.stock || 0) - (b.stock || 0);
      if (sortBy === "stock-desc") return (b.stock || 0) - (a.stock || 0);
      return 0;
    });
  }, [products, searchQuery, categoryFilter, sortBy]);

  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        title: product.title,
        price: product.price,
        oldPrice: product.oldPrice || "",
        category: product.category || "Bé Gái",
        stock: product.stock,
        colors: product.colors || "",
        sizes: product.sizes || "",
        status: product.status || "active",
        description: product.description || "",
        image: product.image
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        title: "",
        price: "",
        oldPrice: "",
        category: "Bé Gái",
        stock: "",
        colors: "Hồng, Trắng, Vàng",
        sizes: "90, 100, 110",
        status: "active",
        description: "",
        image: ""
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.title || !productForm.price || !productForm.stock) {
      if (window.showToast) {
        window.showToast("Vui lòng nhập đầy đủ Tên sản phẩm, Giá bán và Số lượng tồn kho!", "error", "Nhập thiếu thông tin");
      }
      return;
    }

    let category_id = null;
    const catStr = productForm.category.toLowerCase();
    if (catStr.includes("gái")) category_id = 1;
    else if (catStr.includes("trai")) category_id = 2;
    else if (catStr.includes("sinh")) category_id = 3;
    else if (catStr.includes("unisex")) category_id = 4;

    const payload = {
      name: productForm.title,
      price: Number(productForm.price),
      old_price: productForm.oldPrice ? Number(productForm.oldPrice) : null,
      image: productForm.image,
      description: productForm.description,
      category_id,
      stock: Number(productForm.stock),
      status: productForm.status
    };

    try {
      if (editingProduct) {
        await request(`/products/${editingProduct.id}`, {
          method: "PUT",
          body: payload
        });
      } else {
        await request("/products", {
          method: "POST",
          body: payload
        });
      }

      if (window.showToast) {
        window.showToast(
          editingProduct ? "Đã cập nhật sản phẩm thành công" : "Đã thêm sản phẩm mới thành công",
          "success",
          editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"
        );
      }
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.message, "error", "Lưu sản phẩm thất bại");
      }
      return;
    }

    setShowProductModal(false);
    loadData();
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi cửa hàng?")) {
      try {
        await request(`/products/${id}`, {
          method: "DELETE"
        });
        if (window.showToast) {
          window.showToast("Đã xóa sản phẩm khỏi cửa hàng", "success", "Xóa sản phẩm");
        }
      } catch (err) {
        if (window.showToast) {
          window.showToast(err.message, "error", "Xóa sản phẩm thất bại");
        }
        return;
      }
      loadData();
    }
  };

  const handleToggleStatus = async (p) => {
    const nextStatus = p.status === "active" ? "inactive" : "active";
    try {
      await request(`/products/${p.id}`, {
        method: "PUT",
        body: { status: nextStatus }
      });
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.message, "error", "Cập nhật trạng thái thất bại");
      }
      return;
    }
    loadData();
    if (window.showToast) {
      window.showToast(`Đã chuyển trạng thái sản phẩm sang: ${nextStatus}`, "info", "Trạng thái hiển thị");
    }
  };

  return (
    <div className="admin-products-view">
      {/* Action Bar */}
      <div className="admin-action-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
        
        {/* Search */}
        <div className="admin-search-box" style={{ position: "relative", width: "260px" }}>
          <span className="admin-search-icon" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--kidty-text-secondary)" }}>🔍</span>
          <input 
            type="text" 
            className="admin-search-input" 
            placeholder="Tìm theo tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", paddingLeft: "35px" }}
          />
        </div>

        {/* Filters and Sorters */}
        <div className="admin-filter-group" style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          
          {/* Lọc danh mục */}
          <select 
            className="admin-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ minWidth: "150px" }}
          >
            <option value="all">Tất cả danh mục</option>
            <option value="Bé Gái">Bé Gái</option>
            <option value="Bé Trai">Bé Trai</option>
            <option value="Sơ Sinh">Sơ Sinh</option>
            <option value="Unisex">Unisex</option>
          </select>

          {/* Sắp xếp */}
          <select 
            className="admin-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ minWidth: "150px" }}
          >
            <option value="name-asc">Tên (A-Z)</option>
            <option value="name-desc">Tên (Z-A)</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="stock-asc">Tồn kho: Thấp đến Cao</option>
            <option value="stock-desc">Tồn kho: Cao đến Thấp</option>
          </select>

          <button className="admin-btn" onClick={() => handleOpenProductModal()}>
            ➕ Thêm sản phẩm mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "35%" }}>Sản Phẩm</th>
              <th>Mã ID</th>
              <th>Danh Mục</th>
              <th>Đơn Giá</th>
              <th>Tồn Kho</th>
              <th>Hiển thị</th>
              <th style={{ textAlign: "center" }}>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--kidty-text-secondary)" }}>
                  Không tìm thấy sản phẩm nào khớp với tìm kiếm.
                </td>
              </tr>
            ) : (
              filteredProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <img 
                        src={p.image || "/Sản Phẩm – Kidty Shop_files/pro-16_master.jpg"} 
                        alt={p.title} 
                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--kidty-border)" }}
                      />
                      <div>
                        <strong style={{ fontSize: "0.9rem", color: "var(--kidty-text-primary)" }}>{p.title}</strong>
                        
                        {/* Display Sizes and Colors */}
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                          {p.sizes && p.sizes.split(",").map((s, idx) => (
                            <span key={idx} style={{ fontSize: "0.7rem", background: "#f1f3f5", color: "#495057", padding: "1px 4px", borderRadius: "3px", fontWeight: "600" }}>{s.trim()}</span>
                          ))}
                          {p.colors && p.colors.split(",").map((c, idx) => (
                            <span key={idx} style={{ fontSize: "0.7rem", background: "#fff0f3", color: "var(--kidty-primary)", padding: "1px 4px", borderRadius: "3px", fontWeight: "600" }}>{c.trim()}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: "0.8rem", background: "#f8f9fa", padding: "3px 8px", borderRadius: "5px", border: "1px solid #e9ecef" }}>
                      {p.id}
                    </code>
                  </td>
                  <td>
                    <span className="admin-badge info">{p.category || "Chưa rõ"}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ color: "var(--kidty-text-primary)" }}>{p.price.toLocaleString("vi-VN")}₫</div>
                    {p.oldPrice && (
                      <span style={{ fontSize: "0.75rem", textDecoration: "line-through", color: "var(--kidty-text-secondary)" }}>
                        {p.oldPrice.toLocaleString("vi-VN")}₫
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ 
                      fontWeight: "600",
                      color: p.stock <= 5 ? "var(--kidty-danger)" : p.stock <= 15 ? "var(--kidty-warning)" : "var(--kidty-success)"
                    }}>
                      {p.stock} cái {p.stock <= 10 && "⚠️"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className={`admin-badge ${p.status !== "inactive" ? "success" : "danger"}`}>
                        {p.status !== "inactive" ? "Hiện" : "Ẩn"}
                      </span>
                      <label className="admin-switch">
                        <input 
                          type="checkbox" 
                          checked={p.status !== "inactive"}
                          onChange={() => handleToggleStatus(p)}
                        />
                        <span className="admin-slider"></span>
                      </label>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button 
                        className="admin-btn-outline" 
                        style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        onClick={() => handleOpenProductModal(p)}
                      >
                        ✏️ Sửa
                      </button>
                      <button 
                        className="admin-btn-outline" 
                        style={{ padding: "6px 12px", fontSize: "0.8rem", color: "var(--kidty-danger)", borderColor: "var(--kidty-danger)" }}
                        onClick={() => handleDeleteProduct(p.id)}
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

      {/* Product Form Modal */}
      {showProductModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: "650px" }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h3>
              <button className="admin-modal-close-btn" onClick={() => setShowProductModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="admin-modal-body">
                
                <div className="admin-form-group">
                  <label>Tên sản phẩm *</label>
                  <input 
                    type="text" 
                    className="admin-input" 
                    placeholder="Nhập tên sản phẩm (Ví dụ: Đầm hoa voan hồng...)"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div className="admin-form-group">
                    <label>Giá bán hiện tại (VNĐ) *</label>
                    <input 
                      type="number" 
                      className="admin-input" 
                      placeholder="Giá thực bán"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Giá niêm yết cũ (nếu có)</label>
                    <input 
                      type="number" 
                      className="admin-input" 
                      placeholder="Giá niêm yết gốc (để gạch ngang)"
                      value={productForm.oldPrice}
                      onChange={(e) => setProductForm({ ...productForm, oldPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div className="admin-form-group">
                    <label>Số lượng tồn kho *</label>
                    <input 
                      type="number" 
                      className="admin-input" 
                      placeholder="Số lượng"
                      required
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Danh mục</label>
                    <select 
                      className="admin-select"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      <option value="Bé Gái">Bé Gái</option>
                      <option value="Bé Trai">Bé Trai</option>
                      <option value="Sơ Sinh">Sơ Sinh</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div className="admin-form-group">
                    <label>Màu sắc (phân cách bằng dấu phẩy)</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="Ví dụ: Hồng, Trắng, Xanh"
                      value={productForm.colors}
                      onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Kích thước / Sizes (phân cách bằng dấu phẩy)</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="Ví dụ: 90, 100, 110 hoặc S, M, L"
                      value={productForm.sizes}
                      onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "15px" }}>
                  <div className="admin-form-group">
                    <label>URL Hình ảnh sản phẩm</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="/Sản Phẩm – Kidty Shop_files/..."
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Trạng thái bán</label>
                    <select 
                      className="admin-select"
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                    >
                      <option value="active">Kích hoạt (Hiện)</option>
                      <option value="inactive">Tạm ngưng (Ẩn)</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group" style={{ marginBottom: "0" }}>
                  <label>Mô tả chi tiết sản phẩm</label>
                  <textarea 
                    className="admin-textarea" 
                    placeholder="Mô tả chất liệu, thiết kế, hướng dẫn chọn size..."
                    rows="3"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>

              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setShowProductModal(false)}>Hủy bỏ</button>
                <button type="submit" className="admin-btn">Lưu sản phẩm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
