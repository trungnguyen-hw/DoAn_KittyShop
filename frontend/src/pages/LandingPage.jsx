import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import prelude from "../generated/landing-prelude.html?raw";
import header from "../generated/landing-header.html?raw";
import postHtml from "../generated/landing-post.html?raw";
import scripts from "../generated/landing-scripts.json";
import { KidtyDocument } from "../components/kidty/KidtyDocument.jsx";
import { productService } from "../services/productService.js";
import ProductCard from "../components/ProductCard.jsx";
import { request } from "../services/api.js";
import "../landing-page.css";

const normalizeProduct = (product) => {
  if (!product) return {};
  let rawImage = product.image || product.img || product.thumbnail || "/Sản Phẩm – Kidty Shop_files/pro-12_master.jpg";
  if (rawImage && !rawImage.startsWith("http") && !rawImage.startsWith("https") && !rawImage.startsWith("/")) {
    rawImage = "/" + rawImage;
  }
  
  let oldPrice = Number(product.oldPrice || product.old_price) || 0;
  if (product.id === "dam-hoa-cong-chua-fm-45" && oldPrice === 0) {
    oldPrice = 550000;
  }

  return {
    ...product,
    id: product.id || "ao-vest-be-trai-fm-v5",
    title: product.title || product.name || "Sản phẩm Kidty",
    price: Number(product.price) || 0,
    oldPrice: oldPrice,
    image: rawImage,
  };
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [products, setProducts] = useState(() =>
    productService.getProducts().map(normalizeProduct)
  );

  // Load products from API or localStorage
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await request("/products");
        const apiProducts = Array.isArray(data)
          ? data
          : data.data || data.products || [];
        
        if (apiProducts.length > 0) {
          setProducts(apiProducts.map(normalizeProduct));
        }
      } catch (err) {
        console.warn("API products failed, using local products:", err);
      }
    }
    loadProducts();
  }, []);

  // Filter valid products
  const validProducts = useMemo(() => {
    return products.filter((product) => {
      return (
        product &&
        (product.name || product.title) &&
        product.image &&
        Number(product.price) > 0
      );
    });
  }, [products]);

  // Tab Filtering
  const tabProducts = useMemo(() => {
    if (activeTab === "all") {
      return validProducts;
    } else if (activeTab === "new") {
      // Get last 4 products
      return validProducts.slice(-4).reverse();
    } else if (activeTab === "bestseller") {
      // Products under Unisex/Bé Trai categories with higher price as premium feel
      return validProducts.filter(p => p.price >= 200000).slice(0, 4);
    } else if (activeTab === "sale") {
      // Products with old price
      const saleItems = validProducts.filter(p => p.oldPrice > p.price);
      return saleItems.length > 0 ? saleItems.slice(0, 4) : validProducts.slice(2, 6);
    }
    return validProducts;
  }, [activeTab, validProducts]);

  // Flash Sale Countdown State
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 34,
    seconds: 56,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // Reset timer loop for demo
              hours = 24;
              minutes = 0;
              seconds = 0;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dealProduct = useMemo(() => {
    const p = validProducts.find(p => p.slug === "dam-hoa-cong-chua-fm-45" || p.id === "dam-hoa-cong-chua-fm-45" || p.id === 9) || validProducts[0] || {};
    if (p && (p.slug === "dam-hoa-cong-chua-fm-45" || p.id === "dam-hoa-cong-chua-fm-45" || p.id === 9) && (!p.oldPrice || p.oldPrice === 0)) {
      return {
        ...p,
        oldPrice: 550000
      };
    }
    return p;
  }, [validProducts]);

  const salePrice = Number(dealProduct.price) || 0;
  const originalPrice = Number(dealProduct.oldPrice || dealProduct.old_price) || 0;
  const hasValidSale = salePrice > 0 &&
                       originalPrice > 0 &&
                       salePrice < originalPrice;

  const discountPercent = hasValidSale ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;

  const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(value);
  };

  return (
    <KidtyDocument
      bodyClass="page"
      prelude={prelude}
      header={header}
      postHtml={postHtml}
      scripts={scripts}
    >
      <main className="landing-container">
        {/* Hero Section */}
        <section className="ldp-hero">
          <div className="ldp-hero-pattern"></div>
          <div className="ldp-hero-wrapper">
            <div className="ldp-hero-content">
              <span className="ldp-hero-badge">🎁 Bộ Sưu Tập Mới 2026</span>
              <h1>Thiên Đường Thời Trang Cho <span>Bé Yêu</span> của Mẹ</h1>
              <p>
                Khám phá bộ sưu tập thời trang trẻ em cao cấp từ Kidty Shop. Chất liệu 100% Organic Cotton mềm mại, co giãn, cực kỳ an toàn cho làn da nhạy cảm của bé sơ sinh và trẻ nhỏ.
              </p>
              <div className="ldp-hero-buttons">
                <a href="/collections/all" className="ldp-btn ldp-btn-primary">Mua Sắm Ngay</a>
                <a href="#featured-collection" className="ldp-btn ldp-btn-secondary">Tìm Hiểu Thêm</a>
              </div>
            </div>
            
            <div className="ldp-hero-media">
              <div className="ldp-hero-img-bg"></div>
              <div className="ldp-hero-img-wrap">
                <img 
                  className="ldp-hero-img" 
                  src="/Sản Phẩm – Kidty Shop_files/pro-3_master.jpg" 
                  alt="Kidty Fashion" 
                />
                <div className="ldp-hero-floating-badge badge-top-left">
                  <span className="icon">⭐</span>
                  <span>Hơn 10k+ Mẹ Tin Dùng</span>
                </div>
                <div className="ldp-hero-floating-badge badge-bottom-right">
                  <span className="icon">⚡</span>
                  <span>Flash Sale -50%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights Section */}
        <section className="ldp-highlights">
          <div className="ldp-highlights-wrapper">
            <div className="ldp-highlight-card">
              <div className="ldp-highlight-icon">🚚</div>
              <div className="ldp-highlight-info">
                <h3>Miễn Phí Vận Chuyển</h3>
                <p>Cho mọi đơn hàng từ 500k trên toàn quốc</p>
              </div>
            </div>
            <div className="ldp-highlight-card">
              <div className="ldp-highlight-icon">🔄</div>
              <div className="ldp-highlight-info">
                <h3>7 Ngày Đổi Trả</h3>
                <p>Đổi size, mẫu mã nhanh chóng trong 7 ngày</p>
              </div>
            </div>
            <div className="ldp-highlight-card">
              <div className="ldp-highlight-icon">🍀</div>
              <div className="ldp-highlight-info">
                <h3>100% Cotton Organic</h3>
                <p>Thấm hút mồ hôi, dịu nhẹ an toàn cho bé</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="ldp-categories">
          <div className="ldp-section-header">
            <h2>Danh Mục Nổi Bật</h2>
            <p>Tuyển chọn những trang phục hot nhất, thiết kế xinh xắn cho từng lứa tuổi của con</p>
          </div>
          <div className="ldp-categories-grid">
            <div className="ldp-category-card" onClick={() => navigate("/collections/all")}>
              <img className="ldp-category-img" src="/Sản Phẩm – Kidty Shop_files/pro-4_master.jpg" alt="Đầm công chúa bé gái" />
              <div className="ldp-category-overlay">
                <h3>Bé Gái Điệu Đà</h3>
                <span className="shop-link">Xem bộ sưu tập →</span>
              </div>
            </div>
            <div className="ldp-category-card" onClick={() => navigate("/collections/all")}>
              <img className="ldp-category-img" src="/Sản Phẩm – Kidty Shop_files/pro-12_master.jpg" alt="Đồ vest bé trai" />
              <div className="ldp-category-overlay">
                <h3>Bé Trai Năng Động</h3>
                <span className="shop-link">Xem bộ sưu tập →</span>
              </div>
            </div>
            <div className="ldp-category-card" onClick={() => navigate("/collections/all")}>
              <img className="ldp-category-img" src="/Sản Phẩm – Kidty Shop_files/pro-8_master.jpg" alt="Quần áo sơ sinh" />
              <div className="ldp-category-overlay">
                <h3>Trẻ Sơ Sinh Dễ Thương</h3>
                <span className="shop-link">Xem bộ sưu tập →</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tabbed Featured Products */}
        <section className="ldp-products" id="featured-collection">
          <div className="ldp-section-header">
            <h2>Gợi Ý Cho Mẹ</h2>
            <p>Những mẫu thiết kế thời trang bền màu, chuẩn dáng và hợp mốt nhất thời điểm hiện tại</p>
          </div>
          <div className="ldp-tabs">
            <button 
              type="button"
              className={`ldp-tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              🌸 Toàn bộ
            </button>
            <button 
              type="button"
              className={`ldp-tab-btn ${activeTab === "new" ? "active" : ""}`}
              onClick={() => setActiveTab("new")}
            >
              🆕 Sản Phẩm Mới
            </button>
            <button 
              type="button"
              className={`ldp-tab-btn ${activeTab === "bestseller" ? "active" : ""}`}
              onClick={() => setActiveTab("bestseller")}
            >
              🔥 Bán Chạy Nhất
            </button>
            <button 
              type="button"
              className={`ldp-tab-btn ${activeTab === "sale" ? "active" : ""}`}
              onClick={() => setActiveTab("sale")}
            >
              💖 Khuyến Mãi Hot
            </button>
          </div>
          <div className="ldp-grid-container">
            <div className="products-grid ldp-grid">
              {tabProducts.map((product) => (
                <ProductCard key={product.id || product.slug} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Countdown Flash Sale Section */}
        {dealProduct.id && (
          <section className="ldp-deal">
            <div className="ldp-deal-wrapper">
              <div className="ldp-deal-media">
                <div className="ldp-deal-img-wrap">
                  <img 
                    className="ldp-deal-img" 
                    src={dealProduct.image} 
                    alt={dealProduct.title} 
                  />
                </div>
              </div>
              <div className="ldp-deal-content">
                {hasValidSale && (
                  <span className="ldp-hero-badge">⚡ DEAL ĐẶC BIỆT HÔM NAY</span>
                )}
                <h2>{dealProduct.title}</h2>
                <div className="ldp-deal-price">
                  <span className="new-price">{formatVND(salePrice)}</span>
                  {hasValidSale && (
                    <span className="old-price" style={{ textDecoration: "line-through", color: "#888", marginLeft: "10px" }}>
                      {formatVND(originalPrice)}
                    </span>
                  )}
                  {hasValidSale && (
                    <span className="discount-badge" style={{ marginLeft: "10px", background: "#f94c43", color: "white", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8em", fontWeight: "bold" }}>
                      -{discountPercent}%
                    </span>
                  )}
                </div>
                
                <div className="ldp-countdown">
                  <div className="ldp-countdown-box">
                    <span className="num">{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span className="lbl">Giờ</span>
                  </div>
                  <div className="ldp-countdown-box">
                    <span className="num">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                    <span className="lbl">Phút</span>
                  </div>
                  <div className="ldp-countdown-box">
                    <span className="num">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                    <span className="lbl">Giây</span>
                  </div>
                </div>

                <div className="ldp-deal-progress">
                  <div className="ldp-deal-progress-info">
                    <span>🔥 Đã bán: 18 sản phẩm</span>
                    <span>Chỉ còn: 6 sản phẩm</span>
                  </div>
                  <div className="ldp-progress-bar-bg">
                    <div className="ldp-progress-bar" style={{ width: "75%" }}></div>
                  </div>
                </div>

                <a 
                  href="/products/dam-hoa-cong-chua-fm-45" 
                  onClick={(e) => { e.preventDefault(); navigate("/products/dam-hoa-cong-chua-fm-45"); }} 
                  className="ldp-btn ldp-btn-primary"
                >
                  Mua Ngay Với Giá Ưu Đãi
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Customer Testimonials */}
        <section className="ldp-testimonials">
          <div className="ldp-section-header">
            <h2>Phản Hồi Từ Các Mẹ</h2>
            <p>Trải nghiệm mua sắm thực tế từ các bậc phụ huynh sau khi mua đồ cho bé tại Kidty Shop</p>
          </div>
          <div className="ldp-testimonials-grid">
            <div className="ldp-testi-card">
              <p className="ldp-testi-quote">
                "Đầm hoa công chúa chất ren voan cực kỳ mềm, lót cotton thấm hút mồ hôi nên bé nhà mình mặc chạy nhảy cả ngày không bị ngứa hay nóng. Shop tư vấn size rất chuẩn."
              </p>
              <div className="ldp-testi-user">
                <img className="ldp-testi-avatar" src="/Sản Phẩm – Kidty Shop_files/pro-3_master.jpg" alt="Mẹ Lan" />
                <div className="ldp-testi-name">
                  <h4>Mẹ Lan Vy</h4>
                  <p>Hà Nội (Bé gái 3 tuổi)</p>
                </div>
              </div>
            </div>
            <div className="ldp-testi-card">
              <p className="ldp-testi-quote">
                "Thích nhất là các bộ body sơ sinh ở đây. Vải siêu mát, co giãn tốt, giặt máy nhiều lần mà không hề bị nhão hay phai màu. Sẽ tiếp tục ủng hộ shop lâu dài."
              </p>
              <div className="ldp-testi-user">
                <img className="ldp-testi-avatar" src="/Sản Phẩm – Kidty Shop_files/pro-8_master.jpg" alt="Mẹ Mai" />
                <div className="ldp-testi-name">
                  <h4>Mẹ Ngọc Mai</h4>
                  <p>TP. Hồ Chí Minh (Bé sơ sinh 6 tháng)</p>
                </div>
              </div>
            </div>
            <div className="ldp-testi-card">
              <p className="ldp-testi-quote">
                "Bộ vest bé trai mặc siêu sang. Vải lót mềm mại, đường may chắc chắn. Bé mặc đi tiệc cưới ai cũng khen lịch lãm như soái ca nhí. Giao hàng siêu nhanh!"
              </p>
              <div className="ldp-testi-user">
                <img className="ldp-testi-avatar" src="/Sản Phẩm – Kidty Shop_files/pro-12_master.jpg" alt="Bố Trung" />
                <div className="ldp-testi-name">
                  <h4>Bố Hoàng Trung</h4>
                  <p>Đà Nẵng (Bé trai 5 tuổi)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Subscription */}
        <section className="ldp-newsletter">
          <div className="ldp-newsletter-wrapper">
            <h2>Nhận Ưu Đãi Đặc Biệt</h2>
            <p>Đăng ký email của mẹ ngay hôm nay để nhận thông báo về bộ sưu tập mới nhất và voucher giảm giá 10% cho đơn hàng đầu tiên!</p>
            <form className="ldp-subscribe-form" onSubmit={(e) => { e.preventDefault(); alert("Đăng ký thành công! Kidty đã gửi ưu đãi vào hộp thư của bạn."); }}>
              <input type="email" placeholder="Nhập địa chỉ email của mẹ..." required />
              <button type="submit">Đăng Ký</button>
            </form>
          </div>
        </section>
      </main>
    </KidtyDocument>
  );
}
