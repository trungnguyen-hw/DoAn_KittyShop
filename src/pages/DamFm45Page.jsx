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

  const isFm45 = !slug || slug === "dam-hoa-cong-chua-fm-45";
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(!isFm45);

  const variant = useMemo(
    () => resolveVariant(searchParams),
    [searchParams],
  );
  const b = BUNDLES[variant];

  useEffect(() => {
    if (isFm45) {
      return;
    }

    const normalizeImg = (img) => {
      if (!img) return "/Sản Phẩm – Kidty Shop_files/pro-12_master.jpg";
      if (img.startsWith("http") || img.startsWith("https") || img.startsWith("/")) return img;
      return "/" + img;
    };

    async function fetchProduct() {
      try {
        setLoading(true);
        // Try backend API first
        const data = await request(`/products/slug/${slug}`);
        if (data && data.name) {
          setProduct({
            ...data,
            title: data.name,
            oldPrice: data.old_price || data.oldPrice || 0,
            image: normalizeImg(data.image)
          });
        } else {
          // Fallback to local storage
          const local = productService.getProducts().find(p => p.slug === slug || p.id === slug);
          setProduct(local ? { ...local, image: normalizeImg(local.image) } : null);
        }
      } catch (err) {
        console.warn("Fetch product by slug failed, using local storage:", err);
        const local = productService.getProducts().find(p => p.slug === slug || p.id === slug);
        setProduct(local ? { ...local, image: normalizeImg(local.image) } : null);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug, isFm45]);

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

  // Get raw main HTML
  let mainHtml = b.mainHtml;

  if (!isFm45 && product) {
    // 1. Replace all original static files and Haravan CDN images with product.image FIRST (before replacing title modifies folder names)
    mainHtml = mainHtml.replace(/\/Đầm Hoa Công Chúa FM-45[^"]+?pro-\d+_[a-z0-9_]+\.(jpg|png|jpeg)/gi, product.image);
    mainHtml = mainHtml.replace(/\/\/product.hstatic.net\/1000309391\/product\/pro-\d+_[a-z0-9_]+\.(jpg|png|jpeg)/gi, product.image);

    // 2. Replace title in text, titles and alts
    mainHtml = mainHtml.replaceAll("Đầm Hoa Công Chúa FM-45", product.title || product.name || "");
    mainHtml = mainHtml.replaceAll("Đầm hoa công chúa fm-45", product.title || product.name || "");

    // 3. Replace price
    const priceStr = formatPrice(product.price) + "₫";
    if (product.oldPrice && product.oldPrice > product.price) {
      const oldPriceStr = formatPrice(product.oldPrice) + "₫";
      const priceHtml = `<span class="pro-price">${priceStr}</span><del style="margin-left: 10px; color: #999; font-size: 0.8em; font-weight: normal;">${oldPriceStr}</del>`;
      mainHtml = mainHtml.replace(/<span class="pro-price">[\s\S]*?<\/span>/i, priceHtml);
      mainHtml = mainHtml.replace(/<span class="pro-price">389,000₫<\/span>/gi, priceHtml);
    } else {
      mainHtml = mainHtml.replaceAll("389,000₫", priceStr);
      mainHtml = mainHtml.replaceAll("389,000đ", priceStr);
    }

    // 4. Replace description content
    const descReg = /<div class="description-productdetail">[\s\S]*?<\/div>/i;
    const descContent = `<div class="description-productdetail"><p>${product.description || "Thời trang trẻ em cao cấp Kidty Shop. Chất liệu mềm mại, thoáng mát và co giãn tốt, cực kỳ an toàn cho bé."}</p></div>`;
    mainHtml = mainHtml.replace(descReg, descContent);
  }

  return (
    <KidtyDocument
      bodyClass="product"
      prelude={b.prelude}
      header={b.header}
      postHtml={b.postHtml}
      scripts={b.scripts}
    >
      <main className="mainContent-theme " dangerouslySetInnerHTML={{ __html: mainHtml }} />
    </KidtyDocument>
  );
}
