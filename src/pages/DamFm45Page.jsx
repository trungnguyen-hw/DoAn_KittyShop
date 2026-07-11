import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import prelude1 from "../generated/dam-style-1-prelude.html?raw";
import header1 from "../generated/dam-style-1-header.html?raw";
import post1 from "../generated/dam-style-1-post.html?raw";
import main1 from "../generated/dam-style-1-main.html?raw";
import scripts1 from "../generated/dam-style-1-scripts.json";
import prelude2 from "../generated/dam-style-2-prelude.html?raw";
import header2 from "../generated/dam-style-2-header.html?raw";
import post2 from "../generated/dam-style-2-post.html?raw";
import main2 from "../generated/dam-style-2-main.html?raw";
import scripts2 from "../generated/dam-style-2-scripts.json";
import prelude3 from "../generated/dam-style-3-prelude.html?raw";
import header3 from "../generated/dam-style-3-header.html?raw";
import post3 from "../generated/dam-style-3-post.html?raw";
import main3 from "../generated/dam-style-3-main.html?raw";
import scripts3 from "../generated/dam-style-3-scripts.json";
import { KidtyDocument } from "../components/kidty/KidtyDocument.jsx";
import { productService } from "../services/productService.js";
import { useCart } from "../context/CartContext.jsx";
import { request } from "../services/api.js";
import { formatPrice } from "../components/ProductCard.jsx";

const BUNDLES = {
  1: {
    prelude: prelude1,
    header: header1,
    postHtml: post1,
    mainHtml: main1,
    scripts: scripts1,
  },
  2: {
    prelude: prelude2,
    header: header2,
    postHtml: post2,
    mainHtml: main2,
    scripts: scripts2,
  },
  3: {
    prelude: prelude3,
    header: header3,
    postHtml: post3,
    mainHtml: main3,
    scripts: scripts3,
  },
};

function resolveVariant(search) {
  const view = search.get("view");
  if (view === "style-01") return 1;
  if (view === "style-02") return 2;
  if (view === "style-03") return 3;
  return 3;
}

export default function DamFm45Page() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const isFm45 = !slug || slug === "dam-hoa-cong-chua-fm-45";
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(!isFm45);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("100");
  const [selectedColor, setSelectedColor] = useState("Hồng");

  const variant = useMemo(
    () => resolveVariant(searchParams),
    [searchParams],
  );
  const b = BUNDLES[variant];

  useEffect(() => {
    if (isFm45) {
      return;
    }

    async function fetchProduct() {
      try {
        setLoading(true);
        // Try backend API first
        const data = await request(`/products/slug/${slug}`);
        if (data && data.name) {
          setProduct({
            ...data,
            title: data.name,
            oldPrice: data.old_price || data.oldPrice || 0
          });
        } else {
          // Fallback to local storage
          const local = productService.getProducts().find(p => p.slug === slug || p.id === slug);
          setProduct(local);
        }
      } catch (err) {
        console.warn("Fetch product by slug failed, using local storage:", err);
        const local = productService.getProducts().find(p => p.slug === slug || p.id === slug);
        setProduct(local);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug, isFm45]);

  const handleAddToCart = () => {
    if (!product) return;
    const variantStr = `${selectedColor} / ${selectedSize}`;
    const cartProduct = {
      id: product.id || product.slug,
      title: product.title || product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      variant: variantStr
    };
    addToCart(cartProduct);
  };

  // 1. Rendering for loading state of custom products
  if (loading && !isFm45) {
    return (
      <KidtyDocument
        bodyClass="product"
        prelude={BUNDLES[3].prelude}
        header={BUNDLES[3].header}
        postHtml={BUNDLES[3].postHtml}
        scripts={BUNDLES[3].scripts}
      >
        <main className="mainContent-theme" style={{ padding: "100px 0", textAlign: "center" }}>
          <div className="container">
            <div className="loading-spinner" style={{ border: "4px solid #f3f3f3", borderTop: "4px solid #f94c43", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite", margin: "0 auto 20px" }}></div>
            <p style={{ color: "#666" }}>Đang tải thông tin sản phẩm...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </main>
      </KidtyDocument>
    );
  }

  // 2. Rendering for product not found
  if (!loading && !isFm45 && !product) {
    return (
      <KidtyDocument
        bodyClass="product"
        prelude={BUNDLES[3].prelude}
        header={BUNDLES[3].header}
        postHtml={BUNDLES[3].postHtml}
        scripts={BUNDLES[3].scripts}
      >
        <main className="mainContent-theme" style={{ padding: "80px 0", textAlign: "center" }}>
          <div className="container">
            <h2 style={{ fontSize: "24px", color: "#333", marginBottom: "15px" }}>Không tìm thấy sản phẩm</h2>
            <p style={{ color: "#666", marginBottom: "25px" }}>Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <button onClick={() => navigate("/collections/all")} style={{ padding: "10px 25px", background: "#f94c43", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
              Quay lại danh sách sản phẩm
            </button>
          </div>
        </main>
      </KidtyDocument>
    );
  }

  // 3. Rendering for custom product details (Dynamic view)
  if (!isFm45 && product) {
    return (
      <KidtyDocument
        bodyClass="product"
        prelude={BUNDLES[3].prelude}
        header={BUNDLES[3].header}
        postHtml={BUNDLES[3].postHtml}
        scripts={BUNDLES[3].scripts}
      >
        <main className="mainContent-theme" style={{ padding: "40px 0", background: "#fafafa" }}>
          <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 15px" }}>
            {/* Breadcrumb */}
            <div className="breadcrumb" style={{ marginBottom: "20px", fontSize: "14px", color: "#777" }}>
              <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} style={{ color: "#333", textDecoration: "none" }}>Trang chủ</a>
              <span style={{ margin: "0 8px" }}>/</span>
              <a href="/collections/all" onClick={(e) => { e.preventDefault(); navigate("/collections/all"); }} style={{ color: "#333", textDecoration: "none" }}>Sản phẩm</a>
              <span style={{ margin: "0 8px" }}>/</span>
              <span style={{ color: "#888" }}>{product.title || product.name}</span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              {/* Left media */}
              <div style={{ flex: "1 1 450px", minWidth: "300px" }}>
                <div style={{ position: "relative", overflow: "hidden", borderRadius: "8px", border: "1px solid #eee", background: "#fcfcfc" }}>
                  <img 
                    src={product.image} 
                    alt={product.title || product.name} 
                    style={{ width: "100%", height: "auto", display: "block", objectFit: "contain", maxHeight: "500px", margin: "0 auto" }} 
                  />
                </div>
              </div>

              {/* Right details */}
              <div style={{ flex: "1 1 450px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <span style={{ fontSize: "12px", textTransform: "uppercase", background: "#fce8e6", color: "#f94c43", padding: "3px 8px", borderRadius: "3px", fontWeight: "bold" }}>
                    {product.category || "Trẻ Em"}
                  </span>
                  <h1 style={{ fontSize: "28px", fontWeight: "700", marginTop: "10px", marginBottom: "5px", color: "#333" }}>
                    {product.title || product.name}
                  </h1>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    Trạng thái: <span style={{ color: product.stock > 0 ? "#28a745" : "#dc3545", fontWeight: "bold" }}>
                      {product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : "Hết hàng"}
                    </span>
                  </div>
                </div>

                {/* Price row */}
                <div style={{ background: "#fafafa", padding: "15px 20px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "15px" }}>
                  <span style={{ fontSize: "24px", color: "#f94c43", fontWeight: "bold" }}>
                    {formatPrice(product.price)}đ
                  </span>
                  {product.oldPrice > product.price && (
                    <span style={{ fontSize: "16px", color: "#999", textDecoration: "line-through" }}>
                      {formatPrice(product.oldPrice)}đ
                    </span>
                  )}
                </div>

                {/* Description */}
                <div style={{ fontSize: "15px", color: "#555", lineHeight: "1.6" }}>
                  <p>{product.description || "Thời trang trẻ em cao cấp Kidty Shop. Thiết kế độc đáo, đường may tinh xảo, chất vải mềm mịn và co giãn tốt, an toàn tuyệt đối cho làn da nhạy cảm của bé."}</p>
                </div>

                {/* Color Selector */}
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "8px", color: "#333" }}>MÀU SẮC:</h4>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {["Hồng", "Xanh", "Trắng", "Vàng"].map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        style={{
                          padding: "6px 15px",
                          fontSize: "14px",
                          borderRadius: "4px",
                          border: selectedColor === color ? "2px solid #f94c43" : "1px solid #ccc",
                          background: selectedColor === color ? "#fdf3f2" : "#fff",
                          color: selectedColor === color ? "#f94c43" : "#333",
                          cursor: "pointer",
                          fontWeight: selectedColor === color ? "bold" : "normal"
                        }}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selector */}
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "8px", color: "#333" }}>KÍCH THƯỚC (SIZE):</h4>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {["80", "90", "100", "110", "120"].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        style={{
                          padding: "6px 15px",
                          fontSize: "14px",
                          borderRadius: "4px",
                          border: selectedSize === size ? "2px solid #f94c43" : "1px solid #ccc",
                          background: selectedSize === size ? "#fdf3f2" : "#fff",
                          color: selectedSize === size ? "#f94c43" : "#333",
                          cursor: "pointer",
                          fontWeight: selectedSize === size ? "bold" : "normal"
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Area */}
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "8px", color: "#333" }}>SỐ LƯỢNG:</h4>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      style={{ padding: "6px 12px", border: "1px solid #ccc", background: "#f5f5f5", cursor: "pointer", borderRadius: "4px 0 0 4px" }}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={quantity}
                      readOnly
                      style={{ width: "50px", textAlign: "center", padding: "6px 0", borderTop: "1px solid #ccc", borderBottom: "1px solid #ccc", borderLeft: "none", borderRight: "none", fontSize: "14px" }}
                    />
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      style={{ padding: "6px 12px", border: "1px solid #ccc", background: "#f5f5f5", cursor: "pointer", borderRadius: "0 4px 4px 0" }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart button */}
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    style={{
                      width: "100%",
                      padding: "15px 0",
                      background: product.stock > 0 ? "#f94c43" : "#ccc",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: product.stock > 0 ? "pointer" : "not-allowed",
                      boxShadow: "0 4px 10px rgba(249, 76, 67, 0.2)",
                      transition: "background 0.2s"
                    }}
                  >
                    {product.stock > 0 ? "THÊM VÀO GIỎ HÀNG" : "HẾT HÀNG"}
                  </button>
                </div>

                {/* Security/Trust flags */}
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: "20px", marginTop: "10px" }}>
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <span style={{ fontSize: "20px" }}>🚚</span>
                    <p style={{ fontSize: "11px", color: "#666", margin: "5px 0 0" }}>Freeship từ 500k</p>
                  </div>
                  <div style={{ textAlign: "center", flex: 1, borderLeft: "1px solid #eee", borderRight: "1px solid #eee" }}>
                    <span style={{ fontSize: "20px" }}>🔄</span>
                    <p style={{ fontSize: "11px", color: "#666", margin: "5px 0 0" }}>Đổi trả trong 7 ngày</p>
                  </div>
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <span style={{ fontSize: "20px" }}>☘️</span>
                    <p style={{ fontSize: "11px", color: "#666", margin: "5px 0 0" }}>Cotton 100% Organic</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </KidtyDocument>
    );
  }

  // 4. Default view (DamFm45Page static bundle view)
  return (
    <KidtyDocument
      bodyClass="product"
      prelude={b.prelude}
      header={b.header}
      postHtml={b.postHtml}
      scripts={b.scripts}
    >
      <main className="mainContent-theme " dangerouslySetInnerHTML={{ __html: b.mainHtml }} />
    </KidtyDocument>
  );
}
